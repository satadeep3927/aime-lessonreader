import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { convertFileSrc } from "@tauri-apps/api/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves an image path from the lesson pack to a proper file URL
 * @param imagePath - The relative image path from the slide data
 * @param extractedPath - The extracted path from the lesson pack
 * @returns The resolved file URL or null if imagePath is null
 */
export function resolveImagePath(
  imagePath: string | null,
  extractedPath: string
): string | null {
  if (!imagePath) return null;
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") || imagePath.startsWith("\\")
    ? imagePath.slice(1)
    : imagePath;
  
  // Combine extracted path with image path
  const fullPath = `${extractedPath}/${cleanPath}`;
  
  // Convert to Tauri asset URL
  return convertFileSrc(fullPath);
}
