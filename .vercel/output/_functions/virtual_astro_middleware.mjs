import { kt as defineMiddleware, t as sequence } from "./chunks/sequence_CcNeFUgX.mjs";
import { a as adminEmails, c as serviceReady, i as sessionClient, o as dbReady, r as serviceClient } from "./chunks/supabase_BYajXEmb.mjs";
import { t as atLeast } from "./chunks/types_DpuWdFt1.mjs";
//#region src/middleware.ts
var PERSONAL = /^\/(me|admin|onboarding|auth|api|join)(\/|$)/;
var SIGNED_IN_COOKIE = "cc_in";
var onRequest$1 = defineMiddleware(async (ctx, next) => {
	ctx.locals.user = null;
	ctx.locals.profile = null;
	ctx.locals.role = "guest";
	const path = ctx.url.pathname;
	const method = ctx.request.method;
	if (path.startsWith("/api/") && method !== "GET" && method !== "HEAD" && !path.startsWith("/api/cron/")) {
		const origin = ctx.request.headers.get("origin");
		const site = ctx.request.headers.get("sec-fetch-site");
		if (!(origin === ctx.url.origin || site === "same-origin")) return new Response("Forbidden", { status: 403 });
	}
	if (dbReady() && PERSONAL.test(path)) {
		const supabase = sessionClient(ctx.request, ctx.cookies);
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			ctx.locals.user = {
				id: user.id,
				email: user.email ?? null
			};
			const [{ data: profile }, { data: roleRow }] = await Promise.all([supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle()]);
			let role = roleRow?.role || "member";
			if (role !== "admin" && user.email && adminEmails().includes(user.email.toLowerCase()) && serviceReady()) {
				await serviceClient().from("user_roles").upsert({
					user_id: user.id,
					role: "admin"
				});
				role = "admin";
			}
			ctx.locals.profile = profile ?? null;
			ctx.locals.role = role;
			if (profile?.suspended && !path.startsWith("/auth/")) return new Response("This account is suspended.", { status: 403 });
			if (!ctx.cookies.get(SIGNED_IN_COOKIE)) ctx.cookies.set(SIGNED_IN_COOKIE, "1", {
				path: "/",
				maxAge: 2592e3,
				sameSite: "lax",
				httpOnly: false,
				secure: ctx.url.protocol === "https:"
			});
		} else if (ctx.cookies.get(SIGNED_IN_COOKIE)) ctx.cookies.delete(SIGNED_IN_COOKIE, { path: "/" });
	}
	const { user, profile, role } = ctx.locals;
	const toSignIn = () => ctx.redirect(`/join?next=${encodeURIComponent(path)}`);
	if (/^\/(me|onboarding)(\/|$)/.test(path)) {
		if (!user) return toSignIn();
		if (profile && !profile.onboarded && !path.startsWith("/onboarding")) return ctx.redirect("/onboarding");
		if (profile?.onboarded && path.startsWith("/onboarding")) return ctx.redirect("/me");
	}
	if (path.startsWith("/admin")) {
		if (!user) return toSignIn();
		if (!atLeast(role, "editor")) return new Response("You do not have access to the admin panel.", { status: 403 });
	}
	return next();
});
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
//#endregion
export { onRequest };
