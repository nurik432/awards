'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const GROUPS: { label: string; items: { href: string; icon: string; label: string }[] }[] = [
  {
    label: 'Работа с заявками',
    items: [
      { href: '/admin',         icon: '📋', label: 'Заявки' },
      { href: '/admin/results', icon: '📊', label: 'Результаты' },
      { href: '/admin/users',   icon: '👥', label: 'Комиссия' },
    ],
  },
  {
    label: 'Содержание сайта',
    items: [
      { href: '/admin/nominations', icon: '🏆', label: 'Номинации' },
      { href: '/admin/winners',     icon: '🥇', label: 'Победители' },
      { href: '/admin/gallery',     icon: '🖼', label: 'Галерея' },
      { href: '/admin/content',     icon: '✏️', label: 'Тексты' },
    ],
  },
  {
    label: 'Инструменты',
    items: [{ href: '/admin/sync', icon: '🔄', label: 'Google Sheets' }],
  },
];

export default function AdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  // "/admin" must only light up on an exact match, otherwise it would stay
  // active on every nested page.
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' || pathname.startsWith('/admin/applications') : pathname.startsWith(href);

  return (
    <nav className="adm-nav">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <div className="adm-nav-label">{group.label}</div>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="adm-nav-link"
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span className="adm-nav-icon" aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/admin' && pendingCount > 0 && (
                <span className="adm-nav-count">{pendingCount}</span>
              )}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
