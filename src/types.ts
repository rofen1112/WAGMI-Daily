export type Channel = 'ai' | 'github' | 'skills' | 'operations';
export type Track = 'main' | 'dev';

export interface SourceLink {
  label: string;
  url: string;
  language?: 'zh' | 'en' | 'other';
  role?: 'original' | 'coverage' | 'discovery';
  visibility?: 'internal' | 'public';
}

export interface Report {
  id: string;
  title: string;
  date: string;
  channel: 'ai' | 'github' | 'skills';
  format: 'markdown' | 'html';
  path: string;
}

export interface LocalReport {
  id: string;
  projectRepo: string;
  title: string;
  date: string;
  format: 'html';
  status: 'draft' | 'final' | 'archived';
  author: string;
  summary: string;
  path: string;
}

export interface BriefAction {
  id: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  channel: Channel;
}

export interface Highlight {
  id: string;
  channel: 'ai' | 'github' | 'skills';
  date: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  action: string;
  sourceReportId: string;
}

export interface Project {
  id: string;
  name: string;
  repo: string;
  url: string;
  category: string;
  stars: number;
  forks: number;
  starsDelta: number;
  starsDeltaWindowStart?: string | null;
  starsDeltaWindowEnd?: string;
  starsDeltaSemantics?: 'local_snapshot_change';
  repoAliases?: string[];
  level: string;
  levelChange: string;
  verification: 'verified' | 'related_official';
  lastActivity: string;
  summary: string;
  riskNote: string;
  sourceReportId: string;
  industryFit?: 'high' | 'medium' | 'low';
  priorityDomains?: string[];
  originality?: string;
  maintenanceEvidence?: string;
  intakeDecision?: 'approved' | 'observe' | 'rejected';
  decisionReason?: string;
  license?: string;
  trackingStatus?: 'active' | 'delisted';
  delistedAt?: string | null;
  delistedReason?: string | null;
  availabilityCheckedAt?: string | null;
}

export interface GithubTrendSignal {
  id: string;
  weight: number;
  rank?: number;
  period?: string;
}

export interface GithubTrendDomain {
  id: string;
  label: string;
}

export interface GithubTrendCandidate {
  repo: string;
  url: string;
  name: string;
  description: string;
  language?: string | null;
  periodStars24h: number;
  periodStarsWeekly: number;
  activityScore24h?: number;
  activityScoreWeekly?: number;
  pushes24h?: number;
  pullRequests24h?: number;
  sourceSignals: GithubTrendSignal[];
  topics: string[];
  forcedByAI?: boolean;
  tracked: boolean;
  fork: boolean;
  totalStars: number;
  forks: number;
  openIssues?: number;
  createdAt?: string;
  pushedAt: string;
  archived: boolean;
  license?: string | null;
  curatedIndustry?: boolean;
  observedDelta?: number;
  hotScore: number;
  aiRelevant?: boolean;
  industryRelevant?: boolean;
  priorityDomains: GithubTrendDomain[];
  intakePriority?: string;
  heatRequiredForIntake?: boolean;
  qualityGate: boolean;
  qualityRisks: string[];
  intakeRecommendation?: string;
  aiReviewStatus?: string;
  hotLevel: 'surging' | 'hot' | 'watch';
  hotReasons: string[];
  trackingStatus?: 'active' | 'delisted';
  delistedAt?: string | null;
}

export interface AiEvent {
  id: string;
  date: string;
  dateStart?: string;
  dateEnd?: string;
  periodLabel?: string;
  archived?: boolean;
  title: string;
  summary: string;
  whyItMatters: string;
  action: string;
  priority: 'A' | 'B' | 'C';
  boards: string[];
  sourceType: 'official' | 'official_and_followed' | 'trusted_media' | string;
  verification: 'verified' | 'pending';
  entities: string[];
  repoCandidates: string[];
  sources: SourceLink[];
  readingSources?: SourceLink[];
  sourceReportId: string;
  contentKind?: 'event' | 'paper';
  paper?: {
    titleOriginal: string;
    authors: string[];
    publishedAt: string;
    venue: string;
    paperUrl: string;
    pdfUrl?: string;
    projectUrl?: string;
    codeUrl?: string;
    readingLevel: 'abstract' | 'fulltext';
  };
}

export interface AiWeeklySummary {
  id: string;
  generatedAt: string;
  range: { start: string; end: string };
  totalEvents: number;
  boardCounts: { name: string; count: number }[];
  trends: { title: string; summary: string; action?: string }[];
  entities: { name: string; count: number; type?: string }[];
  projectCandidates: string[];
  sourceReportPath?: string;
  run?: RunRecord;
  report?: Report;
}

export interface RunRecord {
  id: string;
  name: string;
  channel: Channel;
  schedule: string;
  lastSuccess: string | null;
  status: 'success' | 'warning' | 'failed' | 'unknown';
  artifact: string | null;
  message: string;
}

export interface Candidate {
  id: string;
  name: string;
  status: string;
  source: string;
  reason: string;
  decisionNote?: string;
  decisionUpdatedAt?: string;
}

export interface CreatorWatch {
  name: string;
  kind?: 'official' | 'media' | 'creator' | 'community';
  status: string;
  priority: number;
  focus: string[];
  url: string;
  why: string;
  seed_links: string[];
  last_seen_at: string;
}

export interface ModelWatchRepository {
  repo: string;
  url: string;
  roleZh: string;
}

export interface ModelWatchItem {
  id: string;
  name: string;
  modelId: string;
  source: 'huggingface';
  url: string;
  publisher: string;
  level: string;
  relationship: 'official-base-model' | 'official-derivative' | 'community-finetune';
  releaseType: 'open-source' | 'open-weight';
  access: 'public' | 'gated';
  license: string;
  modalities: string[];
  tasks: string[];
  priorityDomains: string[];
  summaryZh: string;
  valueZh: string;
  riskNoteZh: string;
  upstreamModels: string[];
  relatedRepositories: ModelWatchRepository[];
  metrics: {
    likes: number | null;
    downloadsLastMonth: number | null;
    downloadsTracked: boolean;
  };
  reviewedAt: string;
  intakeDecision: 'approved' | 'observe' | 'rejected';
  decisionReason: string;
}

export interface SkillTrend {
  id: string;
  date: string;
  rank: number;
  name: string;
  source: string;
  skillId?: string;
  sourceType: 'github' | 'well-known' | string;
  url: string;
  installUrl: string | null;
  trendInstalls?: number;
  heatInstalls: number;
  hourInstalls?: number;
  installsYesterday?: number;
  change?: number;
  hotRank?: number;
  previousTrendInstalls?: number | null;
  trendInstallChange?: number | null;
  previousRank?: number | null;
  rankChange?: number | null;
  trendStatus?: 'new' | 'up' | 'down' | 'flat';
  previousHotRank?: number | null;
  hotRankChange?: number | null;
  hotStatus?: 'entered' | 'exited' | 'up' | 'down' | 'flat' | 'not_hot';
  comparisonDate?: string | null;
  totalInstalls: number | null;
  isOfficial: boolean;
  officialOwner?: string | null;
  weeklyInstalls?: number[];
  allTimeRank?: number | null;
  rawDescription: string;
  descriptionZh: string;
  useCases: string[];
  category: string;
  metadataStatus: 'success' | 'fallback';
  capturedAt: string;
  sourceReportId: string;
}

export interface SkillCatalogItem {
  id: string;
  name: string;
  source: string;
  skillId: string;
  sourceType: 'github' | 'well-known' | string;
  url: string;
  installUrl: string | null;
  totalInstalls: number;
  weeklyInstalls: number[];
  allTimeRank: number | null;
  isOfficial: boolean;
  officialOwner: string | null;
  hourInstalls?: number;
  installsYesterday?: number;
  change?: number;
  hotRank?: number;
  previousTrendInstalls?: number | null;
  trendInstallChange?: number | null;
  previousRank?: number | null;
  rankChange?: number | null;
  trendStatus?: 'new' | 'up' | 'down' | 'flat';
  previousHotRank?: number | null;
  hotRankChange?: number | null;
  hotStatus?: 'entered' | 'exited' | 'up' | 'down' | 'flat' | 'not_hot';
  comparisonDate?: string | null;
  descriptionZh: string;
  useCases: string[];
  category: string;
  capturedAt: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastCheckedAt?: string | null;
  availabilityStatus?: 'active' | 'monitoring' | 'needs_review';
  missingRuns?: number;
  missingSince?: string | null;
}

export interface SkillCatalogSummary {
  totalSkills: number;
  activeSkills?: number;
  monitoringSkills?: number;
  needsReviewSkills?: number;
  officialSkills: number;
  officialOwners: number;
  sourceOfficialRows?: number;
  newSkills: number;
  path: string;
  syncedAt: string;
}

export interface SkillCatalog {
  schemaVersion: '1.0.0';
  generatedAt: string;
  asOf: string;
  source: string;
  stats: Omit<SkillCatalogSummary, 'path' | 'syncedAt'>;
  skills: SkillCatalogItem[];
}

export type PaperReviewStatus = 'discovered' | 'queued' | 'interpreted' | 'verified';
export type PaperAvailabilityStatus = 'active' | 'monitoring' | 'needs_review';
export type PaperRepositoryRelation = 'official_code' | 'project_page' | 'baseline' | 'related_method' | 'downstream_application';

export interface PaperTopic {
  id: string;
  labelZh: string;
  board: string;
  score: number;
  matchedTerms: string[];
}

export interface PaperRepositoryLink {
  repo: string;
  url: string;
  relation: PaperRepositoryRelation;
  labelZh: string;
  evidenceUrl: string;
  confidence: 'high' | 'medium' | 'contextual';
  verified: boolean;
}

export interface PaperCatalogItem {
  id: string;
  arxivId: string;
  source: 'arxiv' | string;
  titleOriginal: string;
  titleZh: string;
  abstractOriginal: string;
  summaryZh: string;
  authors: string[];
  categories: string[];
  publishedAt: string;
  originalPublishedAt?: string | null;
  rssAnnouncedAt?: string | null;
  dateSemantics?: 'original_submission' | 'rss_announcement';
  url: string;
  pdfUrl: string | null;
  licenseUrl: string | null;
  score: number;
  heatScore: number;
  reviewTier: 'deep' | 'digest' | 'watch';
  reviewStatus: PaperReviewStatus;
  reviewPriority: 'automatic' | 'immediate' | null;
  reviewRequestedAt: string | null;
  readingLevel: 'metadata' | 'abstract' | 'fulltext';
  topics: PaperTopic[];
  targetBoards: string[];
  reasonsZh: string[];
  recommendationReasonsZh: string[];
  keyContributionsZh: string[];
  industryValueZh: string;
  limitationsZh: string;
  futureOutlookZh: string;
  relatedRepositories: PaperRepositoryLink[];
  firstSeenAt: string;
  lastSeenAt: string;
  lastCheckedAt: string;
  availabilityStatus: PaperAvailabilityStatus;
  missingRuns: number;
  lastMissingDate?: string | null;
  scheduledFor: string | null;
  reviewedAt: string | null;
}

export interface PaperTrendCluster {
  id: string;
  labelZh: string;
  evidenceLevel: 'strong' | 'emerging';
  paperIds: string[];
  repositories: string[];
  conclusionZh: string;
}

export interface PaperCatalog {
  schemaVersion: '1.0.0';
  generatedAt: string;
  asOf: string;
  source: string;
  stats: {
    totalPapers: number;
    activePapers: number;
    monitoringPapers: number;
    needsReviewPapers: number;
    addedToday: number;
    queuedPapers: number;
    priorityQueuedPapers: number;
    interpretedPapers: number;
    linkedPapers: number;
    linkedRepositories: number;
  };
  budgets: { deepRead: number; fullText: number; digest: number };
  reviewQueue: string[];
  priorityReviewQueue: string[];
  dailyRecommendations: string[];
  trendClusters: PaperTrendCluster[];
  papers: PaperCatalogItem[];
}

export interface Snapshot {
  schemaVersion: '1.0.0';
  track: Track;
  generatedAt: string;
  asOf: {
    github: string;
    ai: string;
    skills: string;
  };
  brief: {
    date: string;
    title: string;
    summary: string;
    actions: BriefAction[];
    highlights: Highlight[];
  };
  projects: Project[];
  githubTrends?: GithubTrendCandidate[];
  aiEvents: AiEvent[];
  skills: SkillTrend[];
  skillCatalog?: SkillCatalogSummary;
  runs: RunRecord[];
  reports: Report[];
  localReports?: LocalReport[];
  candidates: Candidate[];
  watchlist: CreatorWatch[];
  modelWatchlist?: ModelWatchItem[];
  weeklySummaries?: AiWeeklySummary[];
}
