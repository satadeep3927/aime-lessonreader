import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SlideContainerProps {
  children: ReactNode;
  className?: string;
}

export const SlideContainer = ({
  children,
  className,
}: SlideContainerProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8 overflow-hidden bg-white dark:bg-zinc-900 select-none">
      <div className={cn("w-full h-full relative", className)}>{children}</div>
    </div>
  );
};
