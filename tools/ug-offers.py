#!/usr/bin/env python3
"""Rebuild undergrad/data/offers.json from the admissions export.

Usage (from dad_demo/, after tools/ug-rankings.py):
    python3 tools/ug-offers.py "_suppltement-1001/数字艺术与设计-26录取本科.xlsx"

Input: the 录取 export sheet (one row per offer). Only rows whose 录取结果 is
"Admitted" are kept. Student names are reduced to "<surname>同学" — no full
names, ids or advisor names are written to the site.

Also reads
    undergrad/data/rankings.json  → each school gets `rid` (ranking school id) and
                                    `rank` (best tier in its country; ordering only)
    undergrad/data/cases.json     → an offer that belongs to a 案例卡 gets `case`

UAL colleges (伦艺-xxx) are grouped into one school "伦敦艺术大学"; the
college stays on each offer as `college`.

Output (undergrad/data/offers.json):
    meta     — season label, totals
    schools  — one row per school: key / zh / en / country / count / top / rid / rank / cases / colleges
    cities   — one row per 学生归属地 campus: students / offers / top schools
    wall     — one row per offer, anonymised, newest first; `s` = school key
"""
import json, re, sys, collections
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("pip install openpyxl")

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "_suppltement-1001" / "数字艺术与设计-26录取本科.xlsx")
DATA = ROOT / "undergrad" / "data"
OUT = DATA / "offers.json"

ws = openpyxl.load_workbook(SRC, data_only=True).active
head = [c.value for c in next(ws.iter_rows(max_row=1))]
col = {name: i for i, name in enumerate(head)}
rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[col["录取结果"]] == "Admitted"]

# ── ranking lookup ──
rankings = json.loads((DATA / "rankings.json").read_text(encoding="utf-8"))
STOP = {"the", "of", "at", "university", "college", "school", "for", "and", "in", "london", "institute", "a"}


def toks(en):
    en = (en or "").lower().replace("\xa0", " ").replace("&", " and ")
    en = re.sub(r"\(.*?\)", " ", en)
    return frozenset(t for t in re.findall(r"[a-z]+", en) if t not in STOP)


RANK_BY_TOKENS = {}
RANK_OF = collections.defaultdict(dict)  # rid → {country: best tier}
for lst in rankings["lists"].values():
    for s in lst["schools"]:
        RANK_BY_TOKENS.setdefault(toks(s["en"]), s["id"])
        RANK_OF[s["id"]][lst["country"]] = min(s["rank"], RANK_OF[s["id"]].get(lst["country"], 999))

# export name → ranking id, where the English names differ
ALIAS = {
    "ArtCenter College of Design": "art-center-college-of-design",
    "Ontario College of Art & Design University": "ocad-university",
    "Swinburn University of Technology": "swinburne-university-of-technology",
    "Nova Scotia College of Art and Design": "nscad-university",  # NSCAD's former name
}


def rid_of(zh, en):
    if zh.startswith("伦艺-") or en.upper().startswith("UAL"):
        return "ual"  # incl. Creative Computing Institute, which the ranking sheet doesn't list
    return ALIAS.get(en) or RANK_BY_TOKENS.get(toks(en))


def split_school(s):
    s = (s or "").strip()
    if "/" in s:
        zh, en = s.split("/", 1)
        return zh.strip(), en.strip().replace("\xa0", " ")
    return s, ""


def city_of(v):
    return (v or "其他").strip()


# ── case cards: (student, city, school, major) → case id ──
cases = json.loads((DATA / "cases.json").read_text(encoding="utf-8"))
CASE_KEY = {}
for c in cases:
    # each 案例卡 offer that was matched to an export row carries `link: {zh, major}`
    # (the export's own spelling); unmatched card offers simply aren't linked
    for o in c.get("offers", []):
        if o.get("link"):
            CASE_KEY.setdefault((c["student"], c["city"], o["link"]["zh"], o["link"]["major"].strip()), c["id"])

schools = {}
cities = collections.defaultdict(lambda: {"students": set(), "offers": 0, "schools": collections.Counter(), "top": 0})
wall = []
for r in rows:
    zh, en = split_school(r[col["录取院校"]])
    country = (r[col["录取国家"]] or "其他").strip()
    top = r[col["是否顶尖院校录取"]] == "是"
    rid = rid_of(zh, en)
    key, college = zh, ""
    if rid == "ual":
        key, college = "伦敦艺术大学", zh.replace("伦艺-", "")
    s = schools.setdefault(key, {
        "key": key, "zh": key, "en": "University of the Arts London" if rid == "ual" else en,
        "country": country, "count": 0, "top": False, "rid": rid,
        "rank": RANK_OF.get(rid, {}).get(country), "cases": 0, "colleges": collections.Counter(),
    })
    s["count"] += 1
    s["top"] = s["top"] or top
    if college:
        s["colleges"][college] += 1

    city = city_of(r[col["学生归属地"]])
    c = cities[city]
    c["students"].add(r[col["客户id"]])
    c["offers"] += 1
    c["schools"][key] += 1
    c["top"] += top

    name = (r[col["学生姓名"]] or "").strip()
    student = (name[:1] + "同学") if name else "SFK同学"
    major = (r[col["录取专业"]] or "").strip()
    w = {
        "student": student, "city": city,
        "hs": (r[col["目前就读院校性质"]] or "").split(",")[0],
        "s": key, "zh": zh, "en": en, "country": country, "major": major,
        "track": (r[col["学生转案-专业"]] or "").strip(),
        "season": r[col["申请季度"]] or "",
        "top": top,
        "date": str(r[col["录入日期"]] or "")[:10],
    }
    if college:
        w["college"] = college
    cid = CASE_KEY.get((student, city, zh, major))
    if cid:
        w["case"] = cid
        s["cases"] += 1
    wall.append(w)

wall.sort(key=lambda w: w["date"], reverse=True)
for s in schools.values():
    s["colleges"] = [[k, v] for k, v in s["colleges"].most_common()]
    if not s["colleges"]:
        del s["colleges"]
    for k in ("rid", "rank"):
        if s[k] is None:
            del s[k]
school_list = sorted(schools.values(), key=lambda s: (-s["count"], s["zh"]))
city_list = sorted(({
    "city": k,
    "students": len(v["students"]),
    "offers": v["offers"],
    "top": v["top"],
    "schools": [z for z, _ in v["schools"].most_common(4)],
} for k, v in cities.items()), key=lambda c: -c["offers"])

linked = sum(1 for w in wall if "case" in w)
case_offers = sum(1 for c in cases for o in c.get("offers", []) if o.get("link"))
out = {
    "meta": {
        "season": "26 申请季",
        "offers": len(rows),
        "students": len({r[col["客户id"]] for r in rows}),
        "schools": len(schools),
        "topOffers": sum(w["top"] for w in wall),
        "countries": collections.Counter(w["country"] for w in wall).most_common(),
        "source": SRC.name,
        "rankings": rankings["meta"]["cleaned"],
    },
    "schools": school_list,
    "cities": city_list,
    "wall": wall,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
unranked = [s["zh"] for s in school_list if "rank" not in s]
print(f"wrote {OUT.relative_to(ROOT)} — {len(rows)} offers, {len(schools)} schools, {len(city_list)} cities")
print(f"  ranked schools: {len(school_list) - len(unranked)} / {len(school_list)}; unranked (listed after ranked ones): {len(unranked)}")
print(f"  offers linked to case cards: {linked} (case cards list {case_offers} offers)")
