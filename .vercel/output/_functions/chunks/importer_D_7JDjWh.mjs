import { C as partners_default, D as events_default, E as highlights_default, O as site_default, S as team_default, T as stories_default, w as impact_default } from "./content_DecWaDc1.mjs";
import { n as publicUrl$1, r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { t as solvers_default } from "./solvers_CzCqjK_w.mjs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
//#region src/content/posts/five-python-libraries.md?raw
var five_python_libraries_default = "---\ntitle: \"Five Python libraries worth learning first\"\ndate: 2026-02-02\nauthor: \"CC Technical Team\"\ncategory: \"Tutorial\"\ntags: [\"python\", \"tutorial\"]\nexcerpt: \"If you know basic Python and want to build real things, these five libraries cover most of what you will reach for.\"\n---\n\nBasic Python gets you loops, functions and files. These five libraries are where it starts to feel like a real toolkit. Each one is a single `pip install` away.\n\n## 1. requests: talk to the web\n\n```python\nimport requests\n\nr = requests.get(\"https://api.github.com/repos/KFUPM-COMPUTER-CLUB/website\")\nprint(r.status_code, r.json()[\"stargazers_count\"])\n```\n\nEvery API, every scraper, every bot starts here. Learn `get`, `post`, `params`, `headers` and `r.json()` and you are set for most of them.\n\n## 2. pandas: tables that behave\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv(\"attendance.csv\")\nprint(df.groupby(\"event\")[\"student_id\"].nunique().sort_values(ascending=False))\n```\n\nAnything shaped like a spreadsheet belongs in a DataFrame. Filtering, grouping and joining take one line each, and reading CSV, Excel or JSON is the same call with a different name.\n\n## 3. matplotlib: see the numbers\n\n```python\nimport matplotlib.pyplot as plt\n\ncounts = df.groupby(\"event\")[\"student_id\"].nunique()\ncounts.plot(kind=\"bar\")\nplt.title(\"Attendance by event\")\nplt.tight_layout()\nplt.savefig(\"attendance.png\")\n```\n\nNot the prettiest charts, but the ones every other plotting library is built on. Once you can read a matplotlib figure you can read all of them.\n\n## 4. FastAPI: ship an API in a file\n\n```python\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get(\"/events/{event_id}\")\ndef event(event_id: int):\n    return {\"id\": event_id, \"name\": \"Techathon\"}\n```\n\nRun it with `uvicorn main:app --reload` and you have a documented API at `/docs`. Type hints become validation for free, which is why so many hackathon backends start this way.\n\n## 5. pytest: know when you broke it\n\n```python\ndef slugify(title: str) -> str:\n    return \"-\".join(title.lower().split())\n\ndef test_slugify():\n    assert slugify(\"KAUST Connect\") == \"kaust-connect\"\n```\n\nPut that in a file named `test_anything.py`, run `pytest`, and you have a test suite. It costs a minute now and saves an hour at 2 AM before a demo.\n\n## Where to go next\n\nPick one project and use all five: pull data with requests, clean it with pandas, chart it with matplotlib, serve it with FastAPI, and test the piece you are least sure about. Bring it to the next workshop and we will look at it together.\n";
//#endregion
//#region src/content/posts/kaust-connect-recap.md?raw
var kaust_connect_recap_default = "---\ntitle: \"KAUST Connect, in one evening\"\ndate: 2025-10-19\nauthor: \"CC Media Team\"\ncategory: \"Event recap\"\ntags: [\"kaust\", \"talks\"]\nexcerpt: \"KAUST Academy alumni from every track, 400+ students from three universities, and a room that stayed full until the end.\"\n---\n\nOn 12 October we opened the doors at 7 PM for KAUST Connect. KAUST Academy alumni from every track came to tell us how they got in, what the programs are like from the inside, and what they would do differently.\n\n## Who came\n\nMore than 400 students showed up, and not only from KFUPM. Students from Imam Abdulrahman Bin Faisal University and King Faisal University made the trip, which turned the Q&A into a conversation between campuses rather than a lecture.\n\n## What stood out\n\n- Every speaker had a different path in. There is no single \"right\" profile for the academy.\n- The questions that got the longest answers were about timing: when to apply, and what to build before applying.\n- Coffee came from our sponsor OKO, and it did not last long.\n\n## Thank you\n\nTo the speakers, to the Deanship of Student Affairs for the support, and to everyone who stayed after the session to keep asking questions. The photos are on our X account, and the next talk will be announced there first.\n";
//#endregion
//#region src/content/posts/techathon-2025-recap.md?raw
var techathon_2025_recap_default = "---\ntitle: \"Techathon 2025: four days, 60+ teams\"\ndate: 2025-04-27\nauthor: \"CC Events Team\"\ncategory: \"Event recap\"\ntags: [\"hackathon\", \"techathon\"]\nexcerpt: \"How a national hackathon ran at KFUPM, from the three-hour design phase to the final pitches, and who took the prizes.\"\n---\n\nTechathon brought teams from universities across the Kingdom to Building 22. More than 60 teams applied, 24 reached the on-site final, and the prize pool passed 30,000 SAR.\n\n## Day one: design\n\nThe first day started with a three-hour design phase. Teams had to turn an idea into a scoped plan before writing code, and the mentors spent most of those hours pushing back on scope.\n\n## The final\n\nOn the last day 11 teams presented to the jury, with Dr. Khalid Al-Anzi and Dr. Abdullah Al-Sultan in attendance. The judging rewarded working demos and clear thinking, not slides.\n\n## Winners\n\n- First place: Team Belligol, KFUPM\n- Second place: Team Muarshf, Jubail Industrial College\n- Third place: Team Mifaq, KFUPM\n- Best design: Team CodeSparksYU, Al Yamamah University\n- Best idea: Team Fussha, Jubail Industrial College\n\n## What we learned\n\nJudging criteria should be public from the first announcement. Power strips run out before pizza does. And four days is long enough to build something real, as long as day one is spent on the plan.\n\nThank you to the Techathon team for the sleepless nights, and to every team that came. See you next spring.\n";
//#endregion
//#region scripts/import-seed.mjs
var ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
var argv = new Set(process.argv.slice(2));
var DRY = argv.has("--dry-run");
var FORCE = argv.has("--force");
var BUCKET = "media";
var PHOTO_WIDTHS$1 = [
	480,
	960,
	1600
];
var LOGO_WIDTHS$1 = [480, 960];
var LOGO_MAX = 800;
var PROTECTED_SETTINGS = [
	"links",
	"whatsapp_groups",
	"email_templates",
	"banner"
];
var CONTENT_TYPES = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".svg": "image/svg+xml",
	".webp": "image/webp",
	".gif": "image/gif"
};
function parseEnv(text) {
	const out = {};
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
		if (!m) continue;
		let v = m[2].trim();
		const q = /^(["'])([\s\S]*)\1\s*(?:#.*)?$/.exec(v);
		if (q) v = q[2];
		else v = v.replace(/\s+#.*$/, "").trim();
		out[m[1]] = v;
	}
	return out;
}
function uuidFrom(seed) {
	const h = createHash("sha1").update(seed, "utf8").digest();
	h[6] = h[6] & 15 | 80;
	h[8] = h[8] & 63 | 128;
	const x = h.subarray(0, 16).toString("hex");
	return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
var riyadhIso = (date, h = 0, min = 0, s = 0, ms = 0) => {
	const [y, m, d] = date.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1, d, h - 3, min, s, ms)).toISOString();
};
var riyadhEndOfDay = (date) => riyadhIso(date, 23, 59, 59, 999);
function parseTimeRange(text) {
	const one = (s) => {
		const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(s || "");
		if (!m) return null;
		let h = Number(m[1]);
		const ap = m[3]?.toUpperCase();
		if (ap === "PM" && h < 12) h += 12;
		if (ap === "AM" && h === 12) h = 0;
		return {
			h,
			min: Number(m[2])
		};
	};
	const [a, b] = String(text || "").split(/\s*[–—-]\s*/);
	const start = one(a);
	return [start, start && b ? one(b) : null];
}
var real = (v) => typeof v === "string" && v.length > 0 && !v.includes("REPLACE");
var orNull = (v) => v === void 0 || v === null || v === "" ? null : v;
var stable = (v) => JSON.stringify(v, (_, x) => x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x);
var readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
var listDir = (p) => existsSync(join(ROOT, p)) ? readdirSync(join(ROOT, p)).filter((f) => !f.startsWith(".")).sort() : [];
var stripExt = (f) => f.replace(/\.[^.]+$/, "");
async function pmap(items, n, fn) {
	const out = new Array(items.length);
	let next = 0;
	await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
		for (let i; (i = next++) < items.length;) out[i] = await fn(items[i], i);
	}));
	return out;
}
function parseFrontmatter(src) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
	if (!m) return {
		data: {},
		body: src
	};
	const scalar = (v) => {
		v = v.trim();
		if (v.startsWith("[") && v.endsWith("]")) try {
			return JSON.parse(v);
		} catch {
			return v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
		}
		const q = /^(["'])([\s\S]*)\1$/.exec(v);
		if (q) return q[2].replace(/\\"/g, "\"");
		if (v === "true") return true;
		if (v === "false") return false;
		if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
		return v;
	};
	const data = {};
	for (const line of m[1].split(/\r?\n/)) {
		const kv = /^([\w-]+):\s*(.*)$/.exec(line);
		if (kv) data[kv[1]] = scalar(kv[2]);
	}
	return {
		data,
		body: src.slice(m[0].length)
	};
}
var escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function inline(text) {
	return escapeHtml(text).split(/(`[^`\n]+`)/).map((part) => {
		if (part.startsWith("`") && part.endsWith("`") && part.length > 1) return `<code>${part.slice(1, -1)}</code>`;
		return part.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "<a href=\"$2\">$1</a>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])/g, "$1<em>$2</em>").replace(/(^|[^\w])_(?!\s)([^_\n]+?)(?<!\s)_(?!\w)/g, "$1<em>$2</em>");
	}).join("");
}
function markdownToHtml(md) {
	const lines = md.replace(/\r\n?/g, "\n").split("\n");
	const out = [];
	let i = 0;
	const isBlank = (l) => /^\s*$/.test(l);
	const isUl = (l) => /^\s*[-*+]\s+/.test(l);
	const isOl = (l) => /^\s*\d+[.)]\s+/.test(l);
	const isBlock = (l) => /^```/.test(l) || /^#{1,6}\s/.test(l) || /^\s*>/.test(l) || isUl(l) || isOl(l);
	while (i < lines.length) {
		const line = lines[i];
		if (isBlank(line)) {
			i++;
			continue;
		}
		if (/^```/.test(line)) {
			const lang = line.slice(3).trim();
			const code = [];
			i++;
			while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
			i++;
			out.push(`<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
			continue;
		}
		const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
		if (h) {
			out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
			i++;
			continue;
		}
		if (/^\s*>/.test(line)) {
			const quoted = [];
			while (i < lines.length && /^\s*>/.test(lines[i])) quoted.push(lines[i++].replace(/^\s*>\s?/, ""));
			out.push(`<blockquote>${markdownToHtml(quoted.join("\n"))}</blockquote>`);
			continue;
		}
		if (isUl(line) || isOl(line)) {
			const ordered = isOl(line);
			const test = ordered ? isOl : isUl;
			const items = [];
			while (i < lines.length && test(lines[i])) {
				let item = lines[i++].replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "");
				while (i < lines.length && !isBlank(lines[i]) && !isBlock(lines[i])) item += " " + lines[i++].trim();
				items.push(`<li>${inline(item)}</li>`);
			}
			out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
			continue;
		}
		const para = [];
		while (i < lines.length && !isBlank(lines[i]) && !isBlock(lines[i])) para.push(lines[i++].trim());
		out.push(`<p>${inline(para.join(" "))}</p>`);
	}
	return out.join("\n");
}
var fileEnv = existsSync(join(ROOT, ".env")) ? parseEnv(readFileSync(join(ROOT, ".env"), "utf8")) : {};
var env = (k) => process.env[k] ?? fileEnv[k] ?? "";
var SUPABASE_URL = env("PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
var SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SECRET_KEY");
var publicUrl = (path) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
var log = (...a) => console.log(...a);
var stats = {};
var skips = [];
var stat = (table) => stats[table] ??= {
	inserted: 0,
	updated: 0,
	unchanged: 0,
	deleted: 0,
	skipped: 0
};
var skip = (table, why) => {
	stat(table).skipped++;
	skips.push(`${table}: ${why}`);
};
var db = null;
async function selectIn(table, pk, ids, columns = "*") {
	if (!db || !ids.length) return [];
	const rows = [];
	for (let i = 0; i < ids.length; i += 100) {
		const { data, error } = await db.from(table).select(columns).in(pk, ids.slice(i, i + 100));
		if (error) throw new Error(`select ${table}: ${error.message}`);
		rows.push(...data);
	}
	return rows;
}
var norm = (v) => {
	if (v === void 0 || v === null) return null;
	if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) && !Number.isNaN(Date.parse(v))) return new Date(v).toISOString();
	if (typeof v === "object") return stable(v);
	return v;
};
var same = (existing, row) => Object.keys(row).every((k) => norm(existing[k]) === norm(row[k]));
async function sync(table, rows, { pk = "id", label = (r) => r[pk], keep = [], protect = () => false } = {}) {
	const s = stat(table);
	const existing = new Map((await selectIn(table, pk, rows.map((r) => r[pk]))).map((r) => [r[pk], r]));
	const writes = [];
	for (const row of rows) {
		const cur = existing.get(row[pk]);
		const payload = cur ? {
			...row,
			...Object.fromEntries(keep.filter((k) => k in cur).map((k) => [k, cur[k]]))
		} : row;
		if (cur && same(cur, payload)) {
			s.unchanged++;
			continue;
		}
		if (cur && !FORCE && protect(cur)) {
			skip(table, `${label(row)} differs from the seed but is admin-owned; kept (use --force to overwrite)`);
			continue;
		}
		if (DRY) log(`  ${cur ? "~" : "+"} ${table}: ${label(row)}`);
		cur ? s.updated++ : s.inserted++;
		writes.push(payload);
	}
	if (!DRY && writes.length) {
		const groups = /* @__PURE__ */ new Map();
		for (const w of writes) {
			const sig = Object.keys(w).sort().join(",");
			(groups.get(sig) ?? groups.set(sig, []).get(sig)).push(w);
		}
		for (const group of groups.values()) for (let i = 0; i < group.length; i += 100) {
			const { error } = await db.from(table).upsert(group.slice(i, i + 100), { onConflict: pk });
			if (error) throw new Error(`upsert ${table}: ${error.message}`);
		}
	}
	return writes.length;
}
async function upload(path, body, contentType) {
	if (DRY) return;
	for (let attempt = 1;; attempt++) {
		const { error } = await db.storage.from(BUCKET).upload(path, body, {
			upsert: true,
			contentType,
			cacheControl: "31536000"
		});
		if (!error) return;
		if (attempt >= 3) throw new Error(`upload ${path}: ${error.message}`);
		await new Promise((r) => setTimeout(r, 500 * attempt));
	}
}
async function headOk(url) {
	try {
		return (await fetch(url, { method: "HEAD" })).status === 200;
	} catch {
		return false;
	}
}
async function importMedia() {
	const photoDir = "src/assets/photos", logoDir = "src/assets/partners";
	const photos = listDir(photoDir).filter((f) => /\.jpe?g$/i.test(f));
	const logos = listDir(logoDir).filter((f) => extname(f).toLowerCase() in CONTENT_TYPES);
	const plan = async (file, dir, isPhoto) => {
		const abs = join(ROOT, dir, file);
		const buf = readFileSync(abs);
		const ext = extname(file).toLowerCase();
		const name = stripExt(file);
		let meta = {};
		try {
			meta = await sharp(buf).metadata();
		} catch (e) {
			skip("media", `${file}: unreadable (${e.message})`);
			return null;
		}
		const rotated = meta.orientation >= 5;
		const width = (rotated ? meta.height : meta.width) ?? null, height = (rotated ? meta.width : meta.height) ?? null;
		const folder = isPhoto ? `photos/${name}` : `partners/${name}`;
		const originalPath = isPhoto ? `${folder}/original.jpg` : `partners/${file}`;
		const variants = [];
		if (isPhoto) {
			for (const w of PHOTO_WIDTHS$1) if (width && w <= width) variants.push({
				slot: String(w),
				width: w,
				path: `${folder}/w${w}.webp`
			});
		} else if (ext !== ".svg") {
			const seen = /* @__PURE__ */ new Set();
			for (const w of LOGO_WIDTHS$1) {
				const actual = Math.min(w, LOGO_MAX, width || w);
				if (seen.has(actual)) continue;
				seen.add(actual);
				variants.push({
					slot: String(w),
					width: actual,
					path: `${folder}/w${w}.webp`
				});
			}
		}
		const sizes = Object.fromEntries(variants.map((v) => [v.slot, publicUrl(v.path)]));
		if (!isPhoto) sizes.file = publicUrl(originalPath);
		return {
			file,
			buf,
			ext,
			isPhoto,
			originalPath,
			variants,
			row: {
				key: file,
				kind: "image",
				alt: "",
				width,
				height,
				bytes: buf.length,
				sizes,
				path: originalPath,
				tags: isPhoto ? ["seed", "photo"] : ["seed", "partner"]
			}
		};
	};
	const items = (await Promise.all([...photos.map((f) => plan(f, photoDir, true)), ...logos.map((f) => plan(f, logoDir, false))])).filter(Boolean);
	log(`media: ${photos.length} photos, ${logos.length} partner logos`);
	const existing = new Map((await selectIn("media", "key", items.map((it) => it.row.key), "key,alt,sizes,path,tags,uploaded_by")).map((r) => [r.key, r]));
	const upToDate = async (it) => {
		const cur = existing.get(it.row.key);
		if (!cur || FORCE || cur.path !== it.originalPath) return false;
		const urls = [...Object.values(it.row.sizes), publicUrl(it.originalPath)];
		if (Object.keys(it.row.sizes).some((k) => cur.sizes?.[k] !== it.row.sizes[k])) return false;
		return (await pmap(urls, 4, headOk)).every(Boolean);
	};
	const fresh = await pmap(items, 8, upToDate);
	const todo = items.filter((_, i) => !fresh[i]);
	const skippedUploads = items.length - todo.length;
	log(`media: ${skippedUploads} already in storage, ${todo.length} to ${DRY ? "process (dry run)" : "process"}`);
	await pmap(todo, 3, async (it) => {
		if (DRY) {
			log(`  ^ upload ${it.file}: ${it.variants.map((v) => `${v.slot}=${v.width}px`).join(" ") || "original only"}`);
			return;
		}
		const base = sharp(it.buf).rotate();
		for (const v of it.variants) {
			const webp = await base.clone().resize({
				width: v.width,
				withoutEnlargement: true
			}).webp({ quality: 80 }).toBuffer();
			await upload(v.path, webp, "image/webp");
		}
		await upload(it.originalPath, it.buf, CONTENT_TYPES[it.ext]);
		log(`  uploaded ${it.file} (${it.variants.length} sizes + original)`);
	});
	await sync("media", items.map((it) => {
		const cur = existing.get(it.row.key);
		return cur ? {
			...it.row,
			tags: [.../* @__PURE__ */ new Set([...cur.tags || [], ...it.row.tags])]
		} : it.row;
	}), {
		pk: "key",
		keep: ["alt", "uploaded_by"]
	});
	stat("media").uploads = todo.length;
	stat("media").cached = skippedUploads;
	return new Set(items.map((it) => it.row.key));
}
function mapEvents(events, mediaKeys) {
	return events.map((e) => {
		const [start, end] = parseTimeRange(e.time);
		const allDay = !start;
		let endsAt = e.endDate ? riyadhEndOfDay(e.endDate) : null;
		if (!endsAt && end) {
			const endMs = Date.parse(riyadhIso(e.date, end.h, end.min)) + (end.h * 60 + end.min <= start.h * 60 + start.min ? 864e5 : 0);
			endsAt = new Date(endMs).toISOString();
		}
		if (e.image && !mediaKeys.has(e.image)) skip("events", `${e.id}: cover "${e.image}" is not a media key, left empty`);
		return {
			id: uuidFrom(`event:${e.id}`),
			slug: e.id,
			title: e.title,
			type: e.type || "Other",
			starts_at: allDay ? riyadhIso(e.date) : riyadhIso(e.date, start.h, start.min),
			ends_at: endsAt,
			all_day: allDay,
			location: e.location || "",
			summary: e.summary || "",
			cover_key: e.image && mediaKeys.has(e.image) ? e.image : null,
			x_url: orNull(e.detailsUrl),
			register_url: real(e.registerUrl) ? e.registerUrl : null,
			featured: !!e.featured,
			published: true
		};
	});
}
var mapHighlights = (list, mediaKeys) => list.map((h, i) => {
	if (h.photo && !mediaKeys.has(h.photo)) skip("highlights", `${h.title}: photo "${h.photo}" is not a media key`);
	return {
		id: uuidFrom(`highlight:${h.photo}`),
		photo_key: mediaKeys.has(h.photo) ? h.photo : null,
		title: h.title,
		date: h.date,
		line: h.line || "",
		post_url: orNull(h.post),
		sort: i,
		visible: true
	};
});
var mapStories = (list, mediaKeys) => list.map((s, i) => {
	if (s.photo && !mediaKeys.has(s.photo)) skip("stories", `${s.title}: photo "${s.photo}" is not a media key`);
	return {
		id: uuidFrom(`story:${s.photo}`),
		photo_key: mediaKeys.has(s.photo) ? s.photo : null,
		title: s.title,
		date: s.date,
		text: s.text || "",
		post_url: orNull(s.post),
		sort: i,
		visible: true
	};
});
function mapStripPhotos(photoKeys, events, highlights) {
	const byImage = new Map(events.filter((e) => e.image).map((e) => [e.image, e.title]));
	const byPhoto = new Map(highlights.map((h) => [h.photo, h.title]));
	const byDate = /* @__PURE__ */ new Map();
	for (const e of events) if (!byDate.has(e.date)) byDate.set(e.date, e.title);
	return [...photoKeys].sort().map((key, i) => {
		const [date, id] = stripExt(key).split("_");
		return {
			photo_key: key,
			label: byImage.get(key) || byPhoto.get(key) || byDate.get(date) || "@KFUPM_CC",
			post_url: id ? `https://x.com/KFUPM_CC/status/${id}` : null,
			sort: i,
			visible: true
		};
	});
}
function mapImpact(impact, mediaKeys) {
	const semesters = [], items = [];
	(impact.semesters || []).forEach((s, i) => {
		if (s.photo && !mediaKeys.has(s.photo)) skip("impact_semesters", `${s.term}: photo "${s.photo}" is not a media key`);
		const id = uuidFrom(`impact:${s.term}`);
		semesters.push({
			id,
			term: s.term,
			total_sar: s.total_sar ?? null,
			total_is_minimum: !!s.total_is_minimum,
			photo_key: s.photo && mediaKeys.has(s.photo) ? s.photo : null,
			sort: i
		});
		(s.events || []).forEach((e, j) => items.push({
			id: uuidFrom(`impactitem:${s.term}:${e.name}`),
			semester_id: id,
			name: e.name,
			prize_sar: e.prize_sar ?? null,
			detail: orNull(e.detail),
			source_url: orNull(e.source),
			sort: j
		}));
	});
	return {
		semesters,
		items
	};
}
function mapPartners(partners, mediaKeys) {
	const groups = [
		["companies", "company"],
		["kfupm_units", "kfupm_unit"],
		["student_clubs", "student_club"],
		["visited", "visited"]
	];
	const rows = [];
	let sort = 0;
	for (const [field, kind] of groups) for (const p of partners[field] || []) {
		if (p.logo && !mediaKeys.has(p.logo)) skip("partners", `${p.name}: logo "${p.logo}" is not a media key`);
		rows.push({
			id: uuidFrom(`partner:${kind}:${p.name}`),
			name: p.name,
			kind,
			what: orNull(p.what),
			url: orNull(p.url),
			source_url: orNull(p.source),
			logo_key: p.logo && mediaKeys.has(p.logo) ? p.logo : null,
			handle: orNull(p.handle),
			mark: !!p.mark,
			square: !!p.square,
			tall: !!p.tall,
			sort: sort++,
			visible: kind !== "visited"
		});
	}
	return rows;
}
var mapOfficers = (team) => team.map((m, i) => ({
	id: uuidFrom(`officer:${m.id}`),
	name: m.name,
	title: m.role,
	committee: m.committee || "",
	term: m.term || "",
	major: orNull(m.major),
	linkedin: orNull(m.linkedin),
	sort: m.order ?? i,
	is_current: true,
	photo_key: null
}));
function mapSettings(site, impact) {
	const clean = (v) => real(v) ? v : "";
	const prizes = Number(String(impact.headline_numbers?.announced_prizes_since_2023_sar ?? "").replace(/\D/g, "")) || 0;
	return [
		{
			key: "site",
			value: {
				name: site.name,
				short: site.short,
				tagline: site.tagline,
				description: site.description,
				intro: site.intro,
				email: clean(site.email),
				missionAr: site.missionAr || ""
			}
		},
		{
			key: "links",
			value: Object.fromEntries(Object.entries(site.links || {}).map(([k, v]) => [k, clean(v)]))
		},
		{
			key: "home",
			value: {
				heroLine: site.tagline,
				buildWithUs: {
					title: "Build with us.",
					text: "Workshops, hackathons, talks and competitions, all term long. Free for KFUPM students."
				},
				photoMoment: {
					photoKey: "2025-04-10_1910478806520914205.jpg",
					eyebrow: "Techathon 2025, day one",
					line: "Any major. Any year. No experience required."
				},
				stats: [
					{
						v: "40,000",
						u: "SAR",
						l: "biggest prize pool"
					},
					{
						v: "60+",
						u: "teams",
						l: "at Techathon 2025"
					},
					{
						v: "400+",
						u: "students",
						l: "at KAUST Connect"
					}
				],
				totalPrizesSar: prizes
			}
		},
		{
			key: "made_by",
			value: site.madeBy || []
		},
		{
			key: "banner",
			value: {
				text: "",
				url: "",
				visible: false
			}
		},
		{
			key: "whatsapp_groups",
			value: []
		},
		{
			key: "email_templates",
			value: {}
		}
	];
}
var mapFaq = (faq) => faq.map((f, i) => ({
	id: uuidFrom(`faq:${f.q}`),
	q_en: f.q,
	a_en: f.a,
	sort: i,
	visible: true
}));
function mapPost(file, src) {
	const slug = stripExt(file);
	const { data, body } = parseFrontmatter(src);
	const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date || "").slice(0, 10);
	return {
		id: uuidFrom(`post:${slug}`),
		slug,
		title: data.title || slug,
		excerpt: data.excerpt || "",
		content_html: markdownToHtml(body.trim()),
		dir: "ltr",
		category: data.category || "News",
		tags: Array.isArray(data.tags) ? data.tags : [],
		author_id: null,
		author_name: data.author || null,
		status: "published",
		published_at: /^\d{4}-\d{2}-\d{2}$/.test(date) ? riyadhIso(date) : (/* @__PURE__ */ new Date()).toISOString()
	};
}
var mapSolvers = (list) => (Array.isArray(list) ? list : []).filter((s) => s && (s.name || typeof s === "string")).map((s) => {
	const name = String(typeof s === "string" ? s : s.name).slice(0, 40), handle = orNull(typeof s === "string" ? null : s.handle);
	return {
		id: uuidFrom(`solver:${name}:${handle || ""}`),
		name,
		handle: handle ? String(handle).slice(0, 40) : null,
		approved: true
	};
});
async function main() {
	log(`seed import${DRY ? " (dry run: nothing is written)" : ""}${FORCE ? " (force)" : ""}`);
	if (!SUPABASE_URL || !SERVICE_KEY) {
		const missing = [!SUPABASE_URL && "PUBLIC_SUPABASE_URL", !SERVICE_KEY && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean).join(" and ");
		if (!DRY) {
			console.error(`Missing ${missing}. Put them in .env (see .env.example) or export them, then run again.`);
			process.exit(1);
		}
		log(`note: ${missing} not set; the dry run assumes an empty database${SUPABASE_URL ? "" : " and a placeholder project URL"}.`);
		SUPABASE_URL ||= "https://PROJECT.supabase.co";
	} else {
		db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: {
			persistSession: false,
			autoRefreshToken: false
		} });
		const { error } = await db.from("settings").select("key").limit(1);
		if (error) {
			console.error(`Cannot reach the database at ${SUPABASE_URL}: ${error.message}. Has supabase/migrations/0001_init.sql been applied?`);
			process.exit(1);
		}
	}
	const events = readJson("src/data/events.json");
	const highlights = readJson("src/data/highlights.json");
	const stories = readJson("src/data/stories.json");
	const impact = readJson("src/data/impact.json");
	const partners = readJson("src/data/partners.json");
	const team = readJson("src/data/team.json");
	const site = readJson("src/data/site.json");
	const solvers = existsSync(join(ROOT, "src/data/solvers.json")) ? readJson("src/data/solvers.json") : [];
	const mediaKeys = await importMedia();
	const photoKeys = [...mediaKeys].filter((k) => /^\d{4}-\d{2}-\d{2}_\d+\.jpe?g$/i.test(k));
	await sync("events", mapEvents(events, mediaKeys), { label: (r) => r.slug });
	await sync("highlights", mapHighlights(highlights, mediaKeys), { label: (r) => r.title });
	await sync("stories", mapStories(stories, mediaKeys), { label: (r) => r.title });
	await sync("strip_photos", mapStripPhotos(photoKeys, events, highlights), { pk: "photo_key" });
	const { semesters, items } = mapImpact(impact, mediaKeys);
	await sync("impact_semesters", semesters, { label: (r) => r.term });
	await sync("impact_items", items, { label: (r) => r.name });
	const current = await selectIn("impact_items", "semester_id", semesters.map((s) => s.id), "id,name,semester_id");
	const keepIds = new Set(items.map((i) => i.id));
	const stale = current.filter((r) => !keepIds.has(r.id));
	if (stale.length) {
		if (DRY) stale.forEach((r) => log(`  - impact_items: ${r.name}`));
		else {
			const { error } = await db.from("impact_items").delete().in("id", stale.map((r) => r.id));
			if (error) throw new Error(`delete impact_items: ${error.message}`);
		}
		stat("impact_items").deleted += stale.length;
	}
	await sync("partners", mapPartners(partners, mediaKeys), { label: (r) => `${r.kind}/${r.name}` });
	await sync("officer_terms", mapOfficers(team), {
		label: (r) => `${r.name} (${r.title})`,
		keep: ["user_id", "photo_key"]
	});
	await sync("settings", mapSettings(site, impact), {
		pk: "key",
		protect: (cur) => PROTECTED_SETTINGS.includes(cur.key)
	});
	await sync("faq", mapFaq(site.faq || []), { label: (r) => r.q_en });
	await sync("posts", listDir("src/content/posts").filter((f) => f.endsWith(".md")).map((f) => mapPost(f, readFileSync(join(ROOT, "src/content/posts", f), "utf8"))), {
		label: (r) => r.slug,
		keep: [
			"author_id",
			"cover_key",
			"content_json"
		]
	});
	await sync("flag_solvers", mapSolvers(solvers), { label: (r) => r.name });
	const cols = [
		"table",
		"inserted",
		"updated",
		"unchanged",
		"deleted",
		"skipped"
	];
	const rows = Object.entries(stats).map(([t, s]) => [
		t,
		s.inserted,
		s.updated,
		s.unchanged,
		s.deleted,
		s.skipped
	].map(String));
	const w = cols.map((c, i) => Math.max(c.length, ...rows.map((r) => r[i].length)));
	const line = (r) => r.map((c, i) => i ? c.padStart(w[i]) : c.padEnd(w[i])).join("  ");
	log(`\n${DRY ? "would change" : "changed"}:\n${line(cols)}\n${w.map((n) => "-".repeat(n)).join("  ")}\n${rows.map(line).join("\n")}`);
	if (stats.media) log(`media files: ${stats.media.uploads} ${DRY ? "to upload" : "uploaded"}, ${stats.media.cached} already in storage`);
	if (skips.length) log(`\nskipped:\n${skips.map((s) => `  ${s}`).join("\n")}`);
	log(DRY ? "\ndry run complete; nothing was written." : "\ndone.");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => {
	console.error(`\nimport failed: ${e.message}`);
	process.exit(1);
});
//#endregion
//#region src/lib/importer.ts
var photoFiles = Object.keys({
	"../assets/photos/2021-11-18_1461424996052520960.jpg": 0,
	"../assets/photos/2022-11-14_1592111879358484480.jpg": 0,
	"../assets/photos/2022-11-15_1592548101872832515.jpg": 0,
	"../assets/photos/2022-12-19_1604855828833570816.jpg": 0,
	"../assets/photos/2023-01-25_1618224758306529280.jpg": 0,
	"../assets/photos/2023-01-26_1618587590055333888.jpg": 0,
	"../assets/photos/2023-02-01_1620676655600779265.jpg": 0,
	"../assets/photos/2023-02-09_1623696515263856645.jpg": 0,
	"../assets/photos/2023-02-13_1625031384392781828.jpg": 0,
	"../assets/photos/2023-02-17_1626580038513750022.jpg": 0,
	"../assets/photos/2023-02-18_1626977922769686532.jpg": 0,
	"../assets/photos/2023-02-19_1627334418477027328.jpg": 0,
	"../assets/photos/2023-02-19_1627334441352691715.jpg": 0,
	"../assets/photos/2023-02-19_1627334457362374656.jpg": 0,
	"../assets/photos/2023-02-19_1627334471740538885.jpg": 0,
	"../assets/photos/2023-02-19_1627334485116166147.jpg": 0,
	"../assets/photos/2023-03-10_1634237904884215809.jpg": 0,
	"../assets/photos/2023-04-02_1642669962069262336.jpg": 0,
	"../assets/photos/2023-04-10_1645521699012575248.jpg": 0,
	"../assets/photos/2023-05-08_1655532666228297733.jpg": 0,
	"../assets/photos/2023-05-15_1658203167425699850.jpg": 0,
	"../assets/photos/2023-09-24_1705965808340414726.jpg": 0,
	"../assets/photos/2023-10-05_1709879497476948298.jpg": 0,
	"../assets/photos/2023-10-05_1710052770403799547.jpg": 0,
	"../assets/photos/2023-10-06_1710393697978741041.jpg": 0,
	"../assets/photos/2023-10-06_1710393716165206361.jpg": 0,
	"../assets/photos/2023-10-27_1717887423932235810.jpg": 0,
	"../assets/photos/2023-11-02_1720117729473057111.jpg": 0,
	"../assets/photos/2023-11-08_1722207975157436836.jpg": 0,
	"../assets/photos/2023-11-13_1723997385997561915.jpg": 0,
	"../assets/photos/2023-11-28_1729387940701151682.jpg": 0,
	"../assets/photos/2023-11-29_1729746614653161705.jpg": 0,
	"../assets/photos/2023-11-30_1730211245867802749.jpg": 0,
	"../assets/photos/2023-11-30_1730314930832732261.jpg": 0,
	"../assets/photos/2023-12-03_1731292973663457737.jpg": 0,
	"../assets/photos/2023-12-03_1731293063736143941.jpg": 0,
	"../assets/photos/2023-12-03_1731293084665950378.jpg": 0,
	"../assets/photos/2023-12-06_1732356471982043620.jpg": 0,
	"../assets/photos/2024-01-25_1750466051257610585.jpg": 0,
	"../assets/photos/2024-02-06_1754768354974257462.jpg": 0,
	"../assets/photos/2024-02-07_1755148899864518982.jpg": 0,
	"../assets/photos/2024-02-08_1755578530677637289.jpg": 0,
	"../assets/photos/2024-02-12_1757048642790187243.jpg": 0,
	"../assets/photos/2024-02-13_1757404213083046384.jpg": 0,
	"../assets/photos/2024-02-14_1757712935655260400.jpg": 0,
	"../assets/photos/2024-02-14_1757867157617070427.jpg": 0,
	"../assets/photos/2024-03-10_1766907280203624486.jpg": 0,
	"../assets/photos/2024-03-17_1769505136064282669.jpg": 0,
	"../assets/photos/2024-03-19_1769880969639518423.jpg": 0,
	"../assets/photos/2024-03-20_1770266404811395169.jpg": 0,
	"../assets/photos/2024-03-24_1772041072769679652.jpg": 0,
	"../assets/photos/2024-04-25_1783465960931832006.jpg": 0,
	"../assets/photos/2024-04-26_1783838738101178565.jpg": 0,
	"../assets/photos/2024-04-30_1785217635640132045.jpg": 0,
	"../assets/photos/2024-05-01_1785567400550662586.jpg": 0,
	"../assets/photos/2024-05-01_1785727003213042026.jpg": 0,
	"../assets/photos/2024-05-07_1787837453123846484.jpg": 0,
	"../assets/photos/2024-05-07_1787837468470812860.jpg": 0,
	"../assets/photos/2024-05-07_1787837500515307525.jpg": 0,
	"../assets/photos/2024-05-07_1787837515770003470.jpg": 0,
	"../assets/photos/2024-05-07_1787837532714995751.jpg": 0,
	"../assets/photos/2024-05-07_1787837550565933250.jpg": 0,
	"../assets/photos/2024-05-07_1787837569968820574.jpg": 0,
	"../assets/photos/2024-05-07_1787837587085803802.jpg": 0,
	"../assets/photos/2024-05-07_1787837608648659400.jpg": 0,
	"../assets/photos/2024-05-14_1790391068023791895.jpg": 0,
	"../assets/photos/2024-05-20_1792616103044174237.jpg": 0,
	"../assets/photos/2024-09-26_1839248619293028714.jpg": 0,
	"../assets/photos/2024-09-29_1840466306006659353.jpg": 0,
	"../assets/photos/2024-10-06_1842990131260834264.jpg": 0,
	"../assets/photos/2024-10-21_1848265386073940168.jpg": 0,
	"../assets/photos/2024-10-29_1851239307748532557.jpg": 0,
	"../assets/photos/2024-11-24_1860663399195066682.jpg": 0,
	"../assets/photos/2024-11-25_1861119863458029794.jpg": 0,
	"../assets/photos/2024-11-28_1862120985945608671.jpg": 0,
	"../assets/photos/2024-12-03_1864050646992793601.jpg": 0,
	"../assets/photos/2024-12-04_1864396918228422715.jpg": 0,
	"../assets/photos/2024-12-05_1864760431241211919.jpg": 0,
	"../assets/photos/2025-02-12_1889724538708988331.jpg": 0,
	"../assets/photos/2025-02-18_1891893230205088026.jpg": 0,
	"../assets/photos/2025-03-18_1901911196837818695.jpg": 0,
	"../assets/photos/2025-04-10_1910478806520914205.jpg": 0,
	"../assets/photos/2025-04-13_1911484448878526779.jpg": 0,
	"../assets/photos/2025-04-20_1913920617407009239.jpg": 0,
	"../assets/photos/2025-04-20_1913920636671438920.jpg": 0,
	"../assets/photos/2025-04-20_1913920653427691792.jpg": 0,
	"../assets/photos/2025-04-20_1913920668669821112.jpg": 0,
	"../assets/photos/2025-04-20_1913920688710168909.jpg": 0,
	"../assets/photos/2025-04-26_1916231780799053933.jpg": 0,
	"../assets/photos/2025-09-13_1966930489975226577.jpg": 0,
	"../assets/photos/2025-09-15_1967613383982936340.jpg": 0,
	"../assets/photos/2025-09-26_1971532633755865260.jpg": 0,
	"../assets/photos/2025-09-26_1971646693231010182.jpg": 0,
	"../assets/photos/2025-10-03_1974082470355370275.jpg": 0,
	"../assets/photos/2025-10-12_1977385330635362441.jpg": 0,
	"../assets/photos/2025-10-12_1977397509702988011.jpg": 0,
	"../assets/photos/2025-10-17_1979208323674013989.jpg": 0,
	"../assets/photos/2025-10-20_1980196823303397615.jpg": 0,
	"../assets/photos/2025-10-23_1981399639560507551.jpg": 0,
	"../assets/photos/2025-11-07_1986846367201861709.jpg": 0,
	"../assets/photos/2025-12-06_1997329598145544489.jpg": 0,
	"../assets/photos/2025-12-06_1997329877641421114.jpg": 0,
	"../assets/photos/2025-12-10_1998825273383399868.jpg": 0,
	"../assets/photos/2025-12-14_2000224482489667651.jpg": 0,
	"../assets/photos/2025-12-14_2000224783506563094.jpg": 0,
	"../assets/photos/2025-12-19_2002037765056434492.jpg": 0,
	"../assets/photos/2026-01-28_2016548505070817595.jpg": 0,
	"../assets/photos/2026-09-08_2097325969014984962.jpg": 0,
	"../assets/photos/2026-09-11_2098349741796983025.jpg": 0,
	"../assets/photos/2026-09-22_2102397545573974170.jpg": 0,
	"../assets/photos/2026-10-06_2107519660690165818.jpg": 0
}).map((p) => p.split("/").pop()).sort();
var logoFiles = Object.keys({
	"../assets/partners/3d-solutions.png": 0,
	"../assets/partners/accenture.svg": 0,
	"../assets/partners/aws.svg": 0,
	"../assets/partners/google-cloud.svg": 0,
	"../assets/partners/jrcai.png": 0,
	"../assets/partners/kaust.svg": 0,
	"../assets/partners/photography-club.jpg": 0,
	"../assets/partners/replit.svg": 0,
	"../assets/partners/stc.svg": 0,
	"../assets/partners/stream.png": 0,
	"../assets/partners/thakaa.png": 0,
	"../assets/partners/voluntary-work-unit.png": 0,
	"../assets/partners/x-actuarial_kfupm.jpg": 0,
	"../assets/partners/x-airobotclub_iau.jpg": 0,
	"../assets/partners/x-cieclub.jpg": 0,
	"../assets/partners/x-eec_kfupm.jpg": 0,
	"../assets/partners/x-gdsc_kfupm.jpg": 0,
	"../assets/partners/x-kaust_academy.jpg": 0,
	"../assets/partners/x-kfupm_faec.jpg": 0,
	"../assets/partners/x-kfupm_kikx.jpg": 0,
	"../assets/partners/x-kfupmvolunteers.jpg": 0,
	"../assets/partners/x-meettechnology.jpg": 0
}).map((p) => p.split("/").pop()).sort();
var postFiles = /* #__PURE__ */ Object.assign({
	"../content/posts/five-python-libraries.md": five_python_libraries_default,
	"../content/posts/kaust-connect-recap.md": kaust_connect_recap_default,
	"../content/posts/techathon-2025-recap.md": techathon_2025_recap_default
});
var REPO = "KFUPM-COMPUTER-CLUB/website";
var ref = () => process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_REF || "main";
var rawUrl = (path) => `https://raw.githubusercontent.com/${REPO}/${ref()}/${path}`;
var PHOTO_WIDTHS = [
	480,
	960,
	1600
];
var LOGO_WIDTHS = [480, 960];
var BATCH = 6;
var PROTECTED = [
	"links",
	"whatsapp_groups",
	"email_templates",
	"banner"
];
var totalMediaSteps = () => photoFiles.length + logoFiles.length;
async function fetchBytes(path) {
	const r = await fetch(rawUrl(path));
	if (!r.ok) throw new Error(`Could not fetch ${path} (${r.status})`);
	return new Uint8Array(await r.arrayBuffer());
}
async function exists(key) {
	const { data } = await serviceClient().from("media").select("key,sizes").eq("key", key).maybeSingle();
	return !!(data && Object.keys(data.sizes || {}).length);
}
async function importPhoto(name, force) {
	if (!force && await exists(name)) return "kept";
	const buf = await fetchBytes(`src/assets/photos/${name}`);
	const sb = serviceClient();
	const base = `photos/${name.replace(/\.[^.]+$/, "")}`;
	const meta = await sharp(Buffer.from(buf)).rotate().metadata();
	const width = meta.width || 0, height = meta.height || 0;
	const sizes = {};
	for (const w of PHOTO_WIDTHS) {
		if (w > width && w !== PHOTO_WIDTHS[0]) continue;
		const out = await sharp(Buffer.from(buf)).rotate().resize({
			width: Math.min(w, width),
			withoutEnlargement: true
		}).webp({ quality: 80 }).toBuffer();
		const path = `${base}/w${w}.webp`;
		const { error } = await sb.storage.from("media").upload(path, out, {
			contentType: "image/webp",
			upsert: true,
			cacheControl: "31536000"
		});
		if (error) throw new Error(`${name}: ${error.message}`);
		sizes[String(w)] = publicUrl$1(`media/${path}`);
	}
	const origPath = `${base}/original.jpg`;
	await sb.storage.from("media").upload(origPath, buf, {
		contentType: "image/jpeg",
		upsert: true,
		cacheControl: "31536000"
	});
	const { data: old } = await sb.from("media").select("alt,uploaded_by").eq("key", name).maybeSingle();
	const { error } = await sb.from("media").upsert({
		key: name,
		kind: "image",
		alt: old?.alt || "",
		width,
		height,
		bytes: buf.byteLength,
		sizes,
		path: `media/${origPath}`,
		tags: ["seed", "photo"],
		bucket: "media",
		published: true,
		uploaded_by: old?.uploaded_by || null
	});
	if (error) throw new Error(`${name}: ${error.message}`);
	return "imported";
}
async function importLogo(name, force) {
	if (!force && await exists(name)) return "kept";
	const buf = await fetchBytes(`src/assets/partners/${name}`);
	const sb = serviceClient();
	const ext = name.split(".").pop().toLowerCase();
	const type = ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
	const path = `partners/${name}`;
	const { error } = await sb.storage.from("media").upload(path, buf, {
		contentType: type,
		upsert: true,
		cacheControl: "31536000"
	});
	if (error) throw new Error(`${name}: ${error.message}`);
	const sizes = { file: publicUrl$1(`media/${path}`) };
	let width = null, height = null;
	if (ext !== "svg") {
		const meta = await sharp(Buffer.from(buf)).metadata();
		width = meta.width || null;
		height = meta.height || null;
		for (const w of LOGO_WIDTHS) {
			if (width && w > width && w !== LOGO_WIDTHS[0]) continue;
			const out = await sharp(Buffer.from(buf)).resize({
				width: Math.min(w, 800, width || w),
				withoutEnlargement: true
			}).webp({ quality: 85 }).toBuffer();
			const p = `partners/${name.replace(/\.[^.]+$/, "")}/w${w}.webp`;
			await sb.storage.from("media").upload(p, out, {
				contentType: "image/webp",
				upsert: true,
				cacheControl: "31536000"
			});
			sizes[String(w)] = publicUrl$1(`media/${p}`);
		}
	}
	const { data: old } = await sb.from("media").select("alt").eq("key", name).maybeSingle();
	const { error: e2 } = await sb.from("media").upsert({
		key: name,
		kind: "image",
		alt: old?.alt || name.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
		width,
		height,
		bytes: buf.byteLength,
		sizes,
		path: `media/${path}`,
		tags: ["seed", "partner"],
		bucket: "media",
		published: true
	});
	if (e2) throw new Error(`${name}: ${e2.message}`);
	return "imported";
}
async function upsertAll(table, rows, pk = "id") {
	if (!rows.length) return 0;
	const { error } = await serviceClient().from(table).upsert(rows, { onConflict: pk });
	if (error) throw new Error(`${table}: ${error.message}`);
	return rows.length;
}
async function importData(log) {
	const sb = serviceClient();
	const { data: media } = await sb.from("media").select("key");
	const keys = new Set((media || []).map((m) => m.key));
	const count = (t, n) => log.push(`${t}: ${n} rows`);
	count("events", await upsertAll("events", mapEvents(events_default, keys)));
	count("highlights", await upsertAll("highlights", mapHighlights(highlights_default, keys)));
	count("stories", await upsertAll("stories", mapStories(stories_default, keys)));
	count("strip_photos", await upsertAll("strip_photos", mapStripPhotos(photoFiles.filter((k) => keys.has(k)), events_default, highlights_default), "photo_key"));
	const impact = mapImpact(impact_default, keys);
	count("impact_semesters", await upsertAll("impact_semesters", impact.semesters));
	count("impact_items", await upsertAll("impact_items", impact.items));
	count("partners", await upsertAll("partners", mapPartners(partners_default, keys)));
	count("officer_terms", await upsertAll("officer_terms", mapOfficers(team_default)));
	count("faq", await upsertAll("faq", mapFaq(site_default.faq || [])));
	const { data: existing } = await sb.from("settings").select("key");
	const have = new Set((existing || []).map((r) => r.key));
	count("settings", await upsertAll("settings", mapSettings(site_default, impact_default).filter((s) => !(PROTECTED.includes(s.key) && have.has(s.key))), "key"));
	const posts = Object.entries(postFiles).map(([path, src]) => mapPost(path.split("/").pop(), src));
	const { data: oldPosts } = await sb.from("posts").select("id,author_id,cover_key,content_json").in("id", posts.map((p) => p.id));
	const keep = new Map((oldPosts || []).map((p) => [p.id, p]));
	count("posts", await upsertAll("posts", posts.map((p) => ({
		...p,
		...keep.get(p.id) ? {
			author_id: keep.get(p.id).author_id,
			cover_key: keep.get(p.id).cover_key,
			content_json: keep.get(p.id).content_json
		} : {}
	}))));
	count("flag_solvers", await upsertAll("flag_solvers", mapSolvers(solvers_default)));
}
async function runStep(s, force) {
	const log = [];
	const total = totalMediaSteps() + 1;
	if (s.step === "photos") {
		const slice = photoFiles.slice(s.offset, s.offset + BATCH);
		for (const name of slice) try {
			log.push(`${name}: ${await importPhoto(name, force)}`);
		} catch (e) {
			log.push(`${name}: FAILED ${e.message}`);
		}
		return {
			next: s.offset + BATCH < photoFiles.length ? {
				step: "photos",
				offset: s.offset + BATCH
			} : {
				step: "logos",
				offset: 0
			},
			log,
			total,
			done: Math.min(s.offset + BATCH, photoFiles.length)
		};
	}
	if (s.step === "logos") {
		const slice = logoFiles.slice(s.offset, s.offset + BATCH);
		for (const name of slice) try {
			log.push(`${name}: ${await importLogo(name, force)}`);
		} catch (e) {
			log.push(`${name}: FAILED ${e.message}`);
		}
		return {
			next: s.offset + BATCH < logoFiles.length ? {
				step: "logos",
				offset: s.offset + BATCH
			} : {
				step: "data",
				offset: 0
			},
			log,
			total,
			done: photoFiles.length + Math.min(s.offset + BATCH, logoFiles.length)
		};
	}
	if (s.step === "data") {
		await importData(log);
		return {
			next: null,
			log,
			total,
			done: total
		};
	}
	return {
		next: null,
		log,
		total,
		done: total
	};
}
//#endregion
export { totalMediaSteps as n, runStep as t };
