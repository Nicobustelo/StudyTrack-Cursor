import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MarkdownProps = {
  children: string;
  className?: string;
};

const components: ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "mt-6 mb-3 text-xl font-bold text-ink first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-6 mb-2 text-lg font-bold text-ink first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mt-5 mb-2 text-base font-semibold text-ink first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("mb-3 leading-relaxed last:mb-0", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold text-ink", className)} {...props} />
  ),
  em: ({ className, ...props }) => (
    <em className={cn("italic", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("mb-3 list-disc space-y-1 pl-5", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("mb-3 list-decimal space-y-1 pl-5", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "mb-3 border-l-2 border-border pl-4 italic text-ink-muted",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline", className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-ink",
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-4 border-border", className)} {...props} />
  ),
};

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("text-sm text-ink", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
