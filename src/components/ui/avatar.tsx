import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex items-center justify-center", className)} {...props} />;
}

export function AvatarImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className={cn("rounded-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600", className)}
      {...props}
    />
  );
}
