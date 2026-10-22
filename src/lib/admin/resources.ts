/* Admin resources: one definition per table drives the list page, the edit form, the API and the
 * audit log. Adding a field here adds it everywhere. */
import type { Role } from '../types';

export type Field = {
  name: string; label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'bool' | 'select' | 'url' | 'media' | 'tags' | 'ref';
  options?: string[]; required?: boolean; help?: string; max?: number; ref?: { resource: string; label: string };
};
export type Resource = {
  key: string; table: string; title: string; singular: string; minRole: Role; pk: string;
  fields: Field[]; columns: string[]; orderBy: string; sortable?: boolean; visible?: boolean; publicPage?: string; help?: string;
};

const EVENT_TYPES = ['Workshop', 'Talk', 'Hackathon', 'Competition', 'Social', 'Trip', 'Exhibition', 'Other'];

export const RESOURCES: Record<string, Resource> = {
  events: {
    key: 'events', table: 'events', title: 'Events', singular: 'event', minRole: 'officer', pk: 'id', orderBy: 'starts_at.desc', publicPage: '/timeline',
    columns: ['title', 'type', 'starts_at', 'location', 'registration_open', 'published'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 140 },
      { name: 'slug', label: 'Slug (URL id)', type: 'text', help: 'Lowercase letters, digits and dashes. Leave empty to make one from the title.', max: 80 },
      { name: 'type', label: 'Type', type: 'select', options: EVENT_TYPES, required: true },
      { name: 'starts_at', label: 'Starts (Riyadh time)', type: 'datetime', required: true },
      { name: 'ends_at', label: 'Ends (Riyadh time)', type: 'datetime', help: 'Optional. Multi-day events end on the last day.' },
      { name: 'all_day', label: 'All day (no specific time)', type: 'bool' },
      { name: 'location', label: 'Location', type: 'text', max: 120 },
      { name: 'summary', label: 'Summary', type: 'textarea', max: 240 },
      { name: 'cover_key', label: 'Cover photo', type: 'media' },
      { name: 'x_url', label: 'X post URL (the details link)', type: 'url' },
      { name: 'register_url', label: 'External registration URL (optional)', type: 'url' },
      { name: 'capacity', label: 'Capacity (optional)', type: 'number' },
      { name: 'registration_open', label: 'Members can reserve a spot', type: 'bool' },
      { name: 'featured', label: 'Featured', type: 'bool' },
      { name: 'published', label: 'Published', type: 'bool' },
    ],
  },
  highlights: {
    key: 'highlights', table: 'highlights', title: 'Polaroids', singular: 'polaroid', minRole: 'officer', pk: 'id', orderBy: 'sort.asc', sortable: true, visible: true, publicPage: '/',
    help: 'The seven tilted photos at the seam of the home page. Order matters.',
    columns: ['title', 'date', 'photo_key', 'visible'],
    fields: [
      { name: 'photo_key', label: 'Photo', type: 'media', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true, max: 60 },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'line', label: 'One line', type: 'text', max: 140 },
      { name: 'post_url', label: 'Post link', type: 'url' },
      { name: 'visible', label: 'Visible', type: 'bool' },
    ],
  },
  stories: {
    key: 'stories', table: 'stories', title: 'Moments', singular: 'moment', minRole: 'officer', pk: 'id', orderBy: 'sort.asc', sortable: true, visible: true, publicPage: '/',
    help: 'The slides under CC | KFUPM on the home page.',
    columns: ['title', 'date', 'photo_key', 'visible'],
    fields: [
      { name: 'photo_key', label: 'Photo', type: 'media', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true, max: 60 },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'text', label: 'Text', type: 'textarea', max: 240 },
      { name: 'post_url', label: 'Post link', type: 'url' },
      { name: 'visible', label: 'Visible', type: 'bool' },
    ],
  },
  strip: {
    key: 'strip', table: 'strip_photos', title: 'Photo strip', singular: 'photo', minRole: 'officer', pk: 'photo_key', orderBy: 'sort.asc', sortable: true, visible: true, publicPage: '/',
    help: 'The pool the "In pictures" strip picks 20 random photos from on every visit.',
    columns: ['photo_key', 'label', 'visible'],
    fields: [
      { name: 'photo_key', label: 'Photo', type: 'media', required: true },
      { name: 'label', label: 'Caption', type: 'text', max: 80 },
      { name: 'post_url', label: 'Post link', type: 'url' },
      { name: 'visible', label: 'Visible', type: 'bool' },
    ],
  },
  impact: {
    key: 'impact', table: 'impact_semesters', title: 'Impact semesters', singular: 'semester', minRole: 'officer', pk: 'id', orderBy: 'sort.asc', sortable: true, publicPage: '/#impact',
    help: 'One row per semester in the impact reel. Add the prizes under Impact items.',
    columns: ['term', 'total_sar', 'total_is_minimum', 'photo_key'],
    fields: [
      { name: 'term', label: 'Term (e.g. Spring 2026)', type: 'text', required: true, max: 40 },
      { name: 'total_sar', label: 'Total SAR announced', type: 'number' },
      { name: 'total_is_minimum', label: 'Total is a minimum (show +)', type: 'bool' },
      { name: 'photo_key', label: 'Backdrop photo', type: 'media' },
    ],
  },
  'impact-items': {
    key: 'impact-items', table: 'impact_items', title: 'Impact items', singular: 'prize', minRole: 'officer', pk: 'id', orderBy: 'sort.asc', sortable: true,
    columns: ['name', 'prize_sar', 'semester_id'],
    fields: [
      { name: 'semester_id', label: 'Semester', type: 'ref', ref: { resource: 'impact', label: 'term' }, required: true },
      { name: 'name', label: 'Event', type: 'text', required: true, max: 80 },
      { name: 'prize_sar', label: 'Prize SAR', type: 'number' },
      { name: 'detail', label: 'Detail', type: 'text', max: 120 },
      { name: 'source_url', label: 'Source post', type: 'url' },
    ],
  },
  partners: {
    key: 'partners', table: 'partners', title: 'Partners', singular: 'partner', minRole: 'officer', pk: 'id', orderBy: 'sort.asc', sortable: true, visible: true, publicPage: '/#partners',
    columns: ['name', 'kind', 'logo_key', 'visible'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 80 },
      { name: 'kind', label: 'Kind', type: 'select', options: ['company', 'kfupm_unit', 'student_club', 'visited'], required: true },
      { name: 'what', label: 'What we did together', type: 'text', max: 160 },
      { name: 'logo_key', label: 'Logo', type: 'media' },
      { name: 'source_url', label: 'Source post (the click goes here)', type: 'url' },
      { name: 'url', label: 'Website', type: 'url' },
      { name: 'handle', label: 'X handle', type: 'text', max: 40 },
      { name: 'mark', label: 'Round mark with the name next to it', type: 'bool' },
      { name: 'square', label: 'Square mark', type: 'bool' },
      { name: 'tall', label: 'Tall logo', type: 'bool' },
      { name: 'visible', label: 'Visible', type: 'bool' },
    ],
  },
  faq: {
    key: 'faq', table: 'faq', title: 'FAQ', singular: 'question', minRole: 'officer', pk: 'id', orderBy: 'sort.asc', sortable: true, visible: true, publicPage: '/faq',
    columns: ['q_en', 'q_ar', 'visible'],
    fields: [
      { name: 'q_en', label: 'Question (English)', type: 'text', required: true, max: 160 },
      { name: 'a_en', label: 'Answer (English)', type: 'textarea', required: true, max: 600 },
      { name: 'q_ar', label: 'السؤال (Arabic)', type: 'text', max: 160 },
      { name: 'a_ar', label: 'الجواب (Arabic)', type: 'textarea', max: 600 },
      { name: 'visible', label: 'Visible', type: 'bool' },
    ],
  },
  board: {
    key: 'board', table: 'officer_terms', title: 'Community board', singular: 'officer', minRole: 'admin', pk: 'id', orderBy: 'sort.asc', sortable: true, publicPage: '/community',
    help: 'Current officers show as cards; untick "current" to move someone to the alumni archive.',
    columns: ['name', 'title', 'committee', 'term', 'is_current'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 80 },
      { name: 'user_id', label: 'Member account', type: 'ref', ref: { resource: 'members', label: 'name' }, help: 'Optional. Links the card to the member profile.' },
      { name: 'title', label: 'Title', type: 'text', required: true, max: 60 },
      { name: 'committee', label: 'Committee', type: 'text', max: 60 },
      { name: 'term', label: 'Term (e.g. 2026–27)', type: 'text', required: true, max: 20 },
      { name: 'major', label: 'Major', type: 'text', max: 80 },
      { name: 'photo_key', label: 'Photo', type: 'media' },
      { name: 'linkedin', label: 'LinkedIn', type: 'url' },
      { name: 'is_current', label: 'Current board', type: 'bool' },
    ],
  },
  solvers: {
    key: 'solvers', table: 'flag_solvers', title: 'Flag solvers', singular: 'solver', minRole: 'admin', pk: 'id', orderBy: 'created_at.desc', publicPage: '/flag',
    help: 'People who solved the site challenge. Approve to show them on the flag page.',
    columns: ['name', 'handle', 'approved', 'created_at'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 40 },
      { name: 'handle', label: 'Handle', type: 'text', max: 40 },
      { name: 'approved', label: 'Approved (shown publicly)', type: 'bool' },
    ],
  },
};
export const resource = (key: string) => RESOURCES[key] || null;
