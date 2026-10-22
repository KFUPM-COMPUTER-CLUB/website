import { n as publicUrl, r as serviceClient } from "./supabase_BKsAzIKQ.mjs";
import { t as ApiError } from "./api_BNUCaDnj.mjs";
import sharp from "sharp";
//#region src/lib/upload.ts
var IMAGE_MAX = 8388608;
var PDF_MAX = 10485760;
var WIDTHS = [
	480,
	960,
	1600
];
var sniff = (b) => {
	if (b[0] === 255 && b[1] === 216 && b[2] === 255) return "image/jpeg";
	if (b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71) return "image/png";
	if (b[0] === 71 && b[1] === 73 && b[2] === 70 && b[3] === 56) return "image/gif";
	if (b[0] === 82 && b[1] === 73 && b[2] === 70 && b[3] === 70 && b[8] === 87 && b[9] === 69 && b[10] === 66 && b[11] === 80) return "image/webp";
	if (b[0] === 37 && b[1] === 80 && b[2] === 68 && b[3] === 70 && b[4] === 45) return "application/pdf";
	return null;
};
var key = (ext) => `${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}${ext}`;
var safeName = (n) => n.replace(/[^\w.\- ]+/g, "").slice(0, 80) || "file";
async function storeImage(file, alt, uploaderId, tags = []) {
	if (file.size > IMAGE_MAX) throw new ApiError("Images must be under 8 MB.");
	const buf = new Uint8Array(await file.arrayBuffer());
	const type = sniff(buf);
	if (!type || type === "application/pdf") throw new ApiError("That file is not a JPEG, PNG, WebP or GIF image.");
	const meta = await sharp(Buffer.from(buf), { animated: false }).rotate().metadata();
	const width = meta.width || 0, height = meta.height || 0;
	if (!width || !height) throw new ApiError("Could not read the image.");
	const k = key(".webp");
	const base = `uploads/${k.replace(".webp", "")}`;
	const sb = serviceClient();
	const sizes = {};
	for (const w of WIDTHS) {
		if (w > width && w !== WIDTHS[0]) continue;
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
		if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
		sizes[String(w)] = publicUrl(`media/${path}`);
	}
	const original = await sharp(Buffer.from(buf)).rotate().resize({
		width: 2400,
		withoutEnlargement: true
	}).webp({ quality: 85 }).toBuffer();
	const origPath = `${base}/original.webp`;
	await sb.storage.from("media").upload(origPath, original, {
		contentType: "image/webp",
		upsert: true,
		cacheControl: "31536000"
	});
	const row = {
		key: k,
		kind: "image",
		alt,
		width,
		height,
		bytes: file.size,
		sizes,
		path: `media/${origPath}`,
		tags,
		uploaded_by: uploaderId
	};
	const { error } = await sb.from("media").insert(row);
	if (error) throw new ApiError(`Could not record the upload: ${error.message}`, 500);
	return {
		key: k,
		url: sizes["960"] || sizes["480"] || publicUrl(`media/${origPath}`),
		width,
		height,
		alt,
		sizes
	};
}
async function storePdf(file, uploaderId) {
	if (file.size > PDF_MAX) throw new ApiError("PDFs must be under 10 MB.");
	const buf = new Uint8Array(await file.arrayBuffer());
	if (sniff(buf) !== "application/pdf") throw new ApiError("That file is not a PDF.");
	const k = key(".pdf");
	const path = `pdf/${k}`;
	const sb = serviceClient();
	const { error } = await sb.storage.from("files").upload(path, buf, {
		contentType: "application/pdf",
		upsert: true,
		cacheControl: "31536000"
	});
	if (error) throw new ApiError(`Upload failed: ${error.message}`, 502);
	const url = publicUrl(`files/${path}`);
	const name = safeName(file.name);
	await sb.from("media").insert({
		key: k,
		kind: "pdf",
		alt: name,
		bytes: file.size,
		sizes: { file: url },
		path: `files/${path}`,
		tags: ["pdf"],
		uploaded_by: uploaderId
	});
	return {
		key: k,
		url,
		name,
		bytes: file.size
	};
}
//#endregion
export { storePdf as n, storeImage as t };
