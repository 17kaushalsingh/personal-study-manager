'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './Header.module.css';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const { data: session, status } = useSession();

  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>
          Study Manager
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.navLink}>
          Dashboard
        </Link>
        <Link href="/curriculum" className={styles.navLink}>
          Curriculum
        </Link>
        <Link href="/settings" className={styles.navLink}>
          Settings
        </Link>
      </nav>

      <div className={styles.right}>
        {status === 'loading' ? (
          <span className={styles.loading}>Loading...</span>
        ) : session?.user ? (
          <div className={styles.user}>
            <span className={styles.userName}>{session.user.name || session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={styles.signOut}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/login" className={styles.signIn}>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
