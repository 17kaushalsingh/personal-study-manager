'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SubjectCard from '@/components/SubjectCard';
import styles from './page.module.css';

interface SubjectData {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  topicCount: number;
  progress: number;
  status: string;
}

export default function CurriculumPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const result = await response.json();
          setSubjects(result.data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchSubjects();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading curriculum...</p>
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
            <h1 className={styles.title}>Curriculum</h1>
            <p className={styles.subtitle}>
              Track your progress across all subjects
            </p>
          </div>

          <div className={styles.grid}>
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                description={subject.description}
                icon={subject.icon}
                progress={subject.progress}
                topicCount={subject.topicCount}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
