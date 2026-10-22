import { C as mediaImg, D as __exportAll, w as mediaMap } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BKsAzIKQ.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript } from "./BaseLayout_CR5R09AB.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$AdminLayout } from "./AdminLayout_BC24AB2X.mjs";
import { a as resource, i as RESOURCES, r as toRiyadhInput } from "./io_KM2kA_x8.mjs";
//#region src/pages/admin/[resource]/[id].astro
var _id__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Id,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Id = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Id;
	const res = resource(Astro.params.resource || "");
	if (!res) return new Response(null, { status: 404 });
	if (!atLeast(Astro.locals.role, res.minRole)) return new Response("Not allowed", { status: 403 });
	const id = Astro.params.id === "new" ? null : decodeURIComponent(Astro.params.id || "");
	const sb = serviceClient();
	const row = id ? (await sb.from(res.table).select("*").eq(res.pk, id).maybeSingle()).data : null;
	if (id && !row) return new Response(null, { status: 404 });
	const media = res.fields.some((f) => f.type === "media") ? await mediaMap() : /* @__PURE__ */ new Map();
	const images = [...media.values()].filter((m) => m.kind === "image").sort((a, b) => a.key < b.key ? 1 : -1);
	const refOptions = {};
	for (const f of res.fields) if (f.type === "ref" && f.ref) {
		if (f.ref.resource === "members") refOptions[f.name] = ((await sb.from("profiles").select("id,name,handle").eq("onboarded", true).order("name")).data || []).map((p) => ({
			value: p.id,
			label: `${p.name} (@${p.handle})`
		}));
		else {
			const r = RESOURCES[f.ref.resource];
			refOptions[f.name] = ((await sb.from(r.table).select(`${r.pk},${f.ref.label}`).order("sort")).data || []).map((x) => ({
				value: x[r.pk],
				label: x[f.ref.label]
			}));
		}
	}
	const val = (n) => row ? row[n] : void 0;
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": id ? `Edit ${res.singular}` : `New ${res.singular}` }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<form class="form" method="post"${addAttribute(`/api/admin/${res.key}`, "action")} data-admin-form><input type="hidden" name="_action" value="save">${id && renderTemplate`<input type="hidden" name="id"${addAttribute(id, "value")}>`}${res.fields.map((f) => renderTemplate`<div class="field">${f.type === "bool" ? renderTemplate`<label class="check"><input type="checkbox"${addAttribute(f.name, "name")} value="1"${addAttribute(val(f.name) ?? (f.name === "visible" || f.name === "published" || f.name === "is_current"), "checked")}> ${f.label}</label>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<label${addAttribute(`f-${f.name}`, "for")}>${f.label}${f.required && " *"}</label>${f.type === "textarea" && renderTemplate`<textarea class="textarea"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")}${addAttribute(f.max, "maxlength")}${addAttribute(f.required, "required")}>${val(f.name) || ""}</textarea>`}${(f.type === "text" || f.type === "url") && renderTemplate`<input class="input"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")}${addAttribute(f.type === "url" ? "url" : "text", "type")}${addAttribute(f.max, "maxlength")}${addAttribute(f.required, "required")}${addAttribute(val(f.name) || "", "value")}${addAttribute(id && res.pk === f.name, "disabled")}>`}${f.type === "number" && renderTemplate`<input class="input"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")} type="number" inputmode="numeric"${addAttribute(val(f.name) ?? "", "value")}${addAttribute(f.required, "required")}>`}${f.type === "date" && renderTemplate`<input class="input"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")} type="date"${addAttribute(val(f.name) || "", "value")}${addAttribute(f.required, "required")}>`}${f.type === "datetime" && renderTemplate`<input class="input"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")} type="datetime-local"${addAttribute(toRiyadhInput(val(f.name) || null), "value")}${addAttribute(f.required, "required")}>`}${f.type === "select" && renderTemplate`<select class="select"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")}>${f.options.map((o) => renderTemplate`<option${addAttribute(o, "value")}${addAttribute(val(f.name) === o, "selected")}>${o}</option>`)}</select>`}${f.type === "ref" && renderTemplate`<select class="select"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")}><option value="">—</option>${refOptions[f.name].map((o) => renderTemplate`<option${addAttribute(o.value, "value")}${addAttribute(val(f.name) === o.value, "selected")}>${o.label}</option>`)}</select>`}${f.type === "media" && renderTemplate`<div class="media-pick" data-media-pick>${val(f.name) && media.get(val(f.name)) && renderTemplate`<img class="media-pick__preview"${addAttribute(mediaImg(media.get(val(f.name))).src, "src")} alt="" width="160" height="120" style="width:160px;height:120px;object-fit:cover;border:1px solid var(--line-strong)">`}<input class="input"${addAttribute(`f-${f.name}`, "id")}${addAttribute(f.name, "name")}${addAttribute(`media-${f.name}`, "list")}${addAttribute(val(f.name) || "", "value")} placeholder="photo key"${addAttribute(f.required, "required")}${addAttribute(id && res.pk === f.name, "disabled")}><datalist${addAttribute(`media-${f.name}`, "id")}>${images.map((m) => renderTemplate`<option${addAttribute(m.key, "value")}>${m.alt || m.key}</option>`)}</datalist><label class="field__label" style="margin-top:6px">Or upload a new one <input type="file" accept="image/*"${addAttribute(f.name, "data-media-upload")}></label></div>`}${f.help && renderTemplate`<small>${f.help}</small>`}` })}`}</div>`)}<div class="form__actions"><button class="btn" type="submit">Save</button><a class="btn btn--ghost"${addAttribute(`/admin/${res.key}`, "href")}>Cancel</a>${id && renderTemplate`<button class="btn btn--ghost btn--danger" type="submit" name="_action" value="delete" formnovalidate onclick="return confirm('Delete this item? You can undo it from the audit log.')">Delete</button>`}</div></form>` })}${renderScript($$result, "/home/user/website/src/pages/admin/[resource]/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/admin/[resource]/[id].astro", void 0);
var $$file = "/home/user/website/src/pages/admin/[resource]/[id].astro";
var $$url = "/admin/[resource]/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/[resource]/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
