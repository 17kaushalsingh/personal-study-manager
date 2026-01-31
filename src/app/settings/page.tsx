'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Card, { CardHeader, CardContent } from '@/components/Card';
import Button from '@/components/Button';
import { UserPreferences } from '@/types';
import styles from './page.module.css';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>({
    dailyProblems: 2,
    dailyLearningMinutes: 60,
    difficultyPreference: 'balanced',
    focusAreas: [],
    theme: 'system',
    includeDailyChallenge: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const result = await response.json();
          setPreferences(result.data.preferences);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchPreferences();
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (response.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPlatform = async (platform: 'leetcode' | 'codeforces') => {
    const username = platform === 'leetcode'
      ? preferences.leetcodeUsername
      : preferences.codeforcesHandle;

    if (!username) {
      setMessage(`Please enter your ${platform} username first`);
      return;
    }

    try {
      const response = await fetch('/api/platforms/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, username }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage(`${platform} username verified!`);
      } else {
        setMessage(result.error || `Could not verify ${platform} username`);
      }
    } catch (error) {
      console.error('Error verifying platform:', error);
      setMessage('Verification failed');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading settings...</p>
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
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Configure your study preferences</p>
          </div>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div className={styles.sections}>
            {/* Platform Connections */}
            <Card>
              <CardHeader>
                <h2>Platform Connections</h2>
              </CardHeader>
              <CardContent>
                <div className={styles.field}>
                  <label>LeetCode Username</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={preferences.leetcodeUsername || ''}
                      onChange={(e) => setPreferences({ ...preferences, leetcodeUsername: e.target.value })}
                      placeholder="your-leetcode-username"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyPlatform('leetcode')}
                    >
                      Verify
                    </Button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Codeforces Handle</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={preferences.codeforcesHandle || ''}
                      onChange={(e) => setPreferences({ ...preferences, codeforcesHandle: e.target.value })}
                      placeholder="your-codeforces-handle"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyPlatform('codeforces')}
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Goals */}
            <Card>
              <CardHeader>
                <h2>Daily Goals</h2>
              </CardHeader>
              <CardContent>
                <div className={styles.field}>
                  <label>Problems per Day</label>
                  <select
                    value={preferences.dailyProblems}
                    onChange={(e) => setPreferences({ ...preferences, dailyProblems: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} problem{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Learning Time (minutes)</label>
                  <select
                    value={preferences.dailyLearningMinutes}
                    onChange={(e) => setPreferences({ ...preferences, dailyLearningMinutes: parseInt(e.target.value) })}
                  >
                    {[30, 45, 60, 90, 120].map((n) => (
                      <option key={n} value={n}>{n} minutes</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Difficulty Preference</label>
                  <select
                    value={preferences.difficultyPreference}
                    onChange={(e) => setPreferences({ ...preferences, difficultyPreference: e.target.value as 'easy' | 'medium' | 'hard' | 'balanced' })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>
                <div className={styles.checkbox}>
                  <input
                    type="checkbox"
                    id="dailyChallenge"
                    checked={preferences.includeDailyChallenge}
                    onChange={(e) => setPreferences({ ...preferences, includeDailyChallenge: e.target.checked })}
                  />
                  <label htmlFor="dailyChallenge">Include LeetCode Daily Challenge</label>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <h2>Appearance</h2>
              </CardHeader>
              <CardContent>
                <div className={styles.field}>
                  <label>Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' | 'system' })}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} loading={saving} fullWidth>
              Save Settings
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
