import { generateDailyTasks, checkAndGenerateTasks } from '@/lib/taskGenerator';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    subject: {
      findMany: jest.fn(),
    },
  },
}));

// Mock LeetCode API
jest.mock('@/lib/leetcode', () => ({
  getDailyChallenge: jest.fn(),
  getProblems: jest.fn(),
}));

// Mock Codeforces API
jest.mock('@/lib/codeforces', () => ({
  getProblems: jest.fn(),
}));

import prisma from '@/lib/db';
import { getDailyChallenge, getProblems as getLeetCodeProblems } from '@/lib/leetcode';
import { getProblems as getCodeforcesProblems } from '@/lib/codeforces';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetDailyChallenge = getDailyChallenge as jest.MockedFunction<typeof getDailyChallenge>;
const mockGetLeetCodeProblems = getLeetCodeProblems as jest.MockedFunction<typeof getLeetCodeProblems>;
const mockGetCodeforcesProblems = getCodeforcesProblems as jest.MockedFunction<typeof getCodeforcesProblems>;

describe('Task Generator', () => {
  const mockUserId = 'user-123';
  const mockDate = new Date('2024-01-15');

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (mockPrisma.task.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.subject.findMany as jest.Mock).mockResolvedValue([]);
    mockGetDailyChallenge.mockResolvedValue(null);
    mockGetLeetCodeProblems.mockResolvedValue([]);
    mockGetCodeforcesProblems.mockResolvedValue([]);
  });

  describe('generateDailyTasks', () => {
    it('should include daily challenge when enabled', async () => {
      mockGetDailyChallenge.mockResolvedValue({
        date: '2024-01-15',
        question: {
          questionId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'Easy',
          topicTags: [{ name: 'Array' }, { name: 'Hash Table' }],
          acRate: 49.5,
        },
      });

      const tasks = await generateDailyTasks({
        userId: mockUserId,
        preferences: {
          dailyProblems: 2,
          dailyLearningMinutes: 60,
          difficultyPreference: 'balanced',
          focusAreas: [],
          theme: 'system',
          includeDailyChallenge: true,
        },
        date: mockDate,
      });

      expect(tasks.some((t) => t.title.includes('Daily Challenge'))).toBe(true);
      expect(tasks.some((t) => t.title.includes('Two Sum'))).toBe(true);
    });

    it('should not include daily challenge when disabled', async () => {
      mockGetDailyChallenge.mockResolvedValue({
        date: '2024-01-15',
        question: {
          questionId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'Easy',
          topicTags: [{ name: 'Array' }],
          acRate: 49.5,
        },
      });

      const tasks = await generateDailyTasks({
        userId: mockUserId,
        preferences: {
          dailyProblems: 2,
          dailyLearningMinutes: 60,
          difficultyPreference: 'balanced',
          focusAreas: [],
          theme: 'system',
          includeDailyChallenge: false,
        },
        date: mockDate,
      });

      expect(tasks.some((t) => t.title.includes('Daily Challenge'))).toBe(false);
    });

    it('should generate learning tasks from subjects', async () => {
      (mockPrisma.subject.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'sub-1',
          name: 'DSA',
          topics: [
            { id: 'topic-1', name: 'Arrays', description: 'Learn arrays', order: 0 },
            { id: 'topic-2', name: 'Linked Lists', description: 'Learn linked lists', order: 1 },
          ],
          userSubjects: [{ status: 'IN_PROGRESS', progress: 0 }],
        },
      ]);

      const tasks = await generateDailyTasks({
        userId: mockUserId,
        preferences: {
          dailyProblems: 0,
          dailyLearningMinutes: 60,
          difficultyPreference: 'balanced',
          focusAreas: ['DSA'],
          theme: 'system',
          includeDailyChallenge: false,
        },
        date: mockDate,
      });

      const learningTasks = tasks.filter((t) => t.type === 'LEARNING');
      expect(learningTasks.length).toBeGreaterThan(0);
      expect(learningTasks[0].title).toContain('DSA');
      expect(learningTasks[0].title).toContain('Arrays');
    });

    it('should generate problem tasks from LeetCode', async () => {
      mockGetLeetCodeProblems.mockResolvedValue([
        {
          questionId: '2',
          title: 'Add Two Numbers',
          titleSlug: 'add-two-numbers',
          difficulty: 'Medium',
          topicTags: [{ name: 'Linked List' }],
          acRate: 40.2,
        },
      ]);

      const tasks = await generateDailyTasks({
        userId: mockUserId,
        preferences: {
          dailyProblems: 1,
          dailyLearningMinutes: 0,
          difficultyPreference: 'medium',
          focusAreas: [],
          theme: 'system',
          includeDailyChallenge: false,
        },
        date: mockDate,
      });

      const problemTasks = tasks.filter((t) => t.type === 'PROBLEM');
      expect(problemTasks.length).toBe(1);
      expect(problemTasks[0].title).toBe('Add Two Numbers');
      expect(problemTasks[0].platform).toBe('LEETCODE');
    });

    it('should respect difficulty preference', async () => {
      mockGetLeetCodeProblems.mockResolvedValue([
        {
          questionId: '3',
          title: 'Hard Problem',
          titleSlug: 'hard-problem',
          difficulty: 'Hard',
          topicTags: [],
          acRate: 20.0,
        },
      ]);

      const tasks = await generateDailyTasks({
        userId: mockUserId,
        preferences: {
          dailyProblems: 1,
          dailyLearningMinutes: 0,
          difficultyPreference: 'hard',
          focusAreas: [],
          theme: 'system',
          includeDailyChallenge: false,
        },
        date: mockDate,
      });

      const problemTasks = tasks.filter((t) => t.type === 'PROBLEM');
      expect(problemTasks[0]?.difficulty).toBe('HARD');
    });

    it('should create tasks with correct structure', async () => {
      mockGetDailyChallenge.mockResolvedValue({
        date: '2024-01-15',
        question: {
          questionId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'Easy',
          topicTags: [{ name: 'Array' }],
          acRate: 49.5,
        },
      });

      const tasks = await generateDailyTasks({
        userId: mockUserId,
        preferences: {
          dailyProblems: 1,
          dailyLearningMinutes: 0,
          difficultyPreference: 'balanced',
          focusAreas: [],
          theme: 'system',
          includeDailyChallenge: true,
        },
        date: mockDate,
      });

      expect(tasks[0]).toMatchObject({
        userId: mockUserId,
        date: mockDate,
        type: 'PROBLEM',
        status: 'PENDING',
        platform: 'LEETCODE',
      });
      expect(tasks[0].referenceLink).toContain('leetcode.com');
    });
  });

  describe('checkAndGenerateTasks', () => {
    it('should return true when no tasks exist for today', async () => {
      (mockPrisma.task.count as jest.Mock).mockResolvedValue(0);

      const result = await checkAndGenerateTasks(mockUserId);
      expect(result).toBe(true);
    });

    it('should return false when tasks already exist for today', async () => {
      (mockPrisma.task.count as jest.Mock).mockResolvedValue(5);

      const result = await checkAndGenerateTasks(mockUserId);
      expect(result).toBe(false);
    });
  });
});
