/**
 * WordPress REST contract (namespace snc/v1).
 * Must match docs/02-IMPLEMENTATION-PLAN.md Part B5 exactly.
 */

export type Img = { url: string; width: number; height: number; alt: string };
export type WpFile = { url: string; mime: string; size_bytes: number; filename: string };
export type Term = { slug: string; name: string };
export type Paged<T> = { items: T[]; page: number; total_pages: number; total: number };

export type WhyIconKey =
  | 'graduation-cap'
  | 'flask-conical'
  | 'library'
  | 'wifi'
  | 'hand-coins'
  | 'briefcase'
  | 'users'
  | 'shield-check';

export type Settings = {
  college_name: string;
  /** Official logo from WordPress. null → the bundled fallback (see siteConfig.logo). */
  logo: Img | null;
  hindi_name: string;
  short_about: string;
  affiliation: string;
  phone_admission: string;
  phone_office: string;
  email: string;
  address: string;
  map_embed_url: string;
  map_link: string;
  office_hours: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  youtube: string;
  session_label: string;
  admission_open: boolean;
  apply_url: string;
  about_eyebrow: string;
  about_heading: string;
  about_body: string;
  about_image: Img | null;
  why_items: { icon: WhyIconKey; title: string; text: string }[];
  facts: { value: string; label: string }[];
  cta_heading: string;
  cta_text: string;
  cta_image: Img | null;
  /** Google listing summary. An empty google_rating hides the whole reviews section. */
  google_rating: string;
  google_review_count: string;
  google_reviews_url: string;
  default_og_image: Img | null;
};

/** Used when WordPress is unreachable. Empty values hide their UI — never fake data. */
export const emptySettings: Settings = {
  college_name: '',
  logo: null,
  hindi_name: '',
  short_about: '',
  affiliation: '',
  phone_admission: '',
  phone_office: '',
  email: '',
  address: '',
  map_embed_url: '',
  map_link: '',
  office_hours: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  youtube: '',
  session_label: '',
  admission_open: false,
  apply_url: '',
  about_eyebrow: '',
  about_heading: '',
  about_body: '',
  about_image: null,
  why_items: [],
  facts: [],
  cta_heading: '',
  cta_text: '',
  cta_image: null,
  google_rating: '',
  google_review_count: '',
  google_reviews_url: '',
  default_og_image: null,
};

export type Slide = {
  id: number;
  image_desktop: Img;
  image_mobile: Img | null;
  eyebrow: string;
  heading: string;
  subtext: string;
  cta1: { label: string; url: string } | null;
  cta2: { label: string; url: string } | null;
  link_url: string;
};

export type Notice = {
  id: number;
  title: string;
  slug: string;
  date: string;
  type: Term | null;
  important: boolean;
  file: WpFile | null;
  url: string;
};

export type MeritList = {
  id: number;
  title: string;
  date: string;
  year: Term | null;
  programme: Term | null;
  list_type: Term | null;
  category: Term | null;
  file: WpFile | null;
};

export type Doc = {
  id: number;
  title: string;
  date: string;
  type: Term | null;
  year: Term | null;
  programme: Term | null;
  file: WpFile | null;
  url: string;
};

export type ProgrammeSummary = {
  id: number;
  slug: string;
  title: string;
  short_name: string;
  level: Term | null;
  excerpt: string;
  duration: string;
  pattern: string;
  subjects: string[];
  image: Img | null;
};

export type Programme = ProgrammeSummary & {
  content_html: string;
  eligibility: string;
  career_paths: string[];
  syllabus: WpFile | null;
  intake: string;
  fee_note: string;
};

export type Person = {
  id: number;
  name: string;
  designation: string;
  qualification: string;
  experience: string;
  department: Term | null;
  staff_type: Term | null;
  email: string;
  photo: Img | null;
};

export type Committee = {
  id: number;
  title: string;
  purpose_html: string;
  convener: string;
  members: { name: string; designation: string; role: string }[];
  order_document: WpFile | null;
  year: Term | null;
};

export type Leader = {
  id: number;
  name: string;
  designation: string;
  excerpt: string;
  content_html: string;
  photo: Img | null;
};

export type AlbumSummary = {
  id: number;
  slug: string;
  title: string;
  date: string;
  cover: Img | null;
  photo_count: number;
};

export type Album = AlbumSummary & { content_html: string; photos: Img[] };

export type NewsSummary = {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: Term | null;
  image: Img | null;
};

export type NewsItem = NewsSummary & { content_html: string; gallery: Img[] };

export type Testimonial = {
  id: number;
  name: string;
  quote: string;
  programme_batch: string;
  photo: Img | null;
  /** 'google' reviews carry the Google mark and a link to the original. */
  source: 'college' | 'google';
  rating: number | null;
  review_url: string;
  /** YYYY-MM-DD, as shown on Google. */
  date: string;
};

export type WpPage = {
  id: number;
  title: string;
  path: string;
  subtitle: string;
  content_html: string;
  excerpt: string;
  hero_image: Img | null;
  updated_at: string;
};

export type NoticesResponse = Paged<Notice> & { types: Term[] };

export type NewsResponse = Paged<NewsSummary> & { categories: Term[] };

export type MeritListsResponse = {
  items: MeritList[];
  selected_year: string;
  years: Term[];
  programmes: Term[];
  list_types: Term[];
  categories: Term[];
};

export type DocumentsResponse = { items: Doc[]; years: Term[] };

export type CommitteesResponse = { items: Committee[]; selected_year: string; years: Term[] };

export type PathsResponse = { pages: string[]; programmes: string[]; news: string[]; gallery: string[] };

export type HomeData = {
  slides: Slide[];
  notices: Notice[];
  programmes: ProgrammeSummary[];
  leaders: Leader[];
  news: NewsSummary[];
  gallery: Img[];
  testimonials: Testimonial[];
};
