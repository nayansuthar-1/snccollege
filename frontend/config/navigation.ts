/**
 * Single source of navigation — header, mobile drawer, footer, section sidebars, breadcrumbs.
 *
 * Structure follows the college's own menu (the old snccollegedpr.in grouping), which the
 * owner asked for on 2026-10-10. It replaces the regrouped IA of design system §7.2; the
 * routes themselves are unchanged, so §7.1 and the §7.3 redirects still hold. Pages that the
 * old menu had no slot for (merit lists, notices, downloads, admission kit, IQAC reports,
 * Pragati Sansthan, news) are added to the nearest dropdown so nothing becomes unreachable.
 *
 * Styling rules still apply: max 2 levels, max 10 links per menu except the wide "Activities"
 * menu (12, two columns). See docs/PROGRESS.md "Phase 10 follow-up" for the recorded deviations.
 *
 * `description` is used only on section landing pages (child-page cards).
 */

export type NavLink = { label: string; href: string; description?: string; external?: boolean };
export type NavGroup = { heading?: string; links: NavLink[] };
export type NavPanel = { tagline: string; title: string; image?: string; cta?: NavLink };
export type NavItem = {
  label: string;
  href: string;
  groups?: NavGroup[];
  panel?: NavPanel;
  /** Wide mega menu (two link columns). */
  wide?: boolean;
};

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    groups: [
      {
        links: [
          { label: 'About SNC', href: '/about', description: 'The college, its history and what it stands for.' },
          { label: 'Message', href: '/about/messages', description: 'Messages from the Chairman and the Principal.' },
          { label: 'Infrastructure', href: '/about/infrastructure', description: 'Library, laboratories, classrooms and campus facilities.' },
          { label: 'College Committee', href: '/iqac/committees', description: 'College committees and cells, session-wise.' },
          { label: 'Affiliations', href: '/about/affiliations', description: 'Universities the college is affiliated and associated with.' },
          { label: 'Our Values', href: '/about/vision-mission', description: 'Vision, mission, ladder of success and philosophy.' },
          { label: 'Pragati Sansthan', href: '/about/pragati-sansthan', description: 'The organisation that runs the college, and its milestones.' },
        ],
      },
    ],
    panel: { tagline: 'Estd. 2005', title: 'Simalwara, Dungarpur' },
  },
  {
    label: 'Activities',
    href: '/campus-life',
    wide: true,
    // Two groups = the two columns of the menu, in the order the college's menu shows them.
    groups: [
      {
        links: [
          { label: 'Support & Guidance', href: '/campus-life/support-guidance', description: 'Student welfare, counselling and complaint cells.' },
          { label: 'IQAC', href: '/iqac', description: 'The Internal Quality Assurance Cell and its functions.' },
          { label: 'Student Grievance Redressal Cell', href: '/students/grievance-redressal', description: 'How to raise and resolve a student grievance.' },
          { label: 'Mandatory Disclosures', href: '/about/mandatory-disclosures', description: 'Information disclosed as required by regulatory bodies.' },
          { label: 'Examination Section', href: '/academics/examinations', description: 'University examination forms, time tables and results.' },
          { label: 'UGC / Statutory Bodies Compliance', href: '/iqac/ugc-compliance', description: 'Statutory and regulatory compliance documents.' },
        ],
      },
      {
        links: [
          { label: 'NAAC', href: '/iqac/naac', description: 'Assessment and accreditation by NAAC.' },
          { label: 'Placement Cell', href: '/campus-life/placement-cell', description: 'Career guidance, skill development and placement support.' },
          { label: 'Anti-Ragging Committee & Undertaking', href: '/students/anti-ragging', description: 'Policy, committee and how to report ragging.' },
          { label: 'Faculty / Staff Details', href: '/academics/faculty', description: 'Teaching and administrative staff of the college.' },
          { label: 'Academic Calendar', href: '/academics/academic-calendar', description: 'Teaching, examination and holiday schedule.' },
          { label: 'Reports (AQAR / AISHE)', href: '/iqac/reports', description: 'Quality and statistical reports submitted by the college.' },
        ],
      },
    ],
    panel: { tagline: 'Activities', title: 'Cells, committees & compliance' },
  },
  { label: 'Courses', href: '/academics/programmes' },
  { label: 'Scholarship', href: '/admissions/scholarships' },
  {
    label: 'Student Corner',
    href: '/students',
    groups: [
      {
        links: [
          { label: 'Admission', href: '/admissions', description: 'Steps, eligibility and documents required.' },
          { label: 'Admission Form', href: '/admissions/apply', description: 'How to complete and submit your application.' },
          { label: 'Merit Lists', href: '/admissions/merit-lists', description: 'Merit, waiting and admitted lists by session.' },
          { label: 'Notices', href: '/students/notices', description: 'Latest notices and circulars from the college.' },
          { label: 'Syllabus', href: '/students/syllabus', description: 'Syllabus prescribed by GGTU, Banswara.' },
          { label: 'Old Question Papers', href: '/students/question-papers', description: 'Previous year university question papers.' },
          { label: 'Migration Nodal', href: '/students/migration', description: 'Applying for a migration certificate.' },
          { label: 'Downloads', href: '/students/downloads', description: 'Forms and documents for students.' },
          { label: 'Admission Kit & Dress Code', href: '/admissions/admission-kit', description: 'College uniform and items required after admission.' },
        ],
      },
    ],
    panel: { tagline: 'Student Corner', title: 'Notices, syllabus & forms' },
  },
  {
    label: 'Gallery',
    href: '/campus-life/gallery',
    groups: [
      {
        links: [
          { label: 'Photo Gallery', href: '/campus-life/gallery', description: 'Photographs of campus events and activities.' },
          { label: 'Video Gallery', href: '/campus-life/videos', description: 'Videos of college events and activities.' },
          { label: 'Press Note', href: '/news?category=press-notes', description: 'The college in the press.' },
          { label: 'Alumni', href: '/campus-life/alumni', description: 'Stay connected with the SNC alumni network.' },
          { label: 'News & Events', href: '/news', description: 'College news, events and press notes.' },
        ],
      },
    ],
    panel: { tagline: 'Life @ SNC', title: 'Photos, videos & press' },
  },
  { label: 'Contact Us', href: '/contact' },
];

export const utilityLinks: NavLink[] = [
  { label: 'IQAC', href: '/iqac' },
  { label: 'NAAC', href: '/iqac/naac' },
  { label: 'Mandatory Disclosures', href: '/about/mandatory-disclosures' },
  { label: 'Notices', href: '/students/notices' },
  { label: 'Alumni', href: '/campus-life/alumni' },
  { label: 'Contact', href: '/contact' },
];

export const footerQuickLinks: NavLink[] = [
  { label: 'About SNC', href: '/about' },
  { label: 'Courses', href: '/academics/programmes' },
  { label: 'Admission', href: '/admissions' },
  { label: 'Merit Lists', href: '/admissions/merit-lists' },
  { label: 'Notices', href: '/students/notices' },
  { label: 'Photo Gallery', href: '/campus-life/gallery' },
  { label: 'Contact', href: '/contact' },
];

export const footerImportantLinks: NavLink[] = [
  { label: 'GGTU, Banswara', href: 'https://ggtu.ac.in', external: true },
  { label: 'VMOU, Kota', href: 'https://vmou.ac.in', external: true },
  { label: 'Rajasthan Scholarship Portal', href: 'https://sje.rajasthan.gov.in', external: true },
  { label: 'UGC', href: 'https://www.ugc.gov.in', external: true },
  { label: 'AISHE', href: 'https://aishe.gov.in', external: true },
  { label: 'Academic Bank of Credits', href: 'https://www.abc.gov.in', external: true },
];

/** All links of a nav item, flattened. */
export function navItemLinks(item: NavItem): NavLink[] {
  return item.groups?.flatMap((g) => g.links) ?? [];
}

/** Path part of a nav href, without any query string (`/news?category=…` → `/news`). */
function pathOf(href: string): string {
  return href.split('?')[0];
}

/**
 * The top-level nav item whose href is exactly this path **and** that has a menu, if any.
 * Used for section landing pages. Items without a menu (Courses, Scholarship, Contact Us)
 * are ordinary pages, not section roots.
 */
export function getSectionRoot(pathname: string): NavItem | undefined {
  return mainNav.find((item) => item.href !== '/' && item.href === pathname && !!item.groups);
}

/**
 * Top-level section that owns a path, e.g. "/about/messages" → About.
 * Longest match wins, so "/campus-life/gallery" resolves to Gallery and not to Activities.
 */
export function getSectionForPath(pathname: string): NavItem | undefined {
  if (pathname === '/') return undefined;

  const longestMatch = (candidates: { item: NavItem; href: string }[]) =>
    candidates
      .filter(({ href }) => href !== '/' && (pathname === href || pathname.startsWith(`${href}/`)))
      .sort((a, b) => b.href.length - a.href.length)[0]?.item;

  const direct = longestMatch(mainNav.map((item) => ({ item, href: item.href })));
  if (direct) return direct;

  // Pages listed inside a section menu but living elsewhere (e.g. /iqac/naac under Activities).
  return longestMatch(mainNav.flatMap((item) => navItemLinks(item).map((link) => ({ item, href: pathOf(link.href) }))));
}

export function isActivePath(pathname: string, href: string): boolean {
  const path = pathOf(href);
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export type Crumb = { label: string; href?: string };

/** Home › Section › Current page. */
export function getBreadcrumbs(pathname: string, currentTitle: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Home', href: '/' }];
  const section = getSectionForPath(pathname);
  if (section && section.href !== pathname) crumbs.push({ label: section.label, href: section.href });
  crumbs.push({ label: currentTitle });
  return crumbs;
}
