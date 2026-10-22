//#region src/lib/types.ts
var ROLE_RANK = {
	member: 0,
	editor: 1,
	reviewer: 2,
	officer: 3,
	admin: 4
};
var atLeast = (role, min) => role !== "guest" && ROLE_RANK[role] >= ROLE_RANK[min];
//#endregion
export { atLeast as t };
