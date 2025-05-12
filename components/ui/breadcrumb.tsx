import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  children: React.ReactNode
  separator?: React.ReactNode
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {
  children: React.ReactNode
  isCurrentPage?: boolean
}

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  children: React.ReactNode
  isCurrentPage?: boolean
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, separator = <ChevronRight className="h-4 w-4" />, ...props }, ref) => {
    const items = React.Children.toArray(children);
    const itemsWithSeparators = items.map((item, index) => {
      if (index === items.length - 1) {
        return item;
      }
      return (
        <React.Fragment key={index}>
          {item}
          <li className="inline-flex items-center">
            <span className="mx-2 text-muted-foreground">{separator}</span>
          </li>
        </React.Fragment>
      );
    });

    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex", className)}
        {...props}
      >
        <ol className="inline-flex items-center space-x-0">{itemsWithSeparators}</ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, isCurrentPage, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center", className)}
        aria-current={isCurrentPage ? "page" : undefined}
        {...props}
      >
        {children}
      </li>
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, children, isCurrentPage, ...props }, ref) => {
    if (isCurrentPage) {
      return (
        <span
          className={cn("text-sm font-medium text-muted-foreground", className)}
          aria-current="page"
        >
          {children}
        </span>
      );
    }

    return (
      <Link
        ref={ref}
        className={cn("text-sm font-medium text-foreground hover:underline", className)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink };
