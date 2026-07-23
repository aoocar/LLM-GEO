#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deep audit crawler: simulate browsing, find broken links / missing assets / SEO / quality bugs."""
import urllib.request, urllib.error, urllib.parse
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
import json, re, os, sys

BASE = "http://127.0.0.1:4173"
visited = set()
queue = [BASE + "/"]
found_urls = set()
issues = []          # (severity, url, msg)
page_reports = {}    # url -> dict

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 AuditBot"})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read()
            return r.status, data, r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        return e.code, b"", ""
    except Exception as e:
        return -1, b"", str(e)

class LinkExtractor(HTMLParser):
    def __init__(self, base):
        super().__init__()
        self.base = base
        self.links = set()
        self.assets = set()
        self.text = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        href = d.get("href")
        src = d.get("src")
        if href:
            self.links.add(urljoin(self.base, href))
        if src:
            self.assets.add(urljoin(self.base, src))
        if tag in ("img", "script", "link"):
            if tag == "link" and d.get("rel") == ["stylesheet"]:
                self.assets.add(urljoin(self.base, d.get("href")))
    def handle_data(self, data):
        self.text.append(data)

def is_internal(u):
    p = urlparse(u)
    return p.netloc in ("127.0.0.1:4173", "localhost:4173") or p.netloc == ""

def local_path_for(u):
    p = urlparse(u)
    path = p.path
    if path == "" or path == "/":
        return "out/index.html"
    if path.endswith("/"):
        return "out" + path + "index.html"
    if path.endswith(".html"):
        return "out" + path
    # try .html
    return "out" + path + ".html"

while queue:
    url = queue.pop(0)
    if url in visited:
        continue
    visited.add(url)
    status, data, ctype = fetch(url)
    # record
    report = {"url": url, "status": status}
    if status == 200 and "html" in ctype:
        try:
            html = data.decode("utf-8", "replace")
        except Exception:
            html = data.decode("latin-1", "replace")
        ex = LinkExtractor(url)
        ex.feed(html)
        # analyze content
        title_m = re.search(r"<title>(.*?)</title>", html, re.S)
        h1_m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
        desc_m = re.search(r'<meta name="description" content="(.*?)"', html, re.S)
        jsonld = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        text = " ".join(ex.text)
        text_clean = re.sub(r"\s+", " ", text).strip()
        report.update({
            "title": title_m.group(1).strip() if title_m else "",
            "h1": re.sub(r"<[^>]+>", "", h1_m.group(1)).strip() if h1_m else "",
            "desc": desc_m.group(1).strip() if desc_m else "",
            "jsonld_count": len(jsonld),
            "jsonld_valid": sum(1 for j in jsonld if (lambda x: (json.loads(x) or True) if x.strip() else False)(j)),
            "text_len": len(text_clean),
        })
        # collect links/queue
        for l in ex.links:
            if is_internal(l):
                found_urls.add(l)
                if l not in visited and l not in queue:
                    queue.append(l)
        for a in ex.assets:
            if is_internal(a):
                found_urls.add(a)
        # Detect rendering/quality bugs
        # 1. visible error text
        for err_pat in ["Cannot read", "undefined</", "TypeError", "ReferenceError", "[object Object]", "NaN", "null</"]:
            if err_pat in html:
                issues.append(("HIGH", url, f"疑似渲染错误文本: {err_pat}"))
        # 2. raw markdown leaking
        if re.search(r"\*\*[^*]+\*\*|^\s*#\s|\[[^\]]+\]\([^)]+\)", text_clean[:0]) or "```" in html:
            issues.append(("MED", url, "页面含原始 Markdown 片段"))
        # 3. empty h1
        if not report["h1"]:
            issues.append(("MED", url, "缺少 H1 标题"))
        # 4. title empty
        if not report["title"]:
            issues.append(("MED", url, "缺少 <title>"))
        # 5. description empty
        if not report["desc"]:
            issues.append(("LOW", url, "缺少 meta description"))
        # 6. jsonld broken
        for j in jsonld:
            try:
                json.loads(j)
            except Exception as e:
                issues.append(("MED", url, f"JSON-LD 解析失败: {e}"))
        # 7. duplicate AooBee in title
        if report["title"].count("AooBee") > 1:
            issues.append(("LOW", url, f"title 重复 AooBee: {report['title']}"))
    elif status != 200:
        issues.append(("HIGH" if status in (404,500) else "MED", url, f"HTTP {status}"))
    page_reports[url] = report

# Now check all discovered internal URLs resolve
for u in sorted(found_urls):
    if u in visited:
        continue
    status, _, _ = fetch(u)
    if status != 200:
        issues.append(("HIGH" if status in (404,500) else "MED", u, f"HTTP {status}"))
    visited.add(u)

# Check asset files exist on disk
asset_missing = []
for u in found_urls:
    p = urlparse(u)
    if p.path.endswith((".css", ".js", ".svg", ".png", ".ico", ".woff", ".woff2", ".jpg", ".jpeg", ".webp")):
        lp = local_path_for(u)
        if not os.path.exists(lp):
            asset_missing.append((u, lp))

print("=== AUDIT SUMMARY ===")
print(f"Pages crawled: {len([u for u in page_reports if page_reports[u].get('status')==200])}")
print(f"Total URLs discovered: {len(found_urls)}")
print(f"Total issues: {len(issues)}")
print()
print("--- ISSUES BY SEVERITY ---")
for sev in ("HIGH","MED","LOW"):
    its = [i for i in issues if i[0]==sev]
    print(f"[{sev}] {len(its)}")
    for s,u,m in its:
        print(f"  {u}  ::  {m}")

print()
print("--- MISSING ASSET FILES ---")
for u,lp in asset_missing:
    print(f"  {u}  (expected {lp})")

print()
print("--- PAGE QUALITY (title/h1/desc/len/jsonld) ---")
for u,r in sorted(page_reports.items()):
    if r.get("status")==200 and "title" in r:
        print(f"{u}\n   title={r['title'][:70]!r}\n   h1={r['h1'][:50]!r}\n   desc={'Y' if r['desc'] else 'N'}({len(r['desc'])})\n   text_len={r['text_len']} jsonld={r.get('jsonld_count')}\n")
