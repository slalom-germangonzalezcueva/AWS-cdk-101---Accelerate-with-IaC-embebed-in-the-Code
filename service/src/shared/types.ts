export type CvItemType = 'skill' | 'workHistory' | 'education' | 'project' | 'certification' | string;

export interface CvItemInput {
  type: CvItemType;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, unknown>;
}

export interface ProfileInput {
  fullName?: string;
  headline?: string;
  location?: string;
  summary?: string;
  email?: string;
  phone?: string;
  imageKey?: string;
}
