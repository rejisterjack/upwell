export type ServiceState =
  | "unknown"
  | "operational"
  | "degraded"
  | "down"
  | "maintenance";

export type CheckOutcome = "up" | "degraded" | "down";

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export type IncidentImpact = "minor" | "major" | "critical" | "maintenance";

export type BannerTone =
  | "operational"
  | "degraded"
  | "partial"
  | "major"
  | "maintenance"
  | "unknown"
  | "delayed";

export type DayTone = "empty" | "up" | "degraded" | "down";

export type DayCell = {
  date: string;
  tone: DayTone;
  uptime: number | null;
};

export type ServiceView = {
  id: string;
  name: string;
  description: string | null;
  groupLabel: string | null;
  status: ServiceState;
  enabled: boolean;
  uptimePercent: number | null;
  responseMs: number | null;
  lastCheckedAt: string | null;
  days: DayCell[];
};

export type IncidentUpdateView = {
  id: string;
  body: string;
  status: IncidentStatus;
  createdAt: string;
};

export type IncidentView = {
  id: string;
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  startedAt: string;
  resolvedAt: string | null;
  updates: IncidentUpdateView[];
  serviceNames: string[];
};

export type Banner = {
  tone: BannerTone;
  title: string;
  detail: string;
};

export type ServiceGroup = {
  label: string;
  services: ServiceView[];
};

export type PublicSnapshot = {
  siteName: string;
  siteUrl: string;
  banner: Banner;
  delayed: boolean;
  updatedAt: string | null;
  services: ServiceView[];
  groups: ServiceGroup[];
  activeIncidents: IncidentView[];
  incidents: IncidentView[];
};
