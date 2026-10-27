#!/usr/bin/env python3
"""Clean the 数艺设 school-ranking workbook and build undergrad/data/rankings.json.

Usage (from dad_demo/):
    python3 tools/ug-rankings.py "_suppltement-1001/数艺设排名文件27f 10.10最新-英美港澳澳洲新加坡加拿大.xlsx"

The source workbook is hand-maintained: merged cells (rank / school / city
span every programme row of a school), columns that differ per sheet, the
odd misaligned row and typos. This script

  1. unmerges and forward-fills every merged range,
  2. normalises the columns of all sheets to one schema,
  3. fills school-level fields on programme rows, repairs rows whose rank
     or name slipped (错行), merges duplicate school rows, fixes typos,
  4. writes a cleaned copy next to the source:
        <source stem> · 清洗版.xlsx   (专业明细 / 院校排名 / 修正记录)
  5. writes undergrad/data/rankings.json for the site.

Ranking numbers are tiers (ties are common). The site uses them only for
ordering and never prints them. UAL colleges are listed one by one in the
UK sheet; for the site they are grouped into a single "伦敦艺术大学 UAL"
entry (the cleaned workbook keeps them as separate rows + a 院校集团 column).
"""
import json, re, sys, datetime
from pathlib import Path

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment
except ImportError:
    sys.exit("pip install openpyxl")

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else
           ROOT / "_suppltement-1001" / "数艺设排名文件27f 10.10最新-英美港澳澳洲新加坡加拿大.xlsx")
CLEAN = SRC.with_name(SRC.stem + " · 清洗版.xlsx")
OUT = ROOT / "undergrad" / "data" / "rankings.json"

# sheet-name prefix → (list id, country as used in offers.json, direction label)
SHEETS = [
    ("英国",   "uk",    "英国",     "数字媒体 · 平面"),
    ("美国数媒", "us-dm", "美国",     "数字媒体 · 交互"),
    ("美国视传", "us-vc", "美国",     "视觉传达"),
    ("香港",   "hk",    "中国香港", "视传 · 数媒"),
    ("澳门",   "mo",    "中国澳门", "数字媒体"),
    ("新加坡", "sg",    "新加坡",   "视传 · 数媒"),
    ("澳洲",   "au",    "澳大利亚", "数字媒体 · 平面"),
    ("加拿大", "ca",    "加拿大",   "数字媒体 · 平面"),
]

HEAD = {
    "排名": "rank", "院校英文名称": "en", "院校中文名称": "zh", "中文名称": "zh",
    "所在城市": "city", "专业名称": "program", "项目名称": "program",
    "专业链接": "url", "链接": "url", "标化要求": "req", "备注": "note",
}

# typo / wording fixes: (field, wrong, right)
FIXES = [
    ("zh", "卡附基梅隆大学", "卡内基梅隆大学"),
    ("zh", "帕森设计学院", "帕森斯设计学院"),
    ("zh", "帕森斯艺术设计学院", "帕森斯设计学院"),
    ("zh", "加利福尼亚大学圣尔湾分校", "加州大学尔湾分校"),
    ("zh", "伊利诺伊大学-香槟分校", "伊利诺伊大学香槟分校"),
    ("zh", "皇家墨尔本理工", "皇家墨尔本理工大学"),
    ("zh", "中央圣马丁&坎伯韦尔合并合并预科", "中央圣马丁&坎伯韦尔合并预科"),
    ("en", "Parsons the New School for Design", "Parsons The New School for Design"),
    ("en", "Art Center College of design", "Art Center College of Design"),
    ("en", "School of visual arts", "School of Visual Arts"),
    ("en", "Kings College London", "King's College London"),
    ("en", "Academy Of Art University", "Academy of Art University"),
    ("city", "Conventry", "Coventry"),
    ("city", "Providence，RL", "Providence, RI"),
    ("city", "San Fransico, CA", "San Francisco, CA"),
    ("program", "BACHELOR OF Communication", "Bachelor of Communication"),
    ("program", "BACHELOR OF Design", "Bachelor of Design"),
]

UAL_COLLEGES = ("London College of Communication", "Camberwell College of Arts", "Central Saint Martins",
                "Chelsea College of Arts", "UAL-School of Pre-degree Studies")

log = []  # (sheet, row, what)


def clean_str(v, keep_lines=False):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    s = str(v).replace("　", " ").strip()
    if keep_lines:
        return " / ".join(p.strip() for p in s.splitlines() if p.strip())
    return re.sub(r"\s+", " ", s)


def slug(en):
    s = en.lower().replace("&", " and ")
    s = re.sub(r"\(.*?\)", " ", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def read_sheet(ws, sheet_label):
    # 1. unmerge + forward-fill every merged range
    head = [HEAD.get(clean_str(c.value)) for c in ws[1]]
    en_col = head.index("en") + 1 if "en" in head else 0
    filled = set()  # rows whose school name came from a merged range (programme rows)
    for rng in list(ws.merged_cells.ranges):
        v = ws.cell(rng.min_row, rng.min_col).value
        ws.unmerge_cells(str(rng))
        for r in range(rng.min_row, rng.max_row + 1):
            for c in range(rng.min_col, rng.max_col + 1):
                ws.cell(r, c).value = v
                if c == en_col and r > rng.min_row:
                    filled.add(r)
    rows = list(ws.iter_rows(values_only=True))
    out = []
    for n, r in enumerate(rows[1:], start=2):
        rec = {k: "" for k in ("rank", "en", "zh", "city", "program", "url", "req", "note")}
        for k, v in zip(head, r):
            if k:
                rec[k] = clean_str(v, keep_lines=k in ("req", "note"))
        if not any(rec.values()):
            continue
        rec["_row"] = n
        rec["_cont"] = n in filled
        out.append(rec)
    dropped = [h for h, k in zip(rows[0], head) if h is not None and not k]
    if dropped:
        log.append((sheet_label, 1, f"未识别列已忽略：{dropped}"))
    return out


def fix_rows(recs, sheet_label):
    prev = None
    for rec in recs:
        n = rec["_row"]
        for f, wrong, right in FIXES:
            if rec[f] == wrong:
                rec[f] = right
                log.append((sheet_label, n, f"{f}：「{wrong}」→「{right}」"))
        if rec["city"]:
            rec["city"] = rec["city"].replace("，", ", ").replace(" ,", ",")
        # programme row of the previous school (school cells empty)
        if not rec["en"] and not rec["zh"]:
            if prev is None:
                continue
            if rec["rank"] and rec["rank"] != prev["rank"]:
                log.append((sheet_label, n, f"无院校名但排名为 {rec['rank']}，按上一所院校（{prev['zh']}）的专业行处理"))
            for k in ("rank", "en", "zh", "city"):
                rec[k] = prev[k]
            rec["_cont"] = True
        # school row with the rank missing (错行)
        if rec["en"] and not rec["rank"]:
            rec["rank"] = prev["rank"] if prev else "99"
            log.append((sheet_label, n, f"「{rec['zh']}」排名缺失，按上一行并列为 {rec['rank']}（待核）"))
        # zh/en missing on one side
        if rec["en"] and not rec["zh"] and prev and prev["en"] == rec["en"]:
            rec["zh"] = prev["zh"]
        if not rec.get("_cont") and prev and rec["en"] != prev["en"] and rec["rank"] and prev["rank"]:
            try:
                if int(float(rec["rank"])) < int(float(prev["rank"])):
                    log.append((sheet_label, n, f"「{rec['zh']}」排名 {rec['rank']} 排在 {prev['rank']} 之后（错行），按排名归入并列档"))
            except ValueError:
                pass
        if "sussex" in rec["en"].lower() and "essex.ac.uk" in rec["url"]:
            log.append((sheet_label, n, "University of Sussex 的专业链接指向 essex.ac.uk（埃塞克斯大学），保留原链接，待核"))
        if rec["url"] and not re.match(r"https?://", rec["url"]):
            if rec["url"] != "无":
                rec["note"] = (rec["note"] + " / " if rec["note"] else "") + f"原链接为文本：{rec['url']}"
            log.append((sheet_label, n, f"链接不是网址（「{rec['url'][:40]}」），已清空"))
            rec["url"] = ""
        try:
            rec["rank"] = int(float(rec["rank"]))
        except ValueError:
            log.append((sheet_label, n, f"排名「{rec['rank']}」不是数字，置为 99"))
            rec["rank"] = 99
        rec["group"] = "UAL" if any(c in rec["en"] for c in UAL_COLLEGES) else ""
        prev = rec
    return [r for r in recs if r["en"]]


def schools_of(recs, sheet_label):
    """one entry per school; non-adjacent duplicates merged."""
    by = {}
    order = []
    last_key = None
    for rec in recs:
        key = slug(rec["en"])
        if key in by and (key != last_key or not rec.get("_cont")):
            log.append((sheet_label, rec["_row"], f"「{rec['zh']}」重复出现，已合并到同一院校"))
        s = by.get(key)
        if not s:
            s = by[key] = {"id": key, "zh": rec["zh"], "en": rec["en"], "city": rec["city"],
                           "rank": rec["rank"], "group": rec["group"], "programs": []}
            order.append(key)
        if rec["rank"] < s["rank"]:
            s["rank"] = rec["rank"]
        if rec["program"] and rec["program"] not in [p["name"] for p in s["programs"]]:
            s["programs"].append({"name": rec["program"], "url": rec["url"]})
        last_key = key
    # stable: rank tier first, then the sheet's own order
    return sorted((by[k] for k in order), key=lambda s: (s["rank"], order.index(s["id"])))


def group_ual(schools):
    ual = [s for s in schools if s["group"] == "UAL"]
    if not ual:
        return schools
    g = {"id": "ual", "zh": "伦敦艺术大学", "en": "University of the Arts London", "city": "London",
         "rank": min(s["rank"] for s in ual), "group": "UAL",
         "colleges": [s["zh"] for s in ual],
         "programs": [{"name": f"{s['en'].replace('UAL-', '')} · {p['name']}", "url": p["url"]}
                      for s in ual for p in s["programs"]]}
    out, placed = [], False
    for s in schools:
        if s["group"] == "UAL":
            if not placed:
                out.append(g)
                placed = True
            continue
        out.append(s)
    return out


def collapse(entries):
    merged = {}
    for sh, row, what in entries:
        merged.setdefault((sh, what), []).append(row)
    return [[sh, "、".join(str(r) for r in rows), what] for (sh, what), rows in merged.items()]


def main():
    wb = openpyxl.load_workbook(SRC)
    flat, lists = [], {}
    for prefix, lid, country, direction in SHEETS:
        ws = next((w for w in wb.worksheets if w.title.startswith(prefix)), None)
        if ws is None:
            log.append((prefix, 0, "未找到工作表"))
            continue
        recs = fix_rows(read_sheet(ws, ws.title), ws.title)
        for r in recs:
            flat.append({"sheet": ws.title, "list": lid, "country": country, "direction": direction, **r})
        schools = schools_of(recs, ws.title)
        lists[lid] = {"country": country, "direction": direction, "sheet": ws.title,
                      "schools": group_ual(schools) if lid == "uk" else schools}
        for s in lists[lid]["schools"]:
            if not s.get("group"):
                s.pop("group", None)

    # ── cleaned workbook ──
    out = openpyxl.Workbook()
    hfont = Font(bold=True, color="000000")
    hfill = PatternFill("solid", fgColor="FFFF00")

    def sheet(title, header, rows, widths):
        ws = out.create_sheet(title)
        ws.append(header)
        for c in ws[1]:
            c.font, c.fill = hfont, hfill
        for r in rows:
            ws.append(r)
        for i, w in enumerate(widths):
            ws.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w
        ws.freeze_panes = "A2"
        ws.auto_filter.ref = ws.dimensions
        for row in ws.iter_rows(min_row=2):
            for c in row:
                c.alignment = Alignment(vertical="top", wrap_text=True)
        return ws

    out.remove(out.active)
    sheet("专业明细",
          ["地区", "方向", "原工作表", "原行号", "排名", "院校英文名称", "院校中文名称", "院校集团", "所在城市",
           "专业名称", "专业链接", "标化要求", "备注"],
          [[r["country"], r["direction"], r["sheet"], r["_row"], r["rank"], r["en"], r["zh"], r["group"],
            r["city"], r["program"], r["url"], r["req"], r["note"]] for r in flat],
          [10, 16, 18, 8, 6, 40, 24, 8, 18, 50, 50, 36, 30])
    sheet("院校排名",
          ["地区", "方向", "排名(并列档)", "站内排序", "院校英文名称", "院校中文名称", "所在城市", "专业数", "备注"],
          [[l["country"], l["direction"], s["rank"], i + 1, s["en"], s["zh"], s["city"], len(s["programs"]),
            ("含：" + "、".join(s["colleges"])) if s.get("colleges") else ""]
           for l in lists.values() for i, s in enumerate(l["schools"])],
          [10, 16, 10, 8, 44, 26, 18, 8, 60])
    sheet("修正记录", ["原工作表", "原行号", "处理"],
          [["全部", "", "所有合并单元格已拆分，并把值填回每一行（排名 / 院校 / 城市 / 标化要求等）"],
           ["全部", "", "统一列名：中文名称→院校中文名称，项目名称→专业名称，链接→专业链接；去掉首尾空格与多余换行"],
           ["英国ba数媒平面方向", "", "UAL 各学院保留为独立行，「院校集团」列标为 UAL；网站上合并显示为「伦敦艺术大学 UAL」"],
           ] + collapse(log),
          [22, 8, 90])
    out.save(CLEAN)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "meta": {"source": SRC.name, "cleaned": CLEAN.name,
                 "built": datetime.date.today().isoformat(),
                 "note": "rank = tier from the source sheet (ties allowed); used for ordering only, never displayed"},
        "lists": lists,
    }, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {CLEAN.name} and {OUT.relative_to(ROOT)} — "
          + ", ".join(f"{k}:{len(v['schools'])}" for k, v in lists.items()) + f" · {len(log)} fixes logged")


if __name__ == "__main__":
    main()
