import { _ as slugify, c as isUrl, o as int, r as bool, t as ApiError, v as str } from "./api_CGwffj9f.mjs";
var RESOURCES = {
	events: {
		key: "events",
		table: "events",
		title: "Events",
		singular: "event",
		minRole: "officer",
		pk: "id",
		orderBy: "starts_at.desc",
		publicPage: "/timeline",
		columns: [
			"title",
			"type",
			"starts_at",
			"location",
			"registration_open",
			"published"
		],
		fields: [
			{
				name: "title",
				label: "Title",
				type: "text",
				required: true,
				max: 140
			},
			{
				name: "slug",
				label: "Slug (URL id)",
				type: "text",
				help: "Lowercase letters, digits and dashes. Leave empty to make one from the title.",
				max: 80
			},
			{
				name: "type",
				label: "Type",
				type: "select",
				options: [
					"Workshop",
					"Talk",
					"Hackathon",
					"Competition",
					"Social",
					"Trip",
					"Exhibition",
					"Other"
				],
				required: true
			},
			{
				name: "starts_at",
				label: "Starts (Riyadh time)",
				type: "datetime",
				required: true
			},
			{
				name: "ends_at",
				label: "Ends (Riyadh time)",
				type: "datetime",
				help: "Optional. Multi-day events end on the last day."
			},
			{
				name: "all_day",
				label: "All day (no specific time)",
				type: "bool"
			},
			{
				name: "location",
				label: "Location",
				type: "text",
				max: 120
			},
			{
				name: "summary",
				label: "Summary",
				type: "textarea",
				max: 240
			},
			{
				name: "cover_key",
				label: "Cover photo",
				type: "media"
			},
			{
				name: "x_url",
				label: "X post URL (the details link)",
				type: "url"
			},
			{
				name: "register_url",
				label: "External registration URL (optional)",
				type: "url"
			},
			{
				name: "capacity",
				label: "Capacity (optional)",
				type: "number"
			},
			{
				name: "registration_open",
				label: "Members can reserve a spot",
				type: "bool"
			},
			{
				name: "featured",
				label: "Featured",
				type: "bool"
			},
			{
				name: "published",
				label: "Published",
				type: "bool"
			}
		]
	},
	highlights: {
		key: "highlights",
		table: "highlights",
		title: "Polaroids",
		singular: "polaroid",
		minRole: "officer",
		pk: "id",
		orderBy: "sort.asc",
		sortable: true,
		visible: true,
		publicPage: "/",
		help: "The seven tilted photos at the seam of the home page. Order matters.",
		columns: [
			"title",
			"date",
			"photo_key",
			"visible"
		],
		fields: [
			{
				name: "photo_key",
				label: "Photo",
				type: "media",
				required: true
			},
			{
				name: "title",
				label: "Title",
				type: "text",
				required: true,
				max: 60
			},
			{
				name: "date",
				label: "Date",
				type: "date",
				required: true
			},
			{
				name: "line",
				label: "One line",
				type: "text",
				max: 140
			},
			{
				name: "post_url",
				label: "Post link",
				type: "url"
			},
			{
				name: "visible",
				label: "Visible",
				type: "bool"
			}
		]
	},
	stories: {
		key: "stories",
		table: "stories",
		title: "Moments",
		singular: "moment",
		minRole: "officer",
		pk: "id",
		orderBy: "sort.asc",
		sortable: true,
		visible: true,
		publicPage: "/",
		help: "The slides under CC | KFUPM on the home page.",
		columns: [
			"title",
			"date",
			"photo_key",
			"visible"
		],
		fields: [
			{
				name: "photo_key",
				label: "Photo",
				type: "media",
				required: true
			},
			{
				name: "title",
				label: "Title",
				type: "text",
				required: true,
				max: 60
			},
			{
				name: "date",
				label: "Date",
				type: "date",
				required: true
			},
			{
				name: "text",
				label: "Text",
				type: "textarea",
				max: 240
			},
			{
				name: "post_url",
				label: "Post link",
				type: "url"
			},
			{
				name: "visible",
				label: "Visible",
				type: "bool"
			}
		]
	},
	strip: {
		key: "strip",
		table: "strip_photos",
		title: "Photo strip",
		singular: "photo",
		minRole: "officer",
		pk: "photo_key",
		orderBy: "sort.asc",
		sortable: true,
		visible: true,
		publicPage: "/",
		help: "The pool the \"In pictures\" strip picks 20 random photos from on every visit.",
		columns: [
			"photo_key",
			"label",
			"visible"
		],
		fields: [
			{
				name: "photo_key",
				label: "Photo",
				type: "media",
				required: true
			},
			{
				name: "label",
				label: "Caption",
				type: "text",
				max: 80
			},
			{
				name: "post_url",
				label: "Post link",
				type: "url"
			},
			{
				name: "visible",
				label: "Visible",
				type: "bool"
			}
		]
	},
	impact: {
		key: "impact",
		table: "impact_semesters",
		title: "Impact semesters",
		singular: "semester",
		minRole: "officer",
		pk: "id",
		orderBy: "sort.asc",
		sortable: true,
		publicPage: "/#impact",
		help: "One row per semester in the impact reel. Add the prizes under Impact items.",
		columns: [
			"term",
			"total_sar",
			"total_is_minimum",
			"photo_key"
		],
		fields: [
			{
				name: "term",
				label: "Term (e.g. Spring 2026)",
				type: "text",
				required: true,
				max: 40
			},
			{
				name: "total_sar",
				label: "Total SAR announced",
				type: "number"
			},
			{
				name: "total_is_minimum",
				label: "Total is a minimum (show +)",
				type: "bool"
			},
			{
				name: "photo_key",
				label: "Backdrop photo",
				type: "media"
			}
		]
	},
	"impact-items": {
		key: "impact-items",
		table: "impact_items",
		title: "Impact items",
		singular: "prize",
		minRole: "officer",
		pk: "id",
		orderBy: "sort.asc",
		sortable: true,
		columns: [
			"name",
			"prize_sar",
			"semester_id"
		],
		fields: [
			{
				name: "semester_id",
				label: "Semester",
				type: "ref",
				ref: {
					resource: "impact",
					label: "term"
				},
				required: true
			},
			{
				name: "name",
				label: "Event",
				type: "text",
				required: true,
				max: 80
			},
			{
				name: "prize_sar",
				label: "Prize SAR",
				type: "number"
			},
			{
				name: "detail",
				label: "Detail",
				type: "text",
				max: 120
			},
			{
				name: "source_url",
				label: "Source post",
				type: "url"
			}
		]
	},
	partners: {
		key: "partners",
		table: "partners",
		title: "Partners",
		singular: "partner",
		minRole: "officer",
		pk: "id",
		orderBy: "sort.asc",
		sortable: true,
		visible: true,
		publicPage: "/#partners",
		columns: [
			"name",
			"kind",
			"logo_key",
			"visible"
		],
		fields: [
			{
				name: "name",
				label: "Name",
				type: "text",
				required: true,
				max: 80
			},
			{
				name: "kind",
				label: "Kind",
				type: "select",
				options: [
					"company",
					"kfupm_unit",
					"student_club",
					"visited"
				],
				required: true
			},
			{
				name: "what",
				label: "What we did together",
				type: "text",
				max: 160
			},
			{
				name: "logo_key",
				label: "Logo",
				type: "media"
			},
			{
				name: "source_url",
				label: "Source post (the click goes here)",
				type: "url"
			},
			{
				name: "url",
				label: "Website",
				type: "url"
			},
			{
				name: "handle",
				label: "X handle",
				type: "text",
				max: 40
			},
			{
				name: "mark",
				label: "Round mark with the name next to it",
				type: "bool"
			},
			{
				name: "square",
				label: "Square mark",
				type: "bool"
			},
			{
				name: "tall",
				label: "Tall logo",
				type: "bool"
			},
			{
				name: "visible",
				label: "Visible",
				type: "bool"
			}
		]
	},
	faq: {
		key: "faq",
		table: "faq",
		title: "FAQ",
		singular: "question",
		minRole: "officer",
		pk: "id",
		orderBy: "sort.asc",
		sortable: true,
		visible: true,
		publicPage: "/faq",
		columns: [
			"q_en",
			"q_ar",
			"visible"
		],
		fields: [
			{
				name: "q_en",
				label: "Question (English)",
				type: "text",
				required: true,
				max: 160
			},
			{
				name: "a_en",
				label: "Answer (English)",
				type: "textarea",
				required: true,
				max: 600
			},
			{
				name: "q_ar",
				label: "السؤال (Arabic)",
				type: "text",
				max: 160
			},
			{
				name: "a_ar",
				label: "الجواب (Arabic)",
				type: "textarea",
				max: 600
			},
			{
				name: "visible",
				label: "Visible",
				type: "bool"
			}
		]
	},
	board: {
		key: "board",
		table: "officer_terms",
		title: "Community board",
		singular: "officer",
		minRole: "admin",
		pk: "id",
		orderBy: "sort.asc",
		sortable: true,
		publicPage: "/community",
		help: "Current officers show as cards; untick \"current\" to move someone to the alumni archive.",
		columns: [
			"name",
			"title",
			"committee",
			"term",
			"is_current"
		],
		fields: [
			{
				name: "name",
				label: "Name",
				type: "text",
				required: true,
				max: 80
			},
			{
				name: "user_id",
				label: "Member account",
				type: "ref",
				ref: {
					resource: "members",
					label: "name"
				},
				help: "Optional. Links the card to the member profile."
			},
			{
				name: "title",
				label: "Title",
				type: "text",
				required: true,
				max: 60
			},
			{
				name: "committee",
				label: "Committee",
				type: "text",
				max: 60
			},
			{
				name: "term",
				label: "Term (e.g. 2026–27)",
				type: "text",
				required: true,
				max: 20
			},
			{
				name: "major",
				label: "Major",
				type: "text",
				max: 80
			},
			{
				name: "photo_key",
				label: "Photo",
				type: "media"
			},
			{
				name: "linkedin",
				label: "LinkedIn",
				type: "url"
			},
			{
				name: "is_current",
				label: "Current board",
				type: "bool"
			}
		]
	},
	solvers: {
		key: "solvers",
		table: "flag_solvers",
		title: "Flag solvers",
		singular: "solver",
		minRole: "admin",
		pk: "id",
		orderBy: "created_at.desc",
		publicPage: "/flag",
		help: "People who solved the site challenge. Approve to show them on the flag page.",
		columns: [
			"name",
			"handle",
			"approved",
			"created_at"
		],
		fields: [
			{
				name: "name",
				label: "Name",
				type: "text",
				required: true,
				max: 40
			},
			{
				name: "handle",
				label: "Handle",
				type: "text",
				max: 40
			},
			{
				name: "approved",
				label: "Approved (shown publicly)",
				type: "bool"
			}
		]
	}
};
var resource = (key) => RESOURCES[key] || null;
//#endregion
//#region src/lib/admin/io.ts
var toRiyadhInput = (iso) => {
	if (!iso) return "";
	const d = new Date(iso);
	const p = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Riyadh",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	}).formatToParts(d);
	const g = (t) => p.find((x) => x.type === t)?.value;
	return `${g("year")}-${g("month")}-${g("day")}T${g("hour") === "24" ? "00" : g("hour")}:${g("minute")}`;
};
var fromRiyadhInput = (v) => {
	const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(v);
	if (!m) return null;
	return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0) - 3, +(m[5] || 0))).toISOString();
};
function parseFields(res, body, existing) {
	const row = {};
	for (const f of res.fields) {
		if (existing && f.name === res.pk) continue;
		const raw = body[f.name];
		let v;
		switch (f.type) {
			case "bool":
				v = bool(raw);
				break;
			case "number":
				v = raw === "" || raw == null ? null : int(raw);
				break;
			case "date":
				v = /^\d{4}-\d{2}-\d{2}$/.test(String(raw || "")) ? raw : null;
				break;
			case "datetime":
				v = raw ? fromRiyadhInput(String(raw)) : null;
				if (raw && !v) throw new ApiError(`${f.label}: invalid date.`);
				break;
			case "tags":
				v = String(raw || "").split(",").map((t) => str(t, 30)).filter(Boolean);
				break;
			case "url":
				v = str(raw, 500) || null;
				if (v && !isUrl(v)) throw new ApiError(`${f.label} must be a full URL (https://…).`);
				break;
			case "select":
				v = f.options?.includes(String(raw)) ? String(raw) : f.required ? f.options?.[0] : null;
				break;
			default: v = str(raw, f.max || 2e3) || (f.type === "text" || f.type === "textarea" ? "" : null);
		}
		if (f.required && (v === null || v === "" || v === void 0)) throw new ApiError(`${f.label} is required.`);
		row[f.name] = v;
	}
	if (res.key === "events") row.slug = slugify(row.slug || row.title);
	return row;
}
var display = (f, v) => {
	if (v === null || v === void 0 || v === "") return "";
	if (f?.type === "bool" || typeof v === "boolean") return v ? "yes" : "no";
	if (f?.type === "datetime") return toRiyadhInput(String(v)).replace("T", " ");
	if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return toRiyadhInput(v).slice(0, 10);
	return String(v);
};
//#endregion
export { resource as a, RESOURCES as i, parseFields as n, toRiyadhInput as r, display as t };
