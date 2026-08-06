import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items, light }: { items: BreadcrumbItem[]; light?: boolean }) {
  return (
    <nav className={`breadcrumb${light ? ' breadcrumb-light' : ''}`} aria-label="Хлебные крошки">
      {items.map((item, i) => (
        <span key={i} className="bc-step">
          {i > 0 && <span className="bc-sep">›</span>}
          {item.href ? (
            <Link href={item.href} className="bc-link">{item.label}</Link>
          ) : (
            <span className="bc-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
