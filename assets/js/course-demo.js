/* ═══════════════════════════════════════════
   COURSE PRODUCTS — content model + renderer for every "课程产品",
   long-form (旗舰) and catalog (目录) alike, rendered into one shared
   full-screen overlay shell (see CourseOverlay below).

   group: 'longform' | 'catalog'
     - longform products carry the full module set (hero / snapshot /
       whyNow / appTimeline / curriculum / studentCases / whySFK / cta)
     - catalog products carry the same voice (hero / snapshot / whyNow /
       curriculum / whySFK / cta) but swap the multi-quarter application
       timeline + case studies for a `catalogGrid`, which renders the real
       course listing for that category — reusing HomePage's existing card
       markup & filters verbatim (see assets/js/pages/home.js).
═══════════════════════════════════════════ */

const PRODUCTS = {

  /* ── LONGFORM 1 — 美国研究生未来精英计划 ──
     v3.32 (GM's US/HK rich-content pass): rebuilt from the real "美研产品
     解读.docx" + "美国研究生未来精英计划-总对比.pdf" content, following
     longform2/UK's exact `useRichContent` schema and section order (see the
     long comment above longform2 below). Field-by-field provenance:
       - positioningIntro/advantagePairs/overallAdvantages: docx 一/二/三
       - tierTable: the 总对比.pdf page-2 comparison matrix (5 tiers —
         艺术TOP1/3/5/8/10, each with a 专业综合TOP3/5/10/15/20 sub-label;
         `config` transcribes that PDF's real 收获 row per tier, not the
         full cell-by-cell matrix, which stays viewable via "查看比价")
       - coreModules/employability/timeline/otherHighlights: docx 四/六/七
       - industryCases: 案例卡 folder categories (now 6, not UK's 5 — US
         and HK both add 教育与科技) with real schools/programs/URLs from
         美国院校-分支-案例卡.xlsx
     No `dualTrack`: unlike UK's docx, the US material never describes a
     separate 求职陪跑/upgrade-path product — 就业力课程 is just one more
     docx section, so it becomes a plain `employability` block instead of
     fabricating an upsell structure that isn't in the source. ── */
  changemakers: {
    group: 'longform',
    tileVariant: null,
    // v3.29 (GM): real cover art for the 3 长线产品 (dad_demo/_supplement-912/
    // cover/美研.png etc, compressed to WebP) — used both as the 课程产品
    // overview card's banner (.cp-card__banner) and the product's own hero
    // tile (.cd-hero__tile), replacing the gradient-only placeholder.
    cover: 'assets/img/course-products/covers/changemakers.webp',
    useRichContent: true,
    meta: {
      eyebrow: 'US Graduate Admissions｜研究生申请 · 作品集 + 科研双轨',
      titleEn: 'US Graduate Elite Program',
      titleCn: '美国研究生未来精英计划',
      desc: '面向冲刺美国顶尖艺术院校、藤校及综合大学艺术设计/跨学科创意方向的长期规划型产品：以作品集为核心，整合 AI 前沿技术、科研论文、海外教授项目与商业实践，建立更完整、更有说服力的美研申请竞争力。',
      chips: ['TOP1 – TOP10 五层级', 'AI全线覆盖', '科研论文双收获', '招募中'],
    },
    comparePdf: { label: '美国研究生 · 未来精英计划总对比', dir: 'assets/img/course-products/us/pdf', count: 2 },
    snapshot: [
      { k: 'TOP1–10', v: '5 个产品层级，匹配院校目标与预算' },
      { k: '5类核心项目', v: '自主命题 · 商业实践 · Meta Lab · 教授项目 · 科研双收' },
      { k: 'AI全线覆盖', v: 'AI图像生成 · AI视频生成 · AI Coding · AI 3D' },
      { k: '海外教授资源', v: '在职教授项目课 · Critique · 推荐信' },
    ],
    positioningIntro: '美国研究生未来精英计划是一套面向高目标申请者的长期规划型产品，适合希望冲刺美国顶尖艺术院校、藤校、综合大学艺术设计专业及跨学科创意方向的学生。课程以作品集为核心，进一步整合 AI 前沿技术、科研论文、海外教授项目、商业实践和就业力资源，帮助学生建立更完整、更有说服力的美研申请竞争力。',
    advantagePairs: [
      { trait: '美国院校看综合能力', traitDesc: '美国研究生申请不只看作品集，也会综合评估 GPA、语言成绩、推荐信、文书、科研/实习/竞赛经历、专业方向和未来发展潜力。', edge: '学生可以通过长期规划，把作品集、学术背景、项目经历和个人叙事整合成更完整的申请形象，不完全依赖单一作品集结果。' },
      { trait: '艺术院校与综合大学逻辑不同', traitDesc: '艺术院校更看重创作能力、视觉表达和作品集完成度；藤校与综合大学更关注研究能力、学术背景、跨学科能力和项目逻辑。', edge: '学生可以根据目标院校类型制定不同申请策略，在艺术表达和研究深度之间找到更适合自己的申请路径。' },
      { trait: '适合做长期规划', traitDesc: '美研申请周期较长，竞争维度多，尤其是顶尖院校通常需要提前布局作品集、科研、竞赛、实习、语言和文书方向。', edge: '学生有机会在申请前逐步补齐短板，把普通项目转化为更有研究价值、国际视野和职业延展性的申请成果。' },
    ],
    overallAdvantages: [
      { t: '分层目标规划', d: '根据学生目标院校和现有基础，匹配 TOP1 / TOP3 / TOP5 / TOP8 / TOP10 不同申请路径。' },
      { t: '作品集系统训练', d: '通过自主命题项目、商业实践项目、Meta Lab 研创项目、海外教授项目课等方式，完成更完整的作品集结构。' },
      { t: 'AI与前沿技术补强', d: '加入 AI 基础课、AI 图像生成、AI 视频生成、AI Coding、AI 3D 等课程，强化数字艺术方向学生的技术表达能力。' },
      { t: '科研论文双收获', d: '通过设计项目与科研方法论结合，帮助学生将创作项目转化为具备研究表达和学术证明力的成果。' },
      { t: '海外教授与顶校资源', d: '结合海外教授课程、Critique、推荐信、视频反馈和书面评估，提升项目国际化视角。' },
      { t: '申请与就业延展', d: '覆盖文书、选校、网申、面试、签证、行前准备，同时提供就业力测评、实习资源、作品集商业化改造等支持。' },
    ],
    tierTable: [
      { name: '艺术TOP1 · 专业综合TOP3', audience: '冲刺美国艺术院校顶尖梯队与专业综合类院校前3的学生', config: '40H七选四基础课、4个项目（自主命题×2/商业实践/Meta Lab研创）、在职教授项目课、冬夏校、2封海外教授推荐信、4个实习证明、1次展览、8个入围或奖项' },
      { name: '艺术TOP3 · 专业综合TOP5', audience: '冲刺美国艺术院校前3、专业综合类院校前5的学生', config: '40H七选四基础课、4个项目、在职教授项目课、冬夏校、2封海外教授推荐信、3个实习证明、1次展览、4个入围或奖项' },
      { name: '艺术TOP5 · 专业综合TOP10', audience: '目标艺术院校前5、专业综合类院校前10，兼顾配置与预算', config: '30H七选三基础课、4个项目（含自主命题/商业实践/Meta Lab研创）、在职教授项目课、2封海外教授推荐信、2个实习证明' },
      { name: '艺术TOP8 · 专业综合TOP15', audience: '目标院校前15，注重性价比但仍需完整作品集与教授资源', config: '20H七选二基础课、2-3个项目、在职教授项目课、1封海外教授推荐信、1个实习证明' },
      { name: '艺术TOP10 · 专业综合TOP20', audience: '申请目标相对明确，主要需要项目与申请基础支持', config: '20H七选二基础课、3个项目（含1个科研项目）、1个实习证明' },
    ],
    coreModules: [
      { title: '专业升学定位', desc: '通过首课规划，帮助学生明确目标院校、申请方向、作品集结构、背景短板和整体时间安排。' },
      { title: '专业基础课与软件课', desc: '课程覆盖设计思维、当代艺术思潮、前沿技术工具、人文学术专题、商业管理、AI应用实战和软件技能，为后续项目创作建立基础能力。' },
      { title: 'AI基础与应用实战', desc: '课程包括 AI 认知、AI 图像生成、ComfyUI / Stable Diffusion 工作流、AI 视频生成、AI Coding 和 AI 3D，帮助学生掌握数字艺术与设计方向常用的生成式工具和创作流程。', gallery: { slug: 'ai-course', count: 1 } },
      { title: '个性化作品集项目', desc: '学生将围绕个人主题完成自主命题项目或跨媒介项目，逐步形成能够体现个人研究兴趣和创作方法的作品集内容。' },
      { title: 'Meta Lab 革新研创项目', desc: '围绕前沿设计、AI创意科技、交互体验、数字媒体与跨学科研究方向展开。学生将在导师、教研和顶校学长学姐支持下，完成具有研究逻辑和创作深度的作品集项目。', gallery: { slug: 'metalab', count: 2 } },
      { title: '科研论文双收获课程', desc: '将作品集项目与科研方法结合，帮助学生从设计问题、研究方法、案例分析、原型实验到论文写作建立完整路径。适合冲刺综合大学、研究型专业及高目标院校的学生。', gallery: { slug: 'research-paper', count: 6 } },
      { title: '冬夏校', subtitle: '国际化项目强化模块', desc: '通过海外教授带教、实地项目训练和研究型产出，帮助学生补充高质量作品集项目和海外学习经历。课程可结合 AI、交互、数字媒体、艺术科技等前沿方向，支持学生获得项目成果、科研论文、推荐信或相关证明，提升美研申请中的差异化竞争力。', catalogRef: 'summerwinter' },
      { title: '海外教授课', desc: '由海外教授围绕国际前沿课题开展 5次线上课程，引导学生理解新的研究方向、创作方法与专业趋势；地区导师在线下持续推进调研、实验、制作与项目落地，并由教研团队进行阶段性 Critique 与质量审核。学生最终完成可纳入作品集的专业项目，优秀成果可争取海外教授推荐信。', gallery: { slug: 'professor-course', count: 3 } },
      { title: '商业实践课程', desc: '以企业、品牌或行业机构的真实需求为项目背景，由行业导师带领学生完成从 Brief 解读、调研分析、创意提案到成果交付的完整实践流程。学生不仅能够积累真实项目经验、理解行业协作与交付标准，还可形成用于作品集和求职展示的商业项目成果，并有机会获得实习证明与推荐信。', gallery: { slug: 'biz-practice', count: 6 }, catalogRef: 'bizpractice' },
      { title: '文书与申请护航', desc: '覆盖选校定校、文书头脑风暴、申请策略、网申材料、面试辅导、签证与行前准备，帮助学生完成完整申请流程。' },
    ],
    employability: {
      intro: '围绕学生未来的职业方向，提供行业与岗位定位、求职作品集改造、简历优化、面试辅导及求职策略支持，帮助学生将学术项目转化为企业能够理解的专业能力与业务价值，建立从升学作品集到求职材料的完整衔接。',
      items: [
        { title: '行业与岗位定位', desc: '结合学生专业方向与项目积累，明确适合的行业、岗位与职业发展路径。' },
        { title: '求职作品集改造', desc: '将升学作品集中的项目重新梳理为企业能够理解的问题、方法与成果，突出可迁移的专业能力。' },
        { title: '简历优化与面试辅导', desc: '完成简历重塑与求职材料准备，并通过面试辅导帮助学生更从容地应对求职环节。' },
      ],
    },
    timeline: [
      { q: '阶段 1', phase: '申请定位', desc: '目标院校分析、专业方向确认、背景短板评估、作品集规划。' },
      { q: '阶段 2', phase: '基础补强', desc: '专业基础课、软件课、AI基础课、研究方法训练。' },
      { q: '阶段 3', phase: '项目创作', desc: '自主命题项目、商业实践项目、Meta Lab 研创项目。' },
      { q: '阶段 4', phase: '国际化提升', desc: '海外教授项目课、冬夏校、Critique、推荐信或反馈评估。' },
      { q: '阶段 5', phase: '科研与背景提升', desc: '科研论文、竞赛投递、实习证明、展览或奖项规划。' },
      { q: '阶段 6', phase: '申请材料准备', desc: '选校定校、文书写作、Study Proposal、人设挖掘、网申材料。' },
      { q: '阶段 7', phase: '面试与递交', desc: '面试辅导、作品集建站、申请递交、奖学金申请。' },
      { q: '阶段 8', phase: '后续衔接', desc: '签证、体检、行前准备、就业力规划、作品商业化延展。', merged: true },
    ],
    industryCases: [
      { key: 'visual-comm', nameCn: '视觉语言与策略传播', nameEn: 'Visual Communication & Brand Strategy', color: 'brand', caseCount: 4,
        schools: [
          { school: '耶鲁大学', program: 'MFA Graphic Design', url: 'https://www.art.yale.edu/about/study-areas/graduate-study-areas' },
          { school: '南加州大学', program: 'MFA Design', url: 'https://roski.usc.edu/academic/mfa-design' },
          { school: '南加州大学', program: 'MS Integrated Design, Business and Technology', url: 'https://iovine-young.usc.edu/learn/graduate/ms-integrated-design-business-tech' },
          { school: '纽约大学', program: 'MS in Integrated Marketing', url: 'https://www.sps.nyu.edu/homepage/academics/masters-degrees/ms-in-integrated-marketing/brand-management.html' },
          { school: '波士顿大学', program: 'MFA in Graphic Design', url: 'https://www.bu.edu/academics/cfa/programs/school-of-visual-arts/graphic-design/mfa/' },
          { school: '罗德岛设计学院', program: 'MFA Graphic Design', url: 'http://www.risd.edu/academics/graphic-design/graduate/' },
          { school: '纽约视觉艺术学院', program: 'MFA Design', url: 'http://www.sva.edu/graduate/mfa-design' },
        ] },
      { key: '3d-art', nameCn: '3D虚拟艺术制作', nameEn: '3D Virtual Art & Production', color: 'game', caseCount: 4,
        schools: [
          { school: '加州大学洛杉矶分校', program: 'MFA Design Media Arts', url: 'http://dma.ucla.edu/grad/program/' },
          { school: '卡内基梅隆大学', program: 'Entertainment Technology Center (MET)', url: 'https://www.etc.cmu.edu/learn/curriculum/' },
          { school: '哥伦比亚大学', program: 'MA in Design and Development of Digital Games', url: 'https://www.tc.columbia.edu/mathematics-science-and-technology/communication-media-and-learning-technologies-design/degrees--requirements/design-and-development-of-digital-games-ma/' },
          { school: '宾夕法尼亚大学', program: 'MSE in Computer Graphics and Game Technology', url: 'https://www.cis.upenn.edu/graduate/program-offerings/mse-in-computer-graphics-and-game-technology/' },
          { school: '纽约大学', program: 'MPS Virtual Production', url: 'https://tisch.nyu.edu/virtual-production' },
          { school: '纽约大学', program: 'MS Integrated Digital Media', url: 'https://engineering.nyu.edu/academics/programs/integrated-digital-media-ms-campus' },
          { school: '南加州大学', program: 'MFA Interactive Media & Games', url: 'https://catalogue.usc.edu/preview_program.php?catoid=16&poid=20876' },
          { school: '约翰霍普金斯大学', program: 'MA in Film and Media', url: 'https://landing.advanced.jhu.edu/mafm/' },
          { school: '纽约视觉艺术学院', program: 'MFA Computer Art', url: 'https://sva.edu/academics/graduate/mfa-computer-art' },
          { school: '萨凡纳艺术设计学院', program: 'MA/MFA Interactive Design and Game Development', url: 'https://www.scad.edu/academics/programs/interactive-design-and-game-development/degrees/mfa' },
        ] },
      { key: 'info-experience', nameCn: '信息体验与应用设计', nameEn: 'Information Experience & Applied Design', color: 'internet', caseCount: 1,
        schools: [
          { school: '哈佛大学', program: 'MDes Master in Design Studies', url: 'https://www.gsd.harvard.edu/design-studies/' },
          { school: '加利福尼亚大学伯克利分校', program: 'Master of Design', url: 'https://grad.berkeley.edu/program/master-of-design/' },
          { school: '卡内基梅隆大学', program: 'Master of Design', url: 'https://design.cmu.edu/content/master-design' },
          { school: '华盛顿大学', program: 'Master of Communication in Digital Media', url: 'https://commlead.uw.edu/mcdm/' },
          { school: '佐治亚理工学院', program: 'MS Digital Media', url: 'https://dm.lmc.gatech.edu/program/ms-program/' },
          { school: '东北大学', program: 'Master of Professional Studies in Digital Media', url: 'https://cps.northeastern.edu/program/master-of-professional-studies-in-digital-media-boston/' },
          { school: '加州艺术中心学院', program: 'MFA Media Design Practices', url: 'http://www.artcenter.edu/academics/graduate-degrees/media-design-practices/overview.html' },
          { school: '纽约视觉艺术学院', program: 'MFA Design for Social Innovation', url: 'https://dsi.sva.edu/' },
          { school: '帕森斯设计学院', program: 'MPS Communication Design', url: 'https://www.newschool.edu/parsons/mps-communication-design/' },
          { school: '普瑞特艺术学院', program: 'MFA Communications Design', url: 'https://www.pratt.edu/art/digital-arts-and-animation/digital-arts-mfa-interactive-arts-concentration/' },
          { school: '萨凡纳艺术设计学院', program: 'MA/MFA in Motion Media Design', url: 'https://www.scad.edu/academics/programs/motion-media-design/degrees/mfa' },
        ] },
      { key: 'mixed-media', nameCn: '多媒介与装置艺术', nameEn: 'Mixed Media & Installation Art', color: 'indie', caseCount: 4,
        schools: [
          { school: '麻省理工学院', program: 'MAS Media Arts and Sciences', url: 'https://www.media.mit.edu/graduate-program/about-media-arts-sciences/' },
          { school: '哈佛大学', program: 'MDes Master in Design Studies', url: 'https://www.gsd.harvard.edu/design-studies/' },
          { school: '纽约大学', program: 'MPS in Interactive Telecommunications', url: 'https://tisch.nyu.edu/itp/courses/itp-courses' },
          { school: '加州大学洛杉矶分校', program: 'MFA Design Media Arts', url: 'http://dma.ucla.edu/grad/program/' },
          { school: '加州大学圣塔芭芭拉分校', program: 'MS Media Arts and Technology', url: 'https://www.mat.ucsb.edu/degreePrograms/' },
          { school: '加州大学圣迭戈分校', program: 'MFA in Visual Arts', url: 'https://apply.grad.ucsd.edu/departments/visual-arts' },
          { school: '罗德岛设计学院', program: 'MFA Digital + Media', url: 'https://www.risd.edu/academics/digital-media/masters-program' },
          { school: '加州艺术学院', program: 'MFA in Art and Technology', url: 'https://art.calarts.edu/programs/art-and-technology' },
          { school: '帕森斯设计学院', program: 'MFA Design and Technology', url: 'https://www.newschool.edu/parsons/mfa-design-technology/' },
          { school: '普瑞特艺术学院', program: 'Graduate Digital Arts — Interactive Arts MFA', url: 'https://www.pratt.edu/academics/school-of-art/graduate-school-of-art/digital-arts-grad/dda-grad-degrees/interactive-arts/' },
        ] },
      { key: 'ai-computing', nameCn: 'AI创意计算机与互动机械', nameEn: 'AI Creative Computing & Interactive Systems', color: 'ai', caseCount: 3,
        schools: [
          { school: '杜克大学', program: 'MA in Computational Media', url: 'https://aahvs.duke.edu/graduate/ma-cmac' },
          { school: '约翰霍普金斯大学', program: 'MS in AI and Innovation', url: 'https://education.jhu.edu/masters-programs/ms-in-education-international-teaching-global-leadership-cohort/' },
          { school: '康奈尔大学', program: 'MS in Design Technology', url: 'https://tech.cornell.edu/programs/masters-programs/master-of-science-in-design-technology/' },
          { school: '纽约大学', program: 'MPS in Interactive Telecommunications', url: 'https://tisch.nyu.edu/itp/courses/itp-courses' },
          { school: '罗德岛设计学院', program: 'MFA Digital + Media', url: 'https://www.risd.edu/academics/digital-media/masters-program' },
          { school: '普瑞特艺术学院', program: 'Graduate Digital Arts — Interactive Arts MFA', url: 'https://www.pratt.edu/academics/school-of-art/graduate-school-of-art/digital-arts-grad/dda-grad-degrees/interactive-arts/' },
        ] },
      { key: 'edu-tech', nameCn: '教育与科技', nameEn: 'EdTech & Learning Design', color: 'edu', caseCount: 1,
        schools: [
          { school: '哈佛大学', program: 'Ed.M. Learning Design, Innovation, and Technology', url: 'https://www.gse.harvard.edu/masters/programs/ldit' },
          { school: '哥伦比亚大学', program: 'MA in Instructional Technology & Media', url: 'https://www.tc.columbia.edu/mathematics-science-and-technology/communication-media-and-learning-technologies-design/degrees--requirements/instructional-technology-and-media-ma/' },
          { school: '哥伦比亚大学', program: 'Master of Education (Art Pedagogy / Creative Technologies / Community Arts)', url: 'https://www.tc.columbia.edu/arts-and-humanities/art-and-art-education/degrees--requirements/art-and-art-education-edm/' },
          { school: '宾夕法尼亚大学', program: 'Master of Science, Learning Sciences and Technologies (M.S.Ed.)', url: 'https://www.gse.upenn.edu/academics/programs/learning-sciences-technology-masters' },
          { school: '纽约大学', program: 'MA in Learning Technology and Experience Design', url: 'https://steinhardt.nyu.edu/degree/ma-learning-technology-experience-design' },
        ] },
    ],
    otherHighlights: [
      { t: '顶校学长学姐 Lecture / Critique', d: 'Meta Lab 研创项目由顶校学长学姐参与支持，为学生带来贴近申请一线的项目反馈与经验分享。' },
      { t: '作品集建站辅导', d: '把打磨完成的作品集内容转化为排版专业、浏览流畅的个人网站，符合海外院校招生官的在线审阅习惯。' },
      { t: 'Study Proposal 指导', d: '针对研究型硕士项目，指导学生撰写符合学术规范的研究计划书，明确研究问题与方法。' },
      { t: '高端教研人设挖掘', d: '从教授项目课、研创项目等经历中挖掘学生的独特申请人设，并让这一视角贯穿文书与面试。' },
      { t: '国际奖项投递', d: '协助学生梳理项目成果，规划适合的国际竞赛与奖项投递方向，充实申请背景。' },
    ],
    featuredStories: [
      { title: '拒绝保底，只申名校！我一边崩溃大哭，一边拿纽大/皇艺', url: 'https://mp.weixin.qq.com/s/0J3hUP6v14r8eCcZYxq58A' },
      { title: '保研边缘、工作还没方向……大三才决定留学，一年后我拿下了康奈尔+IC+皇艺！', url: 'https://mp.weixin.qq.com/s/51JU3M6hiPgeVBxnVHu0Mg' },
      { title: '0基础，8个月，拿下哈佛录取！', url: 'https://mp.weixin.qq.com/s/yMuQkTn9uktQ2l7XFBqGzQ' },
      { title: '美院冲综大，心里没底… 提前3年布局，拿下纽大+南加大双顶尖录取！', url: 'https://mp.weixin.qq.com/s/EM3tvq8ht6sPVkdwGL6V_g' },
      { title: '年级前5，从保研到出国：她的数字媒体作品集，每一页都写着“我是谁”', url: 'https://mp.weixin.qq.com/s/nYfx7u6fuI94kfhVeoUIrA' },
    ],
    closingStatementCn: '作品集见深度，申请见格局 —— 冲刺美国顶尖院校，我们一起规划。',
    closingStatement: 'Portfolio depth, application vision — built together for top US programs.',
  },

  /* ── LONGFORM 2 — 英国研究生 ──
     v3.26 (GM's 3-part course-page overhaul, part 3/UK): rebuilt from the
     real "英国研究生产品解读.docx" content (see docs/PROJECT_NOTES.md) —
     `useRichContent: true` switches buildProductHTML() over to the new
     section renderers below (positioningIntro/advantagePairs/
     overallAdvantages/tierTable/coreModules/employability/dualTrack/
     timeline/industryCases/otherHighlights) instead of the old generic
     highlightCourses/fitAudience/curriculumTable/appTimeline/topicWall/
     studentCases/generic-SCHOOL_RECS blocks, which stay in the codebase
     (untouched, just gated off) as the template for any longform product
     that hasn't been rebuilt yet. See buildProductHTML's `if
     (product.useRichContent)` branches. ── */
  longform2: {
    group: 'longform',
    tileVariant: 'v2',
    cover: 'assets/img/course-products/covers/longform2.webp',
    useRichContent: true,
    meta: {
      eyebrow: 'UK Graduate Admissions｜研究生申请 · 升学就业一体化',
      titleEn: 'UK Graduate Program',
      titleCn: '英国研究生未来成长计划',
      desc: '同时面向名校申请与长期职业发展的升学就业一体化产品：以个性化作品集和英国研究生申请为基础，向前加入专业定位与项目规划，向后衔接商业实践、岗位制实习、求职作品集与企业内推。',
      chips: ['TOP1 – TOP9 多层级', '升学就业一体化', '5个项目建高匹配作品集', '招募中'],
    },
    comparePdf: { label: '英国研究生 · 未来成长计划总对比', dir: 'assets/img/course-products/uk/pdf', count: 2 },
    snapshot: [
      { k: 'TOP1–9', v: '5 个产品层级，匹配院校目标与预算' },
      { k: '5个项目', v: '高阶产品建立高匹配度作品集' },
      { k: '双路径',  v: '升学产品 + 求职陪跑 A 计划可灵活组合' },
      { k: '分层实习', v: '头部大厂 · 行业名企 · 创意工作室 · 海外' },
    ],
    positioningIntro: '英国研究生未来成长计划是一套同时面向名校申请与长期职业发展的升学就业一体化产品。产品以个性化作品集和英国研究生申请为基础，向前加入专业定位、基础补强与项目规划，向后衔接商业实践、岗位制实习、求职作品集、投递辅导和企业内推，帮助学生建立从申请、在读到入职的连续成长路径。产品设置 TOP1、TOP3、TOP5、TOP7 和 TOP9 不同层级，匹配学生的目标院校、专业基础、项目需求、就业诉求与预算。对就业结果有明确要求的学生，可在相应升学产品基础上升级求职陪跑 A 计划，形成升学就业双路径方案。',
    advantagePairs: [
      { trait: '英国院校看重独立研究与过程表达', traitDesc: '英国视觉传达、数字媒体专业不只评估最终作品，也关注议题选择、研究方法、实验过程、跨媒介能力和个人观点。', edge: '通过首课规划、自主命题项目、教研审核和海外教授反馈，帮助学生建立完整的研究过程与作品集叙事。' },
      { trait: '名校申请需要院校定制化表达', traitDesc: '不同英国院校在作品集结构、项目数量、Video Task、Study Proposal、面试和专业方向上存在明显差异。', edge: '根据目标院校完成项目筛选、院校改版、Video Task、学习计划、作品集建站与面试训练，提高申请材料的针对性。' },
      { trait: '升学结果需要与职业准备同步推进', traitDesc: '英国艺术与设计类研究生学制紧凑，学生若等到毕业后再开始实习和求职，容易缺少行业经验、商业项目和系统的投递准备。', edge: '在申请阶段即引入商业实践、分层实习、求职作品集和投递辅导，让作品集同时支持申请与未来就业。' },
    ],
    overallAdvantages: [
      { t: '升学就业一体化', d: '从目标院校、作品集结构到实习和求职岗位进行统一规划，避免升学项目与职业目标脱节。' },
      { t: '多层级产品匹配', d: 'TOP1 至 TOP9 覆盖不同院校目标、基础与预算，就业资源随产品层级递进。' },
      { t: '五个项目建立高匹配作品集', d: '高阶产品结合自主命题、商业实践、海外教授项目与夏冬校，兼顾个人研究、专业能力和行业应用。' },
      { t: '真实线下实习分层交付', d: '根据产品配置头部大厂、行业名企、创意工作室或海外实习，强调岗位任务、团队协作和真实交付。' },
      { t: '作品集从申请语言转向求职语言', d: '通过商业化改造、求职作品集指导和简历重塑，让企业看懂学生能解决什么问题。' },
      { t: '求职陪跑可灵活升级', d: '对就业需求强的学生，可在升学产品上增加行业导师、AI 商业应用、代投递、笔试面试与入职指导。' },
    ],
    tierTable: [
      { name: '升学就业双保录', audience: '名校申请与就业结果需求都较强', config: '5个项目、多段头部大厂线下实习、求职作品集、AI 商业应用、投递与入职指导' },
      { name: 'TOP1', audience: '目标英国头部院校，同时重视高质量实习', config: '5个项目、教授项目、夏冬校、头部大厂及海外实习可选、商业化改造与投递指导' },
      { name: 'TOP3', audience: '目标英国头部艺术设计院校', config: '5个项目、头部大厂实习、创意工作室实习、作品集商业化评估与完整求职训练' },
      { name: 'TOP5', audience: '希望兼顾名校申请、实践背景与预算', config: '4个项目、行业名企实习、行业推荐、职业规划、简历与笔试面试资源' },
      { name: 'TOP7', audience: '注重性价比，但仍需要完整作品集和基础就业支持', config: '4个项目、职业规划、简历重塑、笔试面试题库与头部企业内推' },
      { name: 'TOP9', audience: '申请目标相对明确，主要需要项目与申请基础支持', config: '4个项目、求职规划、笔试面试题库与增值内推' },
    ],
    coreModules: [
      { title: '专业定位与长线规划', desc: '通过首课规划明确目标院校、专业路线、项目结构、申请节奏与职业方向。' },
      { title: '专业前置必修课', desc: '由 MA基础课、MA软件课和MA AI课程 三个模块组成，根据学生的专业方向与能力基础进行匹配，为后续作品集项目建立研究、设计、技术与创意表达能力。', bullets: [
        { t: 'MA基础课', d: '围绕研究方法、项目设计流程、批判性思维及跨媒介表达展开，帮助学生建立符合英国研究生学习要求的项目逻辑与研究框架。' },
        { t: 'MA软件课', d: '覆盖平面视觉、多媒体与装置、3D虚拟艺术、信息体验和创意计算等工具方向，帮助学生将创意概念转化为可执行、可展示的作品。' },
        { t: 'MA AI课程', d: '涵盖AI视觉生成、3D虚拟场景、动态影像、交互体验及 Vibe Coding 原型，引导学生建立AI工作流，并将新技术融入项目研究与创作。' },
      ], gallery: { slug: 'pre-req', count: 3 } },
      { title: '个性化作品集项目', desc: '围绕学生的个人兴趣、专业方向、目标院校与申请定位进行一对一定制。导师从选题规划、背景调研、概念发展、媒介选择到最终呈现持续辅导，帮助学生将个人经历和创作特点转化为具有完整逻辑、鲜明表达与院校适配性的作品集项目。' },
      { title: '教研课', desc: '由科系教研团队根据院校趋势、专业方向与前沿议题研发项目课题，为学生提供清晰的研究框架、创作路径与阶段任务。课程通过专题教学、项目推进和阶段 Critique，帮助学生拓展专业认知，提升研究、创意与跨媒介表达能力，并完成可纳入作品集的项目成果。', gallery: { slug: 'teaching-research', count: 3 } },
      { title: '冬夏校', subtitle: '国际化项目强化模块', desc: '通过海外教授带教、实地项目训练和研究型产出，帮助学生补充高质量作品集项目和海外学习经历。课程可结合 AI、交互、数字媒体、艺术科技等前沿方向，支持学生获得项目成果、科研论文、推荐信或相关证明，提升申请中的差异化竞争力。', catalogRef: 'summerwinter' },
      { title: '海外教授课', desc: '由海外教授围绕国际前沿课题开展 5次线上课程，引导学生理解新的研究方向、创作方法与专业趋势；地区导师在线下持续推进调研、实验、制作与项目落地，并由教研团队进行阶段性 Critique 与质量审核。学生最终完成可纳入作品集的专业项目，优秀成果可争取海外教授推荐信。', gallery: { slug: 'professor-course', count: 3 } },
      { title: '商业实践', desc: '以企业、品牌或行业机构的真实需求为项目背景，由行业导师带领学生完成从 Brief 解读、调研分析、创意提案到成果交付的完整实践流程。学生不仅能够积累真实项目经验、理解行业协作与交付标准，还可形成用于作品集和求职展示的商业项目成果，并有机会获得实习证明与推荐信。', gallery: { slug: 'biz-practice', count: 6 }, catalogRef: 'bizpractice' },
      { title: '海外教授领航课', desc: '由海外教授围绕学生的个人定位、专业方向与目标院校进行阶段性领航指导，从国际院校视角帮助学生审视项目组合、研究方向与作品集整体逻辑。教授通过关键节点反馈，协助学生判断项目发展方向、调整作品集策略，并提升整体表达与目标院校的匹配度。', gallery: { slug: 'pilot-course', count: 2 } },
      { title: '海外教授审核', desc: '由具有海外院校教学或评审经验的教授，对学生作品集进行阶段性或申请前审核。教授从项目选题、研究逻辑、创意表达、媒介运用、作品完成度及院校适配性等维度提供专业反馈，帮助学生识别作品集中的关键问题，并形成清晰、可执行的修改方向。', gallery: { slug: 'professor-review', count: 1 } },
      { title: 'Video Task辅导', desc: '针对英国院校申请中的 Video Task 要求，结合不同院校与专业的题目形式，指导学生完成内容策划、回答结构、个人表达、作品讲解和镜头呈现。通过脚本梳理、模拟录制与针对性反馈，帮助学生在有限时间内清晰呈现个人特点、专业能力、项目思考及申请动机。', gallery: { slug: 'video-task', count: 1 } },
      { title: 'Study Proposal辅导', desc: '针对英国院校部分专业的 Study Proposal 要求，结合目标院校、专业方向与学生已有项目，指导学生明确研究主题、核心问题、研究背景、方法路径和预期成果。通过选题讨论、结构梳理与多轮修改，帮助学生形成逻辑清晰、方向具体，并能体现个人研究潜力及专业匹配度的学习研究计划。', gallery: { slug: 'study-proposal', count: 1 } },
      { title: '面试辅导', desc: '针对英国院校及目标专业的面试要求，围绕个人背景、申请动机、作品集项目、研究兴趣与未来规划进行系统准备。通过问题梳理、作品讲解训练、英文表达优化和模拟面试，帮助学生建立清晰的回答逻辑，在面试中准确呈现个人特点、专业能力与院校匹配度。', gallery: { slug: 'interview-coaching', count: 1 } },
      { title: '学业补强与作品集整合', desc: '通过毕设辅导、海外教授领航、作品集排版和院校改版，完成申请版本的整合与最终输出。' },
    ],
    employability: {
      intro: '就业力不是升学产品之后的附加课程，而是从项目选题、商业实践到求职交付的第二条主线。不同层级产品提供不同深度的实习、作品集转化与投递支持。',
      items: [
        { title: '职业定位', desc: '结合学生专业、作品集特征和个人优势，确定行业、岗位、目标公司与长期发展方向。' },
        { title: '岗位制实习', subtitle: '放总部海报', desc: '高阶产品根据层级配置头部大厂、行业名企、创意工作室或海外实习，让学生在真实岗位中参与任务、汇报与交付。', catalogRef: 'internship' },
        { title: '作品集商业化改造', desc: '由行业导师评估申请项目的岗位适配性，重新整理项目背景、问题、角色、流程、成果和商业价值。', gallery: { slug: 'portfolio-commercialize', count: 1 } },
        { title: '简历与求职材料', desc: '完成简历重塑、求职作品集、个人介绍、项目话术和岗位版本调整。' },
        { title: '岗位筛选与投递', desc: '根据学生能力、地区、行业和求职阶段建立岗位池，提供投递辅导、进度管理及部分产品的代投递支持。' },
        { title: '笔试面试与企业内推', desc: '提供笔试面试题库、模拟训练、面试反馈、Offer 分析、入职指导和相应层级的头部企业内推资源。' },
      ],
    },
    dualTrack: {
      intro: '双路径方案将英国研究生升学产品与求职陪跑 A 计划进行组合。前半段解决院校定位、作品集、申请材料与录取；后半段解决实习、求职作品集、投递、笔试面试、内推及入职辅导。',
      aiBusiness: { title: 'AI 商业应用', desc: '双保产品由行业导师带领学生将 AI 工具用于创意生产、商业设计、效率提升与岗位任务，形成可向企业展示的应用能力。', gallery: { slug: 'ai-business', count: 1 } },
      fitFor: [
        '适合希望同时确保英国研究生升学质量和毕业后就业竞争力的学生。',
        '适合家长对留学投入的长期回报、实习质量和正式入职结果较为关注的家庭。',
        '可在 TOP1、TOP3、TOP5、TOP7 或 TOP9 产品基础上按需升级，实际服务内容和结果边界以正式合同为准。',
      ],
    },
    timeline: [
      { q: '阶段 1', phase: '定位与评估', desc: '院校与专业定位、背景评估、作品集结构、职业方向和整体时间规划。' },
      { q: '阶段 2', phase: '基础与方法补强', desc: '专业前置必修课、跨学科、AI 或软件训练。' },
      { q: '阶段 3', phase: '作品集项目开发', desc: '自主命题、教研课题、商业实践、教授项目或夏冬校项目。' },
      { q: '阶段 4', phase: '实习与背景提升', desc: '头部大厂、行业名企、创意工作室或海外实习，并整理阶段成果。' },
      { q: '阶段 5', phase: '作品集整合', desc: '项目筛选、叙事优化、视觉排版、英文信息、院校改版与商业化评估。' },
      { q: '阶段 6', phase: '申请与差异化任务', desc: '文书、简历、推荐信、网申、Video Task、Study Proposal 与面试。' },
      { q: '阶段 7', phase: '求职材料转化', desc: '求职作品集、简历重塑、岗位项目话术、求职定位与岗位池。' },
      { q: '阶段 8', phase: '投递与入职陪跑', desc: '投递管理、笔试面试、企业内推、Offer 分析与入职指导。', merged: true },
    ],
    industryCases: [
      { key: 'visual-comm', nameCn: '视觉语言与策略传播', nameEn: 'Visual Communication & Brand Strategy', color: 'brand', caseCount: 6,
        schools: [
          { school: '皇家艺术学院', program: 'MA Visual Communication', url: 'https://www.rca.ac.uk/study/programme-finder/visual-communication-ma/' },
          { school: '皇家艺术学院', program: 'MA Information Experience Design', url: 'https://www.rca.ac.uk/study/programme-finder/information-experience-design-ma/' },
          { school: '伦敦大学学院', program: 'MA Publishing', url: 'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/publishing-ma' },
          { school: '伦敦传媒学院', program: 'MA Graphic Branding And Identity', url: 'https://www.arts.ac.uk/subjects/communication-and-graphic-design/postgraduate/ma-graphic-branding-and-identity-lcc' },
          { school: '伦敦传媒学院', program: 'MA Graphic Media Design', url: 'https://www.arts.ac.uk/subjects/communication-and-graphic-design/postgraduate/ma-graphic-media-design-lcc' },
          { school: '伦敦传媒学院', program: 'MA Design for Art Direction', url: 'https://www.arts.ac.uk/subjects/communication-and-graphic-design/postgraduate/ma-design-for-art-direction-lcc' },
          { school: '伦敦传媒学院', program: 'MA Advertising', url: 'https://www.arts.ac.uk/subjects/journalism-pr-media-and-publishing/postgraduate/ma-advertising-lcc' },
          { school: '中央圣马丁艺术与设计学院', program: 'MA Graphic Communication Design', url: 'https://www.arts.ac.uk/subjects/communication-and-graphic-design/postgraduate/ma-graphic-communication-design-csm' },
          { school: '爱丁堡大学', program: 'Graphic Design MA', url: 'https://www.ed.ac.uk/studying/postgraduate/degrees/index.php?r=site/view&id=735' },
          { school: '格拉斯哥艺术学院', program: 'MDes Communication Design', url: 'https://www.gsa.ac.uk/postgraduate-degrees/communication-design' },
        ] },
      { key: '3d-art', nameCn: '3D虚拟艺术制作', nameEn: '3D Virtual Art & Production', color: 'game', caseCount: 5,
        schools: [
          { school: '伦敦大学学院', program: 'Digital Media: Production MA', url: 'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/digital-media-production-ma' },
          { school: '伦敦大学学院', program: 'Immersive Factual Storytelling MA', url: 'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/immersive-factual-storytelling-ma' },
          { school: '伦敦大学学院', program: 'Cinematic and Videogame Architecture MArch', url: 'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/cinematic-and-videogame-architecture' },
          { school: '皇家艺术学院', program: 'MA Digital Direction', url: 'https://www.rca.ac.uk/study/programme-finder/digital-direction-ma/' },
          { school: '皇家艺术学院', program: 'MA Animation', url: 'https://www.rca.ac.uk/study/programme-finder/animation-ma/' },
          { school: '伦敦传媒学院', program: 'MA Visual Effects', url: 'https://www.arts.ac.uk/subjects/animation-interactive-film-and-sound/postgraduate/ma-visual-effects-lcc' },
          { school: '伦敦传媒学院', program: 'MA Virtual Reality', url: 'https://www.arts.ac.uk/subjects/animation-interactive-film-and-sound/postgraduate/ma-virtual-reality-lcc' },
          { school: '爱丁堡大学', program: 'MSc Design and Digital Media', url: 'https://www.ed.ac.uk/studying/postgraduate/degrees/index.php?r=site/view&edition=2023&id=37' },
          { school: '布里斯托大学', program: 'MSc Immersive Technologies (VR & AR)', url: 'https://www.bristol.ac.uk/study/postgraduate/taught/msc-immersive-technologies-virtual-and-augmented-reality/' },
          { school: '拉夫堡大学', program: 'MSc Digital Creative Media', url: 'https://www.lboro.ac.uk/study/postgraduate/masters-degrees/a-z/digital-creative-media/' },
        ] },
      { key: 'info-experience', nameCn: '信息体验与应用设计', nameEn: 'Information Experience & Applied Design', color: 'internet', caseCount: 4,
        schools: [
          { school: '皇家艺术学院', program: 'MA Information Experience Design', url: 'https://www.rca.ac.uk/study/programme-finder/information-experience-design-ma/' },
          { school: '帝国理工学院', program: 'MSc Science Communication', url: 'https://www.imperial.ac.uk/study/courses/postgraduate-taught/science-communication/' },
          { school: '伦敦政治经济学院', program: 'MSc Media and Communications', url: 'https://www.lse.ac.uk/study-at-lse/graduate/msc-media-and-communications' },
          { school: '伦敦政治经济学院', program: 'MSc Media, Communication and Development', url: 'https://www.lse.ac.uk/study-at-lse/graduate/msc-media-communication-and-development' },
          { school: '伦敦大学学院', program: 'Digital Media: Production MA', url: 'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/digital-media-production-ma' },
          { school: '伦敦传媒学院', program: 'MA Design for Data Visualisation', url: 'https://www.arts.ac.uk/subjects/communication-and-graphic-design/postgraduate/ma-data-visualisation-lcc' },
          { school: '伦敦传媒学院', program: 'MA Design for Social Innovation and Sustainable Futures', url: 'https://www.arts.ac.uk/subjects/communication-and-graphic-design/postgraduate/ma-design-for-social-innovation-and-sustainable-futures-lcc' },
        ] },
      { key: 'mixed-media', nameCn: '多媒介与装置艺术', nameEn: 'Mixed Media & Installation Art', color: 'indie', caseCount: 5,
        schools: [
          { school: '皇家艺术学院', program: 'MA Contemporary Art Practice', url: 'https://www.rca.ac.uk/study/programme-finder/contemporary-art-practice-ma/' },
          { school: '坎伯韦尔艺术学院', program: 'MA Fine Art: Computational Arts', url: 'https://www.arts.ac.uk/subjects/fine-art/postgraduate/ma-fine-art-camberwell' },
          { school: '爱丁堡大学', program: 'Contemporary Art Practice MA', url: 'https://www.ed.ac.uk/studying/postgraduate/degrees/index.php?r=site/view&edition=2021&id=747' },
          { school: '伦敦国王学院', program: 'Contemporary Art and the Moving Image MA', url: 'https://www.kcl.ac.uk/study/postgraduate-taught/courses/contemporary-art-and-the-moving-image-ma' },
          { school: '中央圣马丁艺术与设计学院', program: 'MA Fine Art: Digital (Online)', url: 'https://www.arts.ac.uk/subjects/fine-art/postgraduate/ma-fine-art-digital-csm' },
          { school: '伦敦大学金史密斯学院', program: 'MA/MFA Computational Arts', url: 'https://www.gold.ac.uk/pg/ma-computational-arts/' },
        ] },
      { key: 'ai-computing', nameCn: 'AI创意计算机与互动机械', nameEn: 'AI Creative Computing & Interactive Systems', color: 'ai', caseCount: 3,
        schools: [
          { school: '皇家艺术学院', program: 'MA/MFA Digital Narrative Arts', url: 'https://www.rca.ac.uk/study/programme-finder/digital-narrative-arts-ma-mfa/' },
          { school: '皇家艺术学院', program: 'MA Information Experience Design', url: 'https://www.rca.ac.uk/study/programme-finder/information-experience-design-ma/' },
          { school: '帝国理工学院', program: 'MRes Artificial Intelligence and Machine Learning', url: 'https://www.imperial.ac.uk/study/courses/postgraduate-taught/artificial-intelligence-machine-learning/' },
          { school: '帝国理工学院', program: 'MSc Artificial Intelligence Applications and Innovation', url: 'https://www.imperial.ac.uk/study/courses/postgraduate-taught/applications-innovation/' },
          { school: '坎伯韦尔艺术学院', program: 'MA Fine Art: Computational Arts', url: 'https://www.arts.ac.uk/subjects/fine-art/postgraduate/ma-fine-art-camberwell' },
          { school: '创意计算机学院', program: 'MSc Data Science and AI', url: 'https://www.arts.ac.uk/subjects/creative-computing/postgraduate/msc-data-science-and-ai' },
          { school: '创意计算机学院', program: 'MSc Applied Machine Learning for Creatives', url: 'https://www.arts.ac.uk/subjects/creative-computing/postgraduate/msc-data-science-and-ai-for-the-creative-industries' },
          { school: '创意计算机学院', program: 'MSc Creative Computing', url: 'https://www.arts.ac.uk/subjects/creative-computing/postgraduate/msc-creative-computing' },
          { school: '伦敦大学金史密斯学院', program: 'MA/MFA Computational Arts', url: 'https://www.gold.ac.uk/pg/ma-computational-arts/' },
        ] },
    ],
    otherHighlights: [
      { t: '全程教研审核', d: '覆盖首课规划、项目过程、项目终期、作品集排版和院校改版。' },
      { t: '海外教授反馈', d: '高阶产品根据配置提供 critique、视频反馈、书面评估或教授项目。' },
      { t: '英国院校特殊任务辅导', d: '针对 Video Task、Study Proposal、作品集网站和院校面试进行专项训练。' },
      { t: '学业与毕设支持', d: '通过毕设辅导和海外教授领航课，补强现有学业成果与申请项目之间的联系。' },
      { t: '行业推荐与实习证明', d: '不同层级产品根据配置交付实习实训证明、行业推荐信与线下实习经历。' },
      { t: '申请后续与长期支持', d: '包含申请进度跟踪、Offer 分析、签证行前以及相应层级的求职辅导。' },
    ],
    whySFK: [
      { t: '升学就业一体化', d: '从目标院校、作品集结构到实习和求职岗位进行统一规划，避免升学项目与职业目标脱节。' },
      { t: '真实线下实习分层交付', d: '根据产品配置头部大厂、行业名企、创意工作室或海外实习，强调岗位任务、团队协作和真实交付。' },
      { t: '作品集从申请语言转向求职语言', d: '通过商业化改造、求职作品集指导和简历重塑，让企业看懂学生能解决什么问题。' },
      { t: '求职陪跑可灵活升级', d: '对就业需求强的学生，可在升学产品上增加行业导师、AI 商业应用、代投递、笔试面试与入职指导。' },
    ],
    featuredStories: [
      { title: '计划有变：不考研了，我申皇艺最难的专业', url: 'https://mp.weixin.qq.com/s/YVMmHzpV6nUqNjKoq8-f0w' },
      { title: '油画跨申数媒交互，皇艺冬校太重要了', url: 'https://mp.weixin.qq.com/s/dhaGVvLNawW918R58MviXw' },
      { title: '皇艺DDL不足1年，双非+双项目同开？Buff叠满，我就想硬磕“最难”视传！', url: 'https://mp.weixin.qq.com/s/M_yyk3vmQAzc9Fj8bi-EWQ' },
      { title: '双非的我，只想求个保底，结果10申10中！把“低配局”打成“大满贯”', url: 'https://mp.weixin.qq.com/s/OhJCFIpPkqhv3-hFOAT_Qw' },
      { title: '大三才转专业，将舞台经验转成视觉表达，零基础学技术，成皇艺的准研究生！', url: 'https://mp.weixin.qq.com/s/O8WBHsetzemRgGFIVO-gCw' },
      { title: '民办二本，求职简历被卡，Gap两年拿下英国大满贯', url: 'https://mp.weixin.qq.com/s/mgHSRNtpPJk_4oQ4BwYV-w' },
      { title: '手握鲁美保研资格，她却拒绝“安全牌”，坚定奔赴皇艺', url: 'https://mp.weixin.qq.com/s/03FuIxNn1JD4VKgqp6xf5g' },
      { title: '双非民办，靠视传逆袭，仅6天拿下全球第一皇艺！', url: 'https://mp.weixin.qq.com/s/rt-j5bKchmm-TvwW8NEWIQ' },
      { title: '我不是艺术生，零基础跨申数字媒体，敲开皇艺！', url: 'https://mp.weixin.qq.com/s/5swjpgs0uVXnLc07n0Hcjg' },
      { title: '不能保研也不怕！我半年极限混申，UCL、南洋理工大满贯', url: 'https://mp.weixin.qq.com/s/HyYXiO1RL202oheL1T-YZg' },
      { title: '大三才转专业，零基础申数媒，14天速拿皇艺offer！', url: 'https://mp.weixin.qq.com/s/oSzDjX5d4QI2-Bogit7UrQ' },
    ],
    closingStatementCn: '从名校申请，到真实入职 —— 一条连续的成长路径。',
    closingStatement: 'From admission to employment — one continuous growth path.',
  },

  /* ── LONGFORM 2 (legacy generic content, kept for reference / as the
     template shape for US & HK before their own rebuild — no longer
     reachable now that longform2.useRichContent short-circuits
     buildProductHTML before any of these fields are read) ── */
  _longform2Legacy: {
    group: 'longform',
    tileVariant: 'v2',
    meta: {
      eyebrow: 'UK Graduate Admissions｜研究生申请 · 作品集打磨',
      titleEn: 'UK Graduate Program',
      titleCn: '英国研究生',
      desc: '面向计划申请英国研究生院校的学生，结合英国院校审核偏好与申请节奏，提供作品集打磨、个人陈述与院校定位的全流程支持，冲刺G5及顶尖艺术设计院校offer。',
      chips: ['25+ G5/顶尖院校offer', '作品集打磨', '申请节奏管理', '招募中'],
    },
    snapshot: [
      { k: '25+',  v: 'G5及顶尖院校offer' },
      { k: '89%',  v: '目标院校录取率' },
      { k: '1对1', v: '申请顾问陪伴' },
      { k: '4周',  v: '作品集集中打磨' },
    ],
    highlightCourses: [
      { title: '作品亮点打磨项目', desc: '围绕1个核心项目深度打磨，产出整本作品集最具竞争力的亮点。',
        detail: { duration: '16H · 项目制小班', highlights: ['围绕1个核心项目深度打磨', '强化视觉呈现与叙事逻辑', '产出适配G5审核标准的亮点作品'], sampleCourses: ['核心项目深化工作坊', '视觉排版与叙事打磨', '作品集主线梳理辅导'], intro: '选定一个最有潜力的项目进行深度打磨，从视觉呈现到叙事逻辑反复迭代，产出整本作品集中最具竞争力的"亮点项目"。' } },
      { title: 'Studio Critique 国际评图工作坊', desc: '模拟真实评图现场，训练当众陈述与应答质疑的能力。',
        detail: { duration: '16H · 国际评图制', highlights: ['邀请海外院校背景导师参与评图', '模拟英国院校面试评图现场', '训练当众陈述与回应质疑的能力'], sampleCourses: ['国际评图工作坊-1', '国际评图工作坊-2', '评图反馈复盘辅导'], intro: '邀请具有海外院校背景的导师参与评图，模拟英国院校真实的评图与面试现场，训练学生当众陈述项目、从容回应质疑的能力。' } },
      { title: '海外冬夏校·校园浸入营', desc: '走进英国校园真实课堂，提前适应海外学习节奏。',
        detail: { duration: '10天 · 英国校园浸入', highlights: ['走进英国院校真实课堂', '与在读学生同堂交流', '提前适应英国的学习与生活节奏'], sampleCourses: ['UK校园浸入营-冬季场', 'UK校园浸入营-夏季场', '院校开放日实地考察'], intro: '走进英国院校的真实课堂环境，与在读学生同堂交流，在正式申请前提前适应英国的学习节奏与校园文化。' } },
    ],
    fitAudience: [
      '计划申请英国研究生院校（G5及顶尖艺术设计院校）的学生',
      '已有作品基础，但项目方向分散、缺少一个"拿得出手"亮点项目的学生',
      '希望在正式投递前获得国际评图与面试实战经验的学生',
      '专业方向尚未完全确定，需要选专业与选校同步梳理的学生',
    ],
    curriculumTable: {
      categories: [
        { name: '专业与选校定位起航', color: 'internet', items: [
          { name: '首课定位课程', hours: '2H',
            detail: { duration: '2H · 1对1首课', highlights: ['诊断作品基础与创意方向', '结合英国院校审核偏好初筛专业', '规划申请节奏与院校梯度'], sampleCourses: ['作品基础诊断', '专业方向初筛', '英国申请节奏解读'], intro: '项目起点。通过1对1访谈梳理学生的创意基础与兴趣方向，结合英国院校"重创意、重个人视角"的审核偏好，初步锁定专业与院校梯度。' } },
        ] },
        { name: '个性化作品集训练', color: 'hardware', items: [
          { name: '创意基础课·24H（五选三）', hours: '24H',
            detail: { duration: '五选三，共24H · 每模块8H', highlights: ['视觉叙事/材料工艺/跨媒介/设计理论/数字工具5大模块自由组合', '按目标专业方向定制修读组合', '为作品亮点打磨积累多元创意语言'], sampleCourses: ['视觉叙事与图像语言-8H', '材料与工艺实验-8H', '跨媒介创意实践-8H', '设计批判与理论-8H', '数字创作工具-8H'], intro: '5大创意模块覆盖视觉叙事、材料实验、跨媒介实践、设计理论与数字工具，学生按目标专业方向自由选修其中3项，积累多元的创意表达语言。' } },
          { name: '作品亮点打磨项目', hours: '16H',
            detail: { duration: '16H · 项目制小班', highlights: ['围绕1个核心项目深度打磨', '强化视觉呈现与叙事逻辑', '产出适配G5审核标准的亮点作品'], sampleCourses: ['核心项目深化工作坊', '视觉排版与叙事打磨', '作品集主线梳理辅导'], intro: '选定一个最有潜力的项目进行深度打磨，从视觉呈现到叙事逻辑反复迭代，产出整本作品集中最具竞争力的"亮点项目"。' } },
        ] },
        { name: '国际前沿创意训练', color: 'culture', items: [
          { name: 'Studio Critique 国际评图工作坊', hours: '16H',
            detail: { duration: '16H · 国际评图制', highlights: ['邀请海外院校背景导师参与评图', '模拟英国院校面试评图现场', '训练当众陈述与回应质疑的能力'], sampleCourses: ['国际评图工作坊-1', '国际评图工作坊-2', '评图反馈复盘辅导'], intro: '邀请具有海外院校背景的导师参与评图，模拟英国院校真实的评图与面试现场，训练学生当众陈述项目、从容回应质疑的能力。' } },
        ] },
        { name: '院校教授直连', color: 'brand', subLabel: 'UK Portfolio Network', items: [
          { name: '在职英国院校教授项目课', hours: '16H',
            detail: { duration: '16H · 教授在职亲授', highlights: ['英国院校在职教授亲自授课', '了解目标院校审核委员会的真实偏好', '课程表现优秀者可获教授推荐信'], sampleCourses: ['服务设计战略项目课', '建筑设计研究方法项目课', '传达设计策略项目课'], intro: '由英国院校方向的在职教授亲自授课，帮助学生真正理解目标院校审核委员会的偏好与语言，是作品集打磨环节最直接的"内部视角"。' } },
          { name: '海外冬夏校·校园浸入营', hours: '10天',
            detail: { duration: '10天 · 英国校园浸入', highlights: ['走进英国院校真实课堂', '与在读学生同堂交流', '提前适应英国的学习与生活节奏'], sampleCourses: ['UK校园浸入营-冬季场', 'UK校园浸入营-夏季场', '院校开放日实地考察'], intro: '走进英国院校的真实课堂环境，与在读学生同堂交流，在正式申请前提前适应英国的学习节奏与校园文化。' } },
        ] },
        { name: '差异化亮点塑造', color: 'arch', items: [
          { name: '作品集排版与建站', hours: '8H',
            detail: { duration: '8H · 一对一建站辅导', highlights: ['将作品集转化为专业排版网站', '排版规范贴合英国院校审核习惯', '建站后仍可自主更新维护'], sampleCourses: ['作品集网站架构设计', '视觉排版一对一辅导', '建站工具实操指导'], intro: '把打磨完成的作品集转化为排版专业、浏览流畅的个人网站，贴合英国院校招生官在线审阅材料的习惯。' } },
          { name: '面试辅导', hours: '6H',
            detail: { duration: '6H · 模拟面试+复盘', highlights: ['多轮模拟面试，覆盖常见评图提问', '逐题复盘表达逻辑', '熟悉目标院校的评图与面试风格'], sampleCourses: ['院校评图真题模拟', '表达逻辑与临场训练', '面试复盘与迭代'], intro: '通过多轮模拟面试与评图熟悉目标院校的提问风格，并对每一轮表现进行复盘，让学生从容应对真实面试与评图现场。' } },
          { name: 'Personal Statement打磨', hours: '4H',
            detail: { duration: '4H · 1对1写作辅导', highlights: ['梳理个人陈述的核心叙事线', '对齐作品方向与专业选择逻辑', '多轮打磨语言与结构'], sampleCourses: ['个人陈述结构工作坊', '叙事线梳理辅导', '语言润色与终稿定稿'], intro: '1对1指导学生打磨Personal Statement，确保个人陈述的叙事线与作品方向、专业选择逻辑保持一致，经多轮修改后定稿。' } },
          { name: '选专业匹配复核', hours: '4H',
            detail: { duration: '4H · 定位复核咨询', highlights: ['结合最终作品方向复核专业匹配度', '梯度化确认最终投递院校清单', '规避"作品与专业不匹配"的常见风险'], sampleCourses: ['专业匹配复核工作坊', '投递清单梯度确认', '跨专业申请风险评估'], intro: '在正式投递前，结合最终定稿的作品方向，复核每一所目标院校的专业匹配度，规避"作品方向与所选专业脱节"这一英国申请中最常见的风险。' } },
        ] },
      ],
    },
    appTimeline: [
      { q: '01', phase: '专业与选校定位起航', type: '首课定位课程', desc: '诊断作品基础，初筛专业与院校梯度。',
        detail: { duration: '2H · 1对1首课', highlights: ['诊断作品基础与创意方向', '结合英国院校审核偏好初筛专业', '规划申请节奏与院校梯度'], sampleCourses: ['作品基础诊断', '专业方向初筛', '英国申请节奏解读'], intro: '项目起点。通过1对1访谈梳理学生的创意基础与兴趣方向，结合英国院校"重创意、重个人视角"的审核偏好，初步锁定专业与院校梯度。' } },
      { q: '02', phase: '个性化作品集训练', type: '创意基础课·24H（五选三）', desc: '5大创意模块自由组合，积累多元表达语言。',
        detail: { duration: '五选三，共24H · 每模块8H', highlights: ['视觉叙事/材料工艺/跨媒介/设计理论/数字工具5大模块自由组合', '按目标专业方向定制修读组合', '为作品亮点打磨积累多元创意语言'], sampleCourses: ['视觉叙事与图像语言-8H', '材料与工艺实验-8H', '跨媒介创意实践-8H', '设计批判与理论-8H', '数字创作工具-8H'], intro: '5大创意模块覆盖视觉叙事、材料实验、跨媒介实践、设计理论与数字工具，学生按目标专业方向自由选修其中3项，积累多元的创意表达语言。' } },
      { q: '03', phase: '个性化作品集训练', type: '作品亮点打磨项目', desc: '深度打磨1个核心项目，产出竞争力亮点。',
        detail: { duration: '16H · 项目制小班', highlights: ['围绕1个核心项目深度打磨', '强化视觉呈现与叙事逻辑', '产出适配G5审核标准的亮点作品'], sampleCourses: ['核心项目深化工作坊', '视觉排版与叙事打磨', '作品集主线梳理辅导'], intro: '选定一个最有潜力的项目进行深度打磨，从视觉呈现到叙事逻辑反复迭代，产出整本作品集中最具竞争力的"亮点项目"。' } },
      { q: '04', phase: '国际前沿创意训练', type: 'Studio Critique 国际评图工作坊', desc: '模拟真实评图现场，训练当众陈述能力。',
        detail: { duration: '16H · 国际评图制', highlights: ['邀请海外院校背景导师参与评图', '模拟英国院校面试评图现场', '训练当众陈述与回应质疑的能力'], sampleCourses: ['国际评图工作坊-1', '国际评图工作坊-2', '评图反馈复盘辅导'], intro: '邀请具有海外院校背景的导师参与评图，模拟英国院校真实的评图与面试现场，训练学生当众陈述项目、从容回应质疑的能力。' } },
      { q: '05', phase: '院校教授直连', type: '在职英国院校教授项目课', desc: '教授亲授审核偏好，积累推荐信资源。',
        detail: { duration: '16H · 教授在职亲授', highlights: ['英国院校在职教授亲自授课', '了解目标院校审核委员会的真实偏好', '课程表现优秀者可获教授推荐信'], sampleCourses: ['服务设计战略项目课', '建筑设计研究方法项目课', '传达设计策略项目课'], intro: '由英国院校方向的在职教授亲自授课，帮助学生真正理解目标院校审核委员会的偏好与语言，是作品集打磨环节最直接的"内部视角"。' } },
      { q: '06', phase: '院校教授直连', type: '海外冬夏校·校园浸入营', desc: '10天英国校园浸入，提前适应学习节奏。',
        detail: { duration: '10天 · 英国校园浸入', highlights: ['走进英国院校真实课堂', '与在读学生同堂交流', '提前适应英国的学习与生活节奏'], sampleCourses: ['UK校园浸入营-冬季场', 'UK校园浸入营-夏季场', '院校开放日实地考察'], intro: '走进英国院校的真实课堂环境，与在读学生同堂交流，在正式申请前提前适应英国的学习节奏与校园文化。' } },
      { q: '07', phase: '差异化亮点塑造', type: '面试辅导', desc: '多轮模拟面试与评图复盘。',
        detail: { duration: '6H · 模拟面试+复盘', highlights: ['多轮模拟面试，覆盖常见评图提问', '逐题复盘表达逻辑', '熟悉目标院校的评图与面试风格'], sampleCourses: ['院校评图真题模拟', '表达逻辑与临场训练', '面试复盘与迭代'], intro: '通过多轮模拟面试与评图熟悉目标院校的提问风格，并对每一轮表现进行复盘，让学生从容应对真实面试与评图现场。' } },
      { q: '08', phase: '差异化亮点塑造', type: '申请冲刺', desc: '作品集建站、Personal Statement打磨与选专业复核，全部收束进最后的冲刺阶段。', merged: true },
    ],
    topicWall: [
      '《破碎的公共空间：伦敦街角的临时性介入设计》',
      '《材料的记忆：废弃纺织品的再造叙事》',
      '《服务的温度：老龄化社区的陪伴式服务设计》',
      '《数字时尚：虚拟服装的可持续实验》',
      '《声音的地图：城市噪音的空间转译》',
      '《不完美的乌托邦：模块化临时居住装置》',
    ],
    studentCases: [
      {
        name: 'Y同学', schools: ['UCL Bartlett', 'AA School', 'TU Delft'],
        highlights: '1段建筑事务所实习 · 2段研究性课题 · 2封导师推荐信',
        tagline: '以实验性空间叙事见长，成功斩获UCL Bartlett建筑硕士offer。',
        bio: '两轮作品集打磨中逐步建立起个人化的空间叙事语言，并通过事务所实习验证了设计方法的可执行性。',
        quote: '"Bartlett看重的是思考方式，顾问帮我把思路讲清楚了。" — Y同学',
      },
      {
        name: 'H同学', schools: ['RCA', 'Central Saint Martins', 'Domus Academy'],
        highlights: '1段咨询公司实习 · 1封导师推荐信',
        tagline: '从产品设计转向服务设计，凭借系统性用户旅程研究拿下RCA offer。',
        bio: '在申请顾问指导下重新梳理了作品集主线，将碎片化项目整合为一条完整的服务设计方法论叙事。',
      },
      {
        name: 'X同学', schools: ['LCF', 'Istituto Marangoni', 'Bocconi'],
        highlights: '2段时尚品牌实习 · 2封导师推荐信',
        tagline: '结合商业分析与时尚敏感度，成功拿下LCF时尚管理硕士offer。',
        bio: '两段品牌实习经历为申请材料提供了扎实的行业案例支撑，个人陈述聚焦可持续时尚方向。',
      },
      {
        name: 'D同学', schools: ['University of Edinburgh', 'UCL', 'Aalto University'],
        highlights: '1段数据设计实习 · 1段研究性课题',
        tagline: '跨界数据可视化与设计研究，拿下爱丁堡大学设计信息学硕士offer。',
        bio: '在导师指导下完成一项数据可视化研究课题，将技术背景转化为设计语言，形成差异化申请优势。',
        quote: '"顾问帮我把技术背景讲成了设计故事。" — D同学',
      },
    ],
    whySFK: [
      { t: '节奏把控', d: '熟悉英国院校滚动审核与放榜节奏，提前规划投递顺序。' },
      { t: '院校定制', d: '针对G5及顶尖艺术设计院校的审核偏好定制文书与作品集主线。' },
      { t: '顾问陪伴', d: '1对1申请顾问全程陪伴，而非仅提供模板化材料。' },
      { t: '真实offer验证', d: '方法论已在G5及顶尖艺术设计院校研究生申请中反复验证。' },
    ],
    closingStatementCn: '踩准节奏，定位精准 —— 英国offer触手可及。',
    closingStatement: 'Timed right, positioned right — the UK offer within reach.',
  },

  /* ── LONGFORM 3 — 香港研究生 ──
     v3.32 (GM's US/HK rich-content pass): rebuilt from the real "香港研究生
     产品解读_常规与学霸双版本.docx" + both "总对比.pdf"s. Unlike UK/US, HK's
     source material genuinely splits into two parallel sub-products —
     常规计划 (regular, for students who need to build professional +
     portfolio ability from the ground up) and 学霸计划 (elite, for
     strong-foundation students on a tighter timeline who need precise
     diagnosis + gap-filling) — so this is the one product using the new
     `product.tracks = { regular, elite }` shape instead of flat top-level
     fields. Fields the docx genuinely shares across both plans
     (positioningIntro, meta, snapshot, industryCases, otherHighlights,
     closingStatement) stay at the top level and render once, above the
     sticky track switcher; everything that differs per plan
     (advantagePairs/tierTable/coreModules/timeline/comparePdf) lives
     inside `tracks.regular`/`tracks.elite` and is rendered by the exact
     same renderAdvantagePairs/renderTierGrid/renderModuleGrid/
     renderTimeline helpers the single-track products use — see
     buildRichLongformSections's `if (product.tracks)` branch and the
     TrackSwitcher component below IndustryCases. ── */
  longform3: {
    group: 'longform',
    tileVariant: 'v3',
    cover: 'assets/img/course-products/covers/longform3.webp',
    useRichContent: true,
    meta: {
      eyebrow: 'HK Graduate Admissions｜研究生申请 · 常规计划 + 学霸计划',
      titleEn: 'Hong Kong Graduate Program',
      titleCn: '香港研究生升学计划',
      desc: '以作品集为核心，结合目标院校定位、专业能力补强、个性化项目、香港高校夏冬校、商业实践、实习推荐和全流程申请服务的港研升学产品。分为常规计划与学霸计划两条路径：常规计划面向需要系统建立专业与作品集能力的学生，学霸计划面向基础较强、目标明确、时间有限的学生。',
      chips: ['常规计划 · 学霸计划', 'TOP3 – TOP8 分层', '作品集+商业实践+实习', '招募中'],
    },
    snapshot: [
      { k: '2个计划', v: '常规计划 · 学霸计划，按基础与时间灵活匹配' },
      { k: 'TOP3–TOP8', v: '常规计划三档配置，学霸计划两档聚焦补强' },
      { k: '4个项目', v: '两个计划均以4个作品集项目为核心产出' },
      { k: '真实实习', v: '头部大厂岗位实习 · 行业推荐信 · 商业实践' },
    ],
    positioningIntro: '香港研究生升学计划以作品集为核心，结合目标院校定位、专业能力补强、个性化项目、香港高校夏冬校、商业实践、实习推荐和全流程申请服务，帮助学生在较紧凑的申请周期内建立与目标专业匹配的竞争力。产品分为常规计划与学霸计划：常规计划面向需要系统建立专业与作品集能力的学生；学霸计划面向基础较强、目标明确、时间有限的学生，强调精准诊断与短板补强。',
    tracksLabel: '选择你的计划',
    tracks: {
      regular: {
        label: '常规计划',
        labelSub: '系统建立专业与作品集能力',
        comparePdf: { label: '香港研究生常规计划 · 总对比', dir: 'assets/img/course-products/hk/pdf-regular', count: 2 },
        advantagePairs: [
          { trait: '申请节奏紧凑且强调专业匹配', traitDesc: '香港研究生项目学制短，申请开放与审理节奏集中，不同院校和专业对作品集、学术背景、语言成绩及项目方向要求差异明显。', edge: '通过首课规划与长期时间管理，提前确认目标院校、专业方向、作品集结构和背景短板。' },
          { trait: '港校重视商业实践与实战经验', traitDesc: '香港高校的艺术设计、数字媒体与创意科技专业与产业联系紧密。除作品集完成度外，也关注商业实践、实习经历、团队协作和解决实际问题的能力。', edge: '通过商业实践项目、岗位制实习、行业导师带训与推荐资源，将真实项目过程转化为作品集和申请材料中的能力证明。' },
          { trait: '不同背景需要不同培养路径', traitDesc: '申请者可能来自艺术设计、传媒、计算机、商科或其他背景，专业基础和项目经验差异较大。', edge: '常规计划提供从基础补强到申请递交的完整路径，依据学生背景匹配专业课、AI课程、项目训练和背景提升。' },
        ],
        tierTable: [
          { name: 'TOP 3', audience: '目标香港顶尖专业方向，需要教研与项目配置最完整的常规计划档位', config: '86H课时、4个作品集项目、2封实习/实训证明、1段线下实习、2封行业推荐信、1封名校教授推荐信、1个名校教授项目、1次毕业展览' },
          { name: 'TOP 5', audience: '目标香港中坚强势专业方向，兼顾项目完整度与预算', config: '76H课时、4个作品集项目、2封实习/实训证明、1封行业推荐信、1封院校短期课程证书、1个名校教授项目、1次毕业展览' },
          { name: 'TOP 8', audience: '注重性价比，仍需要完整的4个作品集项目与基础申请护航', config: '60H课时、4个作品集项目、教学审核（首课/过程/终期/排版/院校改版）与留学指导服务全程覆盖' },
        ],
        coreModules: [
          { title: '专业升学定位', desc: '首课规划明确目标院校、申请专业、作品集结构、背景短板和整体时间安排。' },
          { title: '专业基础与 AI 应用', desc: '按学生基础配置艺术概论、基础入门、基础深入、跨学科或 AI 应用课程。', gallery: { slug: 'ai-course', count: 1 } },
          { title: '个性化作品集项目', desc: '围绕学生的个人兴趣、专业方向、目标院校与申请定位进行一对一定制。导师从选题规划、背景调研、概念发展、媒介选择到最终呈现持续辅导，帮助学生将个人经历和创作特点转化为具有完整逻辑、鲜明表达与院校适配性的作品集项目。' },
          { title: '香港高校夏冬校', desc: '学生在香港高校教学语境中完成集中式项目训练，进一步了解目标专业的教学方式，并将项目成果和学习经历纳入申请背景。', gallery: { slug: 'winter-summer', count: 2 } },
          { title: '商业实践', desc: '以企业、品牌或行业机构的真实需求为项目背景，由行业导师带领学生完成从 Brief 解读、调研分析、创意提案到成果交付的完整实践流程。学生不仅能够积累真实项目经验、理解行业协作与交付标准，还可形成用于作品集和求职展示的商业项目成果，并有机会获得实习证明与推荐信。', gallery: { slug: 'biz-practice', count: 6 }, catalogRef: 'bizpractice' },
          { title: '头部大厂岗位实习', desc: '根据学生的专业背景、能力基础与目标岗位，匹配头部企业或行业领先公司的相关实习机会。学生在真实岗位环境中参与业务项目与团队协作，了解行业工作流程、岗位职责和企业交付标准，将专业能力转化为可验证的实战经历，为港研申请和后续就业补充更具说服力的职业背景。', catalogRef: 'internship' },
          { title: '文书与申请护航', desc: '覆盖背景规划、选校定校、个人陈述、简历、推荐信、网申、面试和行前服务。' },
        ],
        timeline: [
          { q: '阶段 1', phase: '申请定位', desc: '目标院校分析、专业方向确认、背景短板评估、作品集与时间规划。' },
          { q: '阶段 2', phase: '基础补强', desc: '专业基础课、跨学科课程、AI 应用或软件训练。' },
          { q: '阶段 3', phase: '项目启动', desc: '自主命题项目研究、主题确立、媒介实验与阶段教研审核。' },
          { q: '阶段 4', phase: '项目深化', desc: '自主命题与商业实践并行，完善项目逻辑、过程和最终呈现。' },
          { q: '阶段 5', phase: '院校与背景提升', desc: '香港高校夏冬校、实习实训、行业推荐、竞赛或相关经历。' },
          { q: '阶段 6', phase: '作品集整合', desc: '项目筛选、结构调整、视觉排版、英文信息整理与最终审核。' },
          { q: '阶段 7', phase: '申请材料', desc: '选校定校、个人陈述、简历、推荐信、网申与面试准备。' },
          { q: '阶段 8', phase: '递交与后续', desc: '申请递交、进度跟踪、Offer 分析、奖学金、签证与行前准备。', merged: true },
        ],
        otherHighlights: [
          { t: '高频教研审核', d: '覆盖首课规划、过程、阶段、项目终期、排版和院校改版审核。' },
          { t: 'VIP 助教服务', d: '协助学习节奏管理、课程衔接和申请任务推进。' },
          { t: '作品集排版与英文信息整理', d: '统一项目叙事、视觉呈现与申请版本。' },
          { t: '面试辅导与申请后续', d: '往年真题、模拟面试、沟通表达、Offer 分析、签证及行前指导。' },
        ],
      },
      elite: {
        label: '学霸计划',
        labelSub: '精准诊断，聚焦补强',
        comparePdf: { label: '香港研究生学霸计划 · 总对比', dir: 'assets/img/course-products/hk/pdf-elite', count: 2 },
        advantagePairs: [
          { trait: '适合基础较强且目标明确的学生', traitDesc: '部分学生已具备较好的专业基础、项目能力或学术背景，但需要在较短周期内完成作品集与申请。', edge: '学霸计划通过前期诊断取消不必要的重复学习，把课时和资源集中到项目、商业实践、实习推荐和申请材料上。' },
          { trait: '港校重视真实项目与职业潜力', traitDesc: '对于申请香港头部院校的学生，作品集不仅需要成熟表达，也需要真实项目、商业语境、实习经历和可被验证的实践能力。', edge: '四个作品集项目与商业实践、岗位制实习、行业推荐信联动，把学生已有优势转化为更清晰的申请证据。' },
          { trait: '强调精准补强与结果导向', traitDesc: '高基础学生的关键不是重新学习通用基础，而是识别影响录取的关键短板，例如项目结构、研究深度、商业经历或申请表达。', edge: '围绕目标院校和个人短板进行定制训练，不浪费学习时间，提高项目、背景提升和申请任务的优先级。' },
        ],
        tierTable: [
          { name: 'TOP 3', audience: '目标香港头部院校，需要四个项目均具备成熟商业与实践证据', config: '78H课时、4个高完成度作品集项目、2封实习/实训证明、1段线下实习、2封行业推荐信' },
          { name: 'TOP 5', audience: '基础较强、目标明确，聚焦精准补强与效率', config: '68H课时、4个高完成度作品集项目、1封实习/实训证明、1封行业推荐信' },
        ],
        coreModules: [
          { title: '精准诊断与目标定位', desc: '从现有作品、专业能力、学术背景、商业经历和目标院校出发，确定真正需要补强的环节。' },
          { title: '聚焦式 AI 与项目训练', desc: '保留与目标专业、项目生成和录取直接相关的 AI 应用与项目方法训练。', gallery: { slug: 'ai-course', count: 1 } },
          { title: '四个高完成度作品集项目', desc: '围绕目标专业建立高匹配度的项目组合，提高研究深度、个人特征、视觉完成度和项目叙事。' },
          { title: '商业实践', desc: '以企业、品牌或行业机构的真实需求为项目背景，由行业导师带领学生完成从 Brief 解读、调研分析、创意提案到成果交付的完整实践流程。学生不仅能够积累真实项目经验、理解行业协作与交付标准，还可形成用于作品集和求职展示的商业项目成果，并有机会获得实习证明与推荐信。', gallery: { slug: 'biz-practice', count: 6 }, catalogRef: 'bizpractice' },
          { title: '头部大厂岗位实习', desc: '根据学生的专业背景、能力基础与目标岗位，匹配头部企业或行业领先公司的相关实习机会。学生在真实岗位环境中参与业务项目与团队协作，了解行业工作流程、岗位职责和企业交付标准，将专业能力转化为可验证的实战经历，为港研申请和后续就业补充更具说服力的职业背景。', catalogRef: 'internship' },
          { title: '作品集精修与申请表达', desc: '集中完成项目筛选、逻辑调整、视觉排版、英文信息整理、个人陈述与面试准备。' },
          { title: '全流程申请护航', desc: '围绕目标院校和时间节点完成选校定校、文书、网申、递交、跟踪与行前服务。' },
        ],
        timeline: [
          { q: '阶段 1', phase: '诊断定位', desc: '现有作品与背景评估、目标院校确认、关键短板与资源配置。' },
          { q: '阶段 2', phase: '精准补强', desc: '仅保留影响项目和录取的关键 AI、专业方法或软件训练。' },
          { q: '阶段 3', phase: '项目集中开发', desc: '四个项目的主题确立、研究、媒介实验、过程审核与成果完善。' },
          { q: '阶段 4', phase: '实践背景增强', desc: '商业实践、实习实训、线下实习、行业导师带训与推荐信。' },
          { q: '阶段 5', phase: '作品集整合', desc: '项目筛选、逻辑调整、视觉排版、英文信息和目标院校改版。' },
          { q: '阶段 6', phase: '申请材料', desc: '选校定校、个人陈述、简历、推荐信、网申与面试准备。' },
          { q: '阶段 7', phase: '递交与后续', desc: '申请递交、进度跟踪、Offer 分析、奖学金、签证与行前准备。', merged: true },
        ],
        otherHighlights: [
          { t: '教研精准审核', d: '将审核集中在关键节点、项目短板和目标院校改版上。' },
          { t: '项目与申请并行', d: '不等待全部项目完成后再启动申请，文书、选校和网申准备与作品集同步推进。' },
          { t: '行业导师与推荐资源', d: '用实习任务、行业反馈和推荐信为学生建立更可验证的实践背景。' },
          { t: '时间效率优先', d: '把学生已有优势转化为更清晰、更有说服力的作品集和申请成果。' },
        ],
      },
    },
    industryCases: [
      { key: 'visual-comm', nameCn: '视觉语言与策略传播', nameEn: 'Visual Communication & Brand Strategy', color: 'brand', caseCount: 2,
        schools: [
          { school: '香港大学', program: 'Master of Arts in the field of Creative Communications', url: 'https://admissions.hku.hk/tpg/programme/master-arts-field-creative-communications' },
          { school: '香港中文大学', program: 'MSc in New Media', url: 'https://pg.com.cuhk.edu.hk/pgp_nm/index.html' },
          { school: '香港中文大学', program: 'MSSc in Advertising', url: 'https://pg.com.cuhk.edu.hk/pgp_adv/' },
          { school: '香港城市大学', program: 'MA Communication and New Media', url: 'https://www.cityu.edu.hk/pg/programme/p25' },
          { school: '香港浸会大学', program: 'Master of Arts (MA) in Visual Arts', url: 'https://ar.hkbu.edu.hk/tpg-admissions/programmes/master-of-arts-ma-in-visual-arts' },
          { school: '香港岭南大学', program: 'Master of Arts in Creative and Media Industries', url: 'https://www.ln.edu.hk/daci/macmi' },
        ] },
      { key: '3d-art', nameCn: '3D虚拟艺术制作', nameEn: '3D Virtual Art & Production', color: 'game', caseCount: 5,
        schools: [
          { school: '香港理工大学', program: 'MSc Innovative Multimedia Entertainment', url: 'https://www.polyu.edu.hk/sd/study/tpg/innovative-multimedia-entertainment/' },
          { school: '香港城市大学', program: 'MFA Creative Media', url: 'https://www.cityu.edu.hk/pg/programme/p80' },
          { school: '香港城市大学', program: 'MA Creative Media', url: 'https://www.cityu.edu.hk/pg/programme/p81' },
          { school: '香港浸会大学', program: 'MA in Communication (Interactive Media Concentration)', url: 'https://ar.hkbu.edu.hk/tpg-admissions/programmes/master-of-arts-ma-in-communication' },
          { school: '北师港浸会大学', program: 'Artificial Intelligence & Digital Media Concentration', url: 'https://gs.uic.edu.cn/graduate1/Taught_Postgraduate_Programme/Artificial_Intelligence___Digital_Media_Concentrat.htm' },
          { school: '北师港浸会大学', program: 'Interactive Media Studies Concentration', url: 'https://gs.uic.edu.cn/graduate1/Taught_Postgraduate_Programme/imsc.htm' },
          { school: '香港恒生大学', program: 'Master of Arts in Entertainment Media Management and Communication', url: 'https://scom.hsu.edu.hk/en/master-of-arts-in-entertainment-media-management-and-communication/' },
        ] },
      { key: 'info-experience', nameCn: '信息体验与应用设计', nameEn: 'Information Experience & Applied Design', color: 'internet', caseCount: 1,
        schools: [
          { school: '香港大学', program: 'MSSc in the field of Media, Culture and Creative Cities', url: 'https://sociology.hku.hk/taught-postgraduate/tpg-media-culture-creative-cities' },
          { school: '香港大学', program: 'Master of Science in Engineering (Innovative Design and Technology)', url: 'https://admissions.hku.hk/tpg/programme/master-science-engineering-innovative-design-and-technology' },
          { school: '香港科技大学', program: 'Master of Arts (MA) in Arts and Machine Creativity', url: 'https://amc.hkust.edu.hk/master-arts-ma-program-program-objective' },
          { school: '香港科技大学', program: 'MSc Technology Leadership and Entrepreneurship', url: 'https://isd.hkust.edu.hk/academics/msc-tle' },
          { school: '香港中文大学', program: 'M.Sc. in Artificial Intelligence and Communication', url: 'https://aicomm.com.cuhk.edu.hk' },
          { school: '香港理工大学', program: 'Innovative Business Design (MDes)', url: 'https://www.sd.polyu.edu.hk/en/study-detail/innovative-business-design' },
          { school: '香港教育大学', program: 'Master of Arts in New Media and Social Media', url: 'https://aedi.eduhk.hk/programmes/postgraduate-programmes/master-of-arts-in-new-media-and-social-media' },
        ] },
      { key: 'mixed-media', nameCn: '多媒介与装置艺术', nameEn: 'Mixed Media & Installation Art', color: 'indie', caseCount: 4,
        schools: [
          { school: '香港科技大学', program: 'Master of Arts (MA) in Arts and Machine Creativity', url: 'https://amc.hkust.edu.hk/master-arts-ma-program-program-objective' },
          { school: '香港理工大学', program: 'Multimedia & Entertainment Technology (MSc)', url: 'https://www.sd.polyu.edu.hk/en/study-detail/multimedia-and-entertainment-technology' },
          { school: '香港城市大学', program: 'MFA Creative Media', url: 'https://www.cityu.edu.hk/pg/programme/p80' },
          { school: '香港城市大学', program: 'MA Creative Media', url: 'https://www.cityu.edu.hk/pg/programme/p81' },
        ] },
      { key: 'ai-computing', nameCn: 'AI创意计算机与互动机械', nameEn: 'AI Creative Computing & Interactive Systems', color: 'ai', caseCount: 1,
        schools: [
          { school: '香港大学', program: 'Master of Science in Engineering (Innovative Design and Technology)', url: 'https://admissions.hku.hk/tpg/programme/master-science-engineering-innovative-design-and-technology' },
          { school: '香港大学', program: 'Master of Science in Technology, Design and Leadership for Learning', url: 'https://web.edu.hku.hk/programme/tdll' },
          { school: '香港科技大学', program: 'Master of Arts (MA) in Arts and Machine Creativity', url: 'https://amc.hkust.edu.hk/master-arts-ma-program-program-objective' },
          { school: '香港科技大学', program: 'MSc Technology Leadership and Entrepreneurship', url: 'https://isd.hkust.edu.hk/academics/msc-tle' },
          { school: '香港理工大学', program: 'MSc Innovative Multimedia Entertainment', url: 'https://www.polyu.edu.hk/sd/study/tpg/innovative-multimedia-entertainment/' },
          { school: '香港浸会大学', program: 'MSc in AI and Digital Media', url: 'https://comm.hkbu.edu.hk/en/programmes/taught-postgraduate-programmes/aidm.html' },
          { school: '香港教育大学', program: 'Master of Arts in Emerging Technology for Future Workforce', url: 'https://aapsef.eduhk.hk/study/prospective-students/academic-programmes/master-of-arts-in-emerging-technology-for-future-workforce' },
          { school: '北师港浸会大学', program: 'Artificial Intelligence & Digital Media Concentration', url: 'https://gs.uic.edu.cn/graduate1/Taught_Postgraduate_Programme/Artificial_Intelligence___Digital_Media_Concentrat.htm' },
        ] },
      { key: 'edu-tech', nameCn: '教育与科技', nameEn: 'EdTech & Learning Design', color: 'edu', caseCount: 2,
        schools: [
          { school: '香港教育大学', program: 'Master of Arts in Visual Arts Education and Creative Practice', url: 'https://mavaecp.eduhk.hk/' },
          { school: '香港大学', program: 'Master of Science in Technology, Design and Leadership for Learning', url: 'https://web.edu.hku.hk/programme/tdll' },
        ] },
    ],
    featuredStories: [
      { title: '均分70+起步，我用“艺术+科技”搞定绩点竞赛毕设，“一鱼多吃”拿下港三录取！', url: 'https://mp.weixin.qq.com/s/kJPs7OxhTUHKz7DcpP240g' },
      { title: '雅思6分，我“放弃”语言！先拿皇艺+伦艺+港理工等9枚offer', url: 'https://mp.weixin.qq.com/s/NLuM2v6HJuuBOFPmPx21_A' },
      { title: '武大学霸、万粉运动博主，我用“数字媒体”的多元创作，跨界拿下港大offer！', url: 'https://mp.weixin.qq.com/s/hRG6DMTb3AmvvtUfgL2Sgg' },
      { title: '港浸会秋招，让我完美切换职场人！到底是谁还在劝退视传？', url: 'https://mp.weixin.qq.com/s/jtZlCQxaOC0cZAvggu6TRQ' },
    ],
    closingStatementCn: '常规打基础，学霸提效率 —— 两条路径，同一个港校offer目标。',
    closingStatement: 'Two tracks, one Hong Kong offer — built to fit where you\'re starting from.',
  },
  /* ── CATALOG 1 — 就业实习课程 ── */
  internship: {
    group: 'catalog',
    // v3.34 (GM): "pick 1 img from each 课程目录 and use as cover img" — a
    // real photo from this catalog's own course content (dad_courses_
    // industry.json's `poster` field), cropped to the top photo-only
    // strip (no baked-in body text) and re-encoded, same pipeline as the
    // longform product covers above. Picked the 泡泡玛特(POP MART) 岗位制
    // 实习 poster's mall-display photo — a real partner-company shot, not
    // a stock image.
    cover: 'assets/img/course-products/covers/internship.webp',
    catalogSource: { file: 'industry', tabs: ['internship', 'mentoring', 'industry_class', 'cert'] },
    count: 97,
    meta: {
      eyebrow: 'Employment Track｜岗位实习 × 行业导师带训',
      titleEn: 'Career Internship Program',
      titleCn: '就业实习课程 · 岗位实习与导师带训',
      desc: '面向希望获得真实行业经验、积累作品集与推荐信的学生，通过岗位制实地实习与线上行业导师带训两种路径，进入头部大厂、行业名企与创意工作室的真实项目。',
      chips: ['97个岗位/课程', '实地+线上', '头部大厂', '招募中'],
    },
    snapshot: [
      { k: '97个',   v: '在招岗位与带训课程' },
      { k: '2种路径', v: '岗位制实地实习 / 导师带训' },
      { k: '4类企业', v: '头部大厂·行业名企·创意工作室·其他' },
      { k: '真实产出', v: '作品集 + 导师推荐信' },
    ],
    whyNow: [
      '从"了解行业"到"进入行业" — Learning About → Working In',
      '从"模拟项目"到"真实交付" — Simulated → Real Deliverables',
      '从"泛泛推荐信"到"岗位导师背书" — Generic → Role-Specific Endorsement',
      '从"投递简历"到"手握项目经验" — Applying → Already Experienced',
    ],
    curriculum: [
      { title: '岗位制实地实习', desc: '进入头部大厂、行业名企与创意工作室的真实岗位，完成完整项目周期。',
        detail: { duration: '6-8周 · 全职或每周3天', highlights: ['进入头部大厂、行业名企与创意工作室', '完成完整项目周期的真实交付', '获得岗位导师一对一带教'], sampleCourses: ['互联网大厂产品设计实习', '建筑事务所设计实习', '品牌咨询公司项目实习'], intro: '进入真实企业岗位，在岗位导师带领下完成完整项目周期，产出可写入简历与作品集的真实交付成果。' } },
      { title: '线上行业导师带训', desc: '不受地域限制，跟随行业导师完成真实课题与项目产出。',
        detail: { duration: '6-8周 · 每周线上课时', highlights: ['不受地域限制，随时接入', '跟随行业导师完成真实课题', '产出与实地实习同等分量的项目成果'], sampleCourses: ['产品设计方法论带训', '品牌策略实战带训', '用户研究实战带训'], intro: '面向无法离校实习的学生，通过线上形式跟随行业导师完成真实课题与项目产出，成果分量与实地实习相当。' } },
      { title: '企业分层项目库', desc: '头部大厂/行业名企/创意工作室/其他四类分层，按方向精准匹配岗位。',
        detail: { duration: '滚动更新 · 按需匹配', highlights: ['头部大厂/行业名企/创意工作室/其他四类分层', '按学生方向与阶段精准匹配', '岗位与带训课程滚动更新'], sampleCourses: ['大厂产品设计岗', '精品工作室创意岗', '行业名企运营岗'], intro: '将合作企业按头部大厂、行业名企、创意工作室与其他四类分层管理，根据学生的专业方向与所处阶段精准匹配最合适的岗位。' } },
    ],
    whySFK: [
      { t: '岗位真实', d: '直连头部大厂、行业名企与创意工作室的真实岗位与项目，而非模拟练习。' },
      { t: '双路径灵活', d: '岗位制实地实习与线上导师带训两种形式，匹配不同学段与时间安排。' },
      { t: '企业分层清晰', d: '头部大厂/行业名企/创意工作室/其他四类分层，按方向精准匹配。' },
      { t: '持续更新', d: '岗位与带训课程滚动更新，招募状态实时可见。' },
    ],
    closingStatementCn: '从课堂知识，到真实行业交付。',
    closingStatement: 'From classroom knowledge to real industry delivery.',
  },

  /* ── CATALOG 2 — 海外冬夏校课程 ── */
  summerwinter: {
    group: 'catalog',
    // v3.22 (GM): "冬夏校中只保留27冬校系列的研究生课程。所有本科与26年课程先
    // 拿掉。" — dad_courses_academic.json's `program_type` (海外冬夏校) covers
    // BOTH the "winter 27" batch and the "summer 26" batch, so a plain
    // tabs:['summer'] filter can't tell them apart on its own; ist-data.js
    // now preserves each record's original season under `.season` (see its
    // header comment) before overwriting `.tab`, so `extraFilter` here can
    // require season === 'winter 27' AND level === '研究生', temporarily
    // dropping all 本科 rows and the whole "summer 26" batch. Remove
    // extraFilter to restore the full 19-item catalog later.
    // v3.34 (GM): cover picked from this catalog's own poster set — the
    // 费俊×某集体×RCAxUCLA 27冬校 poster's title/art panel, cropped above
    // the speaker headshots.
    cover: 'assets/img/course-products/covers/summerwinter.webp',
    // 冬夏校数据同时含本科与研究生项目；本目录仅面向研究生课程。
    catalogSource: { file: 'academic', tabs: ['summer'], extraFilter: c => (c.status === 'current' || c.status === 'archive') && c.level === '研究生', statusFilter: true },
    count: 18,
    meta: {
      eyebrow: 'Academic Track｜海外院校冬夏校',
      titleEn: 'Overseas Summer & Winter School',
      titleCn: '海外冬夏校课程 · 顶尖院校在地学习',
      desc: '走进海外顶尖院校的官方冬夏校项目，在真实校园环境中体验前沿学术方向，积累院校认可的学术背景与教授推荐资源。',
      chips: ['27冬校 · 当前课程', '26年往期课程', '在地学习', '招募中'],
    },
    snapshot: [
      { k: '当前 / 往期', v: '27冬校与26年课程均可查阅' },
      { k: '在地体验', v: '真实校园与课堂环境' },
      { k: '多学术方向', v: '覆盖设计 / 商科 / 工程等' },
      { k: '官方认证', v: '院校官方项目背书' },
    ],
    whyNow: [
      '从"了解院校"到"走进院校" — Knowing About → Being There',
      '从"网课体验"到"在地学习" — Online → On Campus',
      '从"泛泛兴趣"到"学术方向确认" — Curiosity → Direction',
      '从"参加活动"到"院校资源积累" — Attending → Accumulating',
    ],
    curriculum: [
      { title: '海外院校官方冬夏校', desc: '对接海外院校官方冬夏校项目，而非第三方机构包装课程。',
        detail: { duration: '2-4周 · 寒暑假在地或线上', highlights: ['对接海外院校官方项目', '而非第三方机构包装课程', '完成后获院校官方结业证明'], sampleCourses: ['Harvard GSD 建筑冬校', 'RISD 暑期先修课程', 'Parsons 暑期设计工作营'], intro: '直接对接海外院校官方开设的冬夏校项目，避免第三方机构包装课程的信息不对称，学生完成后可获得院校官方认可的结业证明。' } },
      { title: '在地课堂与校园体验', desc: '真实校园环境与课堂节奏，提前适应海外学习生活。',
        detail: { duration: '2-4周 · 校园沉浸', highlights: ['真实校园环境与课堂节奏', '与在读学生同堂上课', '提前适应海外学习与生活方式'], sampleCourses: ['校园课堂旁听体验', '海外同学互动工作坊', '校园生活适应指南'], intro: '走进海外院校真实的课堂环境，与在读学生同堂学习，在正式入学前提前适应海外的学习节奏与校园生活方式。' } },
      { title: '多学术方向探索', desc: '覆盖设计、商科、工程等多个方向，帮助学生确认专业兴趣。',
        detail: { duration: '按项目安排 · 2-4周', highlights: ['覆盖设计、商科、工程等多个方向', '帮助学生确认真实兴趣', '为后续专业选择提供依据'], sampleCourses: ['设计方向体验营', '商科方向体验营', '工程方向体验营'], intro: '在正式确定申请方向之前，通过多个学术方向的短期体验，帮助学生识别真正感兴趣、也适合自己的专业路径。' } },
    ],
    whySFK: [
      { t: '院校真实', d: '对接海外院校官方冬夏校项目，而非第三方机构包装课程。' },
      { t: '方向覆盖广', d: '覆盖多个学术方向，帮助学生在申请前确认专业兴趣。' },
      { t: '在地沉浸', d: '真实校园环境与课堂节奏，提前适应海外学习生活。' },
      { t: '长期衔接', d: '与后续申请及大师课资源形成连续的学术积累路径。' },
    ],
    closingStatementCn: '走进真实校园，再启程真实申请。',
    closingStatement: 'A real campus, before the real application.',
  },

  /* ── CATALOG 3 — 商业实践课程 ── */
  bizpractice: {
    group: 'catalog',
    // v3.34 (GM): cover picked from this catalog's own poster set — the
    // SFKx北京冬奥会开幕式视效导演 poster's AI ink-art installation photo.
    cover: 'assets/img/course-products/covers/bizpractice.webp',
    catalogSource: { file: 'industry', tabs: ['bizpractice'] },
    count: 14,
    meta: {
      eyebrow: 'Practice Track｜真实商业项目实战',
      titleEn: 'Business Practice Program',
      titleCn: '商业实践课程 · 真实商业项目实战',
      desc: '以真实企业命题为起点，在导师带领下完成从市场调研、方案设计到路演展示的完整商业实践闭环，锻炼商业思维与团队协作能力。',
      chips: ['14个项目', '真实命题', '路演展示', '招募中'],
    },
    snapshot: [
      { k: '14个',     v: '在招商业实践项目' },
      { k: '真实命题', v: '源自真实企业需求' },
      { k: '完整闭环', v: '调研 → 方案 → 路演' },
      { k: '团队协作', v: '小组制项目产出' },
    ],
    whyNow: [
      '从"课堂案例"到"真实命题" — Case Study → Real Brief',
      '从"独立完成"到"团队路演" — Solo Work → Team Pitch',
      '从"理论分析"到"落地方案" — Theory → Actionable Plan',
      '从"被动学习"到"主动提案" — Passive → Proactive',
    ],
    curriculum: [
      { title: '真实企业命题', desc: '项目命题均来自真实企业需求，而非虚构案例。',
        detail: { duration: '4-6周 · 命题制项目', highlights: ['项目命题均来自真实企业需求', '而非虚构或简化案例', '产出直接对接企业实际问题'], sampleCourses: ['消费品品牌命题实战', '互联网产品命题实战', '零售空间命题实战'], intro: '每一期项目的命题都来自合作企业的真实业务需求，学生的方案需要真正回应企业面临的问题，而非简化后的教学案例。' } },
      { title: '市场调研与方案设计', desc: '在导师带领下完成从调研到方案落地的完整方法论训练。',
        detail: { duration: '3-4周 · 小组制', highlights: ['在导师带领下完成系统调研', '调研结论直接支撑方案设计', '训练从洞察到落地的方法论'], sampleCourses: ['市场调研方法工作坊', '用户洞察转化训练', '方案设计与验证'], intro: '在行业导师带领下完成从市场调研、用户洞察到方案设计的完整方法论训练，确保最终方案有据可依，而非拍脑袋式的创意输出。' } },
      { title: '路演展示训练', desc: '小组制协作产出路演成果，锻炼团队与表达能力。',
        detail: { duration: '1-2周 · 小组制冲刺', highlights: ['小组制协作产出路演成果', '面向真实评委的正式路演', '锻炼商业表达与临场应变能力'], sampleCourses: ['路演稿撰写工作坊', '商业演讲表达训练', '模拟路演与复盘'], intro: '项目收尾阶段，小组需要向真实企业评委进行正式路演，这一环节训练学生将复杂方案浓缩为清晰有说服力的商业表达。' } },
    ],
    whySFK: [
      { t: '命题真实', d: '项目命题均来自真实企业需求，而非虚构案例。' },
      { t: '闭环完整', d: '覆盖调研、方案设计到路演展示的完整商业实践流程。' },
      { t: '导师带教', d: '行业导师全程带领，提供商业思维与方法论指导。' },
      { t: '团队产出', d: '小组制协作产出路演成果，锻炼团队与表达能力。' },
    ],
    closingStatementCn: '从真实商业命题，到真实路演展示。',
    closingStatement: 'From a real brief to a real pitch.',
  },

  /* ── CATALOG 4 — 海外大师课程 ── */
  masterclass: {
    group: 'catalog',
    // v3.34 (GM): cover picked from this catalog's own poster set — the
    // 皇家艺术学院(RCA) 暑假大师课 poster's title/headshot panel.
    cover: 'assets/img/course-products/covers/masterclass.webp',
    catalogSource: { file: 'academic', tabs: ['masterclass'] },
    count: 12,
    meta: {
      eyebrow: 'Academic Track｜海外教授大师课',
      titleEn: 'Overseas Masterclass',
      titleCn: '海外大师课程 · 教授视角与方法论',
      desc: '由海外院校教授亲自授课，围绕特定学术方向展开深度方法论训练，为学生带来教授视角的专业指导与推荐信资源。',
      chips: ['12个课程', '教授亲授', '方法论训练', '招募中'],
    },
    snapshot: [
      { k: '12个',       v: '在招大师课程' },
      { k: '教授亲授',    v: '海外院校教授直接授课' },
      { k: '方法论导向',  v: '聚焦专业方法论训练' },
      { k: '推荐信资源',  v: '教授视角评价与推荐' },
    ],
    whyNow: [
      '从"网络课程"到"教授亲授" — Online Course → Taught by Professors',
      '从"通识内容"到"方法论深度" — General → Methodological Depth',
      '从"泛泛评价"到"教授推荐信" — Generic Feedback → Professor Recommendation',
      '从"了解方向"到"验证方向" — Exploring → Validating',
    ],
    curriculum: [
      { title: '教授亲授方法论课程', desc: '课程由海外院校教授本人讲授，围绕具体学术方法论展开深度训练。',
        detail: { duration: '4-6周 · 教授亲授', highlights: ['课程由海外院校教授本人讲授', '而非助教代课或录播回放', '围绕具体学术方法论深度展开'], sampleCourses: ['人机交互方法论大师课', '建筑设计研究方法大师课', '服务设计战略大师课'], intro: '由海外院校教授本人亲自授课，围绕其专业领域内具体的研究方法论展开深度讲解，而非泛泛而谈的公开课形式。' } },
      { title: '专业方向深度训练', desc: '聚焦特定学术方向的方法论深度，而非泛泛概览。',
        detail: { duration: '4-6周 · 方法论深度训练', highlights: ['聚焦特定学术方向的方法论深度', '而非泛泛概览多个方向', '训练成果可直接写入作品集'], sampleCourses: ['专业方法论深度工作坊', '课题式研究训练', '方法论应用实战'], intro: '不同于泛泛介绍多个方向的通识课程，这一环节聚焦学生目标申请方向的方法论深度，帮助其在申请材料中体现出专业判断力。' } },
      { title: '教授视角推荐信', desc: '表现优秀的学生可获得教授视角的推荐信支持。',
        detail: { duration: '课程结束后评估 · 视表现而定', highlights: ['表现优秀的学生可获推荐信', '推荐信来自教授本人视角', '为申请材料增加院校背书'], sampleCourses: ['课程表现评估', '推荐信申请流程指导', '教授面谈机会（视课程而定）'], intro: '课程结束后，教授会根据学生的课堂表现与课题产出进行评估，表现优秀者有机会获得教授本人撰写的推荐信，为申请材料增加真实的院校背书。' } },
    ],
    whySFK: [
      { t: '教授亲授', d: '课程由海外院校教授本人讲授，而非助教代课。' },
      { t: '方法论聚焦', d: '围绕具体学术方法论展开深度训练，而非泛泛概览。' },
      { t: '推荐信资源', d: '表现优秀的学生可获得教授视角的推荐信支持。' },
      { t: '方向验证', d: '帮助学生在申请前验证学术方向与研究兴趣。' },
    ],
    closingStatementCn: '在申请之前，先获得教授视角。',
    closingStatement: 'Professor-level perspective, before you apply.',
  },
};

/* ── Recommended schools & majors, organised by the site's existing
   "five industry directions" (see index.html footer / planning.js) —
   shared across all longform products since the branch taxonomy is
   university-wide, not product-specific. Each branch surfaces 2 schools
   in depth plus a shortlist of other commonly-applied options. ── */
const SCHOOL_RECS = [
  {
    key: 'internet', nameCn: '互联网科技', nameEn: 'Internet & Tech',
    featured: [
      { schoolCn: '卡内基梅隆大学', schoolEn: 'Carnegie Mellon University', program: '人机交互硕士 · HCII', note: '全球人机交互研究重镇，产研结合紧密，硅谷大厂校招资源丰富。' },
      { schoolCn: '华盛顿大学', schoolEn: 'University of Washington', program: '人机交互与设计工程 · HCDE', note: '地处西雅图科技产业腹地，微软、亚马逊校友网络活跃。' },
    ],
    more: ['麻省理工学院 Media Lab', '佐治亚理工学院', '密歇根大学', '加州大学圣地亚哥分校', '康奈尔科技学院'],
  },
  {
    key: 'hardware', nameCn: '智能实体产业', nameEn: 'Smart Hardware & Product',
    featured: [
      { schoolCn: '皇家艺术学院', schoolEn: 'Royal College of Art', program: '设计产品硕士 · Design Products', note: '全球工业设计顶尖学府，注重概念创新与设计研究方法。' },
      { schoolCn: '艺术中心设计学院', schoolEn: 'ArtCenter College of Design', program: '产品设计硕士', note: '紧邻硅谷与洛杉矶制造业腹地，量产落地能力突出。' },
    ],
    more: ['普瑞特艺术学院', '伊利诺伊理工设计学院 ID', '米兰理工大学', '代尔夫特理工大学', '罗德岛设计学院'],
  },
  {
    key: 'culture', nameCn: '数字文化娱乐', nameEn: 'Digital Culture & Entertainment',
    featured: [
      { schoolCn: '南加州大学', schoolEn: 'University of Southern California', program: '互动媒体与游戏硕士 · IMGD', note: '好莱坞与游戏产业双资源，行业导师网络覆盖广。' },
      { schoolCn: '纽约大学', schoolEn: 'New York University', program: 'ITP 交互通讯项目 / Game Center', note: '跨媒介创作氛围浓厚，毕业生活跃于独立游戏与新媒体艺术领域。' },
    ],
    more: ['帕森斯设计学院', '萨凡纳艺术与设计学院', '加州艺术学院', 'DigiPen理工学院', '卡内基梅隆娱乐科技中心 ETC'],
  },
  {
    key: 'brand', nameCn: '品牌与服务', nameEn: 'Brand & Service',
    featured: [
      { schoolCn: '帕森斯设计学院', schoolEn: 'Parsons School of Design', program: '战略设计与管理硕士', note: '商业与设计交叉训练，纽约品牌与咨询资源密集。' },
      { schoolCn: '伦敦传媒学院', schoolEn: 'London College of Communication', program: '服务体验设计硕士', note: '英国服务设计方法论发源地之一，产学合作项目丰富。' },
    ],
    more: ['中央圣马丁学院', '视觉艺术学院 SVA', '多莫斯设计学院', '米兰理工大学（服务设计）', '萨凡纳艺术与设计学院'],
  },
  {
    key: 'arch', nameCn: '建筑环境科技', nameEn: 'Architecture & Built Environment',
    featured: [
      { schoolCn: '哈佛大学设计研究生院', schoolEn: 'Harvard GSD', program: '建筑学硕士 · M.Arch', note: '建筑教育顶级殿堂，跨学科设计研究氛围浓厚。' },
      { schoolCn: '哥伦比亚大学建筑规划与保护研究生院', schoolEn: 'Columbia GSAPP', program: '建筑学硕士', note: '位于纽约核心区域，实验性设计与城市议题结合紧密。' },
    ],
    more: ['加州大学伯克利分校 CED', '宾夕法尼亚大学 Weitzman', '南加州建筑学院 SCI-Arc', '建筑联盟学院 AA', '康奈尔大学 AAP'],
  },
];

/* ── Shared HTML builder ── */
function buildCatalogGridHTML(product) {
  // NOTE (DAD copy, 2026-09; wired to real data 2026-09 v3.2): the
  // catalog grid calls HomePage._buildInternshipPanel/_buildCourseGrid/
  // _buildAcademicGrid (assets/js/pages/home.js, bottom) against
  // DATA.courses_industry/DATA.courses_academic (assets/js/ist-data.js,
  // loaded from data/dad_courses_industry.json / dad_courses_academic.json).
  // The `hasHelpers` guard below is kept as a defensive degrade — if
  // either file fails to load, this still shows the placeholder instead
  // of throwing — rather than because the helpers are unimplemented.
  const src = product.catalogSource;
  if (!src) return '';
  const hasHelpers = window.HomePage && window.HomePage._buildInternshipPanel
    && window.HomePage._buildCourseGrid && window.HomePage._buildAcademicGrid
    && typeof DATA !== 'undefined' && (DATA.courses_industry || DATA.courses_academic);
  if (!hasHelpers) {
    return `<div class="tl-gantt-empty" style="padding:40px 0">课程目录数据接入中 · 此区块结构已就位</div>`;
  }
  if (src.tabs.includes('internship')) {
    // 122+ items → reuse the existing filter-bar + grid, verbatim
    return window.HomePage._buildInternshipPanel();
  }
  const dataset = src.file === 'industry' ? DATA.courses_industry : DATA.courses_academic;
  let items = (dataset || []).filter(c => src.tabs.includes(c.tab));
  // v3.22: optional extra predicate beyond the tab match (see summerwinter's
  // catalogSource for why — a tab alone can't distinguish "27冬校" from
  // "summer 26" once both are remapped to the same tab code).
  if (src.extraFilter) items = items.filter(src.extraFilter);
  return src.file === 'industry'
    ? window.HomePage._buildCourseGrid(items)
    : window.HomePage._buildAcademicGrid(items, { statusFilter: !!src.statusFilter });
}

// v3.22 (GM, temporary): "暂时去掉短期课程目录overlay中除title block与速览外
// 的内容" — 短期课程目录 (catalog) overlays are trimmed down while the rest of
// the course-page overhaul GM flagged ("接下来大改course page") is worked
// out. GM then clarified "真实课程列表还是要的" — the real course-listing
// grid (buildCatalogGridHTML, reusing HomePage's card grid against the
// real dad_courses_*.json data) stays; it's just the surrounding pitch
// copy (why-now / simple curriculum overview cards / why-SFK / CTA) that's
// skipped. Flip this back to false to restore all of it — nothing below
// was deleted, it's just skipped while this is true.
const CATALOG_OVERLAY_MINIMAL = true;

function buildProductHTML(product, productId) {
  const sec = (id, cnLabel, enLabel, inner) => `
    <section class="cd-section">
      <div class="cd-section__label">${cnLabel} <span class="u-en">${enLabel}</span></div>
      ${inner}
    </section>`;

  const tileCls = 'cd-hero__tile' + (product.tileVariant ? ' cd-hero__tile--' + product.tileVariant : '');

  // v3.26: an optional "查看比价" button next to the title, opening a
  // paged PdfViewer over the product's pre-rendered comparison-PDF pages
  // (see registerPdfDoc/PdfViewer in components.js — same pattern as
  // ist_demo's 冬夏校 PDF viewer, ported for DAD). v3.32 (GM): a
  // `product.tracks` product (HK's 常规/学霸) has one comparePdf PER
  // track instead of one for the whole product — each gets registered
  // under `${productId}__${trackKey}`, and the button opens whichever
  // one TrackSwitcher says is currently active (defaulting to the first
  // track before the visitor has clicked either tab).
  let compareBtn = '';
  if (product.comparePdf) {
    registerPdfDoc(productId, product.comparePdf);
    compareBtn = `
        <button type="button" class="cd-compare-btn" onclick="PdfViewer.open('${productId}')">
          查看比价 <span class="u-en">Compare Plans ›</span>
        </button>`;
  } else if (product.tracks) {
    const trackKeys = Object.keys(product.tracks);
    trackKeys.forEach(k => {
      if (product.tracks[k].comparePdf) registerPdfDoc(`${productId}__${k}`, product.tracks[k].comparePdf);
    });
    if (trackKeys.some(k => product.tracks[k].comparePdf)) {
      compareBtn = `
        <button type="button" class="cd-compare-btn" onclick="PdfViewer.open(TrackSwitcher.pdfKey('${productId}','${trackKeys[0]}'))">
          查看比价 <span class="u-en">Compare Plans ›</span>
        </button>`;
    }
  }

  let html = `
    <div class="cd-hero">
      <div class="cd-hero__content">
        <div class="cd-hero__eyebrow">${product.meta.eyebrow}</div>
        <div class="cd-hero__title-row">
          <h1 class="cd-hero__title">${product.meta.titleCn}</h1>
          ${compareBtn}
        </div>
        <div class="cd-hero__subtitle"><span class="u-en">${product.meta.titleEn}</span></div>
        <p class="cd-hero__desc">${product.meta.desc}</p>
        <div class="cd-chips">${product.meta.chips.map(c => `<span class="cd-chip">${c}</span>`).join('')}</div>
      </div>
      <div class="${tileCls}" aria-hidden="true">${product.cover ? `<img src="${product.cover}" alt="" loading="lazy">` : ''}</div>
    </div>`;

  html += sec('snapshot', '速览', 'Snapshot', `
    <div class="cd-stat-grid">
      ${product.snapshot.map(s => `
        <div class="cd-stat">
          <div class="cd-stat__k">${s.k}</div>
          <div class="cd-stat__v">${s.v}</div>
        </div>`).join('')}
    </div>`);

  if (CATALOG_OVERLAY_MINIMAL && product.group === 'catalog') {
    html += `
      <section class="cd-section cd-section--wide">
        <div class="cd-section__label">课程目录 <span class="u-en">Catalog</span></div>
        ${buildCatalogGridHTML(product)}
      </section>`;
    return html;
  }

  // Catalog products keep their original "why now" pitch; longform products
  // replace it with highlight courses + fit-audience further below.
  if (product.group === 'catalog' && product.whyNow) {
    html += sec('why-now', '为什么现在', 'Why Now', `
      <ul class="cd-list">
        ${product.whyNow.map(w => `<li>${w}</li>`).join('')}
      </ul>`);
  }

  const courseCardGrid = (items, keyPrefix) => `
    <div class="cd-curriculum-grid">
      ${items.map((c, i) => {
        const key = `${keyPrefix}-${productId}-${i}`;
        if (c.detail) registerMiniCourse(key, c.detail, c.title, '');
        return `
        <div class="cd-curriculum-card">
          <div class="cd-curriculum-card__img${i === 1 ? ' cd-curriculum-card__img--v2' : i === 2 ? ' cd-curriculum-card__img--v3' : ''}" aria-hidden="true"></div>
          <div class="cd-curriculum-card__body">
            <button type="button" class="cd-curriculum-card__title${c.detail ? ' is-clickable' : ''}"${c.detail ? ` onclick="MiniCourseModal.open('${key}')"` : ''}>${c.title}${c.detail ? '<span class="cd-mini-hint">详情 ›</span>' : ''}</button>
            <p class="cd-curriculum-card__desc">${c.desc}</p>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  // ── v3.26 rich-content branch (real docx-sourced longform pages,
  // e.g. longform2/UK) — takes over from here in place of everything
  // below down to the studentCases/appTimeline/topicWall/school-recs
  // blocks, all of which stay gated with `!product.useRichContent` as
  // the still-live template for any longform product not yet rebuilt. ──
  if (product.useRichContent) {
    html += buildRichLongformSections(product, productId, sec);
  }

  if (product.group === 'longform' && product.highlightCourses && !product.useRichContent) {
    html += sec('highlights', '亮点课程', 'Highlight Courses', courseCardGrid(product.highlightCourses, 'hl'));
  }

  if (product.group === 'longform' && product.fitAudience && !product.useRichContent) {
    html += sec('fit-audience', '适配人群', 'Who It\'s For', `
      <ul class="cd-list">
        ${product.fitAudience.map(a => `<li>${a}</li>`).join('')}
      </ul>`);
  }

  // Catalog products: original simple 3-card curriculum overview.
  if (product.curriculum) {
    html += sec('curriculum', '核心课程', 'Curriculum', courseCardGrid(product.curriculum, 'cur'));
  }

  // Longform products: detailed category → item → hours table, each item clickable.
  if (product.curriculumTable && !product.useRichContent) {
    html += sec('curriculum', '核心课程', 'Curriculum', `
      <div class="cd-curric-table">
        ${product.curriculumTable.categories.map((cat, ci) => `
          <div class="cd-curric-cat">
            <div class="cd-curric-cat__head">
              <span class="cd-curric-cat__dot" style="background:var(--color-${cat.color})"></span>
              <span class="cd-curric-cat__name">${cat.name}</span>
              ${cat.subLabel ? `<span class="cd-curric-cat__sub u-en">${cat.subLabel}</span>` : ''}
            </div>
            <div class="cd-curric-cat__items">
              ${cat.items.map((item, ii) => {
                const key = `ct-${productId}-${ci}-${ii}`;
                if (item.detail) registerMiniCourse(key, item.detail, item.name, '');
                return `
                <div class="cd-curric-item">
                  <button type="button" class="cd-curric-item__name${item.detail ? ' is-clickable' : ''}"${item.detail ? ` onclick="MiniCourseModal.open('${key}')"` : ''}>${item.name}${item.detail ? '<span class="cd-mini-hint">详情 ›</span>' : ''}</button>
                  <span class="cd-curric-item__hours">${item.hours}</span>
                </div>`;
              }).join('')}
            </div>
          </div>`).join('')}
      </div>`);
  }

  if (product.group === 'longform' && !product.useRichContent) {
    html += sec('school-recs', '院校与专业推荐', 'School & Major Recommendations', `
      <div class="cd-schoolrec">
        ${SCHOOL_RECS.map(b => `
          <div class="cd-schoolrec-branch">
            <div class="cd-schoolrec-branch__head">
              <span class="cd-schoolrec-branch__dot" style="background:var(--color-${b.key})"></span>
              <span class="cd-schoolrec-branch__name">${b.nameCn}</span>
              <span class="cd-schoolrec-branch__name-en u-en">${b.nameEn}</span>
            </div>
            <div class="cd-schoolrec-featured">
              ${b.featured.map(s => `
                <div class="cd-schoolrec-card">
                  <div class="cd-schoolrec-card__img" style="background:linear-gradient(135deg, var(--color-${b.key}) 0%, var(--color-primary-bright) 100%)" aria-hidden="true"></div>
                  <div class="cd-schoolrec-card__body">
                    <div class="cd-schoolrec-card__school">${s.schoolCn}</div>
                    <div class="cd-schoolrec-card__school-en u-en">${s.schoolEn}</div>
                    <div class="cd-schoolrec-card__program">${s.program}</div>
                    <p class="cd-schoolrec-card__note">${s.note}</p>
                  </div>
                </div>`).join('')}
            </div>
            <div class="cd-schoolrec-more">
              <span class="cd-schoolrec-more__label">同类可选 <span class="u-en">More</span></span>
              ${b.more.map(m => `<span class="cd-schoolrec-more__chip">${m}</span>`).join('')}
            </div>
          </div>`).join('')}
      </div>`);
  }

  if (product.studentCases && !product.useRichContent) {
    html += sec('cases', '优秀成功案例', 'Success Stories', `
      <div class="cd-case-grid">
        ${product.studentCases.map((c, i) => `
          <div class="cd-case">
            <div class="cd-case__banner${i % 3 === 1 ? ' cd-case__banner--v2' : i % 3 === 2 ? ' cd-case__banner--v3' : ''}">
              <span class="cd-case__badge">优秀学员</span>
            </div>
            <div class="cd-case__body">
              <div class="cd-case__schools"><span class="cd-case__name">${c.name}</span>Offer · ${c.schools.join(' / ')}</div>
              <div class="cd-case__tagline">${c.tagline}</div>
              <div class="cd-case__highlights">${c.highlights}</div>
              <p class="cd-case__bio">${c.bio}</p>
              ${c.quote ? `<div class="cd-case__quote">${c.quote}</div>` : ''}
            </div>
          </div>`).join('')}
      </div>`);
  }

  if (product.group === 'longform' && product.appTimeline && !product.useRichContent) {
    const timeline = product.appTimeline;
    const renderStep = (s) => {
      const key = `tl-${productId}-${s.q}`;
      const isFinal = s === timeline[timeline.length - 1];
      if (s.detail) registerMiniCourse(key, s.detail, s.type, '');
      return `
        <div class="cd-timeline__step${isFinal ? ' cd-timeline__step--final' : ''}">
          <div class="cd-timeline__day">${s.q} · ${s.phase}</div>
          <button type="button" class="cd-timeline__title${s.detail ? ' is-clickable' : ''}"${s.detail ? ` onclick="MiniCourseModal.open('${key}')"` : ''}>${s.type}${s.detail ? '<span class="cd-mini-hint">详情 ›</span>' : ''}</button>
          <div class="cd-timeline__desc">${s.desc}</div>
        </div>`;
    };
    const tlHalf = Math.ceil(timeline.length / 2);
    const tlCols = [timeline.slice(0, tlHalf), timeline.slice(tlHalf)];
    html += sec('app-timeline', '上课时间线', 'Timeline', `
      <div class="cd-timeline">
        ${tlCols.map(col => `<div class="cd-timeline__col">${col.map(renderStep).join('')}</div>`).join('')}
      </div>`);
  }

  if (product.group === 'longform' && product.topicWall && !product.useRichContent) {
    html += sec('topic-wall', '学员课题墙', 'Student Topics', `
      <div class="cd-topic-wall">
        ${product.topicWall.map(t => `<div class="cd-topic-chip">${t}</div>`).join('')}
      </div>`);
  }

  if (product.group === 'catalog') {
    html += `
      <section class="cd-section cd-section--wide">
        <div class="cd-section__label">课程目录 <span class="u-en">Catalog</span></div>
        ${buildCatalogGridHTML(product)}
      </section>`;
  }

  // Catalog keeps "why choose us" as its own section; longform folds the
  // same reasons into the closing CTA instead of a separate top-level block.
  if (product.group === 'catalog' && product.whySFK) {
    html += sec('why-sfk', '为什么选择我们', 'Why SFK', `
      <div class="cd-why-grid">
        ${product.whySFK.map((w, i) => `
          <div class="cd-why">
            <div class="cd-why__num">0${i + 1}</div>
            <div class="cd-why__title">${w.t}</div>
            <div class="cd-why__desc">${w.d}</div>
          </div>`).join('')}
      </div>`);
  }

  const ctaWhyGrid = (product.group === 'longform' && product.whySFK) ? `
      <div class="cd-cta__why cd-why-grid">
        ${product.whySFK.map((w, i) => `
          <div class="cd-why">
            <div class="cd-why__num">0${i + 1}</div>
            <div class="cd-why__title">${w.t}</div>
            <div class="cd-why__desc">${w.d}</div>
          </div>`).join('')}
      </div>` : '';

  html += `
    <div class="cd-cta">
      ${ctaWhyGrid}
      <div class="cd-cta__statement">${product.closingStatementCn}</div>
      <div class="cd-cta__statement-en u-en">${product.closingStatement}</div>
      <button class="cd-cta__btn">咨询课程顾问 <span class="u-en">/ Talk to an Advisor</span></button>
    </div>`;

  return html;
}

/* NOTE (2026-11 undergrad rewrite): buildGalleryCoverHTML, the
   render* fragment helpers and the Gallery/Pdf registries moved to
   assets/js/product-sections.js, shared with the undergraduate site —
   edit them there, they are used by both. */

/* ── v3.26 rich-content section renderers (real docx-sourced longform
   product pages — first used by longform2/UK, same shape reusable for
   US/HK once their own decode passes are done). One function per section
   "type" so a future product just supplies its own data through the same
   fields (positioningIntro/advantagePairs/overallAdvantages/tierTable/
   coreModules/employability/dualTrack/timeline/industryCases/
   otherHighlights) rather than needing new renderer code. ── */


// A compact embed of one of the four existing 课程目录 (catalog) products —
// reuses buildCatalogGridHTML verbatim (same real data, same poster wall,
// same click-through), just clipped to a peek height with a fade + a CTA
// that opens the exact same CourseOverlay the catalog page itself uses.
// v3.27 fix (GM): the peek grid itself has NO click handler of its own —
// it used to, and that bubbled underneath a poster card's own click, so
// clicking one example poster opened BOTH its ImageModal AND the full
// CourseOverlay at once. A poster click now only ever opens that poster's
// ImageModal (_buildCatalogCard already wires that); the overlay opens
// only from the explicit "查看完整目录" button below.
function buildCatalogEmbedHTML(catalogId) {
  const cat = PRODUCTS[catalogId];
  if (!cat) return '';
  const grid = buildCatalogGridHTML(cat);
  return `
    <div class="cd-catalog-embed">
      <div class="cd-catalog-embed__head">
        <span class="cd-catalog-embed__tag">课程目录 <span class="u-en">Catalog</span></span>
        <span class="cd-catalog-embed__title">${cat.meta.titleCn}</span>
      </div>
      <div class="cd-catalog-embed__grid">${grid}</div>
      <button type="button" class="cd-catalog-embed__more" onclick="CourseOverlay.open('${catalogId}')">
        查看完整课程目录与详情 <span class="u-en">View Full Catalog ›</span>
      </button>
    </div>`;
}

function buildRichLongformSections(product, productId, sec) {
  const market = productId === 'longform2' ? 'uk' : productId === 'longform3' ? 'hk' : 'us';
  let out = '';

  if (product.positioningIntro) {
    out += sec('positioning', '产品定位', 'Positioning', `<p class="cd-lead">${product.positioningIntro}</p>`);
  }

  if (product.advantagePairs) {
    out += sec('advantages', '升学方向特性与优势', 'Track Traits & Edge', renderAdvantagePairs(product.advantagePairs));
  }

  if (product.overallAdvantages) {
    out += sec('overall-advantages', '产品整体优势', 'Why This Product', renderWhyGrid(product.overallAdvantages));
  }

  if (product.tierTable) {
    out += sec('tiers', '产品分层与匹配', 'Tiers & Fit', renderTierGrid(product.tierTable));
  }

  if (product.coreModules) {
    out += sec('core-modules', '核心课程模块', 'Core Curriculum', renderModuleGrid(product.coreModules, market, `cm-${productId}`));
  }

  if (product.employability) {
    out += sec('employability', '就业力体系', 'Employability', `
      <p class="cd-lead">${product.employability.intro}</p>
      ${renderModuleGrid(product.employability.items, market, `em-${productId}`)}`);
  }

  if (product.dualTrack) {
    const ai = product.dualTrack.aiBusiness;
    const gallery = ai.gallery ? buildGalleryCoverHTML(market, ai.gallery.slug, ai.gallery.count, ai.title) : '';
    out += sec('dual-track', '升学就业双路径方案', 'Dual-Track Plan', `
      <p class="cd-lead">${product.dualTrack.intro}</p>
      <div class="cd-flow">
        <div class="cd-flow__step"><div class="cd-flow__step-label">前半段</div><div class="cd-flow__step-title">院校定位 · 作品集 · 申请材料 · 录取</div></div>
        <div class="cd-flow__arrow" aria-hidden="true">→</div>
        <div class="cd-flow__step cd-flow__step--accent"><div class="cd-flow__step-label">后半段 · 求职陪跑 A 计划</div><div class="cd-flow__step-title">实习 · 求职作品集 · 投递 · 笔试面试 · 内推 · 入职</div></div>
      </div>
      <div class="cd-core-module has-gallery" style="margin-top:var(--space-5)">
        <div class="cd-core-module__body">
          <div class="cd-core-module__title">${ai.title}</div>
          <p class="cd-core-module__desc">${ai.desc}</p>
        </div>
        ${gallery}
      </div>
      <ul class="cd-list" style="margin-top:var(--space-4)">
        ${product.dualTrack.fitFor.map(f => `<li>${f}</li>`).join('')}
      </ul>`);
  }

  if (product.timeline) {
    out += sec('course-timeline', '课程时间线', 'Timeline', renderTimeline(product.timeline));
  }

  // ── HK-style dual sub-product (常规计划/学霸计划): a sticky left/right
  // tab switcher, each side pre-rendering its own advantagePairs/tierTable/
  // coreModules/timeline/otherHighlights via the exact same helpers as the
  // single-track branches above, just scoped inside a `.cd-track-panel`
  // that TrackSwitcher.switchTrack() shows/hides (same mechanic as
  // IndustryCases.switchTab below). Shared fields (positioningIntro, meta,
  // industryCases, closingStatement) stay outside `tracks` at the top
  // level and are rendered once, not per-track.
  //
  // v3.33 (GM bug report): the tab bar and the track panels must live
  // inside the SAME `.cd-section` (one `sec()` call), not two separate
  // sibling blocks. CSS `position:sticky` only holds an element pinned
  // while its own containing block (here, that `.cd-section`) is still
  // in view — a section that wrapped ONLY the tab bar was barely taller
  // than the bar itself, so it unstuck and scrolled away almost
  // immediately. Nesting `.cd-track-panels` inside the same section as
  // `.cd-track-tabs` makes the section's height match the ACTIVE panel's
  // full content (the inactive one is `display:none` and contributes no
  // height), so the tab bar now stays docked under the navbar for the
  // entire scroll length of whichever track is open. ──
  if (product.tracks) {
    const keys = Object.keys(product.tracks);
    const tabsHTML = `
      <div class="cd-track-tabs" id="track-tabs-${productId}" role="tablist">
        ${keys.map((k, i) => `
          <button type="button" class="cd-track-tab${i === 0 ? ' is-active' : ''}" data-track-tab="${k}" onclick="TrackSwitcher.switchTrack('${productId}','${k}')">
            <span class="cd-track-tab__label">${product.tracks[k].label}</span>
            ${product.tracks[k].labelSub ? `<span class="cd-track-tab__sub">${product.tracks[k].labelSub}</span>` : ''}
          </button>`).join('')}
      </div>`;

    const panelsHTML = `<div class="cd-track-panels" id="track-panels-${productId}">
      ${keys.map((k, i) => {
        const t = product.tracks[k];
        const tp = (id2, cn, en, inner) => sec(id2, cn, en, inner);
        let panel = '';
        if (t.advantagePairs) panel += tp(`${k}-advantages`, '升学特性与课程优势', 'Track Traits & Edge', renderAdvantagePairs(t.advantagePairs));
        if (t.tierTable) panel += tp(`${k}-tiers`, '产品分层与匹配', 'Tiers & Fit', renderTierGrid(t.tierTable));
        if (t.coreModules) panel += tp(`${k}-core-modules`, '核心课程模块', 'Core Curriculum', renderModuleGrid(t.coreModules, market, `cm-${productId}-${k}`));
        if (t.timeline) panel += tp(`${k}-timeline`, '课程时间线', 'Timeline', renderTimeline(t.timeline));
        if (t.otherHighlights) panel += tp(`${k}-highlights`, '其他课程与服务亮点', 'More Highlights', renderWhyGrid(t.otherHighlights));
        return `<div class="cd-track-panel${i === 0 ? ' is-active' : ''}" data-track-panel="${k}">${panel}</div>`;
      }).join('')}
    </div>`;

    out += sec('track-switch', product.tracksLabel || '选择计划', 'Choose Your Plan', `${tabsHTML}${panelsHTML}`);
  }

  if (product.industryCases) {
    const tabs = product.industryCases;
    out += sec('industry-cases', '学生作品 · 产业方向选校与案例', 'Portfolio Cases by Direction', `
      <div class="cd-ind-cases" id="ind-cases-${productId}">
        <div class="cd-ind-tabs" role="tablist">
          ${tabs.map((t, i) => `
            <button type="button" class="cd-ind-tab${i === 0 ? ' is-active' : ''}" data-ind-tab="${t.key}" style="--tab-color:var(--color-ind-${t.color})" onclick="IndustryCases.switchTab('${productId}','${t.key}')">${t.nameCn}</button>`).join('')}
        </div>
        ${tabs.map((t, i) => `
          <div class="cd-ind-panel${i === 0 ? ' is-active' : ''}" data-ind-panel="${t.key}">
            <div class="cd-ind-panel__head">
              <span class="cd-ind-panel__dot" style="background:var(--color-ind-${t.color})"></span>
              <span class="cd-ind-panel__name">${t.nameCn}</span>
              <span class="cd-ind-panel__name-en u-en">${t.nameEn}</span>
            </div>
            <div class="cd-ind-schools">
              ${t.schools.map(s => `
                <a class="cd-ind-school" href="${s.url}" target="_blank" rel="noopener">
                  <span class="cd-ind-school__name">${s.school}</span>
                  <span class="cd-ind-school__program">${s.program}</span>
                </a>`).join('')}
            </div>
            <div class="cd-ind-cases-label">成功案例 <span class="u-en">Success Cases</span></div>
            <div class="cd-ind-case-grid">
              ${Array.from({ length: t.caseCount }, (_, ci) => {
                const n = String(ci + 1).padStart(2, '0');
                const src = `assets/img/course-products/${market}/cases/${t.key}/${n}.webp`;
                return `<div class="cd-ind-case" onclick="ImageModal.open('${src}','${escapeHTML(t.nameCn)}')"><img src="${src}" alt="${escapeHTML(t.nameCn)} 学生作品案例 ${n}" loading="lazy"></div>`;
              }).join('')}
            </div>
          </div>`).join('')}
      </div>`);
  }

  // Module 14 adapted without its image banner: the supplied Word lists
  // contain article headlines and original WeChat links, so a compact
  // text-first card keeps the success-story module's hierarchy while
  // giving each story a clear external destination.
  if (product.featuredStories) {
    out += sec('featured-stories', '优秀学子推文', 'Student Stories', `
      <div class="cd-case-grid cd-story-grid">
        ${product.featuredStories.map((story, i) => `
          <article class="cd-case cd-story-card">
            <div class="cd-case__body">
              <div class="cd-story-card__meta">优秀学子 ${String(i + 1).padStart(2, '0')} <span class="u-en">Student Story</span></div>
              <a class="cd-story-card__title" href="${escapeHTML(story.url)}" target="_blank" rel="noopener">${escapeHTML(story.title)} <span aria-hidden="true">↗</span></a>
              <a class="cd-story-card__link" href="${escapeHTML(story.url)}" target="_blank" rel="noopener">阅读推文 <span class="u-en">Read story</span></a>
            </div>
          </article>`).join('')}
      </div>`);
  }

  if (product.otherHighlights) {
    out += sec('other-highlights', '其他课程与服务亮点', 'More Highlights', renderWhyGrid(product.otherHighlights));
  }

  return out;
}


/* ── 学生作品·产业方向选校与案例 module's tab switcher (see
   buildRichLongformSections's industryCases branch). Plain show/hide
   toggle, same shape as PlanningPage's industry-nav tabs. ── */
const IndustryCases = {
  switchTab(productId, key) {
    const root = document.getElementById(`ind-cases-${productId}`);
    if (!root) return;
    root.querySelectorAll('.cd-ind-tab').forEach(b => b.classList.toggle('is-active', b.dataset.indTab === key));
    root.querySelectorAll('.cd-ind-panel').forEach(p => p.classList.toggle('is-active', p.dataset.indPanel === key));
  },
};
window.IndustryCases = IndustryCases;

/* ── HK-style dual sub-product (常规计划/学霸计划) sticky tab switcher —
   same plain show/hide mechanic as IndustryCases.switchTab above, just
   scoped to `#track-tabs-${productId}`/`#track-panels-${productId}`
   (see buildRichLongformSections's `tracks` branch). Also tracks which
   track is active per productId so the "查看比价" button (registered per
   track in PdfRegistry as `${productId}__${trackKey}`) opens the PDF for
   whichever track is currently showing. ── */
const TrackSwitcher = {
  _active: {},
  switchTrack(productId, key) {
    const tabs = document.getElementById(`track-tabs-${productId}`);
    const panels = document.getElementById(`track-panels-${productId}`);
    if (tabs) tabs.querySelectorAll('.cd-track-tab').forEach(b => b.classList.toggle('is-active', b.dataset.trackTab === key));
    if (panels) panels.querySelectorAll('.cd-track-panel').forEach(p => p.classList.toggle('is-active', p.dataset.trackPanel === key));
    this._active[productId] = key;
  },
  activeKey(productId, fallback) {
    return this._active[productId] || fallback;
  },
  pdfKey(productId, fallback) {
    return `${productId}__${this.activeKey(productId, fallback)}`;
  },
};
window.TrackSwitcher = TrackSwitcher;

/* ── Mini-course detail modal — a smaller click-through popover for any
   specific small course referenced inside the overlay (a timeline quarter's
   course type, a curriculum card), so "基础课" or "软件课" isn't just a
   label but something a student can actually inspect: ~3 highlights, a
   duration, sample course names, and a short intro. Registry is populated
   as buildProductHTML renders each section, then read back on click. ── */
const MiniCourseRegistry = {};
function registerMiniCourse(key, detail, titleCn, titleEn) {
  MiniCourseRegistry[key] = { ...detail, titleCn, titleEn };
}

const MiniCourseModal = {
  open(key) {
    const d = MiniCourseRegistry[key];
    if (!d) return;
    document.getElementById('minicourse-body').innerHTML = `
      <div class="mc-modal__title">${d.titleCn}</div>
      ${d.titleEn ? `<div class="mc-modal__title-en u-en">${d.titleEn}</div>` : ''}
      <div class="mc-modal__duration"><span class="mc-modal__duration-label">课程周期 <span class="u-en">Duration</span></span>${d.duration}</div>
      <ul class="mc-modal__highlights">
        ${d.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
      <div class="mc-modal__samples-label">可选课程示例 <span class="u-en">Sample Courses</span></div>
      <div class="mc-modal__samples">
        ${d.sampleCourses.map(s => `<span class="mc-modal__sample-chip">${s}</span>`).join('')}
      </div>
      <p class="mc-modal__intro">${d.intro}</p>`;
    document.getElementById('minicourse-modal').classList.add('is-open');
  },
  close() {
    document.getElementById('minicourse-modal')?.classList.remove('is-open');
  },
};
window.MiniCourseModal = MiniCourseModal;

/* ── Full-screen overlay, opened from any course card / product card ── */
const CourseOverlay = {
  open(productId) {
    const product = PRODUCTS[productId];
    if (!product) return;
    const body = document.getElementById('course-overlay-body');
    body.innerHTML = buildProductHTML(product, productId);
    // v3.21: longform overlays now share catalog's wider content column
    // (.is-wide, 980px) instead of the narrower 760px default — GM asked
    // for the 长线产品 overlay's content area to match 课程目录's width.
    body.classList.add('is-wide');
    document.getElementById('course-overlay').classList.add('is-open');
    ScrollLock.lock();
    // v3.22 fix: the element that actually scrolls is .course-overlay__panel
    // (overflow-y:auto in CSS) — #course-overlay-body itself has no scroll
    // of its own, so resetting only body.scrollTop (as before) never moved
    // the visible scroll position. GM: overlays were opening mid-scroll,
    // carried over from whatever position the previous overlay was left at.
    const panel = document.querySelector('#course-overlay .course-overlay__panel');
    if (panel) panel.scrollTop = 0;
    body.scrollTop = 0;
  },

  close() {
    document.getElementById('course-overlay').classList.remove('is-open');
    ScrollLock.unlock();
  },
};
window.CourseOverlay = CourseOverlay;
window.PRODUCTS = PRODUCTS;
// v3.25: exposed so CourseProductsPage.showSubpage() (the new full-page
// route for 长线产品 cards) can render a product's content directly,
// without going through CourseOverlay.open()'s overlay-specific DOM.
window.buildProductHTML = buildProductHTML;

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('course-overlay');
  if (overlay) {
    overlay.querySelector('.course-overlay__backdrop')?.addEventListener('click', () => CourseOverlay.close());
    overlay.querySelector('.course-overlay__close')?.addEventListener('click', () => CourseOverlay.close());
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { MiniCourseModal.close(); CourseOverlay.close(); }
  });
  const mini = document.getElementById('minicourse-modal');
  if (mini) {
    mini.querySelector('.minicourse-modal__backdrop')?.addEventListener('click', () => MiniCourseModal.close());
    mini.querySelector('.minicourse-modal__close')?.addEventListener('click', () => MiniCourseModal.close());
  }
});
