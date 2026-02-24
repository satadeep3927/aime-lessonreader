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
    <div className={cn("w-full h-full overflow-hidden select-none", className)}>
      {children}
    </div>
  );
};
