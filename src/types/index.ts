// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  preferences: UserPreferences | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  leetcodeUsername?: string;
  codeforcesHandle?: string;
  dailyProblems: number;
  dailyLearningMinutes: number;
  difficultyPreference: DifficultyPreference;
  focusAreas: string[];
  theme: 'light' | 'dark' | 'system';
  includeDailyChallenge: boolean;
}

export type DifficultyPreference = 'easy' | 'medium' | 'hard' | 'balanced';

// Subject & Topic Types
export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  topics: Topic[];
  createdAt: Date;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  order: number;
  status: TopicStatus;
  resources?: string[];
}

export type TopicStatus = 'todo' | 'in_progress' | 'done';

// Task Types
export interface Task {
  id: string;
  userId: string;
  date: Date;
  type: TaskType;
  title: string;
  description?: string;
  referenceLink?: string;
  platform?: Platform;
  difficulty?: Difficulty;
  tags?: string[];
  status: TaskStatus;
  completedAt?: Date;
  createdAt: Date;
}

export type TaskType = 'problem' | 'learning' | 'review';
export type TaskStatus = 'pending' | 'completed' | 'skipped';
export type Platform = 'leetcode' | 'codeforces';
export type Difficulty = 'easy' | 'medium' | 'hard';

// Problem Types (cached from external APIs)
export interface Problem {
  id: string;
  platform: Platform;
  externalId: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  link: string;
  acceptance?: number;
  createdAt: Date;
}

// Activity & Progress Types
export interface ActivityLog {
  id: string;
  userId: string;
  date: Date;
  tasksCompleted: number;
  problemsSolved: number;
  learningMinutes: number;
  streak: number;
}

export interface DashboardData {
  todaysTasks: Task[];
  currentStreak: number;
  longestStreak: number;
  totalProblemsSolved: number;
  weeklyProgress: WeeklyProgress;
  activityHeatmap: HeatmapData[];
  platformStats: PlatformStats;
}

export interface WeeklyProgress {
  problems: number;
  learning: number;
  target: number;
}

export interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// Platform Stats Types
export interface PlatformStats {
  leetcode?: LeetCodeStats;
  codeforces?: CodeforcesStats;
}

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  acceptanceRate: number;
}

export interface CodeforcesStats {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  problemsSolved: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// LeetCode API Types
export interface LeetCodeProblem {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  topicTags: { name: string }[];
  acRate: number;
}

export interface LeetCodeDailyChallenge {
  date: string;
  question: LeetCodeProblem;
}

// Codeforces API Types
export interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

export interface CodeforcesUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}
