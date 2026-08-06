'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  faded?: boolean;
}

export default function AppNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="cabinet-nav">
      {items.map(item => {
        const cls = [
          path === item.href ? 'active' : '',
          item.faded ? 'nav-faded' : '',
        ].filter(Boolean).join(' ');
        return (
          <Link key={item.href} href={item.href} className={cls || undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
