import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Study Manager</h1>
        <p className={styles.description}>
          Your personal study companion for tech job preparation
        </p>

        <div className={styles.actions}>
          <Link href="/login" className={styles.primaryButton}>
            Sign In
          </Link>
          <Link href="/register" className={styles.secondaryButton}>
            Create Account
          </Link>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>Track Progress</h3>
            <p>Monitor your learning journey across DSA, System Design, and Core CS subjects</p>
          </div>
          <div className={styles.feature}>
            <h3>Platform Integration</h3>
            <p>Connect LeetCode and Codeforces to track your problem-solving stats</p>
          </div>
          <div className={styles.feature}>
            <h3>Daily Tasks</h3>
            <p>Get personalized daily assignments based on your goals and progress</p>
          </div>
        </div>
      </main>
    </div>
  );
}
