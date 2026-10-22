import { G as RenderUndefinedEntryError, Z as UnknownContentCollectionError, tt as AstroError } from "./errors-data_C-B7EqF8.mjs";
import { C as renderScriptElement, D as renderComponent, N as renderTemplate, U as unescapeHTML, V as createHeadAndContent, dt as isRemotePath, jt as generateCspDigest, m as createConsoleLogger, mt as removeBase, pt as prependForwardSlash, w as renderUniqueStylesheet, x as spreadAttributes } from "./sequence_CcNeFUgX.mjs";
import { n as publicUrl, s as dbReady, t as publicClient } from "./supabase_CcU7CO77.mjs";
import { f as VALID_INPUT_FORMATS, g as createComponent, m as level, o as createImageAsset, p as recordContentEntryRender, t as getImage } from "./_astro_assets_BiTtY4hV.mjs";
import * as z from "zod/v4";
import * as devalue from "devalue";
import { escape } from "html-escaper";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/astro/dist/assets/runtime.js
function createSvgComponent({ meta, attributes, children, styles }) {
	const hasStyles = styles.length > 0;
	const Component = createComponent({
		async factory(result, props) {
			const normalizedProps = normalizeProps(attributes, props);
			if (hasStyles && result.cspDestination) for (const style of styles) {
				const hash = await generateCspDigest(style, result.cspAlgorithm);
				result._metadata.extraStyleHashes.push(hash);
			}
			return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${unescapeHTML(children)}</svg>`;
		},
		propagation: hasStyles ? "self" : "none"
	});
	Object.defineProperty(Component, "toJSON", {
		value: () => meta,
		enumerable: false
	});
	return Object.assign(Component, meta);
}
/**
* Some attributes required for `image/svg+xml` are irrelevant when inlined in a `text/html` document. We can save a few bytes by dropping them.
*/
var ATTRS_TO_DROP = [
	"xmlns",
	"xmlns:xlink",
	"version"
];
var DEFAULT_ATTRS = {};
function dropAttributes(attributes) {
	for (const attr of ATTRS_TO_DROP) delete attributes[attr];
	return attributes;
}
function normalizeProps(attributes, props) {
	return dropAttributes({
		...DEFAULT_ATTRS,
		...attributes,
		...props
	});
}
//#endregion
//#region node_modules/astro/dist/content/consts.js
var CONTENT_IMAGE_FLAG = "astroContentImageFlag";
var IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";
//#endregion
//#region node_modules/astro/dist/assets/utils/resolveImports.js
/**
* Resolves an image src from a content file (such as markdown) to a module ID or import that can be resolved by Vite.
*
* @param imageSrc The src attribute of an image tag
* @param filePath The path to the file that contains the image relative to the site root
* @returns A module id of the image that can be resolved by Vite, or undefined if it is not a local image
*/
function imageSrcToImportId(imageSrc, filePath) {
	imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);
	if (isRemotePath(imageSrc)) return;
	const ext = imageSrc.split(".").at(-1)?.toLowerCase();
	if (!ext || !VALID_INPUT_FORMATS.includes(ext)) return;
	const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
	if (filePath) params.set("importer", filePath);
	return `${imageSrc}?${params.toString()}`;
}
//#endregion
//#region node_modules/astro/dist/content/data-store-source.js
/**
* A {@link DataStoreSource} backed by an in-memory {@link ImmutableDataStore}.
* All queries resolve synchronously; the async signatures exist to satisfy the
* {@link DataStoreSource} contract.
*/
var InMemorySource = class {
	#store;
	constructor(store) {
		this.#store = store;
	}
	hasCollection(collection) {
		return this.#store.hasCollection(collection);
	}
	get(collection, key) {
		return this.#store.get(collection, key);
	}
	entries(collection) {
		return this.#store.entries(collection);
	}
	values(collection) {
		return this.#store.values(collection);
	}
	keys(collection) {
		return this.#store.keys(collection);
	}
	has(collection, key) {
		return this.#store.has(collection, key);
	}
	collections() {
		return this.#store.collections();
	}
};
//#endregion
//#region node_modules/astro/dist/content/data-store.js
/**
* Rebuilds a collection from ordered parts containing newline-delimited
* `devalue.stringify([id, entry])` records.
*/
var ChunkedCollectionParser = class {
	#entries = /* @__PURE__ */ new Map();
	#remainder = "";
	add(part) {
		const records = (this.#remainder + part).split("\n");
		this.#remainder = records.pop();
		for (const record of records) {
			const parsed = devalue.parse(record);
			if (!Array.isArray(parsed) || parsed.length !== 2 || typeof parsed[0] !== "string") throw new Error("Invalid chunked data store entry");
			this.#entries.set(parsed[0], parsed[1]);
		}
	}
	finish() {
		if (this.#remainder) throw new Error("Invalid chunked data store entry");
		return this.#entries;
	}
};
/**
* A read-only data store for content collections. This is used to retrieve data from the content layer at runtime.
* To add or modify data, use {@link MutableDataStore} instead.
*/
var ImmutableDataStore = class ImmutableDataStore {
	_collections = /* @__PURE__ */ new Map();
	constructor() {
		this._collections = /* @__PURE__ */ new Map();
	}
	get(collectionName, key) {
		return this._collections.get(collectionName)?.get(String(key));
	}
	entries(collectionName) {
		return [...(this._collections.get(collectionName) ?? /* @__PURE__ */ new Map()).entries()];
	}
	values(collectionName) {
		return [...(this._collections.get(collectionName) ?? /* @__PURE__ */ new Map()).values()];
	}
	keys(collectionName) {
		return [...(this._collections.get(collectionName) ?? /* @__PURE__ */ new Map()).keys()];
	}
	has(collectionName, key) {
		const collection = this._collections.get(collectionName);
		if (collection) return collection.has(String(key));
		return false;
	}
	hasCollection(collectionName) {
		return this._collections.has(collectionName);
	}
	collections() {
		return this._collections;
	}
	/**
	* Rebuilds a collections map from a chunked-store manifest whose part file
	* names have already been swapped for their contents.
	*
	* Each collection maps to a list of parts. A part is either a raw string
	* (when the store is loaded from disk) or an ESM namespace from a virtual
	* chunk import (`{ default: string }`, when emitted at runtime). Each part
	* contains independently serialized entry records. This is the inverse of
	* {@link import('./data-store-writer.js').ChunkedWriter} and stays free of
	* Node built-ins so it can run at runtime.
	*/
	static manifestToMap(manifest) {
		const collections = /* @__PURE__ */ new Map();
		for (const [collectionName, parts] of Object.entries(manifest)) {
			const parser = new ChunkedCollectionParser();
			for (const part of parts) parser.add(typeof part === "string" ? part : part.default);
			collections.set(collectionName, parser.finish());
		}
		return collections;
	}
	/**
	* Attempts to load a DataStore from the virtual module.
	* This only works in Vite.
	*/
	static async fromModule() {
		try {
			const data = await import("./_astro_data-layer-content_I5MTr6fo.mjs");
			if (data.default instanceof Map) return ImmutableDataStore.fromMap(data.default);
			if (Array.isArray(data.default)) {
				const map = devalue.unflatten(data.default);
				return ImmutableDataStore.fromMap(map);
			}
			const map = ImmutableDataStore.manifestToMap(data.default);
			return ImmutableDataStore.fromMap(map);
		} catch {}
		return new ImmutableDataStore();
	}
	static async fromMap(data) {
		const store = new ImmutableDataStore();
		store._collections = data;
		return store;
	}
};
function dataStoreSingleton() {
	let instance = void 0;
	return {
		get: async () => {
			if (!instance) instance = ImmutableDataStore.fromModule().then((store) => new InMemorySource(store));
			return instance;
		},
		set: (store) => {
			instance = new InMemorySource(store);
		}
	};
}
/** @internal */
var globalDataStore = dataStoreSingleton();
//#endregion
//#region node_modules/astro/dist/content/loaders/errors.js
function formatZodError(error) {
	return error.issues.map((issue) => `  **${issue.path.join(".")}**: ${issue.message}`);
}
var LiveCollectionError = class LiveCollectionError extends Error {
	collection;
	message;
	cause;
	constructor(collection, message, cause) {
		super(message);
		this.collection = collection;
		this.message = message;
		this.cause = cause;
		this.name = "LiveCollectionError";
		if (cause?.stack) this.stack = cause.stack;
	}
	static is(error) {
		return error instanceof LiveCollectionError;
	}
};
var LiveEntryNotFoundError = class extends LiveCollectionError {
	constructor(collection, entryFilter) {
		super(collection, `Entry ${collection} → ${typeof entryFilter === "string" ? entryFilter : JSON.stringify(entryFilter)} was not found.`);
		this.name = "LiveEntryNotFoundError";
	}
	static is(error) {
		return error?.name === "LiveEntryNotFoundError";
	}
};
var LiveCollectionValidationError = class extends LiveCollectionError {
	constructor(collection, entryId, error) {
		super(collection, [
			`**${collection} → ${entryId}** data does not match the collection schema.\n`,
			...formatZodError(error),
			""
		].join("\n"));
		this.name = "LiveCollectionValidationError";
	}
	static is(error) {
		return error?.name === "LiveCollectionValidationError";
	}
};
var LiveCollectionCacheHintError = class extends LiveCollectionError {
	constructor(collection, entryId, error) {
		super(collection, [
			`**${String(collection)}${entryId ? ` → ${String(entryId)}` : ""}** returned an invalid cache hint.\n`,
			...formatZodError(error),
			""
		].join("\n"));
		this.name = "LiveCollectionCacheHintError";
	}
	static is(error) {
		return error?.name === "LiveCollectionCacheHintError";
	}
};
//#endregion
//#region node_modules/astro/dist/content/runtime.js
var cacheHintSchema = z.object({
	tags: z.array(z.string()).optional(),
	lastModified: z.date().optional()
});
async function parseLiveEntry(entry, schema, collection) {
	try {
		const parsed = await z.safeParseAsync(schema, entry.data);
		if (!parsed.success) return { error: new LiveCollectionValidationError(collection, entry.id, parsed.error) };
		if (entry.cacheHint) {
			const cacheHint = cacheHintSchema.safeParse(entry.cacheHint);
			if (!cacheHint.success) return { error: new LiveCollectionCacheHintError(collection, entry.id, cacheHint.error) };
			entry.cacheHint = cacheHint.data;
		}
		return { entry: {
			...entry,
			data: parsed.data
		} };
	} catch (error) {
		return { error: new LiveCollectionError(collection, `Unexpected error parsing entry ${entry.id} in collection ${collection}`, error) };
	}
}
function createGetCollection({ liveCollections, logger }) {
	return async function getCollection(collection, filter) {
		if (collection in liveCollections) throw new AstroError({
			...UnknownContentCollectionError,
			message: `Collection "${collection}" is a live collection. Use getLiveCollection() instead of getCollection().`
		});
		const hasFilter = typeof filter === "function";
		const store = await globalDataStore.get();
		if (await store.hasCollection(collection)) {
			const { default: imageAssetMap } = await import("./content-assets_BNW1matP.mjs");
			const result = [];
			for (const rawEntry of await store.values(collection)) {
				const data = resolveEntryData(rawEntry, imageAssetMap);
				let entry = {
					...rawEntry,
					data,
					collection
				};
				if (hasFilter && !filter(entry)) continue;
				result.push(entry);
			}
			return result;
		} else {
			logger.warn("content", `The collection ${JSON.stringify(collection)} does not exist or is empty. Please check your content config file for errors.`);
			return [];
		}
	};
}
function createGetEntry({ liveCollections, logger }) {
	return async function getEntry(collectionOrLookupObject, lookup) {
		let collection, lookupId;
		if (typeof collectionOrLookupObject === "string") {
			collection = collectionOrLookupObject;
			if (!lookup) throw new AstroError({
				...UnknownContentCollectionError,
				message: "`getEntry()` requires an entry identifier as the second argument."
			});
			lookupId = lookup;
		} else {
			collection = collectionOrLookupObject.collection;
			lookupId = "id" in collectionOrLookupObject ? collectionOrLookupObject.id : collectionOrLookupObject.slug;
		}
		if (collection in liveCollections) throw new AstroError({
			...UnknownContentCollectionError,
			message: `Collection "${collection}" is a live collection. Use getLiveEntry() instead of getEntry().`
		});
		if (typeof lookupId === "object") throw new AstroError({
			...UnknownContentCollectionError,
			message: `The entry identifier must be a string. Received object.`
		});
		const store = await globalDataStore.get();
		if (await store.hasCollection(collection)) {
			const entry = await store.get(collection, lookupId);
			if (!entry) {
				logger.warn("content", `Entry ${collection} → ${lookupId} was not found.`);
				return;
			}
			const { default: imageAssetMap } = await import("./content-assets_BNW1matP.mjs");
			const data = resolveEntryData(entry, imageAssetMap);
			const result = {
				...entry,
				data,
				collection
			};
			warnForPropertyAccess(logger, result.data, "slug", `[content] Attempted to access deprecated property on "${collection}" entry.\nThe "slug" property is no longer automatically added to entries. Please use the "id" property instead.`);
			warnForPropertyAccess(logger, result, "render", `[content] Invalid attempt to access "render()" method on "${collection}" entry.\nTo render an entry, use "render(entry)" from "astro:content".`);
			return result;
		}
	};
}
function warnForPropertyAccess(logger, entry, prop, message) {
	if (!(prop in entry)) {
		let _value = void 0;
		Object.defineProperty(entry, prop, {
			get() {
				if (_value === void 0) logger.error("content", message);
				return _value;
			},
			set(v) {
				_value = v;
			},
			enumerable: false
		});
	}
}
function createGetLiveCollection({ liveCollections }) {
	return async function getLiveCollection(collection, filter) {
		if (!(collection in liveCollections)) return { error: new LiveCollectionError(collection, `Collection "${collection}" is not a live collection. Use getCollection() instead of getLiveCollection() to load regular content collections.`) };
		try {
			const context = {
				filter,
				collection
			};
			const response = await liveCollections[collection].loader?.loadCollection?.(context);
			if (response && "error" in response) return { error: response.error };
			const { schema } = liveCollections[collection];
			let processedEntries = response.entries;
			if (schema) {
				const entryResults = await Promise.all(response.entries.map((entry) => parseLiveEntry(entry, schema, collection)));
				for (const result of entryResults) if (result.error) return { error: result.error };
				processedEntries = entryResults.map((result) => result.entry);
			}
			let cacheHint = response.cacheHint;
			if (cacheHint) {
				const cacheHintResult = cacheHintSchema.safeParse(cacheHint);
				if (!cacheHintResult.success) return { error: new LiveCollectionCacheHintError(collection, void 0, cacheHintResult.error) };
				cacheHint = cacheHintResult.data;
			}
			if (processedEntries.length > 0) {
				const entryTags = /* @__PURE__ */ new Set();
				let latestModified;
				for (const entry of processedEntries) if (entry.cacheHint) {
					if (entry.cacheHint.tags) entry.cacheHint.tags.forEach((tag) => entryTags.add(tag));
					if (entry.cacheHint.lastModified instanceof Date) {
						if (latestModified === void 0 || entry.cacheHint.lastModified > latestModified) latestModified = entry.cacheHint.lastModified;
					}
				}
				if (entryTags.size > 0 || latestModified || cacheHint) {
					const mergedCacheHint = {};
					if (cacheHint?.tags || entryTags.size > 0) mergedCacheHint.tags = [.../* @__PURE__ */ new Set([...cacheHint?.tags || [], ...entryTags])];
					if (cacheHint?.lastModified && latestModified) mergedCacheHint.lastModified = cacheHint.lastModified > latestModified ? cacheHint.lastModified : latestModified;
					else if (cacheHint?.lastModified || latestModified) mergedCacheHint.lastModified = cacheHint?.lastModified ?? latestModified;
					cacheHint = mergedCacheHint;
				}
			}
			return {
				entries: processedEntries,
				cacheHint
			};
		} catch (error) {
			return { error: new LiveCollectionError(collection, `Unexpected error loading collection ${collection}${error instanceof Error ? `: ${error.message}` : ""}`, error) };
		}
	};
}
function createGetLiveEntry({ liveCollections }) {
	return async function getLiveEntry(collection, lookup) {
		if (!(collection in liveCollections)) return { error: new LiveCollectionError(collection, `Collection "${collection}" is not a live collection. Use getCollection() instead of getLiveEntry() to load regular content collections.`) };
		try {
			const lookupObject = {
				filter: typeof lookup === "string" ? { id: lookup } : lookup,
				collection
			};
			let entry = await liveCollections[collection].loader?.loadEntry?.(lookupObject);
			if (entry && "error" in entry) return { error: entry.error };
			if (!entry) return { error: new LiveEntryNotFoundError(collection, lookup) };
			const { schema } = liveCollections[collection];
			if (schema) {
				const result = await parseLiveEntry(entry, schema, collection);
				if (result.error) return { error: result.error };
				entry = result.entry;
			}
			return {
				entry,
				cacheHint: entry.cacheHint
			};
		} catch (error) {
			return { error: new LiveCollectionError(collection, `Unexpected error loading entry ${collection} → ${typeof lookup === "string" ? lookup : JSON.stringify(lookup)}`, error) };
		}
	};
}
var CONTENT_LAYER_IMAGE_REGEX = /__ASTRO_IMAGE_="([^"]+)"/g;
async function updateImageReferencesInBody(html, fileName) {
	const { default: imageAssetMap } = await import("./content-assets_BNW1matP.mjs");
	const imageObjects = /* @__PURE__ */ new Map();
	const { getImage } = await import("./_virtual_astro_get-image_BIUpRSU0.mjs");
	for (const [_full, imagePath] of html.matchAll(CONTENT_LAYER_IMAGE_REGEX)) try {
		const decodedImagePath = JSON.parse(imagePath.replace(/&(?:#x22|quot);/g, "\"").replace(/&(?:#x27|apos);/g, "'").replace(/&(?:amp|#x26|#38);/g, "&"));
		let image;
		if (URL.canParse(decodedImagePath.src)) image = await getImage(decodedImagePath);
		else {
			const id = imageSrcToImportId(decodedImagePath.src, fileName);
			const imported = imageAssetMap.get(id);
			if (!id || imageObjects.has(id) || !imported) continue;
			image = await getImage({
				...decodedImagePath,
				src: imported
			});
		}
		imageObjects.set(imagePath, image);
	} catch {
		throw new Error(`Failed to parse image reference: ${imagePath}`);
	}
	return html.replaceAll(CONTENT_LAYER_IMAGE_REGEX, (full, imagePath) => {
		const image = imageObjects.get(imagePath);
		if (!image) return full;
		const { index, ...attributes } = image.attributes;
		return Object.entries({
			...attributes,
			src: image.src,
			...image.srcSet.values.length > 0 ? { srcset: image.srcSet.attribute } : {}
		}).filter(([, value]) => value != null).map(([key, value]) => value === "" ? `${key}=""` : `${key}="${escape(String(value))}"`).join(" ");
	});
}
/**
* Resolves the image src at `path` within `data` to its `ImageMetadata` (or a
* renderable SVG component). Returns the resolved value, or `undefined` when the
* image is not in the asset map and the plain src already stored in `data` should
* be kept.
*/
function resolveImageAtPath(src, fileName, imageAssetMap) {
	const id = imageSrcToImportId(src, fileName);
	if (!id) return;
	const imported = imageAssetMap?.get(id);
	if (!imported) return;
	if (imported.__svgData) {
		const { __svgData: svgData, ...meta } = imported;
		return createSvgComponent({
			meta,
			...svgData
		});
	}
	return imported;
}
/**
* Writes `value` at `path` within `target`, copying only the containers along
* that path so the shared store entry is never mutated. Sibling values and every
* container off the path are shared by reference, so values that `structuredClone`
* cannot handle (e.g. `Temporal` objects or class instances from Zod transforms)
* are never touched.
*/
function setAtPathCopying(target, path, value) {
	if (path.length === 0) return target;
	const [key, ...rest] = path;
	const copy = Array.isArray(target) ? target.slice() : { ...target };
	copy[key] = rest.length === 0 ? value : setAtPathCopying(copy[key], rest, value);
	return copy;
}
function updateImageReferencesInData(data, fileName, imageAssetMap, imageImports) {
	if (!imageImports?.length) return data;
	let result = data;
	for (const path of imageImports) {
		let src = result;
		for (const key of path) src = src?.[key];
		if (typeof src !== "string") continue;
		const resolved = resolveImageAtPath(src, fileName, imageAssetMap);
		if (resolved !== void 0) result = setAtPathCopying(result, path, resolved);
	}
	return result;
}
function resolveEntryData(entry, imageAssetMap) {
	return updateImageReferencesInData(entry.data, entry.filePath, imageAssetMap, entry.imageImports);
}
function createRenderEntry({ logger }) {
	return async function renderEntry(entry) {
		if (!entry) throw new AstroError(RenderUndefinedEntryError);
		recordContentEntryRender(entry.filePath);
		if (entry.deferredRender) try {
			const { default: contentModules } = await import("./content-modules_I7QRxwaA.mjs");
			const renderEntryImport = contentModules.get(entry.filePath);
			return render$1({
				collection: "",
				id: entry.id,
				renderEntryImport
			});
		} catch (e) {
			logger.error("content", `${e}`);
		}
		const html = entry?.rendered?.metadata?.imagePaths?.length && entry.filePath ? await updateImageReferencesInBody(entry.rendered.html, entry.filePath) : entry?.rendered?.html;
		return {
			Content: createComponent(() => renderTemplate`${unescapeHTML(html)}`),
			headings: entry?.rendered?.metadata?.headings ?? [],
			remarkPluginFrontmatter: entry?.rendered?.metadata?.frontmatter ?? {}
		};
	};
}
async function render$1({ collection, id, renderEntryImport }) {
	const UnexpectedRenderError = new AstroError({
		...UnknownContentCollectionError,
		message: `Unexpected error while rendering ${String(collection)} → ${String(id)}.`
	});
	if (typeof renderEntryImport !== "function") throw UnexpectedRenderError;
	const baseMod = await renderEntryImport();
	if (baseMod == null || typeof baseMod !== "object") throw UnexpectedRenderError;
	const { default: defaultMod } = baseMod;
	if (isPropagatedAssetsModule(defaultMod)) {
		const { collectedStyles, collectedLinks, collectedScripts, getMod } = defaultMod;
		if (typeof getMod !== "function") throw UnexpectedRenderError;
		const propagationMod = await getMod();
		if (propagationMod == null || typeof propagationMod !== "object") throw UnexpectedRenderError;
		return {
			Content: createComponent({
				factory(result, baseProps, slots) {
					let styles = "", links = "", scripts = "";
					if (Array.isArray(collectedStyles)) styles = collectedStyles.map((style) => {
						const content = typeof style === "string" ? style : style.content;
						const viteDevId = typeof style === "object" && style.id ? style.id : void 0;
						return renderUniqueStylesheet(result, {
							type: "inline",
							content,
							viteDevId
						});
					}).join("");
					if (Array.isArray(collectedLinks)) links = collectedLinks.map((link) => {
						return renderUniqueStylesheet(result, {
							type: "external",
							src: isRemotePath(link) ? link : prependForwardSlash(link)
						});
					}).join("");
					if (Array.isArray(collectedScripts)) scripts = collectedScripts.map((script) => renderScriptElement(script)).join("");
					let props = baseProps;
					if (id.endsWith("mdx")) props = {
						components: propagationMod.components ?? {},
						...baseProps
					};
					return createHeadAndContent(unescapeHTML(styles + links + scripts), renderTemplate`${renderComponent(result, "Content", propagationMod.Content, props, slots)}`);
				},
				propagation: "self"
			}),
			headings: propagationMod.getHeadings?.() ?? [],
			remarkPluginFrontmatter: propagationMod.frontmatter ?? {}
		};
	} else if (baseMod.Content && typeof baseMod.Content === "function") return {
		Content: baseMod.Content,
		headings: baseMod.getHeadings?.() ?? [],
		remarkPluginFrontmatter: baseMod.frontmatter ?? {}
	};
	else throw UnexpectedRenderError;
}
function isPropagatedAssetsModule(module) {
	return typeof module === "object" && module != null && "__astroPropagation" in module;
}
//#endregion
//#region \0astro:content
var liveCollections = {};
var logger = createConsoleLogger({ level });
var getCollection = createGetCollection({
	liveCollections,
	logger
});
createGetEntry({
	liveCollections,
	logger
});
var render = createRenderEntry({ logger });
createGetLiveCollection({ liveCollections });
createGetLiveEntry({ liveCollections });
//#endregion
//#region src/assets/photos/2021-11-18_1461424996052520960.jpg
var _2021_11_18_1461424996052520960_exports = /* @__PURE__ */ __exportAll({ default: () => _2021_11_18_1461424996052520960_default });
var _2021_11_18_1461424996052520960_default = createImageAsset({
	"src": "/_astro/2021-11-18_1461424996052520960.DpB3e055.jpg",
	"width": 1050,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2021-11-18_1461424996052520960.jpg", false);
//#endregion
//#region src/assets/photos/2022-11-14_1592111879358484480.jpg
var _2022_11_14_1592111879358484480_exports = /* @__PURE__ */ __exportAll({ default: () => _2022_11_14_1592111879358484480_default });
var _2022_11_14_1592111879358484480_default = createImageAsset({
	"src": "/_astro/2022-11-14_1592111879358484480.C6azY9vk.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2022-11-14_1592111879358484480.jpg", false);
//#endregion
//#region src/assets/photos/2022-11-15_1592548101872832515.jpg
var _2022_11_15_1592548101872832515_exports = /* @__PURE__ */ __exportAll({ default: () => _2022_11_15_1592548101872832515_default });
var _2022_11_15_1592548101872832515_default = createImageAsset({
	"src": "/_astro/2022-11-15_1592548101872832515.BQNuZivU.jpg",
	"width": 1079,
	"height": 806,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2022-11-15_1592548101872832515.jpg", false);
//#endregion
//#region src/assets/photos/2022-12-19_1604855828833570816.jpg
var _2022_12_19_1604855828833570816_exports = /* @__PURE__ */ __exportAll({ default: () => _2022_12_19_1604855828833570816_default });
var _2022_12_19_1604855828833570816_default = createImageAsset({
	"src": "/_astro/2022-12-19_1604855828833570816.BbpexbDq.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2022-12-19_1604855828833570816.jpg", false);
//#endregion
//#region src/assets/photos/2023-01-25_1618224758306529280.jpg
var _2023_01_25_1618224758306529280_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_01_25_1618224758306529280_default });
var _2023_01_25_1618224758306529280_default = createImageAsset({
	"src": "/_astro/2023-01-25_1618224758306529280.Q7wUgqDT.jpg",
	"width": 786,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-01-25_1618224758306529280.jpg", false);
//#endregion
//#region src/assets/photos/2023-01-26_1618587590055333888.jpg
var _2023_01_26_1618587590055333888_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_01_26_1618587590055333888_default });
var _2023_01_26_1618587590055333888_default = createImageAsset({
	"src": "/_astro/2023-01-26_1618587590055333888.BGrhdnWi.jpg",
	"width": 1050,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-01-26_1618587590055333888.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-01_1620676655600779265.jpg
var _2023_02_01_1620676655600779265_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_01_1620676655600779265_default });
var _2023_02_01_1620676655600779265_default = createImageAsset({
	"src": "/_astro/2023-02-01_1620676655600779265.3nSgioDD.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-01_1620676655600779265.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-09_1623696515263856645.jpg
var _2023_02_09_1623696515263856645_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_09_1623696515263856645_default });
var _2023_02_09_1623696515263856645_default = createImageAsset({
	"src": "/_astro/2023-02-09_1623696515263856645.D8-H5nKv.jpg",
	"width": 790,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-09_1623696515263856645.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-13_1625031384392781828.jpg
var _2023_02_13_1625031384392781828_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_13_1625031384392781828_default });
var _2023_02_13_1625031384392781828_default = createImageAsset({
	"src": "/_astro/2023-02-13_1625031384392781828.g6JoAeVd.jpg",
	"width": 1400,
	"height": 1051,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-13_1625031384392781828.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-17_1626580038513750022.jpg
var _2023_02_17_1626580038513750022_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_17_1626580038513750022_default });
var _2023_02_17_1626580038513750022_default = createImageAsset({
	"src": "/_astro/2023-02-17_1626580038513750022.vh0u-kII.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-17_1626580038513750022.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-18_1626977922769686532.jpg
var _2023_02_18_1626977922769686532_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_18_1626977922769686532_default });
var _2023_02_18_1626977922769686532_default = createImageAsset({
	"src": "/_astro/2023-02-18_1626977922769686532.DZBsXJAY.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-18_1626977922769686532.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-19_1627334418477027328.jpg
var _2023_02_19_1627334418477027328_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_19_1627334418477027328_default });
var _2023_02_19_1627334418477027328_default = createImageAsset({
	"src": "/_astro/2023-02-19_1627334418477027328.B_OW1KA2.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-19_1627334418477027328.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-19_1627334441352691715.jpg
var _2023_02_19_1627334441352691715_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_19_1627334441352691715_default });
var _2023_02_19_1627334441352691715_default = createImageAsset({
	"src": "/_astro/2023-02-19_1627334441352691715.CPxJPGAb.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-19_1627334441352691715.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-19_1627334457362374656.jpg
var _2023_02_19_1627334457362374656_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_19_1627334457362374656_default });
var _2023_02_19_1627334457362374656_default = createImageAsset({
	"src": "/_astro/2023-02-19_1627334457362374656.Dz5mx9Ew.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-19_1627334457362374656.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-19_1627334471740538885.jpg
var _2023_02_19_1627334471740538885_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_19_1627334471740538885_default });
var _2023_02_19_1627334471740538885_default = createImageAsset({
	"src": "/_astro/2023-02-19_1627334471740538885.D4DWvITY.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-19_1627334471740538885.jpg", false);
//#endregion
//#region src/assets/photos/2023-02-19_1627334485116166147.jpg
var _2023_02_19_1627334485116166147_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_02_19_1627334485116166147_default });
var _2023_02_19_1627334485116166147_default = createImageAsset({
	"src": "/_astro/2023-02-19_1627334485116166147.BOLeDHKd.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-02-19_1627334485116166147.jpg", false);
//#endregion
//#region src/assets/photos/2023-03-10_1634237904884215809.jpg
var _2023_03_10_1634237904884215809_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_03_10_1634237904884215809_default });
var _2023_03_10_1634237904884215809_default = createImageAsset({
	"src": "/_astro/2023-03-10_1634237904884215809.5ih-9Tlu.jpg",
	"width": 933,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-03-10_1634237904884215809.jpg", false);
//#endregion
//#region src/assets/photos/2023-04-02_1642669962069262336.jpg
var _2023_04_02_1642669962069262336_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_04_02_1642669962069262336_default });
var _2023_04_02_1642669962069262336_default = createImageAsset({
	"src": "/_astro/2023-04-02_1642669962069262336.CcjcjF85.jpg",
	"width": 787,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-04-02_1642669962069262336.jpg", false);
//#endregion
//#region src/assets/photos/2023-04-10_1645521699012575248.jpg
var _2023_04_10_1645521699012575248_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_04_10_1645521699012575248_default });
var _2023_04_10_1645521699012575248_default = createImageAsset({
	"src": "/_astro/2023-04-10_1645521699012575248.CrArHgrA.jpg",
	"width": 1280,
	"height": 720,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-04-10_1645521699012575248.jpg", false);
//#endregion
//#region src/assets/photos/2023-05-08_1655532666228297733.jpg
var _2023_05_08_1655532666228297733_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_05_08_1655532666228297733_default });
var _2023_05_08_1655532666228297733_default = createImageAsset({
	"src": "/_astro/2023-05-08_1655532666228297733.CxByw30N.jpg",
	"width": 787,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-05-08_1655532666228297733.jpg", false);
//#endregion
//#region src/assets/photos/2023-05-15_1658203167425699850.jpg
var _2023_05_15_1658203167425699850_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_05_15_1658203167425699850_default });
var _2023_05_15_1658203167425699850_default = createImageAsset({
	"src": "/_astro/2023-05-15_1658203167425699850.Crn9L_qa.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-05-15_1658203167425699850.jpg", false);
//#endregion
//#region src/assets/photos/2023-09-24_1705965808340414726.jpg
var _2023_09_24_1705965808340414726_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_09_24_1705965808340414726_default });
var _2023_09_24_1705965808340414726_default = createImageAsset({
	"src": "/_astro/2023-09-24_1705965808340414726.B281Y9m_.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-09-24_1705965808340414726.jpg", false);
//#endregion
//#region src/assets/photos/2023-10-05_1709879497476948298.jpg
var _2023_10_05_1709879497476948298_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_10_05_1709879497476948298_default });
var _2023_10_05_1709879497476948298_default = createImageAsset({
	"src": "/_astro/2023-10-05_1709879497476948298.D34bJgS4.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-10-05_1709879497476948298.jpg", false);
//#endregion
//#region src/assets/photos/2023-10-05_1710052770403799547.jpg
var _2023_10_05_1710052770403799547_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_10_05_1710052770403799547_default });
var _2023_10_05_1710052770403799547_default = createImageAsset({
	"src": "/_astro/2023-10-05_1710052770403799547.C9HlgBFc.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-10-05_1710052770403799547.jpg", false);
//#endregion
//#region src/assets/photos/2023-10-06_1710393697978741041.jpg
var _2023_10_06_1710393697978741041_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_10_06_1710393697978741041_default });
var _2023_10_06_1710393697978741041_default = createImageAsset({
	"src": "/_astro/2023-10-06_1710393697978741041.n0TX_PD3.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-10-06_1710393697978741041.jpg", false);
//#endregion
//#region src/assets/photos/2023-10-06_1710393716165206361.jpg
var _2023_10_06_1710393716165206361_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_10_06_1710393716165206361_default });
var _2023_10_06_1710393716165206361_default = createImageAsset({
	"src": "/_astro/2023-10-06_1710393716165206361.CJcg2JIE.jpg",
	"width": 1400,
	"height": 941,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-10-06_1710393716165206361.jpg", false);
//#endregion
//#region src/assets/photos/2023-10-27_1717887423932235810.jpg
var _2023_10_27_1717887423932235810_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_10_27_1717887423932235810_default });
var _2023_10_27_1717887423932235810_default = createImageAsset({
	"src": "/_astro/2023-10-27_1717887423932235810.BKB0Php6.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-10-27_1717887423932235810.jpg", false);
//#endregion
//#region src/assets/photos/2023-11-02_1720117729473057111.jpg
var _2023_11_02_1720117729473057111_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_11_02_1720117729473057111_default });
var _2023_11_02_1720117729473057111_default = createImageAsset({
	"src": "/_astro/2023-11-02_1720117729473057111.BjgjIhw2.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-11-02_1720117729473057111.jpg", false);
//#endregion
//#region src/assets/photos/2023-11-08_1722207975157436836.jpg
var _2023_11_08_1722207975157436836_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_11_08_1722207975157436836_default });
var _2023_11_08_1722207975157436836_default = createImageAsset({
	"src": "/_astro/2023-11-08_1722207975157436836.n5EZqhuJ.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-11-08_1722207975157436836.jpg", false);
//#endregion
//#region src/assets/photos/2023-11-13_1723997385997561915.jpg
var _2023_11_13_1723997385997561915_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_11_13_1723997385997561915_default });
var _2023_11_13_1723997385997561915_default = createImageAsset({
	"src": "/_astro/2023-11-13_1723997385997561915.D8EHnP94.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-11-13_1723997385997561915.jpg", false);
//#endregion
//#region src/assets/photos/2023-11-28_1729387940701151682.jpg
var _2023_11_28_1729387940701151682_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_11_28_1729387940701151682_default });
var _2023_11_28_1729387940701151682_default = createImageAsset({
	"src": "/_astro/2023-11-28_1729387940701151682.COrmOl_D.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-11-28_1729387940701151682.jpg", false);
//#endregion
//#region src/assets/photos/2023-11-29_1729746614653161705.jpg
var _2023_11_29_1729746614653161705_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_11_29_1729746614653161705_default });
var _2023_11_29_1729746614653161705_default = createImageAsset({
	"src": "/_astro/2023-11-29_1729746614653161705.CGjq7Ejn.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-11-29_1729746614653161705.jpg", false);
//#endregion
//#region src/assets/photos/2023-11-30_1730211245867802749.jpg
var _2023_11_30_1730211245867802749_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_11_30_1730211245867802749_default });
var _2023_11_30_1730211245867802749_default = createImageAsset({
	"src": "/_astro/2023-11-30_1730211245867802749.BskSOMXs.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-11-30_1730211245867802749.jpg", false);
//#endregion
//#region src/assets/photos/2023-11-30_1730314930832732261.jpg
var _2023_11_30_1730314930832732261_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_11_30_1730314930832732261_default });
var _2023_11_30_1730314930832732261_default = createImageAsset({
	"src": "/_astro/2023-11-30_1730314930832732261.BsBcBUqE.jpg",
	"width": 1050,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-11-30_1730314930832732261.jpg", false);
//#endregion
//#region src/assets/photos/2023-12-03_1731292973663457737.jpg
var _2023_12_03_1731292973663457737_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_12_03_1731292973663457737_default });
var _2023_12_03_1731292973663457737_default = createImageAsset({
	"src": "/_astro/2023-12-03_1731292973663457737.hki0Ig01.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-12-03_1731292973663457737.jpg", false);
//#endregion
//#region src/assets/photos/2023-12-03_1731293063736143941.jpg
var _2023_12_03_1731293063736143941_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_12_03_1731293063736143941_default });
var _2023_12_03_1731293063736143941_default = createImageAsset({
	"src": "/_astro/2023-12-03_1731293063736143941.Cbxi6chI.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-12-03_1731293063736143941.jpg", false);
//#endregion
//#region src/assets/photos/2023-12-03_1731293084665950378.jpg
var _2023_12_03_1731293084665950378_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_12_03_1731293084665950378_default });
var _2023_12_03_1731293084665950378_default = createImageAsset({
	"src": "/_astro/2023-12-03_1731293084665950378.B00gC419.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-12-03_1731293084665950378.jpg", false);
//#endregion
//#region src/assets/photos/2023-12-06_1732356471982043620.jpg
var _2023_12_06_1732356471982043620_exports = /* @__PURE__ */ __exportAll({ default: () => _2023_12_06_1732356471982043620_default });
var _2023_12_06_1732356471982043620_default = createImageAsset({
	"src": "/_astro/2023-12-06_1732356471982043620.BHwM7HZ_.jpg",
	"width": 960,
	"height": 1280,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2023-12-06_1732356471982043620.jpg", false);
//#endregion
//#region src/assets/photos/2024-01-25_1750466051257610585.jpg
var _2024_01_25_1750466051257610585_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_01_25_1750466051257610585_default });
var _2024_01_25_1750466051257610585_default = createImageAsset({
	"src": "/_astro/2024-01-25_1750466051257610585.BVVhbXrL.jpg",
	"width": 891,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-01-25_1750466051257610585.jpg", false);
//#endregion
//#region src/assets/photos/2024-02-06_1754768354974257462.jpg
var _2024_02_06_1754768354974257462_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_02_06_1754768354974257462_default });
var _2024_02_06_1754768354974257462_default = createImageAsset({
	"src": "/_astro/2024-02-06_1754768354974257462.BQfIk00I.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-02-06_1754768354974257462.jpg", false);
//#endregion
//#region src/assets/photos/2024-02-07_1755148899864518982.jpg
var _2024_02_07_1755148899864518982_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_02_07_1755148899864518982_default });
var _2024_02_07_1755148899864518982_default = createImageAsset({
	"src": "/_astro/2024-02-07_1755148899864518982.DYILnZuo.jpg",
	"width": 1170,
	"height": 773,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-02-07_1755148899864518982.jpg", false);
//#endregion
//#region src/assets/photos/2024-02-08_1755578530677637289.jpg
var _2024_02_08_1755578530677637289_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_02_08_1755578530677637289_default });
var _2024_02_08_1755578530677637289_default = createImageAsset({
	"src": "/_astro/2024-02-08_1755578530677637289.CsNuoV43.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-02-08_1755578530677637289.jpg", false);
//#endregion
//#region src/assets/photos/2024-02-12_1757048642790187243.jpg
var _2024_02_12_1757048642790187243_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_02_12_1757048642790187243_default });
var _2024_02_12_1757048642790187243_default = createImageAsset({
	"src": "/_astro/2024-02-12_1757048642790187243.DaR0_WF-.jpg",
	"width": 1050,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-02-12_1757048642790187243.jpg", false);
//#endregion
//#region src/assets/photos/2024-02-13_1757404213083046384.jpg
var _2024_02_13_1757404213083046384_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_02_13_1757404213083046384_default });
var _2024_02_13_1757404213083046384_default = createImageAsset({
	"src": "/_astro/2024-02-13_1757404213083046384.N2F8qe7R.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-02-13_1757404213083046384.jpg", false);
//#endregion
//#region src/assets/photos/2024-02-14_1757712935655260400.jpg
var _2024_02_14_1757712935655260400_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_02_14_1757712935655260400_default });
var _2024_02_14_1757712935655260400_default = createImageAsset({
	"src": "/_astro/2024-02-14_1757712935655260400.vgdqe183.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-02-14_1757712935655260400.jpg", false);
//#endregion
//#region src/assets/photos/2024-02-14_1757867157617070427.jpg
var _2024_02_14_1757867157617070427_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_02_14_1757867157617070427_default });
var _2024_02_14_1757867157617070427_default = createImageAsset({
	"src": "/_astro/2024-02-14_1757867157617070427.DnaF8p8P.jpg",
	"width": 1170,
	"height": 1090,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-02-14_1757867157617070427.jpg", false);
//#endregion
//#region src/assets/photos/2024-03-10_1766907280203624486.jpg
var _2024_03_10_1766907280203624486_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_03_10_1766907280203624486_default });
var _2024_03_10_1766907280203624486_default = createImageAsset({
	"src": "/_astro/2024-03-10_1766907280203624486.DY8CSprT.jpg",
	"width": 1022,
	"height": 423,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-03-10_1766907280203624486.jpg", false);
//#endregion
//#region src/assets/photos/2024-03-17_1769505136064282669.jpg
var _2024_03_17_1769505136064282669_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_03_17_1769505136064282669_default });
var _2024_03_17_1769505136064282669_default = createImageAsset({
	"src": "/_astro/2024-03-17_1769505136064282669.BIxM5fnS.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-03-17_1769505136064282669.jpg", false);
//#endregion
//#region src/assets/photos/2024-03-19_1769880969639518423.jpg
var _2024_03_19_1769880969639518423_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_03_19_1769880969639518423_default });
var _2024_03_19_1769880969639518423_default = createImageAsset({
	"src": "/_astro/2024-03-19_1769880969639518423.OenxIgXh.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-03-19_1769880969639518423.jpg", false);
//#endregion
//#region src/assets/photos/2024-03-20_1770266404811395169.jpg
var _2024_03_20_1770266404811395169_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_03_20_1770266404811395169_default });
var _2024_03_20_1770266404811395169_default = createImageAsset({
	"src": "/_astro/2024-03-20_1770266404811395169.CndKSOdz.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-03-20_1770266404811395169.jpg", false);
//#endregion
//#region src/assets/photos/2024-03-24_1772041072769679652.jpg
var _2024_03_24_1772041072769679652_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_03_24_1772041072769679652_default });
var _2024_03_24_1772041072769679652_default = createImageAsset({
	"src": "/_astro/2024-03-24_1772041072769679652.CVwenSJD.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-03-24_1772041072769679652.jpg", false);
//#endregion
//#region src/assets/photos/2024-04-25_1783465960931832006.jpg
var _2024_04_25_1783465960931832006_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_04_25_1783465960931832006_default });
var _2024_04_25_1783465960931832006_default = createImageAsset({
	"src": "/_astro/2024-04-25_1783465960931832006.KhVejpk6.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-04-25_1783465960931832006.jpg", false);
//#endregion
//#region src/assets/photos/2024-04-26_1783838738101178565.jpg
var _2024_04_26_1783838738101178565_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_04_26_1783838738101178565_default });
var _2024_04_26_1783838738101178565_default = createImageAsset({
	"src": "/_astro/2024-04-26_1783838738101178565.Bd0mFMLv.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-04-26_1783838738101178565.jpg", false);
//#endregion
//#region src/assets/photos/2024-04-30_1785217635640132045.jpg
var _2024_04_30_1785217635640132045_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_04_30_1785217635640132045_default });
var _2024_04_30_1785217635640132045_default = createImageAsset({
	"src": "/_astro/2024-04-30_1785217635640132045.BVdhubl-.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-04-30_1785217635640132045.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-01_1785567400550662586.jpg
var _2024_05_01_1785567400550662586_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_01_1785567400550662586_default });
var _2024_05_01_1785567400550662586_default = createImageAsset({
	"src": "/_astro/2024-05-01_1785567400550662586.BFIRQyrW.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-01_1785567400550662586.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-01_1785727003213042026.jpg
var _2024_05_01_1785727003213042026_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_01_1785727003213042026_default });
var _2024_05_01_1785727003213042026_default = createImageAsset({
	"src": "/_astro/2024-05-01_1785727003213042026.BBWOcyyk.jpg",
	"width": 760,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-01_1785727003213042026.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837453123846484.jpg
var _2024_05_07_1787837453123846484_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837453123846484_default });
var _2024_05_07_1787837453123846484_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837453123846484.Bos6p3iM.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837453123846484.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837468470812860.jpg
var _2024_05_07_1787837468470812860_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837468470812860_default });
var _2024_05_07_1787837468470812860_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837468470812860.DaQJAd26.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837468470812860.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837500515307525.jpg
var _2024_05_07_1787837500515307525_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837500515307525_default });
var _2024_05_07_1787837500515307525_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837500515307525.BfvX3_m9.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837500515307525.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837515770003470.jpg
var _2024_05_07_1787837515770003470_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837515770003470_default });
var _2024_05_07_1787837515770003470_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837515770003470.D3CQ6JmL.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837515770003470.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837532714995751.jpg
var _2024_05_07_1787837532714995751_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837532714995751_default });
var _2024_05_07_1787837532714995751_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837532714995751.CAGSKzyu.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837532714995751.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837550565933250.jpg
var _2024_05_07_1787837550565933250_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837550565933250_default });
var _2024_05_07_1787837550565933250_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837550565933250.DgmGtNkt.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837550565933250.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837569968820574.jpg
var _2024_05_07_1787837569968820574_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837569968820574_default });
var _2024_05_07_1787837569968820574_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837569968820574.CCxBwySq.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837569968820574.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837587085803802.jpg
var _2024_05_07_1787837587085803802_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837587085803802_default });
var _2024_05_07_1787837587085803802_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837587085803802.hd438Y2y.jpg",
	"width": 933,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837587085803802.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-07_1787837608648659400.jpg
var _2024_05_07_1787837608648659400_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_07_1787837608648659400_default });
var _2024_05_07_1787837608648659400_default = createImageAsset({
	"src": "/_astro/2024-05-07_1787837608648659400.DwYFPVCk.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-07_1787837608648659400.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-14_1790391068023791895.jpg
var _2024_05_14_1790391068023791895_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_14_1790391068023791895_default });
var _2024_05_14_1790391068023791895_default = createImageAsset({
	"src": "/_astro/2024-05-14_1790391068023791895.m1yK6Q-A.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-14_1790391068023791895.jpg", false);
//#endregion
//#region src/assets/photos/2024-05-20_1792616103044174237.jpg
var _2024_05_20_1792616103044174237_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_05_20_1792616103044174237_default });
var _2024_05_20_1792616103044174237_default = createImageAsset({
	"src": "/_astro/2024-05-20_1792616103044174237.BtvA7ECP.jpg",
	"width": 509,
	"height": 1103,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-05-20_1792616103044174237.jpg", false);
//#endregion
//#region src/assets/photos/2024-09-26_1839248619293028714.jpg
var _2024_09_26_1839248619293028714_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_09_26_1839248619293028714_default });
var _2024_09_26_1839248619293028714_default = createImageAsset({
	"src": "/_astro/2024-09-26_1839248619293028714.Cdn84egQ.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-09-26_1839248619293028714.jpg", false);
//#endregion
//#region src/assets/photos/2024-09-29_1840466306006659353.jpg
var _2024_09_29_1840466306006659353_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_09_29_1840466306006659353_default });
var _2024_09_29_1840466306006659353_default = createImageAsset({
	"src": "/_astro/2024-09-29_1840466306006659353.DkvuyOdj.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-09-29_1840466306006659353.jpg", false);
//#endregion
//#region src/assets/photos/2024-10-06_1842990131260834264.jpg
var _2024_10_06_1842990131260834264_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_10_06_1842990131260834264_default });
var _2024_10_06_1842990131260834264_default = createImageAsset({
	"src": "/_astro/2024-10-06_1842990131260834264.SHtPH8sN.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-10-06_1842990131260834264.jpg", false);
//#endregion
//#region src/assets/photos/2024-10-21_1848265386073940168.jpg
var _2024_10_21_1848265386073940168_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_10_21_1848265386073940168_default });
var _2024_10_21_1848265386073940168_default = createImageAsset({
	"src": "/_astro/2024-10-21_1848265386073940168.D4ZArlxM.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-10-21_1848265386073940168.jpg", false);
//#endregion
//#region src/assets/photos/2024-10-29_1851239307748532557.jpg
var _2024_10_29_1851239307748532557_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_10_29_1851239307748532557_default });
var _2024_10_29_1851239307748532557_default = createImageAsset({
	"src": "/_astro/2024-10-29_1851239307748532557.C_CbdIi-.jpg",
	"width": 576,
	"height": 1024,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-10-29_1851239307748532557.jpg", false);
//#endregion
//#region src/assets/photos/2024-11-24_1860663399195066682.jpg
var _2024_11_24_1860663399195066682_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_11_24_1860663399195066682_default });
var _2024_11_24_1860663399195066682_default = createImageAsset({
	"src": "/_astro/2024-11-24_1860663399195066682.BjRrQ9lp.jpg",
	"width": 1050,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-11-24_1860663399195066682.jpg", false);
//#endregion
//#region src/assets/photos/2024-11-25_1861119863458029794.jpg
var _2024_11_25_1861119863458029794_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_11_25_1861119863458029794_default });
var _2024_11_25_1861119863458029794_default = createImageAsset({
	"src": "/_astro/2024-11-25_1861119863458029794.-HOLtycb.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-11-25_1861119863458029794.jpg", false);
//#endregion
//#region src/assets/photos/2024-11-28_1862120985945608671.jpg
var _2024_11_28_1862120985945608671_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_11_28_1862120985945608671_default });
var _2024_11_28_1862120985945608671_default = createImageAsset({
	"src": "/_astro/2024-11-28_1862120985945608671.K012g_M_.jpg",
	"width": 1400,
	"height": 843,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-11-28_1862120985945608671.jpg", false);
//#endregion
//#region src/assets/photos/2024-12-03_1864050646992793601.jpg
var _2024_12_03_1864050646992793601_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_12_03_1864050646992793601_default });
var _2024_12_03_1864050646992793601_default = createImageAsset({
	"src": "/_astro/2024-12-03_1864050646992793601.CIo72xhe.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-12-03_1864050646992793601.jpg", false);
//#endregion
//#region src/assets/photos/2024-12-04_1864396918228422715.jpg
var _2024_12_04_1864396918228422715_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_12_04_1864396918228422715_default });
var _2024_12_04_1864396918228422715_default = createImageAsset({
	"src": "/_astro/2024-12-04_1864396918228422715.ikpLxq1a.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-12-04_1864396918228422715.jpg", false);
//#endregion
//#region src/assets/photos/2024-12-05_1864760431241211919.jpg
var _2024_12_05_1864760431241211919_exports = /* @__PURE__ */ __exportAll({ default: () => _2024_12_05_1864760431241211919_default });
var _2024_12_05_1864760431241211919_default = createImageAsset({
	"src": "/_astro/2024-12-05_1864760431241211919.CM1XIZbc.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2024-12-05_1864760431241211919.jpg", false);
//#endregion
//#region src/assets/photos/2025-02-12_1889724538708988331.jpg
var _2025_02_12_1889724538708988331_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_02_12_1889724538708988331_default });
var _2025_02_12_1889724538708988331_default = createImageAsset({
	"src": "/_astro/2025-02-12_1889724538708988331.BkJIpBBs.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-02-12_1889724538708988331.jpg", false);
//#endregion
//#region src/assets/photos/2025-02-18_1891893230205088026.jpg
var _2025_02_18_1891893230205088026_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_02_18_1891893230205088026_default });
var _2025_02_18_1891893230205088026_default = createImageAsset({
	"src": "/_astro/2025-02-18_1891893230205088026.DU3yId70.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-02-18_1891893230205088026.jpg", false);
//#endregion
//#region src/assets/photos/2025-03-18_1901911196837818695.jpg
var _2025_03_18_1901911196837818695_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_03_18_1901911196837818695_default });
var _2025_03_18_1901911196837818695_default = createImageAsset({
	"src": "/_astro/2025-03-18_1901911196837818695.Gqwjucd8.jpg",
	"width": 1050,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-03-18_1901911196837818695.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-10_1910478806520914205.jpg
var _2025_04_10_1910478806520914205_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_10_1910478806520914205_default });
var _2025_04_10_1910478806520914205_default = createImageAsset({
	"src": "/_astro/2025-04-10_1910478806520914205.D7uNa8He.jpg",
	"width": 1024,
	"height": 682,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-10_1910478806520914205.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-13_1911484448878526779.jpg
var _2025_04_13_1911484448878526779_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_13_1911484448878526779_default });
var _2025_04_13_1911484448878526779_default = createImageAsset({
	"src": "/_astro/2025-04-13_1911484448878526779.Cf4P5FiT.jpg",
	"width": 1024,
	"height": 575,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-13_1911484448878526779.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-20_1913920617407009239.jpg
var _2025_04_20_1913920617407009239_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_20_1913920617407009239_default });
var _2025_04_20_1913920617407009239_default = createImageAsset({
	"src": "/_astro/2025-04-20_1913920617407009239.B0hO_P3N.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-20_1913920617407009239.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-20_1913920636671438920.jpg
var _2025_04_20_1913920636671438920_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_20_1913920636671438920_default });
var _2025_04_20_1913920636671438920_default = createImageAsset({
	"src": "/_astro/2025-04-20_1913920636671438920.CZvlgNCY.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-20_1913920636671438920.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-20_1913920653427691792.jpg
var _2025_04_20_1913920653427691792_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_20_1913920653427691792_default });
var _2025_04_20_1913920653427691792_default = createImageAsset({
	"src": "/_astro/2025-04-20_1913920653427691792.Bu6Ym1l9.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-20_1913920653427691792.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-20_1913920668669821112.jpg
var _2025_04_20_1913920668669821112_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_20_1913920668669821112_default });
var _2025_04_20_1913920668669821112_default = createImageAsset({
	"src": "/_astro/2025-04-20_1913920668669821112.CyuMUAh6.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-20_1913920668669821112.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-20_1913920688710168909.jpg
var _2025_04_20_1913920688710168909_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_20_1913920688710168909_default });
var _2025_04_20_1913920688710168909_default = createImageAsset({
	"src": "/_astro/2025-04-20_1913920688710168909.BhJtCuqa.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-20_1913920688710168909.jpg", false);
//#endregion
//#region src/assets/photos/2025-04-26_1916231780799053933.jpg
var _2025_04_26_1916231780799053933_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_04_26_1916231780799053933_default });
var _2025_04_26_1916231780799053933_default = createImageAsset({
	"src": "/_astro/2025-04-26_1916231780799053933.BVb2UxBf.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-04-26_1916231780799053933.jpg", false);
//#endregion
//#region src/assets/photos/2025-09-13_1966930489975226577.jpg
var _2025_09_13_1966930489975226577_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_09_13_1966930489975226577_default });
var _2025_09_13_1966930489975226577_default = createImageAsset({
	"src": "/_astro/2025-09-13_1966930489975226577.DEbtHJmZ.jpg",
	"width": 787,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-09-13_1966930489975226577.jpg", false);
//#endregion
//#region src/assets/photos/2025-09-15_1967613383982936340.jpg
var _2025_09_15_1967613383982936340_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_09_15_1967613383982936340_default });
var _2025_09_15_1967613383982936340_default = createImageAsset({
	"src": "/_astro/2025-09-15_1967613383982936340.DOAb_DJR.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-09-15_1967613383982936340.jpg", false);
//#endregion
//#region src/assets/photos/2025-09-26_1971532633755865260.jpg
var _2025_09_26_1971532633755865260_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_09_26_1971532633755865260_default });
var _2025_09_26_1971532633755865260_default = createImageAsset({
	"src": "/_astro/2025-09-26_1971532633755865260.Bz25w4A5.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-09-26_1971532633755865260.jpg", false);
//#endregion
//#region src/assets/photos/2025-09-26_1971646693231010182.jpg
var _2025_09_26_1971646693231010182_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_09_26_1971646693231010182_default });
var _2025_09_26_1971646693231010182_default = createImageAsset({
	"src": "/_astro/2025-09-26_1971646693231010182.zSSzEH_I.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-09-26_1971646693231010182.jpg", false);
//#endregion
//#region src/assets/photos/2025-10-03_1974082470355370275.jpg
var _2025_10_03_1974082470355370275_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_10_03_1974082470355370275_default });
var _2025_10_03_1974082470355370275_default = createImageAsset({
	"src": "/_astro/2025-10-03_1974082470355370275.CSLjuEZG.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-10-03_1974082470355370275.jpg", false);
//#endregion
//#region src/assets/photos/2025-10-12_1977385330635362441.jpg
var _2025_10_12_1977385330635362441_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_10_12_1977385330635362441_default });
var _2025_10_12_1977385330635362441_default = createImageAsset({
	"src": "/_astro/2025-10-12_1977385330635362441.BJbhR1DW.jpg",
	"width": 1089,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-10-12_1977385330635362441.jpg", false);
//#endregion
//#region src/assets/photos/2025-10-12_1977397509702988011.jpg
var _2025_10_12_1977397509702988011_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_10_12_1977397509702988011_default });
var _2025_10_12_1977397509702988011_default = createImageAsset({
	"src": "/_astro/2025-10-12_1977397509702988011.DMEsFe8h.jpg",
	"width": 576,
	"height": 1024,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-10-12_1977397509702988011.jpg", false);
//#endregion
//#region src/assets/photos/2025-10-17_1979208323674013989.jpg
var _2025_10_17_1979208323674013989_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_10_17_1979208323674013989_default });
var _2025_10_17_1979208323674013989_default = createImageAsset({
	"src": "/_astro/2025-10-17_1979208323674013989.CQ-v3B0d.jpg",
	"width": 1280,
	"height": 853,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-10-17_1979208323674013989.jpg", false);
//#endregion
//#region src/assets/photos/2025-10-20_1980196823303397615.jpg
var _2025_10_20_1980196823303397615_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_10_20_1980196823303397615_default });
var _2025_10_20_1980196823303397615_default = createImageAsset({
	"src": "/_astro/2025-10-20_1980196823303397615.CB_PsPwa.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-10-20_1980196823303397615.jpg", false);
//#endregion
//#region src/assets/photos/2025-10-23_1981399639560507551.jpg
var _2025_10_23_1981399639560507551_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_10_23_1981399639560507551_default });
var _2025_10_23_1981399639560507551_default = createImageAsset({
	"src": "/_astro/2025-10-23_1981399639560507551.DzBTwr5L.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-10-23_1981399639560507551.jpg", false);
//#endregion
//#region src/assets/photos/2025-11-07_1986846367201861709.jpg
var _2025_11_07_1986846367201861709_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_11_07_1986846367201861709_default });
var _2025_11_07_1986846367201861709_default = createImageAsset({
	"src": "/_astro/2025-11-07_1986846367201861709.CWkJjIL7.jpg",
	"width": 788,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-11-07_1986846367201861709.jpg", false);
//#endregion
//#region src/assets/photos/2025-12-06_1997329598145544489.jpg
var _2025_12_06_1997329598145544489_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_12_06_1997329598145544489_default });
var _2025_12_06_1997329598145544489_default = createImageAsset({
	"src": "/_astro/2025-12-06_1997329598145544489.CnU9fNdV.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-12-06_1997329598145544489.jpg", false);
//#endregion
//#region src/assets/photos/2025-12-06_1997329877641421114.jpg
var _2025_12_06_1997329877641421114_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_12_06_1997329877641421114_default });
var _2025_12_06_1997329877641421114_default = createImageAsset({
	"src": "/_astro/2025-12-06_1997329877641421114.BHG3xgYP.jpg",
	"width": 788,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-12-06_1997329877641421114.jpg", false);
//#endregion
//#region src/assets/photos/2025-12-10_1998825273383399868.jpg
var _2025_12_10_1998825273383399868_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_12_10_1998825273383399868_default });
var _2025_12_10_1998825273383399868_default = createImageAsset({
	"src": "/_astro/2025-12-10_1998825273383399868.oEVOM3bO.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-12-10_1998825273383399868.jpg", false);
//#endregion
//#region src/assets/photos/2025-12-14_2000224482489667651.jpg
var _2025_12_14_2000224482489667651_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_12_14_2000224482489667651_default });
var _2025_12_14_2000224482489667651_default = createImageAsset({
	"src": "/_astro/2025-12-14_2000224482489667651.QMEjHXqI.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-12-14_2000224482489667651.jpg", false);
//#endregion
//#region src/assets/photos/2025-12-14_2000224783506563094.jpg
var _2025_12_14_2000224783506563094_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_12_14_2000224783506563094_default });
var _2025_12_14_2000224783506563094_default = createImageAsset({
	"src": "/_astro/2025-12-14_2000224783506563094.CWy4MJ9N.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-12-14_2000224783506563094.jpg", false);
//#endregion
//#region src/assets/photos/2025-12-19_2002037765056434492.jpg
var _2025_12_19_2002037765056434492_exports = /* @__PURE__ */ __exportAll({ default: () => _2025_12_19_2002037765056434492_default });
var _2025_12_19_2002037765056434492_default = createImageAsset({
	"src": "/_astro/2025-12-19_2002037765056434492.D_s00oTX.jpg",
	"width": 1400,
	"height": 788,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2025-12-19_2002037765056434492.jpg", false);
//#endregion
//#region src/assets/photos/2026-01-28_2016548505070817595.jpg
var _2026_01_28_2016548505070817595_exports = /* @__PURE__ */ __exportAll({ default: () => _2026_01_28_2016548505070817595_default });
var _2026_01_28_2016548505070817595_default = createImageAsset({
	"src": "/_astro/2026-01-28_2016548505070817595.D_-7aYDo.jpg",
	"width": 787,
	"height": 1400,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2026-01-28_2016548505070817595.jpg", false);
//#endregion
//#region src/assets/photos/2026-09-08_2097325969014984962.jpg
var _2026_09_08_2097325969014984962_exports = /* @__PURE__ */ __exportAll({ default: () => _2026_09_08_2097325969014984962_default });
var _2026_09_08_2097325969014984962_default = createImageAsset({
	"src": "/_astro/2026-09-08_2097325969014984962.SjeBI03e.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2026-09-08_2097325969014984962.jpg", false);
//#endregion
//#region src/assets/photos/2026-09-11_2098349741796983025.jpg
var _2026_09_11_2098349741796983025_exports = /* @__PURE__ */ __exportAll({ default: () => _2026_09_11_2098349741796983025_default });
var _2026_09_11_2098349741796983025_default = createImageAsset({
	"src": "/_astro/2026-09-11_2098349741796983025.C00Mm_Jm.jpg",
	"width": 1400,
	"height": 934,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2026-09-11_2098349741796983025.jpg", false);
//#endregion
//#region src/assets/photos/2026-09-22_2102397545573974170.jpg
var _2026_09_22_2102397545573974170_exports = /* @__PURE__ */ __exportAll({ default: () => _2026_09_22_2102397545573974170_default });
var _2026_09_22_2102397545573974170_default = createImageAsset({
	"src": "/_astro/2026-09-22_2102397545573974170.kT4-TlZp.jpg",
	"width": 1400,
	"height": 1050,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2026-09-22_2102397545573974170.jpg", false);
//#endregion
//#region src/assets/photos/2026-10-06_2107519660690165818.jpg
var _2026_10_06_2107519660690165818_exports = /* @__PURE__ */ __exportAll({ default: () => _2026_10_06_2107519660690165818_default });
var _2026_10_06_2107519660690165818_default = createImageAsset({
	"src": "/_astro/2026-10-06_2107519660690165818.BYdsPenV.jpg",
	"width": 1400,
	"height": 933,
	"format": "jpg"
}, "/home/user/website/src/assets/photos/2026-10-06_2107519660690165818.jpg", false);
//#endregion
//#region src/assets/partners/3d-solutions.png
var _3d_solutions_exports = /* @__PURE__ */ __exportAll({ default: () => _3d_solutions_default });
var _3d_solutions_default = createImageAsset({
	"src": "/_astro/3d-solutions.DHwiZMIN.png",
	"width": 176,
	"height": 173,
	"format": "png"
}, "/home/user/website/src/assets/partners/3d-solutions.png", false);
//#endregion
//#region src/assets/partners/accenture.svg
var accenture_exports = /* @__PURE__ */ __exportAll({ default: () => accenture_default });
var accenture_default = createSvgComponent({
	"meta": {
		"src": "/_astro/accenture.sPg05bFZ.svg",
		"width": 163,
		"height": 43,
		"format": "svg"
	},
	"attributes": {
		"id": "Layer_1",
		"x": "0px",
		"y": "0px",
		"viewBox": "0 0 163.4 43",
		"xml:space": "preserve",
		"width": "163.39999",
		"height": "43",
		"xmlns:svg": "http://www.w3.org/2000/svg"
	},
	"children": "<defs id=\"defs1\" />\n<style type=\"text/css\" id=\"style1\">\n	.st0{fill:#A100FF;}\n</style>\n<g id=\"g1\">\n	<polygon class=\"st0\" points=\"95.1,4.9 95.1,0 111.2,6.5 111.2,10.5 95.1,17 95.1,12 104.5,8.5 \" id=\"polygon1\" />\n	<path fill=\"#FFFFFF\" d=\"M 6.2,43 C 2.8,43 0,41.3 0,37.5 v -0.2 c 0,-4.6 4,-6.2 8.9,-6.2 h 2.3 v -0.9 c 0,-1.9 -0.8,-3 -2.8,-3 -1.8,0 -2.7,1 -2.8,2.4 h -5 c 0.4,-4.2 3.7,-6.2 8.1,-6.2 4.5,0 7.8,1.9 7.8,6.6 V 42.6 H 11.4 V 40.4 C 10.4,41.8 8.7,43 6.2,43 Z m 5,-6.6 V 34.6 H 9.1 c -2.6,0 -3.9,0.7 -3.9,2.4 v 0.2 c 0,1.3 0.8,2.2 2.6,2.2 1.8,-0.1 3.4,-1.1 3.4,-3 z M 28.4,43 c -5.2,0 -9,-3.2 -9,-9.6 v -0.3 c 0,-6.4 4,-9.8 9,-9.8 4.3,0 7.8,2.2 8.2,7.1 h -5 c -0.3,-1.8 -1.3,-3 -3.1,-3 -2.2,0 -3.8,1.8 -3.8,5.5 v 0.6 c 0,3.8 1.4,5.5 3.8,5.5 1.8,0 3.1,-1.3 3.4,-3.4 h 4.8 C 36.4,40 33.5,43 28.4,43 Z M 48,43 c -5.2,0 -9,-3.2 -9,-9.6 v -0.3 c 0,-6.4 4,-9.8 9,-9.8 4.3,0 7.8,2.2 8.2,7.1 h -5 c -0.3,-1.8 -1.3,-3 -3.1,-3 -2.2,0 -3.8,1.8 -3.8,5.5 v 0.6 c 0,3.8 1.4,5.5 3.8,5.5 1.8,0 3.1,-1.3 3.4,-3.4 h 4.8 C 56,40 53.1,43 48,43 Z m 19.7,0 c -5.4,0 -9.1,-3.2 -9.1,-9.5 v -0.4 c 0,-6.3 3.9,-9.8 9,-9.8 4.7,0 8.6,2.6 8.6,8.9 v 2.3 H 63.9 c 0.2,3.4 1.7,4.7 3.9,4.7 2,0 3.1,-1.1 3.5,-2.4 h 4.9 C 75.6,40.3 72.6,43 67.7,43 Z M 64,31 h 7 c -0.1,-2.8 -1.4,-4 -3.5,-4 -1.6,0.1 -3.1,1 -3.5,4 z m 15.4,-7.2 h 5.3 v 2.8 c 0.9,-1.8 2.8,-3.2 5.7,-3.2 3.4,0 5.7,2.1 5.7,6.6 V 42.6 H 90.8 V 30.8 c 0,-2.2 -0.9,-3.2 -2.8,-3.2 -1.8,0 -3.3,1.1 -3.3,3.5 v 11.5 h -5.3 z m 26.4,-5.7 v 5.7 h 3.6 v 3.9 h -3.6 v 8.9 c 0,1.4 0.6,2.1 1.9,2.1 0.8,0 1.3,-0.1 1.8,-0.3 v 4.1 c -0.6,0.2 -1.7,0.4 -3,0.4 -4.1,0 -6,-1.9 -6,-5.7 v -9.5 h -2.2 v -3.9 h 2.2 v -3.5 z m 23.4,24.5 H 124 v -2.8 c -0.9,1.8 -2.7,3.2 -5.5,3.2 -3.4,0 -5.9,-2.1 -5.9,-6.5 V 23.8 h 5.3 v 12 c 0,2.2 0.9,3.2 2.7,3.2 1.8,0 3.3,-1.2 3.3,-3.5 V 23.8 h 5.3 z m 3.9,-18.8 h 5.3 v 3.5 c 1.1,-2.5 2.9,-3.7 5.7,-3.7 v 5.2 c -3.6,0 -5.7,1.1 -5.7,4.2 v 9.7 h -5.3 z M 154.8,43 c -5.4,0 -9.1,-3.2 -9.1,-9.5 v -0.4 c 0,-6.3 3.9,-9.8 9,-9.8 4.7,0 8.6,2.6 8.6,8.9 v 2.3 h -12.2 c 0.2,3.4 1.7,4.7 3.9,4.7 2,0 3.1,-1.1 3.5,-2.4 h 4.9 c -0.8,3.5 -3.7,6.2 -8.6,6.2 z M 151,31 h 7.1 c -0.1,-2.8 -1.4,-4 -3.5,-4 -1.6,0.1 -3.1,1 -3.6,4 z\" id=\"path1\" />\n</g>\n",
	"styles": ["\n	.st0{fill:#A100FF;}\n"]
});
//#endregion
//#region src/assets/partners/aws.svg
var aws_exports = /* @__PURE__ */ __exportAll({ default: () => aws_default });
var aws_default = createSvgComponent({
	"meta": {
		"src": "/_astro/aws.BU0TVMU_.svg",
		"width": 304,
		"height": 182,
		"format": "svg"
	},
	"attributes": {
		"id": "Layer_1",
		"x": "0px",
		"y": "0px",
		"width": "304",
		"height": "182",
		"viewBox": "0 0 304 182",
		"style": "enable-background:new 0 0 304 182;",
		"xml:space": "preserve"
	},
	"children": "\n<style type=\"text/css\">\n	.st0{fill:#FFFFFF;}\n	.st1{fill-rule:evenodd;clip-rule:evenodd;fill:#FF9900;}\n</style>\n<g>\n	<path class=\"st0\" d=\"M86.4,66.4c0,3.7,0.4,6.7,1.1,8.9c0.8,2.2,1.8,4.6,3.2,7.2c0.5,0.8,0.7,1.6,0.7,2.3c0,1-0.6,2-1.9,3l-6.3,4.2\n		c-0.9,0.6-1.8,0.9-2.6,0.9c-1,0-2-0.5-3-1.4C76.2,90,75,88.4,74,86.8c-1-1.7-2-3.6-3.1-5.9c-7.8,9.2-17.6,13.8-29.4,13.8\n		c-8.4,0-15.1-2.4-20-7.2c-4.9-4.8-7.4-11.2-7.4-19.2c0-8.5,3-15.4,9.1-20.6c6.1-5.2,14.2-7.8,24.5-7.8c3.4,0,6.9,0.3,10.6,0.8\n		c3.7,0.5,7.5,1.3,11.5,2.2v-7.3c0-7.6-1.6-12.9-4.7-16c-3.2-3.1-8.6-4.6-16.3-4.6c-3.5,0-7.1,0.4-10.8,1.3c-3.7,0.9-7.3,2-10.8,3.4\n		c-1.6,0.7-2.8,1.1-3.5,1.3c-0.7,0.2-1.2,0.3-1.6,0.3c-1.4,0-2.1-1-2.1-3.1v-4.9c0-1.6,0.2-2.8,0.7-3.5c0.5-0.7,1.4-1.4,2.8-2.1\n		c3.5-1.8,7.7-3.3,12.6-4.5c4.9-1.3,10.1-1.9,15.6-1.9c11.9,0,20.6,2.7,26.2,8.1c5.5,5.4,8.3,13.6,8.3,24.6V66.4z M45.8,81.6\n		c3.3,0,6.7-0.6,10.3-1.8c3.6-1.2,6.8-3.4,9.5-6.4c1.6-1.9,2.8-4,3.4-6.4c0.6-2.4,1-5.3,1-8.7v-4.2c-2.9-0.7-6-1.3-9.2-1.7\n		c-3.2-0.4-6.3-0.6-9.4-0.6c-6.7,0-11.6,1.3-14.9,4c-3.3,2.7-4.9,6.5-4.9,11.5c0,4.7,1.2,8.2,3.7,10.6\n		C37.7,80.4,41.2,81.6,45.8,81.6z M126.1,92.4c-1.8,0-3-0.3-3.8-1c-0.8-0.6-1.5-2-2.1-3.9L96.7,10.2c-0.6-2-0.9-3.3-0.9-4\n		c0-1.6,0.8-2.5,2.4-2.5h9.8c1.9,0,3.2,0.3,3.9,1c0.8,0.6,1.4,2,2,3.9l16.8,66.2l15.6-66.2c0.5-2,1.1-3.3,1.9-3.9c0.8-0.6,2.2-1,4-1\n		h8c1.9,0,3.2,0.3,4,1c0.8,0.6,1.5,2,1.9,3.9l15.8,67l17.3-67c0.6-2,1.3-3.3,2-3.9c0.8-0.6,2.1-1,3.9-1h9.3c1.6,0,2.5,0.8,2.5,2.5\n		c0,0.5-0.1,1-0.2,1.6c-0.1,0.6-0.3,1.4-0.7,2.5l-24.1,77.3c-0.6,2-1.3,3.3-2.1,3.9c-0.8,0.6-2.1,1-3.8,1h-8.6c-1.9,0-3.2-0.3-4-1\n		c-0.8-0.7-1.5-2-1.9-4L156,23l-15.4,64.4c-0.5,2-1.1,3.3-1.9,4c-0.8,0.7-2.2,1-4,1H126.1z M254.6,95.1c-5.2,0-10.4-0.6-15.4-1.8\n		c-5-1.2-8.9-2.5-11.5-4c-1.6-0.9-2.7-1.9-3.1-2.8c-0.4-0.9-0.6-1.9-0.6-2.8v-5.1c0-2.1,0.8-3.1,2.3-3.1c0.6,0,1.2,0.1,1.8,0.3\n		c0.6,0.2,1.5,0.6,2.5,1c3.4,1.5,7.1,2.7,11,3.5c4,0.8,7.9,1.2,11.9,1.2c6.3,0,11.2-1.1,14.6-3.3c3.4-2.2,5.2-5.4,5.2-9.5\n		c0-2.8-0.9-5.1-2.7-7c-1.8-1.9-5.2-3.6-10.1-5.2L246,52c-7.3-2.3-12.7-5.7-16-10.2c-3.3-4.4-5-9.3-5-14.5c0-4.2,0.9-7.9,2.7-11.1\n		c1.8-3.2,4.2-6,7.2-8.2c3-2.3,6.4-4,10.4-5.2c4-1.2,8.2-1.7,12.6-1.7c2.2,0,4.5,0.1,6.7,0.4c2.3,0.3,4.4,0.7,6.5,1.1\n		c2,0.5,3.9,1,5.7,1.6c1.8,0.6,3.2,1.2,4.2,1.8c1.4,0.8,2.4,1.6,3,2.5c0.6,0.8,0.9,1.9,0.9,3.3v4.7c0,2.1-0.8,3.2-2.3,3.2\n		c-0.8,0-2.1-0.4-3.8-1.2c-5.7-2.6-12.1-3.9-19.2-3.9c-5.7,0-10.2,0.9-13.3,2.8c-3.1,1.9-4.7,4.8-4.7,8.9c0,2.8,1,5.2,3,7.1\n		c2,1.9,5.7,3.8,11,5.5l14.2,4.5c7.2,2.3,12.4,5.5,15.5,9.6c3.1,4.1,4.6,8.8,4.6,14c0,4.3-0.9,8.2-2.6,11.6\n		c-1.8,3.4-4.2,6.4-7.3,8.8c-3.1,2.5-6.8,4.3-11.1,5.6C264.4,94.4,259.7,95.1,254.6,95.1z\" />\n	<g>\n		<path class=\"st1\" d=\"M273.5,143.7c-32.9,24.3-80.7,37.2-121.8,37.2c-57.6,0-109.5-21.3-148.7-56.7c-3.1-2.8-0.3-6.6,3.4-4.4\n			c42.4,24.6,94.7,39.5,148.8,39.5c36.5,0,76.6-7.6,113.5-23.2C274.2,133.6,278.9,139.7,273.5,143.7z\" />\n		<path class=\"st1\" d=\"M287.2,128.1c-4.2-5.4-27.8-2.6-38.5-1.3c-3.2,0.4-3.7-2.4-0.8-4.5c18.8-13.2,49.7-9.4,53.3-5\n			c3.6,4.5-1,35.4-18.6,50.2c-2.7,2.3-5.3,1.1-4.1-1.9C282.5,155.7,291.4,133.4,287.2,128.1z\" />\n	</g>\n</g>\n",
	"styles": ["\n	.st0{fill:#FFFFFF;}\n	.st1{fill-rule:evenodd;clip-rule:evenodd;fill:#FF9900;}\n"]
});
//#endregion
//#region src/assets/partners/google-cloud.svg
var google_cloud_exports = /* @__PURE__ */ __exportAll({ default: () => google_cloud_default });
var google_cloud_default = createSvgComponent({
	"meta": {
		"src": "/_astro/google-cloud.Ca-m_TC6.svg",
		"width": 181,
		"height": 28,
		"format": "svg"
	},
	"attributes": {
		"width": "181",
		"height": "28",
		"viewBox": "0 0 181 28"
	},
	"children": "<defs><style>.cls-1{fill:#ea4335;}.cls-2{fill:#4285f4;}.cls-3{fill:#34a853;}.cls-4{fill:#fbbc05;}.cls-5{fill:#ffffff;}</style></defs><path class=\"cls-1\" d=\"M21.85,7.41l1,0,2.85-2.85.14-1.21A12.81,12.81,0,0,0,5,9.6a1.55,1.55,0,0,1,1-.06l5.7-.94s.29-.48.44-.45a7.11,7.11,0,0,1,9.73-.74Z\" /><path class=\"cls-2\" d=\"M29.76,9.6a12.84,12.84,0,0,0-3.87-6.24l-4,4A7.11,7.11,0,0,1,24.5,13v.71a3.56,3.56,0,1,1,0,7.12H17.38l-.71.72v4.27l.71.71H24.5A9.26,9.26,0,0,0,29.76,9.6Z\" /><path class=\"cls-3\" d=\"M10.25,26.49h7.12v-5.7H10.25a3.54,3.54,0,0,1-1.47-.32l-1,.31L4.91,23.63l-.25,1A9.21,9.21,0,0,0,10.25,26.49Z\" /><path class=\"cls-4\" d=\"M10.25,8A9.26,9.26,0,0,0,4.66,24.6l4.13-4.13a3.56,3.56,0,1,1,4.71-4.71l4.13-4.13A9.25,9.25,0,0,0,10.25,8Z\" /><path class=\"cls-5\" d=\"M52.79,22.51a9.11,9.11,0,0,1-6.6-2.71,8.8,8.8,0,0,1-2.77-6.52,8.81,8.81,0,0,1,2.77-6.52A9.11,9.11,0,0,1,52.79,4a8.84,8.84,0,0,1,6.33,2.55L57.34,8.36a6.41,6.41,0,0,0-4.55-1.8,6.34,6.34,0,0,0-4.7,2,6.53,6.53,0,0,0-1.93,4.75A6.53,6.53,0,0,0,48.09,18a6.71,6.71,0,0,0,9.36.11A5.32,5.32,0,0,0,58.82,15h-6V12.44h8.49A8.12,8.12,0,0,1,61.41,14a8,8,0,0,1-2.19,5.9A8.51,8.51,0,0,1,52.79,22.51Zm19.74-1.7a6.12,6.12,0,0,1-8.47,0,5.7,5.7,0,0,1-1.73-4.25,5.71,5.71,0,0,1,1.73-4.25,6.13,6.13,0,0,1,8.47,0,5.71,5.71,0,0,1,1.73,4.25A5.7,5.7,0,0,1,72.52,20.81Zm-6.6-1.67a3.24,3.24,0,0,0,4.73,0,3.56,3.56,0,0,0,1-2.58,3.57,3.57,0,0,0-1-2.59,3.29,3.29,0,0,0-4.75,0,3.57,3.57,0,0,0-1,2.59A3.56,3.56,0,0,0,65.92,19.14Zm19.62,1.67a6.12,6.12,0,0,1-8.47,0,5.7,5.7,0,0,1-1.73-4.25,5.71,5.71,0,0,1,1.73-4.25,6.12,6.12,0,0,1,8.47,0,5.71,5.71,0,0,1,1.73,4.25A5.7,5.7,0,0,1,85.55,20.81Zm-6.6-1.67a3.24,3.24,0,0,0,4.73,0,3.56,3.56,0,0,0,1-2.58,3.57,3.57,0,0,0-1-2.59,3.29,3.29,0,0,0-4.75,0,3.57,3.57,0,0,0-1,2.59A3.56,3.56,0,0,0,78.94,19.14Zm15.16,8.71a5.24,5.24,0,0,1-3.33-1.06,6.13,6.13,0,0,1-1.94-2.46l2.28-.95a3.84,3.84,0,0,0,1.13,1.49,2.85,2.85,0,0,0,1.87.63,3,3,0,0,0,2.33-.9A3.65,3.65,0,0,0,97.28,22v-.86h-.09a3.81,3.81,0,0,1-3.13,1.35,5.43,5.43,0,0,1-4-1.74,5.75,5.75,0,0,1-1.71-4.19,5.81,5.81,0,0,1,1.71-4.22,5.42,5.42,0,0,1,4-1.75A4.3,4.3,0,0,1,95.9,11a3.7,3.7,0,0,1,1.3.95h.09V11h2.48V21.65a6.21,6.21,0,0,1-1.59,4.65A5.6,5.6,0,0,1,94.11,27.85Zm.18-7.68a2.91,2.91,0,0,0,2.26-1,3.7,3.7,0,0,0,.91-2.56A3.78,3.78,0,0,0,96.55,14a2.9,2.9,0,0,0-2.26-1,3.09,3.09,0,0,0-2.34,1,3.65,3.65,0,0,0-1,2.59,3.58,3.58,0,0,0,1,2.56A3.1,3.1,0,0,0,94.29,20.17Zm9.89-15.5V22.15h-2.61V4.67Zm7.16,17.84a5.68,5.68,0,0,1-4.21-1.71,5.79,5.79,0,0,1-1.69-4.24,5.86,5.86,0,0,1,1.63-4.28,5.36,5.36,0,0,1,4-1.67,5.05,5.05,0,0,1,2,.39,4.71,4.71,0,0,1,1.53,1,7,7,0,0,1,1,1.21,7.15,7.15,0,0,1,.59,1.17l.27.68-8,3.29a3,3,0,0,0,2.88,1.8,3.41,3.41,0,0,0,2.93-1.65l2,1.35a6.59,6.59,0,0,1-1.92,1.82A5.44,5.44,0,0,1,111.34,22.51ZM108,16.38l5.32-2.21a1.84,1.84,0,0,0-.83-.91,2.71,2.71,0,0,0-1.37-.35,3.09,3.09,0,0,0-2.15.95A3.17,3.17,0,0,0,108,16.38Z\" /><path class=\"cls-5\" d=\"M130.13,22.51a8.24,8.24,0,0,1-8.38-8.43,8.24,8.24,0,0,1,8.38-8.43,7.46,7.46,0,0,1,5.93,2.64l-1.44,1.4a5.44,5.44,0,0,0-4.48-2.05,6.11,6.11,0,0,0-4.45,1.78,6.24,6.24,0,0,0-1.81,4.66,6.24,6.24,0,0,0,1.81,4.66,6.11,6.11,0,0,0,4.45,1.78,6.36,6.36,0,0,0,5-2.34l1.44,1.44a7.86,7.86,0,0,1-2.77,2.11A8.48,8.48,0,0,1,130.13,22.51Z\" /><path class=\"cls-5\" d=\"M140.45,22.15h-2.07V6h2.07Z\" /><path class=\"cls-5\" d=\"M143.83,12.43a5.79,5.79,0,0,1,8.16,0,5.85,5.85,0,0,1,1.6,4.2,5.85,5.85,0,0,1-1.6,4.2,5.79,5.79,0,0,1-8.16,0,5.85,5.85,0,0,1-1.6-4.2A5.85,5.85,0,0,1,143.83,12.43Zm1.54,7.1a3.49,3.49,0,0,0,5.07,0,4,4,0,0,0,1.07-2.9,4,4,0,0,0-1.07-2.9,3.49,3.49,0,0,0-5.07,0,4,4,0,0,0-1.07,2.9A4,4,0,0,0,145.38,19.52Z\" /><path class=\"cls-5\" d=\"M165.06,22.15h-2V20.62H163A3.85,3.85,0,0,1,161.54,22a4.08,4.08,0,0,1-2.05.55,3.89,3.89,0,0,1-3.14-1.26,5,5,0,0,1-1.07-3.38V11.11h2.07v6.42q0,3.09,2.73,3.09a2.54,2.54,0,0,0,2.1-1,3.77,3.77,0,0,0,.81-2.39V11.11h2.07Z\" /><path class=\"cls-5\" d=\"M172.09,22.51a4.86,4.86,0,0,1-3.7-1.69,6,6,0,0,1-1.55-4.19,6,6,0,0,1,1.55-4.19,4.86,4.86,0,0,1,3.7-1.69,4.69,4.69,0,0,1,2.26.54,3.83,3.83,0,0,1,1.5,1.35h.09l-.09-1.53V6h2.07V22.15h-2V20.62h-.09a3.83,3.83,0,0,1-1.5,1.35A4.69,4.69,0,0,1,172.09,22.51Zm.34-1.89a3.3,3.3,0,0,0,2.49-1.08,4.05,4.05,0,0,0,1-2.91,4.05,4.05,0,0,0-1-2.91,3.38,3.38,0,0,0-5,0,4,4,0,0,0-1,2.9,4,4,0,0,0,1,2.9A3.3,3.3,0,0,0,172.43,20.62Z\" />",
	"styles": [".cls-1{fill:#ea4335;}.cls-2{fill:#4285f4;}.cls-3{fill:#34a853;}.cls-4{fill:#fbbc05;}.cls-5{fill:#ffffff;}"]
});
//#endregion
//#region src/assets/partners/jrcai.png
var jrcai_exports = /* @__PURE__ */ __exportAll({ default: () => jrcai_default });
var jrcai_default = createImageAsset({
	"src": "/_astro/jrcai.CjF7SkKZ.png",
	"width": 533,
	"height": 191,
	"format": "png"
}, "/home/user/website/src/assets/partners/jrcai.png", false);
//#endregion
//#region src/assets/partners/kaust.svg
var kaust_exports = /* @__PURE__ */ __exportAll({ default: () => kaust_default });
var kaust_default = createSvgComponent({
	"meta": {
		"src": "/_astro/kaust.NM4CVTbL.svg",
		"width": 63,
		"height": 61,
		"format": "svg"
	},
	"attributes": {
		"id": "Layer_1",
		"x": "0px",
		"y": "0px",
		"width": "63.176px",
		"height": "60.795px",
		"viewBox": "0 0 63.176 60.795",
		"enable-background": "new 0 0 63.176 60.795",
		"xml:space": "preserve"
	},
	"children": "\r\n<path fill=\"#F7944A\" d=\"M41.651,36.553c0.939-1.295,1.412-2.969,1.412-5.021c0-1.241-0.174-2.327-0.471-3.289\r\n	c-1.064,1.02-1.75,2.277-1.75,3.81C40.843,33.299,41.103,34.902,41.651,36.553\" />\r\n<path fill=\"#F7944A\" d=\"M53.524,24.677c0.33,1.805,0.488,3.633,0.488,5.409c0,6.71-1.307,11.516-3.303,14.951\r\n	c0.334,0.035,0.674,0.062,1.029,0.062c9.396,0,11.436-8.743,11.436-12.544C63.175,26.468,56.95,24.837,53.524,24.677\" />\r\n<path fill=\"#F7944A\" d=\"M44.073,31.531c0,2.551-0.713,4.564-2.029,6.082c0.359,0.879,0.797,1.752,1.328,2.577\r\n	c1.844-2.118,2.783-5.161,2.783-9.14c0-1.671-0.275-3.226-0.77-4.653c-0.701,0.33-1.367,0.706-1.959,1.141\r\n	C43.825,28.69,44.073,29.997,44.073,31.531\" />\r\n<path fill=\"#F7944A\" d=\"M47.333,31.051c0,4.807-1.303,8.01-3.262,10.129c0.494,0.635,1.059,1.217,1.678,1.734\r\n	c2.074-2.604,3.451-6.516,3.451-12.348c0-1.786-0.238-3.571-0.695-5.276c-0.676,0.174-1.357,0.39-2.025,0.643\r\n	C47.026,27.501,47.333,29.212,47.333,31.051\" />\r\n<path fill=\"#F7944A\" d=\"M50.687,30.566c0,6.24-1.521,10.415-3.727,13.211c0.621,0.375,1.295,0.68,2.021,0.902\r\n	c2.039-3.262,3.342-7.945,3.342-14.594c0-0.939-0.076-2.971-0.535-5.368c-0.578,0.051-1.203,0.134-1.859,0.256\r\n	C50.427,26.803,50.687,28.697,50.687,30.566\" />\r\n<path fill=\"#FFBF0F\" d=\"M31.901,16.46c5.211,0,9.51,1.979,12.241,5.282c0.576-0.778,1.045-1.605,1.436-2.429\r\n	c-2.479-3.103-6.268-5.182-11.512-5.182c-2.758,0-7.863,0.666-12.367,2.372c0.078,0.548,0.258,1.089,0.531,1.617\r\n	C25.424,16.97,29.018,16.46,31.901,16.46\" />\r\n<path fill=\"#FFBF0F\" d=\"M46.966,12.479C46.604,7.761,44.116,0,35.444,0c-6.708,0-10.749,6.33-12.599,11.13\r\n	c5.105-1.601,10.348-2.242,13.394-2.242C40.784,8.888,44.296,10.279,46.966,12.479\" />\r\n<path fill=\"#FFBF0F\" d=\"M24.405,20.762c1.581-0.365,3.372-0.559,5.34-0.559c2.932,0,8.504,0.52,11.768,4.068\r\n	c0.689-0.454,1.303-0.99,1.844-1.583c-2.508-3.151-6.543-5.051-11.455-5.051c-2.695,0-6.056,0.453-9.042,1.477\r\n	C23.289,19.687,23.806,20.238,24.405,20.762\" />\r\n<path fill=\"#FFBF0F\" d=\"M40.573,24.812c-3.049-3.133-8.134-3.602-10.827-3.602c-1.571,0-3.013,0.133-4.319,0.374\r\n	c3.328,2.451,8.099,4.131,11.188,4.131C38.126,25.715,39.437,25.373,40.573,24.812\" />\r\n<path fill=\"#FFBF0F\" d=\"M34.065,12.647c5.406,0,9.402,2.096,12.131,5.206c0.447-1.236,0.691-2.362,0.779-3.159\r\n	c-2.375-2.408-5.789-4.117-10.736-4.117c-3.054,0-8.779,0.737-14.072,2.562c-0.193,0.662-0.328,1.244-0.416,1.739\r\n	C26.124,13.302,30.924,12.647,34.065,12.647\" />\r\n<path fill=\"#BDCC29\" d=\"M11.458,25.736c0-3.918,2.501-6.78,5.936-8.823c-0.502-0.332-1.031-0.601-1.574-0.786\r\n	c-3.232,2.104-5.486,4.898-5.486,8.526c0,3.224,1.191,7.378,3.335,11.452c0.359-0.028,0.699-0.094,1.02-0.201\r\n	C12.626,32.293,11.458,28.595,11.458,25.736\" />\r\n<path fill=\"#BDCC29\" d=\"M14.26,26.82c0-3.389,2.188-5.816,5.21-7.471c-0.251-0.536-0.542-1.017-0.887-1.411\r\n	c-3.241,1.798-5.64,4.321-5.64,7.798c0,2.674,1.09,6.135,3.018,9.515c0.314-0.231,0.612-0.491,0.884-0.794\r\n	C15.193,31.736,14.26,28.972,14.26,26.82\" />\r\n<path fill=\"#BDCC29\" d=\"M13.565,15.664c-0.434-0.041-0.843-0.057-1.207-0.057C8.425,15.607,0,18.855,0,24.848\r\n	c0,6.423,7.141,10.393,11.788,11.158c-2.024-4.065-3.143-8.143-3.143-11.354C8.645,20.893,10.623,17.942,13.565,15.664\" />\r\n<path fill=\"#BDCC29\" d=\"M16.931,27.904c0-2.254,1.177-4.119,3.258-5.451c-0.045-0.751-0.149-1.426-0.319-2.021\r\n	c-2.595,1.459-4.433,3.54-4.433,6.388c0,1.89,0.764,4.285,2.141,6.677c0.269-0.414,0.505-0.867,0.724-1.335\r\n	C17.421,30.622,16.931,29.124,16.931,27.904\" />\r\n<path fill=\"#BDCC29\" d=\"M17.938,27.904c0,0.905,0.306,1.978,0.848,3.099c1.025-2.771,1.375-5.905,1.442-7.354\r\n	C18.76,24.759,17.938,26.203,17.938,27.904\" />\r\n<path fill=\"#00AB9E\" d=\"M32.98,40.838c-4.651,0-8.611-2.041-11.439-4.656c-0.525,0.211-1.042,0.444-1.552,0.696\r\n	c3.251,3.8,8.036,6.905,13.74,6.905c2.758,0,5.049-0.488,6.895-1.444c-0.373-1.005-0.863-1.883-1.453-2.64\r\n	C37.507,40.435,35.46,40.838,32.98,40.838\" />\r\n<path fill=\"#00AB9E\" d=\"M14.555,40.693c-1.987,1.981-3.274,4.254-3.274,6.482c0,8.711,13.563,13.619,18.815,13.619\r\n	c6.222,0,9.134-3.943,10.396-8.125c-1.885,0.471-3.713,0.626-5.303,0.626C26.507,53.296,19.269,47.535,14.555,40.693\" />\r\n<path fill=\"#00AB9E\" d=\"M27.984,34.81c-1.749,0-3.603,0.368-5.417,0.989c2.626,2.28,6.215,4.031,10.413,4.031\r\n	c2.202,0,4.012-0.332,5.497-0.936C35.192,35.481,30.009,34.81,27.984,34.81\" />\r\n<path fill=\"#00AB9E\" d=\"M33.729,44.962c-6.15,0-11.298-3.409-14.76-7.544c-0.394,0.221-0.786,0.444-1.164,0.688\r\n	c3.824,5.199,9.659,9.563,16.66,9.563c2.264,0,4.67-0.353,6.871-1.339c-0.016-1.043-0.145-1.988-0.359-2.853\r\n	C38.714,44.59,36.134,44.962,33.729,44.962\" />\r\n<path fill=\"#00AB9E\" d=\"M34.464,49.154c-7.497,0-13.745-4.678-17.833-10.242c-0.301,0.223-0.58,0.459-0.863,0.694\r\n	c4.41,6.501,11.23,11.999,19.422,11.999c1.881,0,3.848-0.225,5.752-0.801c0.193-0.992,0.311-1.963,0.363-2.869\r\n	C38.921,48.875,36.47,49.154,34.464,49.154\" />\r\n",
	"styles": []
});
//#endregion
//#region src/assets/partners/photography-club.jpg
var photography_club_exports = /* @__PURE__ */ __exportAll({ default: () => photography_club_default });
var photography_club_default = createImageAsset({
	"src": "/_astro/photography-club.C0lFRahs.jpg",
	"width": 324,
	"height": 324,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/photography-club.jpg", false);
//#endregion
//#region src/assets/partners/replit.svg
var replit_exports = /* @__PURE__ */ __exportAll({ default: () => replit_default });
var replit_default = createSvgComponent({
	"meta": {
		"src": "/_astro/replit.DFoLmzM-.svg",
		"width": 32,
		"height": 32,
		"format": "svg"
	},
	"attributes": {
		"width": "32",
		"height": "32",
		"viewBox": "0 0 32 32",
		"fill": "none"
	},
	"children": "\n<path d=\"M6 5.5C6 4.67157 6.67157 4 7.5 4H14.5C15.3284 4 16 4.67157 16 5.5V12H7.5C6.67157 12 6 11.3284 6 10.5V5.5Z\" fill=\"#F26207\" />\n<path d=\"M16 12H24.5C25.3284 12 26 12.6716 26 13.5V18.5C26 19.3284 25.3284 20 24.5 20H16V12Z\" fill=\"#F26207\" />\n<path d=\"M6 21.5C6 20.6716 6.67157 20 7.5 20H16V26.5C16 27.3284 15.3284 28 14.5 28H7.5C6.67157 28 6 27.3284 6 26.5V21.5Z\" fill=\"#F26207\" />\n",
	"styles": []
});
//#endregion
//#region src/assets/partners/stc.svg
var stc_exports = /* @__PURE__ */ __exportAll({ default: () => stc_default });
var stc_default = createSvgComponent({
	"meta": {
		"src": "/_astro/stc.BzgpF8Yq.svg",
		"width": 1e3,
		"height": 500,
		"format": "svg"
	},
	"attributes": {
		"viewBox": "0 0 1000 499.61411",
		"id": "svg10",
		"sodipodi:docname": "STC.svg",
		"width": "1000",
		"height": "499.61411",
		"inkscape:version": "1.2.1 (9c6d41e410, 2022-07-14)",
		"xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape",
		"xmlns:sodipodi": "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd",
		"xmlns:svg": "http://www.w3.org/2000/svg"
	},
	"children": "\n  <defs id=\"defs14\" />\n  <sodipodi:namedview id=\"namedview12\" pagecolor=\"#ffffff\" bordercolor=\"#666666\" borderopacity=\"1.0\" inkscape:showpageshadow=\"2\" inkscape:pageopacity=\"0.0\" inkscape:pagecheckerboard=\"0\" inkscape:deskcolor=\"#d1d1d1\" showgrid=\"false\" inkscape:zoom=\"0.70710678\" inkscape:cx=\"528.20877\" inkscape:cy=\"251.73001\" inkscape:window-width=\"1366\" inkscape:window-height=\"705\" inkscape:window-x=\"-8\" inkscape:window-y=\"-8\" inkscape:window-maximized=\"1\" inkscape:current-layer=\"svg10\" /><!-- Generator: Sketch 61 (89581) - https://sketch.com -->\n  <title id=\"title2\">stc logo</title>\n  <desc id=\"desc4\">Created with Sketch.</desc>\n  <path id=\"path885\" style=\"fill:#4f008c;fill-rule:nonzero;stroke:none;stroke-width:2.50276\" d=\"M 382.87891 0 L 382.87891 105.05859 L 485.59961 105.05859 L 485.59961 0 L 382.87891 0 z M 485.59961 105.05859 L 485.59961 204.67188 L 588.32227 204.67188 L 588.32227 105.05859 L 485.59961 105.05859 z M 485.59961 204.67188 L 382.87891 204.67188 L 382.87891 381.32422 C 382.87891 417.12089 393.77561 445.92122 413.22461 466.15039 C 435.01688 487.94404 466.92543 499.61328 506.61328 499.61328 C 547.08267 499.61328 575.87133 487.1637 588.32227 476.26758 L 588.32227 392.2207 C 578.98786 399.22702 560.31224 407.7793 536.18359 407.7793 C 519.06266 407.7793 506.61224 403.88983 497.26953 395.33008 C 489.48994 387.55047 485.59961 374.32629 485.59961 356.42383 L 485.59961 204.67188 z M 161.08594 93.388672 C 113.61849 93.388672 73.93025 108.9477 46.693359 133.84961 C 23.346271 155.64189 10.115234 185.2145 10.115234 217.9043 C 10.115234 246.69462 19.457645 270.82234 38.134766 289.49805 C 56.810501 308.17517 84.047085 322.17908 119.84375 330.74023 L 178.98828 344.75391 C 208.56153 351.75194 221.79297 362.64819 221.79297 382.10547 C 221.79297 406.22582 200.00117 420.23047 164.20312 420.23047 C 138.51967 420.23047 117.50847 411.67812 104.27734 397.66406 C 94.942929 388.33103 89.490063 375.87984 88.716797 361.86719 L 0 381.32422 C 2.3363659 407.77955 14.78577 431.1353 33.462891 449.80273 C 63.034765 480.93772 110.50262 499.61328 164.20312 499.61328 C 216.34054 499.61328 259.14412 483.274 287.1543 456.03711 C 308.17467 435.01809 320.625 407.00631 320.625 374.32617 C 320.625 344.75293 309.72907 318.28914 289.49023 298.05859 C 269.26108 277.81975 240.46055 263.03517 203.89062 256.03711 L 143.96484 244.35938 C 119.06433 239.68803 105.05859 227.23754 105.05859 210.11523 C 105.05859 187.5497 126.84103 171.99023 161.86719 171.99023 C 183.65118 171.99023 202.33616 178.98851 214.78711 191.43945 C 222.56671 199.99922 228.00916 210.8967 229.57227 223.34766 L 315.95312 203.89062 C 313.61813 178.98872 301.94105 157.20463 284.04688 139.30078 C 256.02841 111.28234 212.4501 93.388672 161.08594 93.388672 z M 817.89453 93.388672 C 762.64885 93.388672 712.83712 114.39922 677.03906 150.19727 C 641.24102 186.77685 619.45703 237.35096 619.45703 296.49609 C 619.45703 355.64122 642.02393 406.22648 678.60352 442.80469 C 714.3919 478.60274 764.98312 499.61328 821.01172 499.61328 C 878.60204 499.61328 922.9615 478.60314 953.30664 449.03125 C 977.43529 425.68416 992.22039 398.44617 1000 370.42773 L 908.94727 340.08203 C 905.05746 354.08643 897.27761 368.87357 884.81836 380.54297 C 870.03242 394.55702 849.80205 404.67188 821.01172 404.67188 C 794.55499 404.67188 769.64751 394.55679 751.75195 376.6543 C 733.84946 357.97719 722.96094 330.73931 722.96094 296.49609 C 722.96094 261.47961 733.84946 235.01706 751.75195 216.34961 C 769.64751 198.44576 793.77514 189.11133 820.23047 189.11133 C 848.24892 189.11133 867.70654 198.44541 881.71094 212.45117 C 893.38862 224.12886 900.38725 238.91524 905.05859 253.70117 L 997.66406 222.56641 C 990.65772 195.32951 975.87326 168.09093 954.08789 145.52539 C 922.96119 115.18025 877.82119 93.388672 817.89453 93.388672 z \" />\n",
	"styles": []
});
//#endregion
//#region src/assets/partners/stream.png
var stream_exports = /* @__PURE__ */ __exportAll({ default: () => stream_default });
var stream_default = createImageAsset({
	"src": "/_astro/stream.CCo8a4Ne.png",
	"width": 398,
	"height": 83,
	"format": "png"
}, "/home/user/website/src/assets/partners/stream.png", false);
//#endregion
//#region src/assets/partners/thakaa.png
var thakaa_exports = /* @__PURE__ */ __exportAll({ default: () => thakaa_default });
var thakaa_default = createImageAsset({
	"src": "/_astro/thakaa.Cpi9Djsu.png",
	"width": 700,
	"height": 139,
	"format": "png"
}, "/home/user/website/src/assets/partners/thakaa.png", false);
//#endregion
//#region src/assets/partners/voluntary-work-unit.png
var voluntary_work_unit_exports = /* @__PURE__ */ __exportAll({ default: () => voluntary_work_unit_default });
var voluntary_work_unit_default = createImageAsset({
	"src": "/_astro/voluntary-work-unit.CKEwmBJ-.png",
	"width": 285,
	"height": 212,
	"format": "png"
}, "/home/user/website/src/assets/partners/voluntary-work-unit.png", false);
//#endregion
//#region src/assets/partners/x-actuarial_kfupm.jpg
var x_actuarial_kfupm_exports = /* @__PURE__ */ __exportAll({ default: () => x_actuarial_kfupm_default });
var x_actuarial_kfupm_default = createImageAsset({
	"src": "/_astro/x-actuarial_kfupm.BBAwHtXb.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-actuarial_kfupm.jpg", false);
//#endregion
//#region src/assets/partners/x-airobotclub_iau.jpg
var x_airobotclub_iau_exports = /* @__PURE__ */ __exportAll({ default: () => x_airobotclub_iau_default });
var x_airobotclub_iau_default = createImageAsset({
	"src": "/_astro/x-airobotclub_iau.CwvSMx0H.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-airobotclub_iau.jpg", false);
//#endregion
//#region src/assets/partners/x-cieclub.jpg
var x_cieclub_exports = /* @__PURE__ */ __exportAll({ default: () => x_cieclub_default });
var x_cieclub_default = createImageAsset({
	"src": "/_astro/x-cieclub.B4OOeyPd.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-cieclub.jpg", false);
//#endregion
//#region src/assets/partners/x-eec_kfupm.jpg
var x_eec_kfupm_exports = /* @__PURE__ */ __exportAll({ default: () => x_eec_kfupm_default });
var x_eec_kfupm_default = createImageAsset({
	"src": "/_astro/x-eec_kfupm.CIAxaELK.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-eec_kfupm.jpg", false);
//#endregion
//#region src/assets/partners/x-gdsc_kfupm.jpg
var x_gdsc_kfupm_exports = /* @__PURE__ */ __exportAll({ default: () => x_gdsc_kfupm_default });
var x_gdsc_kfupm_default = createImageAsset({
	"src": "/_astro/x-gdsc_kfupm.BfK3GVy5.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-gdsc_kfupm.jpg", false);
//#endregion
//#region src/assets/partners/x-kaust_academy.jpg
var x_kaust_academy_exports = /* @__PURE__ */ __exportAll({ default: () => x_kaust_academy_default });
var x_kaust_academy_default = createImageAsset({
	"src": "/_astro/x-kaust_academy.BJaZaGnf.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-kaust_academy.jpg", false);
//#endregion
//#region src/assets/partners/x-kfupm_faec.jpg
var x_kfupm_faec_exports = /* @__PURE__ */ __exportAll({ default: () => x_kfupm_faec_default });
var x_kfupm_faec_default = createImageAsset({
	"src": "/_astro/x-kfupm_faec.BoMcMtzC.jpg",
	"width": 399,
	"height": 399,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-kfupm_faec.jpg", false);
//#endregion
//#region src/assets/partners/x-kfupm_kikx.jpg
var x_kfupm_kikx_exports = /* @__PURE__ */ __exportAll({ default: () => x_kfupm_kikx_default });
var x_kfupm_kikx_default = createImageAsset({
	"src": "/_astro/x-kfupm_kikx.Bi7Ab5Aw.jpg",
	"width": 374,
	"height": 374,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-kfupm_kikx.jpg", false);
//#endregion
//#region src/assets/partners/x-kfupmvolunteers.jpg
var x_kfupmvolunteers_exports = /* @__PURE__ */ __exportAll({ default: () => x_kfupmvolunteers_default });
var x_kfupmvolunteers_default = createImageAsset({
	"src": "/_astro/x-kfupmvolunteers.BdhcxBtd.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-kfupmvolunteers.jpg", false);
//#endregion
//#region src/assets/partners/x-meettechnology.jpg
var x_meettechnology_exports = /* @__PURE__ */ __exportAll({ default: () => x_meettechnology_default });
var x_meettechnology_default = createImageAsset({
	"src": "/_astro/x-meettechnology.BeP67-ZT.jpg",
	"width": 400,
	"height": 400,
	"format": "jpg"
}, "/home/user/website/src/assets/partners/x-meettechnology.jpg", false);
//#endregion
//#region src/lib/photos.ts
var localPhotos = /* #__PURE__ */ Object.assign({
	"../assets/photos/2021-11-18_1461424996052520960.jpg": _2021_11_18_1461424996052520960_exports,
	"../assets/photos/2022-11-14_1592111879358484480.jpg": _2022_11_14_1592111879358484480_exports,
	"../assets/photos/2022-11-15_1592548101872832515.jpg": _2022_11_15_1592548101872832515_exports,
	"../assets/photos/2022-12-19_1604855828833570816.jpg": _2022_12_19_1604855828833570816_exports,
	"../assets/photos/2023-01-25_1618224758306529280.jpg": _2023_01_25_1618224758306529280_exports,
	"../assets/photos/2023-01-26_1618587590055333888.jpg": _2023_01_26_1618587590055333888_exports,
	"../assets/photos/2023-02-01_1620676655600779265.jpg": _2023_02_01_1620676655600779265_exports,
	"../assets/photos/2023-02-09_1623696515263856645.jpg": _2023_02_09_1623696515263856645_exports,
	"../assets/photos/2023-02-13_1625031384392781828.jpg": _2023_02_13_1625031384392781828_exports,
	"../assets/photos/2023-02-17_1626580038513750022.jpg": _2023_02_17_1626580038513750022_exports,
	"../assets/photos/2023-02-18_1626977922769686532.jpg": _2023_02_18_1626977922769686532_exports,
	"../assets/photos/2023-02-19_1627334418477027328.jpg": _2023_02_19_1627334418477027328_exports,
	"../assets/photos/2023-02-19_1627334441352691715.jpg": _2023_02_19_1627334441352691715_exports,
	"../assets/photos/2023-02-19_1627334457362374656.jpg": _2023_02_19_1627334457362374656_exports,
	"../assets/photos/2023-02-19_1627334471740538885.jpg": _2023_02_19_1627334471740538885_exports,
	"../assets/photos/2023-02-19_1627334485116166147.jpg": _2023_02_19_1627334485116166147_exports,
	"../assets/photos/2023-03-10_1634237904884215809.jpg": _2023_03_10_1634237904884215809_exports,
	"../assets/photos/2023-04-02_1642669962069262336.jpg": _2023_04_02_1642669962069262336_exports,
	"../assets/photos/2023-04-10_1645521699012575248.jpg": _2023_04_10_1645521699012575248_exports,
	"../assets/photos/2023-05-08_1655532666228297733.jpg": _2023_05_08_1655532666228297733_exports,
	"../assets/photos/2023-05-15_1658203167425699850.jpg": _2023_05_15_1658203167425699850_exports,
	"../assets/photos/2023-09-24_1705965808340414726.jpg": _2023_09_24_1705965808340414726_exports,
	"../assets/photos/2023-10-05_1709879497476948298.jpg": _2023_10_05_1709879497476948298_exports,
	"../assets/photos/2023-10-05_1710052770403799547.jpg": _2023_10_05_1710052770403799547_exports,
	"../assets/photos/2023-10-06_1710393697978741041.jpg": _2023_10_06_1710393697978741041_exports,
	"../assets/photos/2023-10-06_1710393716165206361.jpg": _2023_10_06_1710393716165206361_exports,
	"../assets/photos/2023-10-27_1717887423932235810.jpg": _2023_10_27_1717887423932235810_exports,
	"../assets/photos/2023-11-02_1720117729473057111.jpg": _2023_11_02_1720117729473057111_exports,
	"../assets/photos/2023-11-08_1722207975157436836.jpg": _2023_11_08_1722207975157436836_exports,
	"../assets/photos/2023-11-13_1723997385997561915.jpg": _2023_11_13_1723997385997561915_exports,
	"../assets/photos/2023-11-28_1729387940701151682.jpg": _2023_11_28_1729387940701151682_exports,
	"../assets/photos/2023-11-29_1729746614653161705.jpg": _2023_11_29_1729746614653161705_exports,
	"../assets/photos/2023-11-30_1730211245867802749.jpg": _2023_11_30_1730211245867802749_exports,
	"../assets/photos/2023-11-30_1730314930832732261.jpg": _2023_11_30_1730314930832732261_exports,
	"../assets/photos/2023-12-03_1731292973663457737.jpg": _2023_12_03_1731292973663457737_exports,
	"../assets/photos/2023-12-03_1731293063736143941.jpg": _2023_12_03_1731293063736143941_exports,
	"../assets/photos/2023-12-03_1731293084665950378.jpg": _2023_12_03_1731293084665950378_exports,
	"../assets/photos/2023-12-06_1732356471982043620.jpg": _2023_12_06_1732356471982043620_exports,
	"../assets/photos/2024-01-25_1750466051257610585.jpg": _2024_01_25_1750466051257610585_exports,
	"../assets/photos/2024-02-06_1754768354974257462.jpg": _2024_02_06_1754768354974257462_exports,
	"../assets/photos/2024-02-07_1755148899864518982.jpg": _2024_02_07_1755148899864518982_exports,
	"../assets/photos/2024-02-08_1755578530677637289.jpg": _2024_02_08_1755578530677637289_exports,
	"../assets/photos/2024-02-12_1757048642790187243.jpg": _2024_02_12_1757048642790187243_exports,
	"../assets/photos/2024-02-13_1757404213083046384.jpg": _2024_02_13_1757404213083046384_exports,
	"../assets/photos/2024-02-14_1757712935655260400.jpg": _2024_02_14_1757712935655260400_exports,
	"../assets/photos/2024-02-14_1757867157617070427.jpg": _2024_02_14_1757867157617070427_exports,
	"../assets/photos/2024-03-10_1766907280203624486.jpg": _2024_03_10_1766907280203624486_exports,
	"../assets/photos/2024-03-17_1769505136064282669.jpg": _2024_03_17_1769505136064282669_exports,
	"../assets/photos/2024-03-19_1769880969639518423.jpg": _2024_03_19_1769880969639518423_exports,
	"../assets/photos/2024-03-20_1770266404811395169.jpg": _2024_03_20_1770266404811395169_exports,
	"../assets/photos/2024-03-24_1772041072769679652.jpg": _2024_03_24_1772041072769679652_exports,
	"../assets/photos/2024-04-25_1783465960931832006.jpg": _2024_04_25_1783465960931832006_exports,
	"../assets/photos/2024-04-26_1783838738101178565.jpg": _2024_04_26_1783838738101178565_exports,
	"../assets/photos/2024-04-30_1785217635640132045.jpg": _2024_04_30_1785217635640132045_exports,
	"../assets/photos/2024-05-01_1785567400550662586.jpg": _2024_05_01_1785567400550662586_exports,
	"../assets/photos/2024-05-01_1785727003213042026.jpg": _2024_05_01_1785727003213042026_exports,
	"../assets/photos/2024-05-07_1787837453123846484.jpg": _2024_05_07_1787837453123846484_exports,
	"../assets/photos/2024-05-07_1787837468470812860.jpg": _2024_05_07_1787837468470812860_exports,
	"../assets/photos/2024-05-07_1787837500515307525.jpg": _2024_05_07_1787837500515307525_exports,
	"../assets/photos/2024-05-07_1787837515770003470.jpg": _2024_05_07_1787837515770003470_exports,
	"../assets/photos/2024-05-07_1787837532714995751.jpg": _2024_05_07_1787837532714995751_exports,
	"../assets/photos/2024-05-07_1787837550565933250.jpg": _2024_05_07_1787837550565933250_exports,
	"../assets/photos/2024-05-07_1787837569968820574.jpg": _2024_05_07_1787837569968820574_exports,
	"../assets/photos/2024-05-07_1787837587085803802.jpg": _2024_05_07_1787837587085803802_exports,
	"../assets/photos/2024-05-07_1787837608648659400.jpg": _2024_05_07_1787837608648659400_exports,
	"../assets/photos/2024-05-14_1790391068023791895.jpg": _2024_05_14_1790391068023791895_exports,
	"../assets/photos/2024-05-20_1792616103044174237.jpg": _2024_05_20_1792616103044174237_exports,
	"../assets/photos/2024-09-26_1839248619293028714.jpg": _2024_09_26_1839248619293028714_exports,
	"../assets/photos/2024-09-29_1840466306006659353.jpg": _2024_09_29_1840466306006659353_exports,
	"../assets/photos/2024-10-06_1842990131260834264.jpg": _2024_10_06_1842990131260834264_exports,
	"../assets/photos/2024-10-21_1848265386073940168.jpg": _2024_10_21_1848265386073940168_exports,
	"../assets/photos/2024-10-29_1851239307748532557.jpg": _2024_10_29_1851239307748532557_exports,
	"../assets/photos/2024-11-24_1860663399195066682.jpg": _2024_11_24_1860663399195066682_exports,
	"../assets/photos/2024-11-25_1861119863458029794.jpg": _2024_11_25_1861119863458029794_exports,
	"../assets/photos/2024-11-28_1862120985945608671.jpg": _2024_11_28_1862120985945608671_exports,
	"../assets/photos/2024-12-03_1864050646992793601.jpg": _2024_12_03_1864050646992793601_exports,
	"../assets/photos/2024-12-04_1864396918228422715.jpg": _2024_12_04_1864396918228422715_exports,
	"../assets/photos/2024-12-05_1864760431241211919.jpg": _2024_12_05_1864760431241211919_exports,
	"../assets/photos/2025-02-12_1889724538708988331.jpg": _2025_02_12_1889724538708988331_exports,
	"../assets/photos/2025-02-18_1891893230205088026.jpg": _2025_02_18_1891893230205088026_exports,
	"../assets/photos/2025-03-18_1901911196837818695.jpg": _2025_03_18_1901911196837818695_exports,
	"../assets/photos/2025-04-10_1910478806520914205.jpg": _2025_04_10_1910478806520914205_exports,
	"../assets/photos/2025-04-13_1911484448878526779.jpg": _2025_04_13_1911484448878526779_exports,
	"../assets/photos/2025-04-20_1913920617407009239.jpg": _2025_04_20_1913920617407009239_exports,
	"../assets/photos/2025-04-20_1913920636671438920.jpg": _2025_04_20_1913920636671438920_exports,
	"../assets/photos/2025-04-20_1913920653427691792.jpg": _2025_04_20_1913920653427691792_exports,
	"../assets/photos/2025-04-20_1913920668669821112.jpg": _2025_04_20_1913920668669821112_exports,
	"../assets/photos/2025-04-20_1913920688710168909.jpg": _2025_04_20_1913920688710168909_exports,
	"../assets/photos/2025-04-26_1916231780799053933.jpg": _2025_04_26_1916231780799053933_exports,
	"../assets/photos/2025-09-13_1966930489975226577.jpg": _2025_09_13_1966930489975226577_exports,
	"../assets/photos/2025-09-15_1967613383982936340.jpg": _2025_09_15_1967613383982936340_exports,
	"../assets/photos/2025-09-26_1971532633755865260.jpg": _2025_09_26_1971532633755865260_exports,
	"../assets/photos/2025-09-26_1971646693231010182.jpg": _2025_09_26_1971646693231010182_exports,
	"../assets/photos/2025-10-03_1974082470355370275.jpg": _2025_10_03_1974082470355370275_exports,
	"../assets/photos/2025-10-12_1977385330635362441.jpg": _2025_10_12_1977385330635362441_exports,
	"../assets/photos/2025-10-12_1977397509702988011.jpg": _2025_10_12_1977397509702988011_exports,
	"../assets/photos/2025-10-17_1979208323674013989.jpg": _2025_10_17_1979208323674013989_exports,
	"../assets/photos/2025-10-20_1980196823303397615.jpg": _2025_10_20_1980196823303397615_exports,
	"../assets/photos/2025-10-23_1981399639560507551.jpg": _2025_10_23_1981399639560507551_exports,
	"../assets/photos/2025-11-07_1986846367201861709.jpg": _2025_11_07_1986846367201861709_exports,
	"../assets/photos/2025-12-06_1997329598145544489.jpg": _2025_12_06_1997329598145544489_exports,
	"../assets/photos/2025-12-06_1997329877641421114.jpg": _2025_12_06_1997329877641421114_exports,
	"../assets/photos/2025-12-10_1998825273383399868.jpg": _2025_12_10_1998825273383399868_exports,
	"../assets/photos/2025-12-14_2000224482489667651.jpg": _2025_12_14_2000224482489667651_exports,
	"../assets/photos/2025-12-14_2000224783506563094.jpg": _2025_12_14_2000224783506563094_exports,
	"../assets/photos/2025-12-19_2002037765056434492.jpg": _2025_12_19_2002037765056434492_exports,
	"../assets/photos/2026-01-28_2016548505070817595.jpg": _2026_01_28_2016548505070817595_exports,
	"../assets/photos/2026-09-08_2097325969014984962.jpg": _2026_09_08_2097325969014984962_exports,
	"../assets/photos/2026-09-11_2098349741796983025.jpg": _2026_09_11_2098349741796983025_exports,
	"../assets/photos/2026-09-22_2102397545573974170.jpg": _2026_09_22_2102397545573974170_exports,
	"../assets/photos/2026-10-06_2107519660690165818.jpg": _2026_10_06_2107519660690165818_exports
});
var localLogos = /* #__PURE__ */ Object.assign({
	"../assets/partners/3d-solutions.png": _3d_solutions_exports,
	"../assets/partners/accenture.svg": accenture_exports,
	"../assets/partners/aws.svg": aws_exports,
	"../assets/partners/google-cloud.svg": google_cloud_exports,
	"../assets/partners/jrcai.png": jrcai_exports,
	"../assets/partners/kaust.svg": kaust_exports,
	"../assets/partners/photography-club.jpg": photography_club_exports,
	"../assets/partners/replit.svg": replit_exports,
	"../assets/partners/stc.svg": stc_exports,
	"../assets/partners/stream.png": stream_exports,
	"../assets/partners/thakaa.png": thakaa_exports,
	"../assets/partners/voluntary-work-unit.png": voluntary_work_unit_exports,
	"../assets/partners/x-actuarial_kfupm.jpg": x_actuarial_kfupm_exports,
	"../assets/partners/x-airobotclub_iau.jpg": x_airobotclub_iau_exports,
	"../assets/partners/x-cieclub.jpg": x_cieclub_exports,
	"../assets/partners/x-eec_kfupm.jpg": x_eec_kfupm_exports,
	"../assets/partners/x-gdsc_kfupm.jpg": x_gdsc_kfupm_exports,
	"../assets/partners/x-kaust_academy.jpg": x_kaust_academy_exports,
	"../assets/partners/x-kfupm_faec.jpg": x_kfupm_faec_exports,
	"../assets/partners/x-kfupm_kikx.jpg": x_kfupm_kikx_exports,
	"../assets/partners/x-kfupmvolunteers.jpg": x_kfupmvolunteers_exports,
	"../assets/partners/x-meettechnology.jpg": x_meettechnology_exports
});
var WIDTHS = [
	480,
	960,
	1600
];
var SIZE_NAMES = [
	"480",
	"960",
	"1600"
];
var mediaCache = null;
async function mediaMap() {
	if (mediaCache && Date.now() - mediaCache.at < 6e4) return mediaCache.map;
	const { data } = await publicClient().from("media").select("key,kind,alt,width,height,sizes,path");
	const map = new Map((data || []).map((m) => [m.key, m]));
	mediaCache = {
		at: Date.now(),
		map
	};
	return map;
}
var invalidateMedia = () => {
	mediaCache = null;
};
function mediaImg(m) {
	const sizes = m.sizes || {};
	const names = SIZE_NAMES.filter((n) => sizes[n]);
	return {
		src: sizes["960"] || sizes["1600"] || sizes["480"] || sizes.file || publicUrl(m.path),
		srcset: names.length ? names.map((n) => `${sizes[n]} ${n}w`).join(", ") : void 0,
		width: m.width ?? void 0,
		height: m.height ?? void 0
	};
}
var imgCache = /* @__PURE__ */ new Map();
function photoImg(key, kind = "photo") {
	if (!key) return Promise.resolve(null);
	const ck = `${kind}:${key}:${dbReady() ? "db" : "seed"}`;
	if (!imgCache.has(ck)) imgCache.set(ck, (async () => {
		if (dbReady()) {
			const m = (await mediaMap()).get(key);
			return m ? mediaImg(m) : null;
		}
		const mod = kind === "logo" ? localLogos[`../assets/partners/${key}`] : localPhotos[`../assets/photos/${key}`];
		if (!mod) return null;
		const meta = mod.default;
		if (kind === "logo" || meta.format === "svg") {
			const r = await getImage({
				src: meta,
				width: Math.min(meta.width, 600)
			});
			return {
				src: r.src,
				width: r.attributes.width,
				height: r.attributes.height
			};
		}
		const r = await getImage({
			src: meta,
			widths: WIDTHS,
			format: "webp"
		});
		return {
			src: r.src,
			srcset: r.srcSet.attribute,
			width: r.attributes.width,
			height: r.attributes.height
		};
	})());
	if (dbReady()) {
		const p = imgCache.get(ck);
		setTimeout(() => imgCache.delete(ck), 6e4);
		return p;
	}
	return imgCache.get(ck);
}
var seedPhotoKeys = () => Object.keys(localPhotos).map((p) => p.split("/").pop()).sort();
var site_default = {
	name: "KFUPM Computer Club",
	short: "CCKFUPM",
	tagline: "Where curious minds build the future.",
	description: "The KFUPM Computer Club: a supportive platform for students to discover their strengths, talents and passions and turn them into real projects, events and skills.",
	email: "REPLACE@kfupm.edu.sa",
	links: {
		"join": "REPLACE",
		"discord": "REPLACE",
		"whatsapp": "REPLACE",
		"instagram": "https://instagram.com/kfupm_cc",
		"x": "https://twitter.com/kfupm_cc",
		"linkedin": "https://linkedin.com/company/kfupmcclub",
		"github": "https://github.com/KFUPM-COMPUTER-CLUB/website",
		"solvers": "REPLACE"
	},
	faq: [
		{
			"q": "Do I need to study computer science?",
			"a": "No. Members come from every college at KFUPM. If you are curious about technology, you belong here."
		},
		{
			"q": "Is it free?",
			"a": "Yes. Membership, events and workshops are free for KFUPM students."
		},
		{
			"q": "I'm a complete beginner. Where do I start?",
			"a": "Come to any workshop. They start from zero, and there is always someone to ask. Recent ones covered Git, web development, React, Flutter, Arduino, prompt engineering, cloud computing and Claude."
		},
		{
			"q": "How do I join?",
			"a": "Use the Join button at the top of the site. Applications open at the start of each term, and the orientation meeting is where you meet the teams."
		},
		{
			"q": "How do I know when something is happening?",
			"a": "Every event is on the Timeline page with one-click Google, Outlook and Apple calendar links. We also announce everything on X at @KFUPM_CC, Instagram and LinkedIn."
		},
		{
			"q": "Where do events take place?",
			"a": "On the KFUPM campus. Each announcement names the building and room, and some sessions run online."
		},
		{
			"q": "Can students from other universities take part?",
			"a": "Some events are open beyond KFUPM. Techathon hosted teams from universities across the Kingdom, and KAUST Connect welcomed students from IAU and KFU. Each announcement says who can register."
		},
		{
			"q": "Are there prizes?",
			"a": "Yes. Competitions and hackathons come with announced prize pools, from 3,000 SAR challenges to the 40,000 SAR Streamathon. The Impact section on the home page lists them by semester."
		},
		{
			"q": "How do I get involved beyond attending?",
			"a": "Join a team: events, media or technical. Write for the blog. Or propose a workshop you want to run; the officers will help you set it up."
		},
		{
			"q": "Can I write for the blog?",
			"a": "Yes. Members write the posts: event recaps, tutorials, and what they learned. Talk to any officer and they will get you started."
		},
		{
			"q": "My company wants to work with the club. Who do I contact?",
			"a": "Open the Officers page and reach the leadership team directly. Companies have run hackathons, talks, office visits and workshops with us."
		}
	],
	intro: "KFUPM's student-run home for everyone who builds with technology. Any major, no experience required.",
	missionAr: "توفير منصة داعمة للطلاب لاكتشاف وإشراك مواطن قوتهم، مواهبهم، وشغفهم في ما يعود لهم بالفائدة ويمكنهم من تحقيق أهدافهم المستقبلية.",
	madeBy: [{
		"name": "Adib Alqurashi",
		"github": "adib-alqurashi"
	}, {
		"name": "Yogesh Krishna Thakur",
		"github": "YKrishna17"
	}],
	contributorsUrl: "https://github.com/KFUPM-COMPUTER-CLUB/website/blob/main/CONTRIBUTORS.md",
	_madeBy_note: "Names shown after 'Made by' in the footer; 'github' is optional. 'contributorsUrl' is the Contributors link.",
	_links_note: "'solvers' is an optional endpoint that receives flag solvers' names as JSON; while it says REPLACE the flag page opens a prefilled GitHub issue instead."
};
//#endregion
//#region src/data/events.json
var events_default = [
	{
		"id": "2025-leap-trip",
		"title": "LEAP 2025 trip",
		"type": "Trip",
		"date": "2025-02-12",
		"location": "Riyadh",
		"summary": "Club members at LEAP, the Kingdom's largest tech conference.",
		"image": "2025-02-12_1889724538708988331.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1889724538708988331",
		"time": ""
	},
	{
		"id": "2025-swe363-competition",
		"title": "SWE 363 competition",
		"type": "Competition",
		"date": "2025-02-18",
		"location": "KFUPM",
		"summary": "Web engineering course competition. Thanks to every participant; congratulations to the top three.",
		"image": "2025-02-18_1891893230205088026.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1891893230205088026",
		"time": ""
	},
	{
		"id": "2025-intro-cloud-meet",
		"title": "Intro to Cloud Computing",
		"type": "Talk",
		"date": "2025-01-28",
		"time": "8:00 PM – 9:30 PM",
		"location": "KFUPM",
		"summary": "First meeting of the term, with Meet Technology. Mohammed Al-Dulaijan on cloud computing fundamentals.",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1883573196701757526"
	},
	{
		"id": "2025-techathon",
		"title": "KFUPM Techathon 2025",
		"type": "Hackathon",
		"date": "2025-04-10",
		"endDate": "2025-04-13",
		"location": "Building 22, KFUPM",
		"summary": "Teams from across the Kingdom. Day 1 was a three-hour design phase; 11 teams pitched to the jury on the final day. Winners: Belligol, Muarshf, Mifaq; best design CodeSparksYU; best idea Fussha.",
		"image": "2025-04-20_1913920617407009239.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1911484448878526779",
		"time": ""
	},
	{
		"id": "2025-orientation",
		"title": "Orientation meeting",
		"type": "Social",
		"date": "2025-09-15",
		"location": "KFUPM",
		"summary": "Meet the club, its teams, and the plan for the term. Applications opened the same week.",
		"image": "2025-09-15_1967613383982936340.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1967613383982936340",
		"time": ""
	},
	{
		"id": "2025-makers-days",
		"title": "Makers Days at SciTech",
		"type": "Exhibition",
		"date": "2025-09-26",
		"location": "SciTech, Al Khobar",
		"summary": "The club's showcase at the Makers Days exhibition.",
		"image": "2025-09-26_1971532633755865260.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1971532633755865260",
		"time": ""
	},
	{
		"id": "2025-chess-championship",
		"title": "First place, Saudi Chess Federation university championship",
		"type": "Other",
		"date": "2025-09-26",
		"location": "Saudi Arabia",
		"summary": "Club president Mohammed Rashad and his team won first place among Saudi universities.",
		"image": "2025-09-26_1971646693231010182.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1971646693231010182",
		"time": ""
	},
	{
		"id": "2025-prompt-engineering",
		"title": "Prompt Engineering workshop",
		"type": "Workshop",
		"date": "2025-10-02",
		"location": "KFUPM",
		"summary": "Hands-on session on writing prompts that work.",
		"image": "2025-10-03_1974082470355370275.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1974082470355370275",
		"time": ""
	},
	{
		"id": "2025-kaust-connect",
		"title": "KAUST Connect",
		"type": "Talk",
		"date": "2025-10-12",
		"time": "7:00 PM",
		"location": "KFUPM",
		"summary": "KAUST Academy alumni from every track shared their stories. 400+ students from KFUPM, IAU, and KFU. Coffee by OKO.",
		"image": "2025-10-17_1979208323674013989.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1979208323674013989"
	},
	{
		"id": "2025-accenture-visit",
		"title": "Accenture office visit",
		"type": "Trip",
		"date": "2025-10-21",
		"time": "1:30 PM – 3:30 PM",
		"location": "Accenture, Al Khobar",
		"summary": "A tour of the office, the projects, and the people, with Accenture.",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1979775285063995461"
	},
	{
		"id": "2025-arduino-101",
		"title": "Arduino 101 workshop",
		"type": "Workshop",
		"date": "2025-10-22",
		"location": "KFUPM",
		"summary": "From a blank board to a blinking circuit.",
		"image": "2025-10-23_1981399639560507551.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1981399639560507551",
		"time": ""
	},
	{
		"id": "2025-ai-bootcamp",
		"title": "AI bootcamp",
		"type": "Workshop",
		"date": "2025-11-05",
		"endDate": "2025-11-07",
		"location": "KFUPM",
		"summary": "Three days of artificial intelligence, presented by Hadi Zubailah.",
		"image": "2025-11-07_1986846367201861709.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1986846367201861709",
		"time": ""
	},
	{
		"id": "2025-black-hat-mea",
		"title": "Black Hat MEA 2025",
		"type": "Trip",
		"date": "2025-12-06",
		"location": "Riyadh",
		"summary": "The club delegation at the region's largest cybersecurity conference: executive sessions, Arsenal and CTF zones, and contact with 25+ organizations.",
		"image": "2025-12-06_1997329598145544489.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1997329598145544489",
		"time": ""
	},
	{
		"id": "2025-treasure-hunt",
		"title": "Treasure Hunt",
		"type": "Social",
		"date": "2025-12-10",
		"location": "KFUPM",
		"summary": "With the CIE Club.",
		"image": "2025-12-10_1998825273383399868.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/1998825273383399868",
		"time": ""
	},
	{
		"id": "2025-bytebank-hackathon",
		"title": "ByteBank hackathon",
		"type": "Hackathon",
		"date": "2025-12-14",
		"location": "KFUPM",
		"summary": "48+ hours building AI-powered FinTech solutions, with the AI & Robotics Club at IAU. Three winning teams.",
		"image": "2025-12-14_2000224482489667651.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2000224482489667651",
		"time": ""
	},
	{
		"id": "2025-term-closing",
		"title": "Term closing gathering",
		"type": "Social",
		"date": "2025-12-19",
		"location": "KFUPM",
		"summary": "A thank-you gathering for the members who made the first term happen.",
		"image": "2025-12-19_2002037765056434492.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2002037765056434492",
		"time": ""
	},
	{
		"id": "2026-intelligent-planet",
		"title": "Intelligent Planet Hackathon booth",
		"type": "Hackathon",
		"date": "2026-01-28",
		"location": "Building 7, KFUPM",
		"summary": "The club ran the booth and volunteer team for the Intelligent Planet Hackathon with Google Cloud.",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2016242626991702024",
		"time": ""
	},
	{
		"id": "2026-sep-advisory",
		"title": "COE – SEP Advisory booth",
		"type": "Other",
		"date": "2026-01-28",
		"location": "KFUPM",
		"summary": "Advising students on the Computer Engineering track, first of a series across the computing majors.",
		"image": "2026-01-28_2016548505070817595.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2016548505070817595",
		"time": ""
	},
	{
		"id": "2026-leap-visit",
		"title": "LEAP visit",
		"type": "Trip",
		"date": "2026-09-08",
		"location": "Riyadh",
		"summary": "Sessions, exhibitors, and direct contact with companies at LEAP.",
		"image": "2026-09-08_2097325969014984962.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2097325969014984962",
		"time": ""
	},
	{
		"id": "2026-first-meeting",
		"title": "First meeting of the term",
		"type": "Social",
		"date": "2026-09-11",
		"location": "KFUPM",
		"summary": "The club, its teams, and the plan for the term.",
		"image": "2026-09-11_2098349741796983025.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2098349741796983025",
		"time": ""
	},
	{
		"id": "2026-kifada-6367",
		"title": "Kifada 6367",
		"type": "Competition",
		"date": "2026-09-22",
		"location": "KFUPM",
		"summary": "A cipher and puzzle competition. The code was cracked.",
		"image": "2026-09-22_2102397545573974170.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2102397545573974170",
		"time": ""
	},
	{
		"id": "2026-claude-workshop",
		"title": "Claude workshop",
		"type": "Workshop",
		"date": "2026-10-05",
		"endDate": "2026-10-06",
		"location": "KFUPM",
		"summary": "Two days from the first prompt to working code: Claude tools, Claude Code, and AI agents.",
		"image": "2026-10-06_2107519660690165818.jpg",
		"detailsUrl": "https://x.com/KFUPM_CC/status/2107519660690165818",
		"time": ""
	}
];
//#endregion
//#region src/data/highlights.json
var highlights_default = [
	{
		"photo": "2023-02-19_1627334418477027328.jpg",
		"title": "KFUPM Innovation Hackathon",
		"date": "2023-02-19",
		"line": "3 days, 25 hours of coding, 12,000 SAR in prizes.",
		"post": "https://x.com/KFUPM_CC/status/1627334418477027328"
	},
	{
		"photo": "2024-03-20_1770266404811395169.jpg",
		"title": "Flutter mini-hackathon",
		"date": "2024-03-20",
		"line": "Winning teams: Dash, Masarifi and SubTrackers.",
		"post": "https://x.com/KFUPM_CC/status/1770266404811395169"
	},
	{
		"photo": "2024-05-07_1787837468470812860.jpg",
		"title": "AWS DeepRacer",
		"date": "2024-05-07",
		"line": "25,000 SAR in prizes, with JRCAI and GDSC. Pictured: the winners' ceremony.",
		"post": "https://x.com/KFUPM_CC/status/1787837468470812860"
	},
	{
		"photo": "2025-04-20_1913920617407009239.jpg",
		"title": "KFUPM Techathon",
		"date": "2025-04-20",
		"line": "60+ teams from Saudi universities, 24 in the on-site final, 4 days, 30,000+ SAR in prizes.",
		"post": "https://x.com/KFUPM_CC/status/1913920617407009239"
	},
	{
		"photo": "2025-10-17_1979208323674013989.jpg",
		"title": "KAUST Connect",
		"date": "2025-10-17",
		"line": "400+ students from KFUPM, IAU and KFU.",
		"post": "https://x.com/KFUPM_CC/status/1979208323674013989"
	},
	{
		"photo": "2025-12-06_1997329598145544489.jpg",
		"title": "Black Hat MEA 2025",
		"date": "2025-12-06",
		"line": "Club delegation in Riyadh. Connected with 25+ organizations.",
		"post": "https://x.com/KFUPM_CC/status/1997329598145544489"
	},
	{
		"photo": "2026-10-06_2107519660690165818.jpg",
		"title": "Claude workshop",
		"date": "2026-10-06",
		"line": "Two days from first prompt to Claude Code and AI agents.",
		"post": "https://x.com/KFUPM_CC/status/2107519660690165818"
	}
];
//#endregion
//#region src/data/stories.json
var stories_default = [
	{
		"photo": "2025-10-17_1979208323674013989.jpg",
		"date": "2025-10-17",
		"title": "KAUST Connect",
		"text": "KAUST Academy alumni from every track shared their stories with 400+ students from KFUPM, IAU and KFU.",
		"post": "https://x.com/KFUPM_CC/status/1979208323674013989"
	},
	{
		"photo": "2025-04-10_1910478806520914205.jpg",
		"date": "2025-04-10",
		"title": "KFUPM Techathon",
		"text": "60+ teams from Saudi universities, 24 in the on-site final, four days of building, 30,000+ SAR in prizes.",
		"post": "https://x.com/KFUPM_CC/status/1911484448878526779"
	},
	{
		"photo": "2025-12-06_1997329598145544489.jpg",
		"date": "2025-12-06",
		"title": "Black Hat MEA 2025",
		"text": "The club delegation in Riyadh: executive sessions, the Arsenal and CTF zones, and contact with 25+ organizations.",
		"post": "https://x.com/KFUPM_CC/status/1997329598145544489"
	}
];
var impact_default = {
	_note: "Prize pools as ANNOUNCED in @KFUPM_CC posts on X (not confirmed payouts). Semesters follow the KFUPM calendar: Fall = Aug-Dec, Spring = Jan-May. Each event links to its source post. \"photo\" is the backdrop used for that semester in the show reel (a club photo from that semester, not necessarily the prize event).",
	semesters: [
		{
			"term": "Spring 2023",
			"total_sar": 24e3,
			"events": [{
				"name": "Competitive Programming Competition",
				"prize_sar": 12e3,
				"detail": "split across 10 winners",
				"source": "https://x.com/KFUPM_CC/status/1622254687096299520"
			}, {
				"name": "KFUPM Innovation Hackathon",
				"prize_sar": 12e3,
				"detail": "3 days, 25 hours of coding",
				"source": "https://x.com/KFUPM_CC/status/1625610866409218078"
			}],
			"photo": "2023-02-19_1627334418477027328.jpg"
		},
		{
			"term": "Fall 2023",
			"total_sar": 9e3,
			"events": [{
				"name": "Typing Speed Competition",
				"prize_sar": 3e3,
				"source": "https://x.com/KFUPM_CC/status/1718948992136986950"
			}, {
				"name": "Flutter Weekend Hackathon (with GDSC)",
				"prize_sar": 6e3,
				"source": "https://x.com/KFUPM_CC/status/1728791511259598914"
			}],
			"photo": "2023-12-03_1731292973663457737.jpg"
		},
		{
			"term": "Spring 2024",
			"total_sar": 25e3,
			"events": [{
				"name": "AWS DeepRacer (with JRCAI and GDSC)",
				"prize_sar": 25e3,
				"detail": "AI and ML workshops plus virtual and physical races",
				"source": "https://x.com/KFUPM_CC/status/1782484563270258838"
			}],
			"photo": "2024-05-07_1787837468470812860.jpg"
		},
		{
			"term": "Fall 2024",
			"total_sar": 12e3,
			"events": [{
				"name": "SWE 363 Best Project Competition",
				"prize_sar": 6e3,
				"source": "https://x.com/KFUPM_CC/status/1858153764055552301"
			}, {
				"name": "Web Penetration Testing Bootcamp CTF",
				"prize_sar": 6e3,
				"source": "https://x.com/KFUPM_CC/status/1864396918228422715"
			}],
			"photo": "2024-12-04_1864396918228422715.jpg"
		},
		{
			"term": "Spring 2025",
			"total_sar": 42e3,
			"total_is_minimum": true,
			"events": [
				{
					"name": "SWE 363 Showcases",
					"prize_sar": 6e3,
					"detail": "up to 6,000; check it isn't the same contest as Fall 2024",
					"source": "https://x.com/KFUPM_CC/status/1890809340430360979"
				},
				{
					"name": "Techathon",
					"prize_sar": 3e4,
					"detail": "30,000+; 60+ teams from Saudi universities, 24 reached the on-site final",
					"source": "https://x.com/KFUPM_CC/status/1900955281497919890"
				},
				{
					"name": "The Hunger Prompts",
					"prize_sar": 6e3,
					"detail": "up to 6,000",
					"source": "https://x.com/KFUPM_CC/status/1914037803802923332"
				}
			],
			"photo": "2025-04-20_1913920617407009239.jpg"
		},
		{
			"term": "Fall 2025",
			"total_sar": 23500,
			"total_is_minimum": true,
			"events": [
				{
					"name": "Arduino Challenge",
					"prize_sar": 3e3,
					"source": "https://x.com/KFUPM_CC/status/1993703688938889341"
				},
				{
					"name": "ByteBank FinTech Hackathon (with IAU AI & Robotics Club)",
					"prize_sar": 1e4,
					"detail": "10,000+",
					"source": "https://x.com/KFUPM_CC/status/1996545405811634210"
				},
				{
					"name": "Typing Speed Competition (with Actuarial Club)",
					"prize_sar": 4500,
					"source": "https://x.com/KFUPM_CC/status/1997685427814408693"
				},
				{
					"name": "Treasure Hunt (with CIE Club)",
					"prize_sar": 6e3,
					"source": "https://x.com/KFUPM_CC/status/1998388715106762864"
				},
				{
					"name": "KFUPM CTF 2025",
					"prize_sar": null,
					"detail": "prize amount not stated in the post",
					"source": "https://x.com/KFUPM_CC/status/1991507986024386931"
				}
			],
			"photo": "2025-12-10_1998825273383399868.jpg"
		},
		{
			"term": "Spring 2026",
			"total_sar": 52e3,
			"events": [
				{
					"name": "LeetCode / Algorithms Competition",
					"prize_sar": 6e3,
					"detail": "two posts mention 6,000 each; check whether it was one contest or two",
					"source": "https://x.com/KFUPM_CC/status/2021864371467513893"
				},
				{
					"name": "Streamathon (powered by Stream & Replit)",
					"prize_sar": 4e4,
					"detail": "biggest prize pool so far",
					"source": "https://x.com/KFUPM_CC/status/2040851390625456417"
				},
				{
					"name": "Data Science Bootcamp + Competition",
					"prize_sar": 6e3,
					"source": "https://x.com/KFUPM_CC/status/2047215307916234837"
				}
			],
			"photo": "2026-09-08_2097325969014984962.jpg"
		},
		{
			"term": "Fall 2026 (so far)",
			"total_sar": null,
			"events": [{
				"name": "Kifada 6367",
				"prize_sar": null,
				"detail": "prizes not stated",
				"source": "https://x.com/KFUPM_CC/status/2099473268461760540"
			}]
		}
	],
	headline_numbers: {
		"announced_prizes_since_2023_sar": "187,500+",
		"biggest_single_prize_pool_sar": 4e4,
		"techathon_teams": "60+ teams, 24 finalists",
		"kaust_connect_attendees": "400+ students from KFUPM, IAU and KFU",
		"black_hat_mea_2025": "connected with 25+ organizations",
		"x_followers": 2048,
		"linkedin_followers": 1659,
		"on_x_since": "November 2020"
	}
};
var partners_default = {
	_note: "Collected from @KFUPM_CC posts on X (2020-2026). The click opens the club post that shows the collaboration (\"source\"); \"url\" is the organisation's site, kept for reference. To show a logo, drop the file into src/assets/partners/ and set \"logo\"; set \"mark\": true when the file is a square symbol or avatar so the name is printed beside it. Files named x-<handle>.jpg are the partner's X profile picture.",
	companies: [
		{
			"name": "Stream",
			"what": "Streamathon hackathon, 40,000 SAR in prizes (Apr 2026), with Replit",
			"source": "https://x.com/KFUPM_CC/status/2040851390625456417",
			"url": "https://getstream.io",
			"logo": "stream.png",
			"mark": false
		},
		{
			"name": "Replit",
			"what": "Streamathon hackathon, 40,000 SAR in prizes (Apr 2026), with Stream",
			"source": "https://x.com/KFUPM_CC/status/2040851390625456417",
			"url": "https://replit.com",
			"logo": "replit.svg",
			"mark": true
		},
		{
			"name": "Google Cloud",
			"logo": "google-cloud.svg",
			"what": "Intelligent Planet Hackathon at KFUPM, Feb 2026",
			"source": "https://x.com/KFUPM_CC/status/2016242626991702024",
			"url": "https://cloud.google.com",
			"mark": false
		},
		{
			"name": "Amazon Web Services",
			"logo": "aws.svg",
			"what": "AWS DeepRacer League final, May 2024",
			"source": "https://x.com/KFUPM_CC/status/1785702174598553829",
			"url": "",
			"mark": false
		},
		{
			"name": "Accenture",
			"logo": "accenture.svg",
			"what": "Discover Accenture, Dec 2024, and an office visit in Al Khobar, Oct 2025",
			"source": "https://x.com/KFUPM_CC/status/1979775285063995461",
			"url": "https://www.accenture.com",
			"mark": false
		},
		{
			"name": "stc",
			"logo": "stc.svg",
			"what": "KFUPM IoT Day, Mar 2023",
			"source": "https://x.com/KFUPM_CC/status/1637056404384096256",
			"url": "https://www.stc.com.sa",
			"mark": false
		},
		{
			"name": "KAUST Academy",
			"logo": "x-kaust_academy.jpg",
			"what": "KAUST AI program session, Sep 2024, and KAUST Connect, Oct 2025",
			"source": "https://x.com/KFUPM_CC/status/1979208323674013989",
			"mark": true,
			"url": "https://academy.kaust.edu.sa"
		},
		{
			"name": "Thakaa Center",
			"logo": "thakaa.png",
			"what": "Robotic Process Automation workshop, Apr 2023",
			"source": "https://x.com/KFUPM_CC/status/1644735964466520064",
			"url": "https://thakaa.sa",
			"mark": false
		},
		{
			"name": "Meet Technology",
			"logo": "x-meettechnology.jpg",
			"what": "Intro to Cloud Computing, Jan 2025",
			"source": "https://x.com/KFUPM_CC/status/1883573196701757526",
			"url": "https://meet-technology.com",
			"mark": true
		},
		{
			"name": "3D Solutions",
			"logo": "3d-solutions.png",
			"what": "AWS DeepRacer League final, May 2024",
			"source": "https://x.com/KFUPM_CC/status/1785702174598553829",
			"url": "",
			"mark": true,
			"square": true
		}
	],
	kfupm_units: [
		{
			"name": "JRCAI",
			"source": "https://x.com/KFUPM_CC/status/1760209575972606280",
			"logo": "jrcai.png",
			"url": "",
			"mark": false,
			"tall": true
		},
		{
			"name": "KIKX",
			"source": "https://x.com/KFUPM_CC/status/1763210446041964717",
			"logo": "x-kfupm_kikx.jpg",
			"url": "https://kikx.kfupm.edu.sa",
			"mark": true
		},
		{
			"name": "Voluntary Work Unit",
			"source": "https://x.com/KFUPM_CC/status/1624101136935399446",
			"logo": "x-kfupmvolunteers.jpg",
			"url": "",
			"mark": true
		}
	],
	student_clubs: [
		{
			"name": "GDSC KFUPM",
			"source": "https://x.com/KFUPM_CC/status/1770923578986316230",
			"logo": "x-gdsc_kfupm.jpg",
			"url": "",
			"mark": true
		},
		{
			"name": "CIE Club",
			"source": "https://x.com/KFUPM_CC/status/1998388715106762864",
			"logo": "x-cieclub.jpg",
			"url": "",
			"mark": true
		},
		{
			"name": "Actuarial Club",
			"source": "https://x.com/KFUPM_CC/status/1997685427814408693",
			"logo": "x-actuarial_kfupm.jpg",
			"url": "",
			"mark": true
		},
		{
			"name": "FAEC Club",
			"source": "https://x.com/KFUPM_CC/status/1991944800967279101",
			"logo": "x-kfupm_faec.jpg",
			"url": "",
			"mark": true
		},
		{
			"name": "Electrical Engineering Club",
			"source": "https://x.com/KFUPM_CC/status/1637056404384096256",
			"logo": "x-eec_kfupm.jpg",
			"url": "",
			"mark": true
		},
		{
			"name": "Photography Club",
			"source": "https://x.com/KFUPM_CC/status/1772041072769679652",
			"logo": "photography-club.jpg",
			"url": "",
			"mark": true,
			"handle": "kfupm_photoclub"
		},
		{
			"name": "AI & Robotics Club, IAU",
			"source": "https://x.com/KFUPM_CC/status/1996545405811634210",
			"logo": "x-airobotclub_iau.jpg",
			"url": "",
			"mark": true
		}
	],
	visited: [{
		"name": "Black Hat MEA 2025",
		"what": "Club delegation attended, Riyadh",
		"source": "https://x.com/KFUPM_CC/status/1997329598145544489",
		"url": "https://blackhatmea.com"
	}, {
		"name": "LEAP",
		"what": "Club trip",
		"source": "",
		"url": "https://onegiantleap.com"
	}]
};
//#endregion
//#region src/data/team.json
var team_default = [
	{
		"id": "sample-member-1",
		"name": "Sample Member",
		"role": "President",
		"photo": "/images/team/placeholder.jpg",
		"order": 1,
		"major": "Computer Science",
		"committee": "Leadership",
		"term": "2026–27"
	},
	{
		"id": "sample-member-2",
		"name": "Sample Member",
		"role": "Vice President",
		"photo": "/images/team/placeholder.jpg",
		"order": 2,
		"major": "Software Engineering",
		"committee": "Leadership",
		"term": "2026–27"
	},
	{
		"id": "sample-member-3",
		"name": "Sample Member",
		"role": "Technical Lead",
		"photo": "/images/team/placeholder.jpg",
		"order": 3,
		"major": "Computer Engineering",
		"committee": "Technical",
		"term": "2026–27"
	},
	{
		"id": "sample-member-4",
		"name": "Sample Member",
		"role": "Media Lead",
		"photo": "/images/team/placeholder.jpg",
		"order": 4,
		"major": "Information Systems",
		"committee": "Media",
		"term": "2026–27"
	},
	{
		"id": "sample-member-5",
		"name": "Sample Member",
		"role": "Events Coordinator",
		"photo": "/images/team/placeholder.jpg",
		"order": 5,
		"major": "Computer Science",
		"committee": "Events",
		"term": "2026–27"
	},
	{
		"id": "sample-member-6",
		"name": "Sample Member",
		"role": "Blog Editor",
		"photo": "/images/team/placeholder.jpg",
		"order": 6,
		"major": "Computer Science",
		"committee": "Blog",
		"term": "2026–27"
	}
];
//#endregion
//#region src/lib/content.ts
var memo = /* @__PURE__ */ new Map();
var cached = (key, fn) => {
	const hit = memo.get(key);
	if (hit && Date.now() - hit.at < 3e4) return hit.value;
	const value = fn().catch((e) => {
		memo.delete(key);
		throw e;
	});
	memo.set(key, {
		at: Date.now(),
		value
	});
	return value;
};
var bust = () => memo.clear();
var db = () => publicClient();
var real = (v) => typeof v === "string" && v.length > 0 && !v.includes("REPLACE");
var RIYADH = "Asia/Riyadh";
var riyadh = (y, m, d, h = 0, min = 0) => new Date(Date.UTC(y, m - 1, d, h - 3, min));
var parseClock = (time) => {
	const t = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(time || "");
	if (!t) return null;
	let h = Number(t[1]);
	const ap = (t[3] || "").toUpperCase();
	if (ap === "PM" && h < 12) h += 12;
	if (ap === "AM" && h === 12) h = 0;
	return {
		h,
		min: Number(t[2])
	};
};
var parseRiyadh = (date, time = "") => {
	const [y, m, d] = date.split("-").map(Number);
	const c = parseClock(time);
	return c ? riyadh(y, m, d, c.h, c.min) : riyadh(y, m, d);
};
var riyadhDate = (d) => new Intl.DateTimeFormat("en-CA", {
	timeZone: RIYADH,
	year: "numeric",
	month: "2-digit",
	day: "2-digit"
}).format(d);
var fmtRiyadh = (d, opts) => new Intl.DateTimeFormat("en-GB", {
	timeZone: RIYADH,
	...opts
}).format(d);
var termOf = (d) => {
	const [y, m] = riyadhDate(d).split("-").map(Number);
	return m >= 8 ? `Fall ${y}` : m <= 5 ? `Spring ${y}` : `Summer ${y}`;
};
var seedSettings = () => ({
	site: {
		name: site_default.name,
		short: site_default.short,
		tagline: site_default.tagline,
		description: site_default.description,
		intro: site_default.intro,
		email: real(site_default.email) ? site_default.email : "",
		missionAr: site_default.missionAr
	},
	links: Object.fromEntries(Object.entries(site_default.links).map(([k, v]) => [k, real(v) ? v : ""])),
	home: {
		heroLine: site_default.tagline,
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
		totalPrizesSar: Number(String(impact_default.headline_numbers?.announced_prizes_since_2023_sar || "187500").replace(/\D/g, ""))
	},
	banner: null,
	madeBy: site_default.madeBy || [],
	contributorsUrl: site_default.contributorsUrl || "https://github.com/KFUPM-COMPUTER-CLUB/website"
});
function getSettings() {
	return cached("settings", async () => {
		const base = seedSettings();
		if (!dbReady()) return base;
		const { data } = await db().from("settings").select("key,value");
		const rows = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
		return {
			site: {
				...base.site,
				...rows.site || {}
			},
			links: {
				...base.links,
				...rows.links || {}
			},
			home: {
				...base.home,
				...rows.home || {}
			},
			banner: rows.banner?.visible ? rows.banner : null,
			madeBy: rows.made_by || base.madeBy,
			contributorsUrl: base.contributorsUrl
		};
	});
}
var seedEvents = () => events_default.map((e) => {
	const start = parseRiyadh(e.date, e.time || "");
	const allDay = !parseClock(e.time || "");
	const end = e.endDate ? parseRiyadh(e.endDate) : null;
	return {
		id: e.id,
		slug: e.id,
		title: e.title,
		type: e.type,
		start,
		end,
		allDay,
		location: e.location || "",
		summary: e.summary || "",
		coverKey: e.image || null,
		cover: null,
		xUrl: e.detailsUrl || null,
		registerUrl: real(e.registerUrl) ? e.registerUrl : null,
		capacity: null,
		registrationOpen: false,
		featured: !!e.featured,
		published: true
	};
});
var rowToEvent = (r) => ({
	id: r.id,
	slug: r.slug,
	title: r.title,
	type: r.type,
	start: new Date(r.starts_at),
	end: r.ends_at ? new Date(r.ends_at) : null,
	allDay: !!r.all_day,
	location: r.location || "",
	summary: r.summary || "",
	coverKey: r.cover_key,
	cover: null,
	xUrl: r.x_url,
	registerUrl: r.register_url,
	capacity: r.capacity,
	registrationOpen: !!r.registration_open,
	featured: !!r.featured,
	published: !!r.published
});
function getEvents() {
	return cached("events", async () => {
		const list = dbReady() ? ((await db().from("events").select("*").eq("published", true).order("starts_at")).data || []).map(rowToEvent) : seedEvents();
		for (const e of list) e.cover = await photoImg(e.coverKey);
		return list.sort((a, b) => a.start.valueOf() - b.start.valueOf());
	});
}
var eventEnd = (e) => e.allDay ? /* @__PURE__ */ new Date(parseRiyadh(riyadhDate(e.end ?? e.start)).valueOf() + 864e5 - 1) : e.end ?? new Date(e.start.valueOf() + 72e5);
async function getUpcomingEvents() {
	const now = Date.now();
	return (await getEvents()).filter((e) => eventEnd(e).valueOf() >= now);
}
async function getPastEvents() {
	const now = Date.now();
	return (await getEvents()).filter((e) => eventEnd(e).valueOf() < now).sort((a, b) => b.start.valueOf() - a.start.valueOf());
}
async function getEvent(slugOrId) {
	return (await getEvents()).find((e) => e.slug === slugOrId || e.id === slugOrId) || null;
}
function getHighlights() {
	return cached("highlights", async () => {
		const list = dbReady() ? ((await db().from("highlights").select("*").eq("visible", true).order("sort")).data || []).map((r) => ({
			id: r.id,
			photoKey: r.photo_key,
			img: null,
			title: r.title,
			date: r.date,
			line: r.line || "",
			postUrl: r.post_url,
			sort: r.sort
		})) : highlights_default.map((h, i) => ({
			id: `seed-${i}`,
			photoKey: h.photo,
			img: null,
			title: h.title,
			date: h.date,
			line: h.line,
			postUrl: h.post,
			sort: i
		}));
		for (const h of list) h.img = await photoImg(h.photoKey);
		return list.filter((h) => h.img);
	});
}
function getStories() {
	return cached("stories", async () => {
		const list = dbReady() ? ((await db().from("stories").select("*").eq("visible", true).order("sort")).data || []).map((r) => ({
			id: r.id,
			photoKey: r.photo_key,
			img: null,
			title: r.title,
			date: r.date,
			text: r.text || "",
			postUrl: r.post_url
		})) : stories_default.map((s, i) => ({
			id: `seed-${i}`,
			photoKey: s.photo,
			img: null,
			title: s.title,
			date: s.date,
			text: s.text,
			postUrl: s.post
		}));
		for (const s of list) s.img = await photoImg(s.photoKey);
		return list.filter((s) => s.img);
	});
}
function getStripPhotos() {
	return cached("strip", async () => {
		let list;
		if (dbReady()) list = ((await db().from("strip_photos").select("*").eq("visible", true).order("sort")).data || []).map((r) => ({
			key: r.photo_key,
			img: null,
			label: r.label || "",
			postUrl: r.post_url,
			date: (r.photo_key.match(/^\d{4}-\d{2}-\d{2}/) || [""])[0]
		}));
		else {
			const events = events_default;
			const highlights = highlights_default;
			const labels = new Map([...events.map((e) => [e.image, e.title]), ...highlights.map((h) => [h.photo, h.title])].filter(([k]) => k));
			const byDate = new Map(events.filter((e) => e.image).map((e) => [e.date, e.title]));
			list = seedPhotoKeys().map((key) => {
				const [date, id] = key.replace(".jpg", "").split("_");
				return {
					key,
					img: null,
					label: labels.get(key) || byDate.get(date) || "@KFUPM_CC",
					postUrl: `https://x.com/KFUPM_CC/status/${id}`,
					date
				};
			});
		}
		for (const p of list) p.img = await photoImg(p.key);
		return list.filter((p) => p.img);
	});
}
function getImpact() {
	return cached("impact", async () => {
		let list;
		if (dbReady()) {
			const { data } = await db().from("impact_semesters").select("*, impact_items(*)").order("sort");
			list = (data || []).map((r) => ({
				id: r.id,
				term: r.term,
				totalSar: r.total_sar,
				isMinimum: !!r.total_is_minimum,
				photoKey: r.photo_key,
				img: null,
				items: (r.impact_items || []).sort((a, b) => a.sort - b.sort).map((i) => ({
					name: i.name,
					prizeSar: i.prize_sar,
					detail: i.detail,
					sourceUrl: i.source_url
				}))
			}));
		} else list = impact_default.semesters.map((s, i) => ({
			id: `seed-${i}`,
			term: s.term,
			totalSar: s.total_sar ?? null,
			isMinimum: !!s.total_is_minimum,
			photoKey: s.photo || null,
			img: null,
			items: (s.events || []).map((e) => ({
				name: e.name,
				prizeSar: e.prize_sar ?? null,
				detail: e.detail || null,
				sourceUrl: e.source || null
			}))
		}));
		for (const s of list) s.img = await photoImg(s.photoKey);
		return list;
	});
}
function getPartners() {
	return cached("partners", async () => {
		let list;
		if (dbReady()) {
			const { data } = await db().from("partners").select("*").eq("visible", true).order("sort");
			list = (data || []).map((r) => ({
				id: r.id,
				name: r.name,
				kind: r.kind,
				what: r.what,
				url: r.url,
				sourceUrl: r.source_url,
				logoKey: r.logo_key,
				logo: null,
				handle: r.handle,
				mark: !!r.mark,
				square: !!r.square,
				tall: !!r.tall,
				sort: r.sort
			}));
		} else {
			const p = partners_default;
			let i = 0;
			const conv = (kind) => (e) => ({
				id: `seed-${i++}`,
				name: e.name,
				kind,
				what: e.what || null,
				url: e.url || null,
				sourceUrl: e.source || null,
				logoKey: e.logo || null,
				logo: null,
				handle: e.handle || null,
				mark: !!e.mark,
				square: !!e.square,
				tall: !!e.tall,
				sort: i
			});
			list = [
				...p.companies.map(conv("company")),
				...p.kfupm_units.map(conv("kfupm_unit")),
				...p.student_clubs.map(conv("student_club"))
			];
		}
		for (const x of list) x.logo = await photoImg(x.logoKey, "logo");
		return list;
	});
}
function getOfficers() {
	return cached("officers", async () => {
		if (!dbReady()) return team_default.map((m, i) => ({
			id: m.id,
			userId: null,
			handle: null,
			name: m.name,
			title: m.role,
			committee: m.committee || "",
			term: m.term || "",
			major: m.major || null,
			photo: m.photo || null,
			linkedin: m.linkedin || null,
			isCurrent: true,
			sort: m.order ?? i
		}));
		const { data } = await db().from("officer_terms").select("*").order("sort");
		const ids = (data || []).map((r) => r.user_id).filter(Boolean);
		const profiles = ids.length ? (await db().from("profiles_public").select("id,handle,avatar_url").in("id", ids)).data || [] : [];
		const byId = new Map(profiles.map((p) => [p.id, p]));
		const out = [];
		for (const r of data || []) {
			const p = r.user_id ? byId.get(r.user_id) : null;
			const img = await photoImg(r.photo_key);
			out.push({
				id: r.id,
				userId: r.user_id,
				handle: p?.handle || null,
				name: r.name,
				title: r.title,
				committee: r.committee || "",
				term: r.term,
				major: r.major,
				photo: img?.src || p?.avatar_url || null,
				linkedin: r.linkedin,
				isCurrent: !!r.is_current,
				sort: r.sort
			});
		}
		return out;
	});
}
async function getMemberCount() {
	if (!dbReady()) return null;
	return cached("member_count", async () => {
		const { data } = await db().rpc("member_count");
		return typeof data === "number" ? data : Number(data) || 0;
	});
}
async function getContributors() {
	if (!dbReady()) return [];
	return cached("contributors", async () => (await db().from("contributors").select("*").order("posts", { ascending: false }).limit(24)).data || []);
}
function getFaq() {
	return cached("faq", async () => {
		if (!dbReady()) return site_default.faq.map((f, i) => ({
			id: `seed-${i}`,
			q: f.q,
			a: f.a,
			qAr: null,
			aAr: null,
			sort: i
		}));
		const { data } = await db().from("faq").select("*").eq("visible", true).order("sort");
		return (data || []).map((r) => ({
			id: r.id,
			q: r.q_en,
			a: r.a_en,
			qAr: r.q_ar,
			aAr: r.a_ar,
			sort: r.sort
		}));
	});
}
var rowToPost = (r) => ({
	id: r.id,
	slug: r.slug,
	title: r.title,
	excerpt: r.excerpt || "",
	date: new Date(r.published_at || r.created_at),
	authorName: r.author?.name || r.author_name || "Computer Club",
	authorHandle: r.author?.handle || null,
	authorAvatar: r.author?.avatar_url || null,
	category: r.category,
	tags: r.tags || [],
	dir: r.dir || "ltr",
	status: r.status
});
async function withAuthors(rows) {
	const ids = [...new Set(rows.map((r) => r.author_id).filter(Boolean))];
	const authors = ids.length ? (await db().from("profiles_public").select("id,name,handle,avatar_url").in("id", ids)).data || [] : [];
	const byId = new Map(authors.map((a) => [a.id, a]));
	return rows.map((r) => rowToPost({
		...r,
		author: byId.get(r.author_id) || null
	}));
}
function getPosts() {
	return cached("posts", async () => {
		if (!dbReady()) return (await getCollection("posts", ({ data }) => !data.draft)).map((e) => ({
			id: e.id,
			slug: e.id,
			title: e.data.title,
			excerpt: e.data.excerpt,
			date: e.data.date,
			authorName: e.data.author,
			authorHandle: null,
			authorAvatar: null,
			category: e.data.category,
			tags: e.data.tags,
			dir: "ltr",
			status: "published"
		})).sort((a, b) => b.date.valueOf() - a.date.valueOf());
		const { data } = await db().from("posts").select("id,slug,title,excerpt,published_at,created_at,author_id,author_name,category,tags,dir,status").eq("status", "published").order("published_at", { ascending: false });
		return withAuthors(data || []);
	});
}
async function getPost(slug) {
	if (!dbReady()) {
		const e = (await getCollection("posts", ({ data }) => !data.draft)).find((x) => x.id === slug);
		if (!e) return null;
		return {
			id: e.id,
			slug: e.id,
			title: e.data.title,
			excerpt: e.data.excerpt,
			date: e.data.date,
			authorName: e.data.author,
			authorHandle: null,
			authorAvatar: null,
			category: e.data.category,
			tags: e.data.tags,
			dir: "ltr",
			status: "published",
			html: null,
			entry: e,
			coverKey: null
		};
	}
	const { data } = await db().from("posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
	if (!data) return null;
	const [row] = await withAuthors([data]);
	return {
		...row,
		html: data.content_html,
		entry: null,
		coverKey: data.cover_key
	};
}
//#endregion
export { mediaImg as A, partners_default as C, events_default as D, highlights_default as E, photoImg as M, render as N, site_default as O, __exportAll as P, team_default as S, stories_default as T, getStories as _, getEvent as a, riyadhDate as b, getHighlights as c, getOfficers as d, getPartners as f, getSettings as g, getPosts as h, getContributors as i, mediaMap as j, invalidateMedia as k, getImpact as l, getPost as m, eventEnd as n, getEvents as o, getPastEvents as p, fmtRiyadh as r, getFaq as s, bust as t, getMemberCount as u, getStripPhotos as v, impact_default as w, termOf as x, getUpcomingEvents as y };
