import { Ft as setOnSetGetEnv, Mt as createInvalidVariablesError, Nt as getEnv$1 } from "./sequence_CcNeFUgX.mjs";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
//#region node_modules/astro/dist/env/validators.js
function getEnvFieldType(options) {
	const optional = options.optional ? options.default !== void 0 ? false : true : false;
	let type;
	if (options.type === "enum") type = options.values.map((v) => `'${v}'`).join(" | ");
	else type = options.type;
	return `${type}${optional ? " | undefined" : ""}`;
}
var stringValidator = ({ max, min, length, url, includes, startsWith, endsWith }) => (input) => {
	if (typeof input !== "string") return {
		ok: false,
		errors: ["type"]
	};
	const errors = [];
	if (max !== void 0 && !(input.length <= max)) errors.push("max");
	if (min !== void 0 && !(input.length >= min)) errors.push("min");
	if (length !== void 0 && !(input.length === length)) errors.push("length");
	if (url !== void 0 && !URL.canParse(input)) errors.push("url");
	if (includes !== void 0 && !input.includes(includes)) errors.push("includes");
	if (startsWith !== void 0 && !input.startsWith(startsWith)) errors.push("startsWith");
	if (endsWith !== void 0 && !input.endsWith(endsWith)) errors.push("endsWith");
	if (errors.length > 0) return {
		ok: false,
		errors
	};
	return {
		ok: true,
		value: input
	};
};
var numberValidator = ({ gt, min, lt, max, int }) => (input) => {
	const num = Number.parseFloat(input ?? "");
	if (isNaN(num)) return {
		ok: false,
		errors: ["type"]
	};
	const errors = [];
	if (gt !== void 0 && !(num > gt)) errors.push("gt");
	if (min !== void 0 && !(num >= min)) errors.push("min");
	if (lt !== void 0 && !(num < lt)) errors.push("lt");
	if (max !== void 0 && !(num <= max)) errors.push("max");
	if (int !== void 0) {
		const isInt = Number.isInteger(num);
		if (!(int ? isInt : !isInt)) errors.push("int");
	}
	if (errors.length > 0) return {
		ok: false,
		errors
	};
	return {
		ok: true,
		value: num
	};
};
var booleanValidator = (input) => {
	const bool = input === "true" ? true : input === "false" ? false : void 0;
	if (typeof bool !== "boolean") return {
		ok: false,
		errors: ["type"]
	};
	return {
		ok: true,
		value: bool
	};
};
var enumValidator = ({ values }) => (input) => {
	if (!(typeof input === "string" ? values.includes(input) : false)) return {
		ok: false,
		errors: ["type"]
	};
	return {
		ok: true,
		value: input
	};
};
function selectValidator(options) {
	switch (options.type) {
		case "string": return stringValidator(options);
		case "number": return numberValidator(options);
		case "boolean": return booleanValidator;
		case "enum": return enumValidator(options);
	}
}
function validateEnvVariable(value, options) {
	const isOptional = options.optional || options.default !== void 0;
	if (isOptional && value === void 0) return {
		ok: true,
		value: options.default
	};
	if (!isOptional && value === void 0) return {
		ok: false,
		errors: ["missing"]
	};
	return selectValidator(options)(value);
}
//#endregion
//#region \0virtual:astro:env/internal
var schema = {
	"PUBLIC_SUPABASE_URL": {
		"context": "client",
		"access": "public",
		"optional": true,
		"type": "string"
	},
	"PUBLIC_SUPABASE_ANON_KEY": {
		"context": "client",
		"access": "public",
		"optional": true,
		"type": "string"
	},
	"PUBLIC_SUPABASE_PUBLISHABLE_KEY": {
		"context": "client",
		"access": "public",
		"optional": true,
		"type": "string"
	},
	"PUBLIC_GOOGLE_SIGNIN": {
		"context": "client",
		"access": "public",
		"optional": true,
		"type": "string"
	},
	"SUPABASE_SERVICE_ROLE_KEY": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"SUPABASE_SECRET_KEY": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"ADMIN_EMAILS": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"RESEND_API_KEY": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"EMAIL_FROM": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"CRON_SECRET": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	},
	"SITE_URL": {
		"context": "server",
		"access": "secret",
		"optional": true,
		"type": "string"
	}
};
//#endregion
//#region \0astro:env/server
/** @returns {string} */
var getEnv = (key) => {
	return getEnv$1(key);
};
var _internalGetSecret = (key) => {
	const rawVariable = getEnv(key);
	const variable = rawVariable === "" ? void 0 : rawVariable;
	const options = schema[key];
	const result = validateEnvVariable(variable, options);
	if (result.ok) return result.value;
	const type = getEnvFieldType(options);
	throw createInvalidVariablesError(key, type, result);
};
setOnSetGetEnv(() => {
	SUPABASE_SERVICE_ROLE_KEY = _internalGetSecret("SUPABASE_SERVICE_ROLE_KEY");
	SUPABASE_SECRET_KEY = _internalGetSecret("SUPABASE_SECRET_KEY");
	ADMIN_EMAILS = _internalGetSecret("ADMIN_EMAILS");
	RESEND_API_KEY = _internalGetSecret("RESEND_API_KEY");
	EMAIL_FROM = _internalGetSecret("EMAIL_FROM");
	CRON_SECRET = _internalGetSecret("CRON_SECRET");
	SITE_URL = _internalGetSecret("SITE_URL");
});
var SUPABASE_SERVICE_ROLE_KEY = _internalGetSecret("SUPABASE_SERVICE_ROLE_KEY");
var SUPABASE_SECRET_KEY = _internalGetSecret("SUPABASE_SECRET_KEY");
var ADMIN_EMAILS = _internalGetSecret("ADMIN_EMAILS");
var RESEND_API_KEY = _internalGetSecret("RESEND_API_KEY");
var EMAIL_FROM = _internalGetSecret("EMAIL_FROM");
var CRON_SECRET = _internalGetSecret("CRON_SECRET");
var SITE_URL = _internalGetSecret("SITE_URL");
//#endregion
//#region src/lib/env.ts
var supabaseUrl = "";
var supabaseAnon = "";
var serviceKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SECRET_KEY || "";
var dbReady = () => !!(supabaseUrl && supabaseAnon);
var serviceReady = () => dbReady() && !!serviceKey;
var googleEnabled = () => "".toLowerCase() === "true";
var adminEmails = () => (ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
//#endregion
//#region src/lib/supabase.ts
var anon = null;
var publicClient = () => anon ??= createClient(supabaseUrl, supabaseAnon, { auth: {
	persistSession: false,
	autoRefreshToken: false
} });
var service = null;
var serviceClient = () => {
	if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
	return service ??= createClient(supabaseUrl, serviceKey, { auth: {
		persistSession: false,
		autoRefreshToken: false
	} });
};
function sessionClient(request, cookies) {
	return createServerClient(supabaseUrl, supabaseAnon, { cookies: {
		getAll: () => parseCookieHeader(request.headers.get("cookie") ?? "").map((c) => ({
			name: c.name,
			value: c.value ?? ""
		})),
		setAll: (list) => {
			for (const { name, value, options } of list) cookies.set(name, value, {
				...options,
				path: "/"
			});
		}
	} });
}
var publicUrl = (path) => `${supabaseUrl}/storage/v1/object/public/${path}`;
//#endregion
export { adminEmails as a, serviceReady as c, sessionClient as i, supabaseUrl as l, publicUrl as n, dbReady as o, serviceClient as r, googleEnabled as s, publicClient as t };
