/**
 * Pages whose WordPress prose is followed by a list of documents (Plan Phase 7, tasks 4–5).
 * Keyed by site path. `types` holds one or more `document_type` slugs from WordPress.
 *
 * To add a document section: create the WordPress page, then add an entry here.
 */

export type DocumentSection = {
  /** document_type slugs, comma-separated (matches GET /documents?type=). */
  types: string;
  heading: string;
  emptyTitle: string;
  emptyDescription?: string;
  /** One accordion per academic session, latest open. */
  groupByYear?: boolean;
  /** Show a Programme column. */
  showProgramme?: boolean;
};

const PUBLISHED_WHEN_RELEASED = 'Documents appear here as soon as the college publishes them.';

export const documentSections: Record<string, DocumentSection> = {
  '/students/syllabus': {
    types: 'syllabus',
    heading: 'Syllabus documents',
    groupByYear: true,
    showProgramme: true,
    emptyTitle: 'No syllabus published yet',
    emptyDescription: 'The syllabus for each programme appears here once the college publishes it.',
  },
  '/students/question-papers': {
    types: 'question-paper',
    heading: 'Question papers',
    groupByYear: true,
    showProgramme: true,
    emptyTitle: 'No question papers published yet',
    emptyDescription: PUBLISHED_WHEN_RELEASED,
  },
  '/students/downloads': {
    types: 'form',
    heading: 'Forms and downloads',
    emptyTitle: 'No forms published yet',
    emptyDescription: PUBLISHED_WHEN_RELEASED,
  },
  '/iqac/reports': {
    types: 'aqar,aishe,annual-report',
    heading: 'Reports',
    groupByYear: true,
    emptyTitle: 'No reports published yet',
    emptyDescription: 'AQAR, AISHE and annual reports appear here once they are submitted and published.',
  },
  '/academics/academic-calendar': {
    types: 'calendar',
    heading: 'Academic calendar',
    groupByYear: true,
    emptyTitle: 'No academic calendar published yet',
    emptyDescription: 'The calendar for the current session appears here once it is released.',
  },
  '/about/mandatory-disclosures': {
    types: 'disclosure',
    heading: 'Disclosure documents',
    emptyTitle: 'No disclosure documents published yet',
    emptyDescription: PUBLISHED_WHEN_RELEASED,
  },
  '/iqac/naac': {
    types: 'naac',
    heading: 'NAAC documents',
    emptyTitle: 'No NAAC documents published yet',
    emptyDescription: PUBLISHED_WHEN_RELEASED,
  },
  '/iqac/ugc-compliance': {
    types: 'compliance',
    heading: 'Compliance documents',
    emptyTitle: 'No compliance documents published yet',
    emptyDescription: PUBLISHED_WHEN_RELEASED,
  },
  '/students/anti-ragging': {
    types: 'anti-ragging',
    heading: 'Anti-ragging documents',
    emptyTitle: 'No anti-ragging documents published yet',
    emptyDescription: 'The undertaking format and committee order appear here once they are published.',
  },
  '/admissions/fee-structure': {
    types: 'fee',
    heading: 'Fee structure',
    groupByYear: true,
    emptyTitle: 'No fee structure published yet',
    emptyDescription: 'The official fee structure appears here once the college publishes it.',
  },
};

export function getDocumentSection(path: string): DocumentSection | undefined {
  return documentSections[path];
}
