import { cn } from "@/lib/utils";
import React from "react";

export default function GridBackgroundDemo() {
  return (
    <div className="relative w-full h-full">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          // White theme with BLACK grid lines
          "[background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]",
        )}
      />
      {/* Soft radial mask to fade the edges slightly */}
      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    </div>
  );
}


