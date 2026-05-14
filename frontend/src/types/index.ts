export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  skills: string[];
  experience: ResumeExperience[];
}

export interface ResumeExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  company: string;
  persona: 'analytical' | 'challenging' | 'conversational';
  rigorLevel: number;
  duration: number;
  status: 'setup' | 'active' | 'completed';
  score?: number;
  createdAt: string;
}

export interface Question {
  id: string;
  sessionId: string;
  category: string;
  text: string;
  subPrompt?: string;
  timeLimit: number;
  order: number;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  confidence: 'low' | 'medium' | 'high';
  duration: number;
  score?: number;
  feedback?: string;
}

export interface FeedbackReport {
  id: string;
  sessionId: string;
  overallScore: number;
  overallAssessment: string;
  strengths: FeedbackItem[];
  improvements: FeedbackItem[];
  recommendedActions: RecommendedAction[];
  vocalConfidenceData: { label: string; value: number }[];
}

export interface FeedbackItem {
  title: string;
  description: string;
}

export interface RecommendedAction {
  title: string;
  link: string;
}

export interface AnalyticsData {
  readinessScore: number;
  readinessTrend: number;
  criticalGaps: number;
  avgResolutionTime: string;
  weakTopics: WeakTopic[];
  heatmapData: HeatmapRow[];
  progressionData: { week: string; value: number }[];
  sessionHistory: SessionHistoryItem[];
}

export interface WeakTopic {
  name: string;
  description: string;
  severity: number;
  level: 'low' | 'medium' | 'high';
}

export interface HeatmapRow {
  label: string;
  cells: number[];
}

export interface SessionHistoryItem {
  id: string;
  type: string;
  icon: string;
  title: string;
  date: string;
  duration: string;
  score: number;
}

export interface NavItem {
  icon: string;
  label: string;
  path: string;
}
