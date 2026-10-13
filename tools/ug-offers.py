#!/usr/bin/env python3
"""Rebuild undergrad/data/offers.json from the admissions export.

Usage:
    python3 tools/ug-offers.py "_suppltement-1001/数字艺术与设计-26录取本科.xlsx"

Input: the 录取 export sheet (one row per offer). Only rows whose 录取结果 is
"Admitted" are kept. Student names are reduced to "<surname>同学" — no full
names, ids or advisor names are written to the site.

Output (undergrad/data/offers.json):
    meta     — season label, totals
    schools  — one row per school: zh / en / country / count / top
    cities   — one row per 学生归属地 campus: students / offers / top schools
    wall     — one row per offer, anonymised, newest first
"""
import json, sys, collections
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("pip install openpyxl")

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "_suppltement-1001/数字艺术与设计-26录取本科.xlsx")
OUT = Path(__file__).resolve().parent.parent / "undergrad" / "data" / "offers.json"

ws = openpyxl.load_workbook(SRC, data_only=True).active
head = [c.value for c in next(ws.iter_rows(max_row=1))]
col = {name: i for i, name in enumerate(head)}
rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[col["录取结果"]] == "Admitted"]


def split_school(s):
    s = (s or "").strip()
    if "/" in s:
        zh, en = s.split("/", 1)
        return zh.strip(), en.strip()
    return s, ""


def city_of(v):
    # campus labels like 北京CBD / 北京海淀 / 上海徐汇 keep their own name
    return (v or "其他").strip()


schools = {}
cities = collections.defaultdict(lambda: {"students": set(), "offers": 0, "schools": collections.Counter(), "top": 0})
wall = []
for r in rows:
    zh, en = split_school(r[col["录取院校"]])
    country = (r[col["录取国家"]] or "其他").strip()
    top = r[col["是否顶尖院校录取"]] == "是"
    s = schools.setdefault(zh, {"zh": zh, "en": en, "country": country, "count": 0, "top": top})
    s["count"] += 1
    s["top"] = s["top"] or top

    c = cities[city_of(r[col["学生归属地"]])]
    c["students"].add(r[col["客户id"]])
    c["offers"] += 1
    c["schools"][zh] += 1
    c["top"] += top

    name = (r[col["学生姓名"]] or "").strip()
    wall.append({
        "student": (name[:1] + "同学") if name else "SFK同学",
        "city": city_of(r[col["学生归属地"]]),
        "hs": (r[col["目前就读院校性质"]] or "").split(",")[0],
        "zh": zh, "en": en, "country": country,
        "major": (r[col["录取专业"]] or "").strip(),
        "track": (r[col["学生转案-专业"]] or "").strip(),
        "season": r[col["申请季度"]] or "",
        "top": top,
        "date": str(r[col["录入日期"]] or "")[:10],
    })

wall.sort(key=lambda w: w["date"], reverse=True)
school_list = sorted(schools.values(), key=lambda s: (-s["count"], s["zh"]))
city_list = sorted(({
    "city": k,
    "students": len(v["students"]),
    "offers": v["offers"],
    "top": v["top"],
    "schools": [z for z, _ in v["schools"].most_common(4)],
} for k, v in cities.items()), key=lambda c: -c["offers"])

out = {
    "meta": {
        "season": "26 申请季",
        "offers": len(rows),
        "students": len({r[col["客户id"]] for r in rows}),
        "schools": len(schools),
        "topOffers": sum(w["top"] for w in wall),
        "countries": collections.Counter(w["country"] for w in wall).most_common(),
        "source": SRC.name,
    },
    "schools": school_list,
    "cities": city_list,
    "wall": wall,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"wrote {OUT} — {len(rows)} offers, {len(schools)} schools, {len(city_list)} cities")
