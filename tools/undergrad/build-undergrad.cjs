#!/usr/bin/env node
/* ═══════════════════════════════════════════
   BUILD — 本科站 (undergraduate site) generator.

   Ported from the handoff project's build_undergraduate.cjs and rewired
   to the graduate site's layout, so the undergraduate site can be
   regenerated inside dad_demo/ without touching any graduate-site file.

   Source of truth (all inside the undergraduate folder, all named
   `undergrad*`, none shared with the graduate site):
     undergrad/data/undergrad-content.json              ↓ homepage copy
     undergrad/data/undergrad-pages.json                ↓ 34 detail pages
     undergrad/data/undergrad-full-time-handbook.json   ↓ handbook layout
     tools/undergrad/templates/{main,detail}.template.html

   Output:
     undergrad/index.html                               (35 pages total)
     undergrad/<route>/index.html  × 34
     undergrad/data/site/undergrad-content.json         ← browser payload
                                                           for the homepage
                                                           (paths resolved)

   Path policy: every emitted link/asset URL is RELATIVE to the page
   that carries it, so the whole undergrad/ folder can be moved or
   renamed without rewriting anything. `prefixOf(route)` is the number
   of `../` needed to get back to undergrad/ from that page's folder.

   Run:  node tools/undergrad/build-undergrad.cjs
   (本机 node: ~/.nvm/versions/node/v24.16.0/bin/node)
═══════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = __dirname;
const ROOT = path.resolve(TOOLS_DIR, '..', '..');        // dad_demo/
const UG_DIR = path.join(ROOT, 'undergrad');
const DATA_DIR = path.join(UG_DIR, 'data');
const TPL_DIR = path.join(TOOLS_DIR, 'templates');
const SITE_DATA_DIR = path.join(DATA_DIR, 'site');

const MAIN_TPL = fs.readFileSync(path.join(TPL_DIR, 'main.template.html'), 'utf8');
const DETAIL_TPL = fs.readFileSync(path.join(TPL_DIR, 'detail.template.html'), 'utf8');
const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'undergrad-content.json'), 'utf8'));
const pageData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'undergrad-pages.json'), 'utf8'));
const fullTimeContent = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'undergrad-full-time-handbook.json'), 'utf8'));

const pageById = new Map(pageData.pages.map(page => [page.id, page]));
const SRC_PREFIX = '/undergraduate/';

/* ── path helpers ───────────────────────────────────────────── */
function depthOf(route) {
  const parts = String(route || '').split('/').filter(Boolean);
  return parts.length;
}
/** `../` × depth — from the page's own folder back to undergrad/ */
function prefixOf(route) {
  return '../'.repeat(depthOf(route));
}
/** The undergrad root URL as seen from that page */
function homeOf(route) {
  return prefixOf(route) || './';
}
/** The graduate site entry (dad_demo/index.html) as seen from that page */
function graduateOf(route) {
  return prefixOf(route) + '../index.html';
}
/** Rewrite a source-site absolute path (/undergraduate/…) into a
    relative one for the page at `route`. Anything else (http, data:,
    relative, ordinary prose) is returned untouched. */
function resolvePath(value, route) {
  if (typeof value !== 'string' || value.indexOf(SRC_PREFIX) !== 0) return value;
  if (value === SRC_PREFIX || value === SRC_PREFIX.replace(/\/$/, '')) return homeOf(route);
  return prefixOf(route) + value.slice(SRC_PREFIX.length);
}
/** Deep-map every string in a JSON tree through resolvePath. */
function resolveTree(node, route) {
  if (typeof node === 'string') return resolvePath(node, route);
  if (Array.isArray(node)) return node.map(item => resolveTree(item, route));
  if (node && typeof node === 'object') {
    const out = {};
    Object.keys(node).forEach(key => { out[key] = resolveTree(node[key], route); });
    return out;
  }
  return node;
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function writeIfChanged(filePath, nextContent) {
  const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (previous === nextContent) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, nextContent);
  return true;
}

/* ── validation — same guarantees as the handoff build script ── */
function validate() {
  ['directions', 'pathways', 'outputs', 'profiles', 'advantages', 'products'].forEach(key => {
    if (!Array.isArray(content[key]) || content[key].length === 0) {
      throw new Error(`Undergraduate content collection is empty: ${key}`);
    }
  });
  if (!Array.isArray(pageData.navigation) || !Array.isArray(pageData.pages)) {
    throw new Error('Undergraduate page navigation and page collections are required.');
  }
  if (pageById.size !== pageData.pages.length) {
    throw new Error('Undergraduate detail page IDs must be unique.');
  }
  const routes = new Set();
  pageData.pages.forEach(page => {
    if (!page.id || !page.route || !page.title || !page.heroImage || !Array.isArray(page.sections)) {
      throw new Error(`Incomplete undergraduate detail page: ${page.id || page.route || 'unknown'}`);
    }
    if (routes.has(page.route)) throw new Error(`Duplicate undergraduate route: ${page.route}`);
    routes.add(page.route);
    if (page.parent) resolvePage(page.parent, 'parent', page.id);
    (page.children || []).forEach(id => resolvePage(id, 'child', page.id));
    (page.related || []).forEach(id => resolvePage(id, 'related', page.id));
  });

  const fullTimePage = pageById.get('pathways/full-time');
  if (!fullTimePage || fullTimePage.layout !== 'full-time-handbook') {
    throw new Error('Full-time handbook page must use the dedicated handbook layout.');
  }
  if (!Array.isArray(fullTimeContent.sections) || fullTimeContent.sections.length !== fullTimePage.sections.length) {
    throw new Error('Full-time handbook section metadata and content must stay aligned.');
  }
  fullTimePage.sections.forEach((section, index) => {
    const contentSection = fullTimeContent.sections[index];
    if (section.id !== contentSection.id || section.title !== contentSection.title) {
      throw new Error(`Full-time handbook section mismatch at position ${index + 1}.`);
    }
  });
}
function resolvePage(id, relationship, owner) {
  const page = pageById.get(id);
  if (!page) throw new Error(`Unknown ${relationship} page "${id}" referenced by "${owner}"`);
  return page;
}

/* ── homepage browser payload ────────────────────────────────────
   Resolved at depth 0 (the payload is only ever read by
   undergrad/index.html). `officialSources` is maintenance-only data
   and stays out of the shipped payload, as in the handoff build. */
function buildBrowserContent() {
  const resolved = resolveTree(content, '');
  delete resolved.officialSources;

  const detailLinks = {
    sections: Object.fromEntries(pageData.navigation.map(item => [item.id, resolvePath(item.route, '')])),
    directions: {
      us: 'directions/us/',
      uk: 'directions/uk/',
      hk: 'directions/hong-kong/',
    },
    pathways: Object.fromEntries(content.pathways.map(item => [item.id, `pathways/${item.id}/`])),
    outputs: {
      '3d': 'capabilities/3d-virtual/',
      performance: 'capabilities/media-installation/',
      material: 'capabilities/media-installation/',
      mechanical: 'capabilities/creative-tech/',
      wearable: 'capabilities/media-installation/',
      sound: 'capabilities/media-installation/',
      experimental: 'capabilities/media-installation/',
      audiovisual: 'capabilities/creative-tech/',
      brand: 'capabilities/visual-strategy/',
      information: 'capabilities/information-experience/',
      book: 'capabilities/visual-strategy/',
      web: 'capabilities/information-experience/',
    },
    profiles: Object.fromEntries(content.profiles.map(item => [item.id, `fit/${item.id}/`])),
    products: {
      'nyu-summer': 'works/summer-school/',
      'works-25-1': 'works/portfolio/',
      'works-25-2': 'works/portfolio/',
      'works-26': 'works/portfolio/',
    },
  };

  const deepNavigation = pageData.navigation
    .filter(item => item.homepageVisible !== false)
    .map(item => ({
      id: item.id,
      label: item.homepageLabel || item.label,
      route: resolvePath(item.route, ''),
      summary: item.summary,
    }));

  return Object.assign({}, resolved, { deepNavigation, detailLinks });
}

/* ── detail page renderers (ported, now prefix-aware + .fade-up) ── */
function renderHeroMedia(page, prefix) {
  const alt = page.layout === 'full-time-handbook'
    ? fullTimeContent.heroAlt
    : `${page.shortTitle}相关学生作品画面`;
  const hero = escapeHTML(resolvePath(page.heroImage, page.route));
  if (page.heroMobileImage) {
    return `
      <picture class="hero-media">
        <source media="(max-width: 700px)" srcset="${escapeHTML(resolvePath(page.heroMobileImage, page.route))}">
        <img src="${hero}" alt="${escapeHTML(alt)}" width="1960" height="1104" fetchpriority="high">
      </picture>
    `;
  }
  return `<img src="${hero}" alt="${escapeHTML(alt)}" width="1800" height="1125" fetchpriority="high">`;
}

function renderFacts(page) {
  return (page.facts || []).map(fact => `
    <div class="hero-fact">
      <strong>${escapeHTML(fact.value)}</strong>
      <span>${escapeHTML(fact.label)}</span>
    </div>
  `).join('');
}

function renderTopicNavigation(page) {
  return pageData.navigation.map(item => {
    const current = item.id === page.nav ? ' aria-current="true"' : '';
    return `<a href="${escapeHTML(resolvePath(item.route, page.route))}"${current}>${escapeHTML(item.label)}</a>`;
  }).join('');
}

function renderBreadcrumbs(page) {
  const ancestors = [];
  const visited = new Set([page.id]);
  let parentId = page.parent;
  while (parentId) {
    if (visited.has(parentId)) throw new Error(`Circular breadcrumb hierarchy at ${page.id}`);
    visited.add(parentId);
    const parent = resolvePage(parentId, 'parent', page.id);
    ancestors.unshift(parent);
    parentId = parent.parent;
  }

  const parts = [`<a href="${escapeHTML(homeOf(page.route))}">本科方向</a>`];
  ancestors.forEach(parent => {
    parts.push('<span aria-hidden="true">/</span>');
    parts.push(`<a href="${escapeHTML(resolvePath(`/undergraduate/${parent.route}/`, page.route))}">${escapeHTML(parent.shortTitle)}</a>`);
  });
  parts.push('<span aria-hidden="true">/</span>');
  parts.push(`<strong aria-current="page">${escapeHTML(page.shortTitle)}</strong>`);
  return parts.join('');
}

function renderItems(items) {
  if (!items?.length) return '';
  return `
    <div class="content-items">
      ${items.map(item => `
        <article class="content-item fade-up">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.text)}</p>
          ${item.meta ? `<span>${escapeHTML(item.meta)}</span>` : ''}
        </article>
      `).join('')}
    </div>
  `;
}

function renderList(items) {
  if (!items?.length) return '';
  return `<ul class="content-list">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
}

function renderSteps(steps) {
  if (!steps?.length) return '';
  return `
    <ol class="process-steps">
      ${steps.map(step => `
        <li class="fade-up">
          <h3>${escapeHTML(step.title)}</h3>
          <p>${escapeHTML(step.text)}</p>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderSection(section, index, page) {
  const body = (section.body || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  const quote = section.quote ? `<blockquote class="section-quote">${escapeHTML(section.quote)}</blockquote>` : '';
  const image = section.image ? `
    <figure class="section-image">
      <img src="${escapeHTML(resolvePath(section.image, page.route))}" alt="${escapeHTML(section.title)}相关课堂或作品画面" width="1600" height="900" loading="lazy">
      <figcaption>${escapeHTML(section.title)} · 课堂与作品过程画面</figcaption>
    </figure>
  ` : '';

  return `
    <section class="content-section fade-up" id="section-${index + 1}" aria-labelledby="section-title-${index + 1}">
      <p class="section-kicker">${escapeHTML(section.kicker)}</p>
      <h2 id="section-title-${index + 1}">${escapeHTML(section.title)}</h2>
      ${body ? `<div class="section-body">${body}</div>` : ''}
      ${renderItems(section.items)}
      ${renderList(section.list)}
      ${renderSteps(section.steps)}
      ${quote}
      ${image}
    </section>
  `;
}

function renderAcgGallery(gallery, modifier = '', page) {
  if (!gallery?.length) return '';
  const modifierClass = modifier ? ` acg-gallery--${modifier}` : '';
  return `
    <div class="acg-gallery${modifierClass}">
      ${gallery.map(item => `
        <figure class="acg-figure">
          <img src="${escapeHTML(resolvePath(item.src, page.route))}" alt="${escapeHTML(item.alt || '')}" width="1600" height="900" loading="lazy">
          ${item.caption ? `<figcaption>${escapeHTML(item.caption)}</figcaption>` : ''}
        </figure>
      `).join('')}
    </div>
  `;
}

function renderAcgVisualGroups(groups, page) {
  if (!groups?.length) return '';
  return `
    <div class="acg-visual-groups">
      ${groups.map((group, index) => `
        <section class="acg-visual-group" aria-labelledby="acg-group-${index + 1}">
          <header>
            <span>${escapeHTML(group.index || String(index + 1).padStart(2, '0'))}</span>
            <div>
              <h3 id="acg-group-${index + 1}">${escapeHTML(group.title)}</h3>
              ${group.text ? `<p>${escapeHTML(group.text)}</p>` : ''}
            </div>
          </header>
          ${renderAcgGallery(group.gallery, 'compact', page)}
        </section>
      `).join('')}
    </div>
  `;
}

function renderAcgSection(section, index, page) {
  const body = (section.body || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  return `
    <section class="content-section acg-section acg-section--${index + 1} fade-up" id="section-${index + 1}" aria-labelledby="section-title-${index + 1}">
      <div class="acg-section-inner">
        <header class="acg-section-heading">
          <div>
            <p class="section-kicker">${escapeHTML(section.kicker)}</p>
            <h2 id="section-title-${index + 1}">${escapeHTML(section.title)}</h2>
          </div>
          ${body ? `<div class="section-body">${body}</div>` : ''}
        </header>
        ${renderItems(section.items)}
        ${renderList(section.list)}
        ${renderAcgVisualGroups(section.visualGroups, page)}
        ${section.quote ? `<blockquote class="section-quote">${escapeHTML(section.quote)}</blockquote>` : ''}
        ${renderAcgGallery(section.gallery, '', page)}
      </div>
    </section>
  `;
}

/* ── handbook-layout renderers (full-time) ── */
function renderHandbookStats(stats) {
  if (!stats?.length) return '';
  return `
    <dl class="handbook-stats">
      ${stats.map(stat => `
        <div>
          <dt>${escapeHTML(stat.value)}</dt>
          <dd>${escapeHTML(stat.label)}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderHandbookTags(tags) {
  if (!tags?.length) return '';
  return `<ul class="handbook-tags">${tags.map(tag => `<li>${escapeHTML(tag)}</li>`).join('')}</ul>`;
}

function renderHandbookCards(cards) {
  if (!cards?.length) return '';
  return `
    <div class="handbook-cards">
      ${cards.map(card => `
        <article class="handbook-card fade-up">
          ${card.eyebrow ? `<p class="handbook-card-kicker">${escapeHTML(card.eyebrow)}</p>` : ''}
          <h3>${escapeHTML(card.title)}</h3>
          ${card.text ? `<p>${escapeHTML(card.text)}</p>` : ''}
          ${renderHandbookTags(card.tags)}
        </article>
      `).join('')}
    </div>
  `;
}

function renderHandbookBullets(items, className = 'handbook-list') {
  if (!items?.length) return '';
  return `<ul class="${className}">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
}

function renderHandbookSteps(steps) {
  if (!steps?.length) return '';
  return `
    <ol class="handbook-steps">
      ${steps.map(step => `
        <li class="fade-up">
          <span class="handbook-step-number" aria-hidden="true"></span>
          <div>
            <h3>${escapeHTML(step.title)}</h3>
            <p>${escapeHTML(step.text)}</p>
            ${renderHandbookBullets(step.bullets, 'handbook-step-points')}
          </div>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderHandbookImage(image, alt, caption = '', display = 'photo', page) {
  if (!image) return '';
  const displayClass = ['photo', 'board', 'portrait'].includes(display) ? display : 'photo';
  return `
    <figure class="handbook-image handbook-image--${displayClass}">
      <img src="${escapeHTML(resolvePath(image, page.route))}" alt="${escapeHTML(alt || '')}" width="1500" height="1000" loading="lazy">
      ${caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : ''}
    </figure>
  `;
}

function renderHandbookGallery(gallery, sectionId, page) {
  if (!gallery?.length) return '';
  return `
    <div class="handbook-gallery handbook-gallery--${escapeHTML(sectionId)}">
      ${gallery.map(item => renderHandbookImage(item.src, item.alt, item.caption, item.display, page)).join('')}
    </div>
  `;
}

function renderHandbookGroups(groups, sectionId, page) {
  if (!groups?.length) return '';
  return `
    <div class="handbook-groups handbook-groups--${escapeHTML(sectionId)}">
      ${groups.map((group, index) => `
        <details class="handbook-group"${index === 0 ? ' open' : ''}>
          <summary>
            <span class="handbook-group-index">${escapeHTML(group.index || String(index + 1).padStart(2, '0'))}</span>
            <span class="handbook-group-heading">
              <strong>${escapeHTML(group.title)}</strong>
              ${group.summary ? `<small>${escapeHTML(group.summary)}</small>` : ''}
            </span>
            <span class="handbook-group-toggle" aria-hidden="true"></span>
          </summary>
          <div class="handbook-group-content">
            ${(group.body || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('')}
            ${renderHandbookStats(group.stats)}
            ${renderHandbookCards(group.cards)}
            ${renderHandbookBullets(group.items)}
            ${renderHandbookTags(group.tags)}
            ${group.courses?.length ? `
              <div class="handbook-course-block">
                <h4>课程内容</h4>
                ${renderHandbookBullets(group.courses, 'handbook-course-list')}
              </div>
            ` : ''}
            ${renderHandbookImage(group.image, group.imageAlt, '', group.imageDisplay, page)}
          </div>
        </details>
      `).join('')}
    </div>
  `;
}

function renderHandbookSection(section, index, page) {
  const intro = (section.intro || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  const sectionId = String(section.id || `section-${index + 1}`).replace(/[^a-z0-9-]/gi, '-');
  return `
    <section class="content-section handbook-section handbook-section--${escapeHTML(sectionId)} fade-up" id="section-${index + 1}" aria-labelledby="section-title-${index + 1}">
      <div class="handbook-section-inner">
        <header class="handbook-section-heading">
          <div class="handbook-title-block">
            <p class="section-kicker">${escapeHTML(section.kicker)}</p>
            <h2 id="section-title-${index + 1}">${escapeHTML(section.title)}</h2>
          </div>
          ${intro ? `<div class="section-body handbook-intro">${intro}</div>` : ''}
        </header>
        ${renderHandbookStats(section.stats)}
        ${renderHandbookCards(section.cards)}
        ${renderHandbookSteps(section.steps)}
        ${section.highlight ? `<blockquote class="handbook-highlight">${escapeHTML(section.highlight)}</blockquote>` : ''}
        ${renderHandbookGroups(section.groups, sectionId, page)}
        ${renderHandbookImage(section.image, section.imageAlt, '', section.imageDisplay, page)}
        ${renderHandbookGallery(section.gallery, sectionId, page)}
      </div>
    </section>
  `;
}

function renderChildren(page) {
  if (!page.children?.length) return '';
  const children = page.children.map(id => resolvePage(id, 'child', page.id));
  return `
    <section class="children-section" aria-labelledby="children-title">
      <div class="children-inner">
        <div class="block-heading">
          <p>NEXT LEVEL</p>
          <h2 id="children-title">继续进入具体方向</h2>
        </div>
        <div class="child-grid">
          ${children.map(child => `
            <a class="child-card fade-up" href="${escapeHTML(resolvePath(`/undergraduate/${child.route}/`, page.route))}">
              <img src="${escapeHTML(resolvePath(child.heroImage, page.route))}" alt="" width="1200" height="750" loading="lazy">
              <span class="child-card-copy">
                <small>${escapeHTML(child.eyebrow)}</small>
                <h3>${escapeHTML(child.shortTitle)}</h3>
                <p>${escapeHTML(child.lead)}</p>
                <span class="arrow" aria-hidden="true">查看详情 →</span>
              </span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderRelated(page) {
  if (!page.related?.length) return '';
  const related = page.related.map(id => resolvePage(id, 'related', page.id));
  return `
    <nav class="related-section" aria-labelledby="related-title">
      <div class="related-inner">
        <div class="block-heading">
          <p>KEEP EXPLORING</p>
          <h2 id="related-title">从这里继续了解</h2>
        </div>
        <div class="related-list">
          ${related.map(relatedPage => `
            <a class="related-link fade-up" href="${escapeHTML(resolvePath(`/undergraduate/${relatedPage.route}/`, page.route))}">
              <small>${escapeHTML(relatedPage.eyebrow)}</small>
              <strong>${escapeHTML(relatedPage.shortTitle)} →</strong>
            </a>
          `).join('')}
        </div>
      </div>
    </nav>
  `;
}

function renderDetailPage(page) {
  const prefix = prefixOf(page.route);
  const isHandbook = page.layout === 'full-time-handbook';
  const sections = isHandbook ? fullTimeContent.sections : page.sections;
  const pageClass = isHandbook
    ? 'page-full-time'
    : page.layout === 'acg-editorial' ? 'page-acg' : '';

  const renderers = isHandbook
    ? renderHandbookSection
    : page.layout === 'acg-editorial' ? renderAcgSection : renderSection;

  const replacements = {
    '__PAGE_DESCRIPTION__': escapeHTML(page.lead),
    '__PAGE_TITLE__': escapeHTML(page.shortTitle),
    '__PAGE_ACCENT__': escapeHTML(page.accent),
    '__PAGE_CLASS__': pageClass,
    '__PREFIX__': prefix,
    '__HOME__': escapeHTML(homeOf(page.route)),
    '__GRADUATE_ENTRY__': escapeHTML(graduateOf(page.route)),
    '__TOPIC_NAV__': renderTopicNavigation(page),
    '__BREADCRUMBS__': renderBreadcrumbs(page),
    '__HERO_MEDIA__': renderHeroMedia(page, prefix),
    '__PAGE_EYEBROW__': escapeHTML(page.eyebrow),
    '__PAGE_HEADING__': escapeHTML(page.title),
    '__PAGE_LEAD__': escapeHTML(page.lead),
    '__HERO_FACTS__': renderFacts(page),
    '__TABLE_OF_CONTENTS__': sections.map((section, index) => (
      `<li><a href="#section-${index + 1}">${escapeHTML(section.title)}</a></li>`
    )).join(''),
    '__CONTENT_SECTIONS__': sections.map((section, index) => renderers(section, index, page)).join(''),
    '__CHILDREN_BLOCK__': renderChildren(page),
    '__RELATED_BLOCK__': renderRelated(page),
  };

  let output = DETAIL_TPL;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    output = output.replaceAll(placeholder, value);
  });
  const unresolved = output.match(/__[A-Z0-9_]+__/g);
  if (unresolved) throw new Error(`Unresolved detail template placeholders for ${page.id}: ${unresolved.join(', ')}`);
  return output;
}

/* ── link self-check — runs ONLY after every page has been written, so
   pages that point at each other are never reported as broken. ── */
function collectLocalRefs(html) {
  const refs = [];
  const attrRe = /\s(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = attrRe.exec(html))) refs.push(match[1]);
  const srcsetRe = /\ssrcset="([^"]+)"/g;
  while ((match = srcsetRe.exec(html))) {
    match[1].split(',').forEach(part => {
      const url = part.trim().split(/\s+/)[0];
      if (url) refs.push(url);
    });
  }
  return refs;
}

function checkLinks(written) {
  const problems = [];
  written.forEach(({ file, html }) => {
    const dir = path.dirname(file);
    collectLocalRefs(html).forEach(ref => {
      if (!ref || ref.startsWith('#')) return;
      if (/^(https?:|data:|mailto:|tel:|javascript:)/i.test(ref)) return;
      const clean = ref.split('#')[0].split('?')[0];
      if (!clean) return;
      const target = path.resolve(dir, clean);
      const exists = clean.endsWith('/')
        ? fs.existsSync(path.join(target, 'index.html'))
        : fs.existsSync(target);
      if (!exists) {
        problems.push(`${path.relative(ROOT, file)} → ${ref}`);
      }
    });
  });
  return problems;
}

/* ── run ──────────────────────────────────────────────────────── */
validate();

const written = [];
const mainChanged = writeIfChanged(path.join(UG_DIR, 'index.html'), MAIN_TPL);
written.push({ file: path.join(UG_DIR, 'index.html'), html: MAIN_TPL });

let changedDetailCount = 0;
pageData.pages.forEach(page => {
  const html = renderDetailPage(page);
  const outputPath = path.join(UG_DIR, ...page.route.split('/'), 'index.html');
  if (writeIfChanged(outputPath, html)) changedDetailCount += 1;
  written.push({ file: outputPath, html });
});

const siteContent = JSON.stringify(buildBrowserContent());
writeIfChanged(path.join(SITE_DATA_DIR, 'undergrad-content.json'), siteContent);

const problems = checkLinks(written);
console.log(`${mainChanged ? 'Generated' : 'Checked'} undergrad/index.html and ${pageData.pages.length} detail pages (${changedDetailCount} updated).`);
console.log(`Wrote browser payload: undergrad/data/site/undergrad-content.json`);
if (problems.length) {
  console.error(`\nBroken local references (${problems.length}):`);
  problems.forEach(p => console.error('  ' + p));
  process.exit(1);
}
console.log('Link self-check: OK — every local href/src resolves.');
