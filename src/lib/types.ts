export type Role = 'member' | 'editor' | 'reviewer' | 'officer' | 'admin';
export const ROLE_RANK: Record<Role, number> = { member: 0, editor: 1, reviewer: 2, officer: 3, admin: 4 };
export const atLeast = (role: Role | 'guest', min: Role) => role !== 'guest' && ROLE_RANK[role] >= ROLE_RANK[min];

export type Img = { src: string; srcset?: string; width?: number; height?: number };

export type Profile = {
  id: string; handle: string | null; name: string | null; email: string | null; phone: string | null; major: string | null; year: string | null;
  kfupm_email: string | null; github: string | null; linkedin: string | null; bio: string | null; avatar_url: string | null;
  show_in_contributors: boolean; onboarded: boolean; suspended: boolean; created_at: string;
};
export type PublicProfile = Pick<Profile, 'id' | 'handle' | 'name' | 'bio' | 'avatar_url' | 'github' | 'linkedin' | 'major' | 'year' | 'show_in_contributors' | 'created_at'>;

export type EventItem = {
  id: string; slug: string; title: string; type: string; start: Date; end: Date | null; allDay: boolean; location: string; summary: string;
  coverKey: string | null; cover: Img | null; xUrl: string | null; registerUrl: string | null; capacity: number | null; registrationOpen: boolean; featured: boolean; published: boolean;
};
export type Highlight = { id: string; photoKey: string | null; img: Img | null; title: string; date: string; line: string; postUrl: string | null; sort: number };
export type Story = { id: string; photoKey: string | null; img: Img | null; title: string; date: string; text: string; postUrl: string | null };
export type StripPhoto = { key: string; img: Img | null; label: string; postUrl: string | null; date: string };
export type ImpactSemester = { id: string; term: string; totalSar: number | null; isMinimum: boolean; photoKey: string | null; img: Img | null; items: { name: string; prizeSar: number | null; detail: string | null; sourceUrl: string | null }[] };
export type Partner = { id: string; name: string; kind: string; what: string | null; url: string | null; sourceUrl: string | null; logoKey: string | null; logo: Img | null; handle: string | null; mark: boolean; square: boolean; tall: boolean; sort: number };
export type Officer = { id: string; userId: string | null; handle: string | null; name: string; title: string; committee: string; term: string; major: string | null; photo: string | null; linkedin: string | null; isCurrent: boolean; sort: number };
export type FaqItem = { id: string; q: string; a: string; qAr: string | null; aAr: string | null; sort: number };
export type Settings = {
  site: { name: string; short: string; tagline: string; description: string; intro: string; email: string; missionAr?: string };
  links: Record<string, string>;
  home: { heroLine: string; buildWithUs: { title: string; text: string }; photoMoment: { photoKey: string; eyebrow: string; line: string }; stats: { v: string; u: string; l: string }[]; totalPrizesSar: number };
  banner: { text: string; url: string; visible: boolean } | null;
  madeBy: { name: string; github?: string }[];
  contributorsUrl: string;
};
export type PostSummary = { id: string; slug: string; title: string; excerpt: string; date: Date; authorName: string; authorHandle: string | null; authorAvatar: string | null; category: string; tags: string[]; dir: 'ltr' | 'rtl'; status: string };
export type PostFull = PostSummary & { html: string | null; entry: any | null; coverKey: string | null };
