'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import styles from './MobileNav.module.css';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/curriculum', label: 'Curriculum', icon: '📚' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNav}>
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            styles.navItem,
            pathname === item.href && styles.active
          )}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
