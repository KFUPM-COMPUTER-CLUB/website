//#region src/lib/notify.ts
var mods = /* #__PURE__ */ Object.assign({ "./email.ts": () => import("./email_CIHCj54n.mjs").then((n) => n.t) });
var email = async () => {
	const load = mods["./email.ts"];
	return load ? await load() : null;
};
async function notifyWelcome(profile) {
	try {
		await (await email())?.sendWelcome?.(profile);
	} catch (e) {
		console.error("welcome email", e);
	}
}
async function notifyStatus(post, status, comment, authorEmail) {
	try {
		const m = await email();
		if (authorEmail) await m?.sendStatusChange?.(post, status, comment, authorEmail);
	} catch (e) {
		console.error("status email", e);
	}
}
async function notifyRegistration(profile, event, calendarLinksHtml) {
	try {
		await (await email())?.sendRegistrationCopy?.(profile, event, calendarLinksHtml);
	} catch (e) {
		console.error("registration email", e);
	}
}
async function emailQuota() {
	try {
		return await (await email())?.quota?.() || null;
	} catch {
		return null;
	}
}
//#endregion
export { notifyWelcome as i, notifyRegistration as n, notifyStatus as r, emailQuota as t };
