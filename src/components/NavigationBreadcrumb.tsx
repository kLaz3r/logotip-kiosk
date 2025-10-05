import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationBreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "default" | "light";
}

export function NavigationBreadcrumb({
  items,
  variant = "default",
}: NavigationBreadcrumbProps) {
  const isLight = variant === "light";
  return (
    <nav className="text-sm" aria-label="breadcrumb">
      <ol
        className={`${isLight ? "text-white/80" : "text-text/70"} flex items-center gap-1`}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={
                    isLight ? "hover:text-white" : "hover:text-primary"
                  }
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLight ? "text-white" : "text-text"}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span className="opacity-50">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
