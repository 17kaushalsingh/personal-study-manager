'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Card, { CardHeader, CardContent } from '@/components/Card';
import TaskCard from '@/components/TaskCard';
import Heatmap from '@/components/Heatmap';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';
import { Task, HeatmapData } from '@/types';
import styles from './page.module.css';

interface DashboardData {
  todaysTasks: Task[];
  currentStreak: number;
  longestStreak: number;
  totalProblemsSolved: number;
  weeklyProgress: {
    problems: number;
    learning: number;
    target: number;
  };
  heatmapData: HeatmapData[];
  platformStats: {
    leetcode?: {
      totalSolved: number;
      ranking: number;
    };
    codeforces?: {
      rating: number;
      rank: string;
    };
  };
  subjectProgress: Array<{
    id: string;
    name: string;
    icon: string | null;
    progress: number;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchDashboard();
    }
  }, [session]);

  const handleGenerateTasks = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/tasks/generate', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setData((prev) => prev ? { ...prev, todaysTasks: result.data.tasks } : null);
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (response.ok) {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            todaysTasks: prev.todaysTasks.map((t) =>
              t.id === taskId ? { ...t, status: 'COMPLETED' as const } : t
            ),
          };
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleSkipTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SKIPPED' }),
      });
      if (response.ok) {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            todaysTasks: prev.todaysTasks.map((t) =>
              t.id === taskId ? { ...t, status: 'SKIPPED' as const } : t
            ),
          };
        });
      }
    } catch (error) {
      console.error('Error skipping task:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>
                Welcome back, {session?.user?.name || 'Student'}!
              </p>
            </div>
          </div>

          <div className={styles.grid}>
            {/* Stats Cards */}
            <div className={styles.statsRow}>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <span className={styles.statIcon}>🔥</span>
                  <div>
                    <p className={styles.statLabel}>Current Streak</p>
                    <p className={styles.statValue}>{data?.currentStreak || 0} days</p>
                  </div>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <span className={styles.statIcon}>🏆</span>
                  <div>
                    <p className={styles.statLabel}>Longest Streak</p>
                    <p className={styles.statValue}>{data?.longestStreak || 0} days</p>
                  </div>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <span className={styles.statIcon}>✅</span>
                  <div>
                    <p className={styles.statLabel}>Problems Solved</p>
                    <p className={styles.statValue}>{data?.totalProblemsSolved || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Today's Tasks */}
            <Card className={styles.tasksCard}>
              <CardHeader>
                <div className={styles.tasksHeader}>
                  <h2>Today&apos;s Tasks</h2>
                  {(!data?.todaysTasks || data.todaysTasks.length === 0) && (
                    <Button onClick={handleGenerateTasks} loading={generating}>
                      Generate Tasks
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {data?.todaysTasks && data.todaysTasks.length > 0 ? (
                  <div className={styles.tasksList}>
                    {data.todaysTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleCompleteTask}
                        onSkip={handleSkipTask}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyTasks}>
                    <p>No tasks for today. Generate some to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Heatmap */}
            <Card className={styles.heatmapCard}>
              <CardHeader>
                <h2>Activity</h2>
              </CardHeader>
              <CardContent>
                {data?.heatmapData && data.heatmapData.length > 0 ? (
                  <Heatmap data={data.heatmapData} />
                ) : (
                  <p className={styles.emptyState}>No activity data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className={styles.progressCard}>
              <CardHeader>
                <h2>Weekly Progress</h2>
              </CardHeader>
              <CardContent>
                <div className={styles.progressItem}>
                  <div className={styles.progressLabel}>
                    <span>Problems</span>
                    <span>{data?.weeklyProgress?.problems || 0} / {data?.weeklyProgress?.target || 14}</span>
                  </div>
                  <ProgressBar
                    value={data?.weeklyProgress?.problems || 0}
                    max={data?.weeklyProgress?.target || 14}
                    color="primary"
                  />
                </div>
                <div className={styles.progressItem}>
                  <div className={styles.progressLabel}>
                    <span>Learning</span>
                    <span>{data?.weeklyProgress?.learning || 0} min</span>
                  </div>
                  <ProgressBar
                    value={data?.weeklyProgress?.learning || 0}
                    max={300}
                    color="success"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Subject Progress */}
            <Card className={styles.subjectsCard}>
              <CardHeader>
                <h2>Subject Progress</h2>
              </CardHeader>
              <CardContent>
                {data?.subjectProgress && data.subjectProgress.length > 0 ? (
                  <div className={styles.subjectsList}>
                    {data.subjectProgress.map((subject) => (
                      <div key={subject.id} className={styles.subjectItem}>
                        <div className={styles.subjectInfo}>
                          <span className={styles.subjectIcon}>{subject.icon || '📚'}</span>
                          <span className={styles.subjectName}>{subject.name}</span>
                        </div>
                        <ProgressBar
                          value={subject.progress}
                          size="sm"
                          showLabel
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No subjects tracked yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
