#!/bin/zsh
# Rebuilds optimized, paged course decks from the supplied 2026 winter/summer
# school source material. Run from the dad_demo directory.
set -euo pipefail

SOURCE_ROOT="_supplement-912/MA-产品解读/冬夏校/2026"
OUTPUT_ROOT="assets/img/course-products/summerwinter"
POPM="/Users/gm/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
TMP_ROOT="$(mktemp -d /private/tmp/dad-archive-assets.XXXXXX)"
trap 'rm -rf "$TMP_ROOT"' EXIT

to_webp() {
  local input="$1" output="$2" max_edge="$3" quality="$4" resized="$TMP_ROOT/resized-$RANDOM.png"
  sips -Z "$max_edge" -s format png "$input" --out "$resized" >/dev/null
  cwebp -quiet -q "$quality" "$resized" -o "$output"
}

render_pdf() {
  local input="$1" output="$2" work="$TMP_ROOT/render-$RANDOM"
  mkdir -p "$work" "$output"
  "$POPM" -r 110 -png "$input" "$work/page" >/dev/null
  local n=1 page target
  for page in "$work"/page-*.png; do
    target="$output/$(printf '%02d' "$n").webp"
    to_webp "$page" "$target" 1600 75
    ((n++))
  done
  echo $((n - 1))
}

render_keynote() {
  local input="$1" output="$2" work="$TMP_ROOT/key-$RANDOM"
  mkdir -p "$work"
  qlmanage -p -o "$work" "$input" >/dev/null 2>&1 || true
  local preview="$(find "$work" -name Preview.html -print -quit)"
  local page n=1 pdf
  mkdir -p "$output"
  # A few supplied Keynote packages cannot be expanded by Quick Look, but
  # still contain the author-provided preview.jpg. Preserve that poster as
  # a one-page readable deck instead of dropping the course from the site.
  if [[ -z "$preview" ]]; then
    unzip -p "$input" preview.jpg > "$work/preview.jpg"
    to_webp "$work/preview.jpg" "$output/01.webp" 1600 75
    echo 1
    return
  fi
  while IFS= read -r page; do
    pdf="$(dirname "$preview")/$page"
    "$POPM" -f 1 -l 1 -r 110 -png -singlefile "$pdf" "$work/$n" >/dev/null
    to_webp "$work/$n.png" "$output/$(printf '%02d' "$n").webp" 1600 75
    ((n++))
  done < <(rg -o 'Attachment[0-9]+\.pdf' "$preview")
  echo $((n - 1))
}

poster_from_file() {
  local input="$1" output="$2"
  mkdir -p "$(dirname "$output")"
  to_webp "$input" "$output" 1400 78
}

poster_from_keynote() {
  local input="$1" output="$2" temp="$TMP_ROOT/preview-$RANDOM.jpg"
  unzip -p "$input" preview.jpg > "$temp"
  poster_from_file "$temp" "$output"
}

make_pdf_course() {
  local slug="$1" poster="$2" pdf="$3"
  poster_from_file "$poster" "$OUTPUT_ROOT/posters/archive-$slug.webp"
  render_pdf "$pdf" "$OUTPUT_ROOT/pdf/archive-$slug" > "$TMP_ROOT/$slug.count"
}

make_keynote_course() {
  local slug="$1" poster_source="$2" keynote="$3"
  if [[ "$poster_source" == "keynote-preview" ]]; then
    poster_from_keynote "$keynote" "$OUTPUT_ROOT/posters/archive-$slug.webp"
  else
    poster_from_file "$poster_source" "$OUTPUT_ROOT/posters/archive-$slug.webp"
  fi
  render_keynote "$keynote" "$OUTPUT_ROOT/pdf/archive-$slug" > "$TMP_ROOT/$slug.count"
}

make_keynote_course ucb-tongji \
  "assets/img/courses/夏冬校/同济｜UCB算据艺术创作研究生班.jpeg" \
  "$SOURCE_ROOT/26夏校-ucbx同济/26冬校- UCBx同济 算据艺术创作与研究0205.key"
make_keynote_course harvard-hust \
  "assets/img/courses/夏冬校/华科｜哈佛响应式环境建筑数媒交互研究生班.jpeg" \
  "$SOURCE_ROOT/26夏校-哈佛 华科/26夏校- Harvard x 华科 响应式环境.key"
make_pdf_course ucl-tea \
  "assets/img/courses/夏冬校/TEA | UCL光影科技艺术研究生班.jpeg" \
  "$SOURCE_ROOT/26夏校-uclxtea光影节/26夏 TEA | UCL光影科技艺术研究生班.pdf"
make_pdf_course feijun-collective \
  "assets/img/courses/夏冬校/费俊x某集体 | 艺术与科技研究生班.jpeg" \
  "$SOURCE_ROOT/26夏校-费俊/26 夏费俊x某集体 | 艺术与科技研究生班.pdf"
make_pdf_course mit-media-lab \
  "assets/img/courses/夏冬校/同济｜MIT Media Lab官方夏校.png" \
  "$SOURCE_ROOT/26夏校 MIT/26夏+MIT+Media+Lab官方夏校0306.pdf"
make_pdf_course polyu \
  "$SOURCE_ROOT/26夏校-港理工/港理工.jpeg" \
  "$SOURCE_ROOT/26夏校-港理工/港理工夏校.pdf"
make_pdf_course nyu-caoyuxi \
  "$SOURCE_ROOT/26夏校-nyux曹雨西/曹雨西 | NYU数媒妍究生班.png" \
  "$SOURCE_ROOT/26夏校-nyux曹雨西/26夏-沉浸式装置展演研究班.pdf"
make_pdf_course jhu-feijun \
  "$SOURCE_ROOT/26冬校-jhux费俊/【大师共创】约翰霍普金斯x费俊.jpg" \
  "$SOURCE_ROOT/26冬校-jhux费俊/冬校-数媒-约翰霍普金斯数媒研究生班.pdf"
make_pdf_course harvard-winter \
  "$SOURCE_ROOT/26冬校-哈佛/WechatIMG4680.jpeg" \
  "$SOURCE_ROOT/26冬校-哈佛/数媒2026冬校-哈佛数媒研究生班1014.pdf"
make_pdf_course rca-city-village \
  "$SOURCE_ROOT/26冬校-大城小村xrca/WechatIMG706.jpeg" \
  "$SOURCE_ROOT/26冬校-大城小村xrca/RCAX大城小村可持续设计与生态研究生班(2).pdf"

for count in "$TMP_ROOT"/*.count; do
  echo "$(basename "$count" .count): $(cat "$count") pages"
done
