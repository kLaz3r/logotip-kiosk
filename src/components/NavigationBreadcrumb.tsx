import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function NavigationBreadcrumb({ items }: NavigationBreadcrumbProps) {
  return (
    <nav className="mb-4 text-sm" aria-label="breadcrumb">
      <ol className="text-text/70 flex flex-wrap items-center gap-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className="text-text">{item.label}</span>
              )}
              {!isLast ? <span className="opacity-50">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
