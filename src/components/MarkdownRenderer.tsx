import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import styles
import { cn } from "@/lib/utils"; // Assuming you have a utility for merging classes

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({
  content,
  className,
}: MarkdownRendererProps) => {
  return (
    <div className={cn("prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Customize components if needed, e.g., images
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg shadow-md max-h-125 object-contain mx-auto"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
