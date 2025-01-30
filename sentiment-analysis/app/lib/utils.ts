import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
/**
 * Combines class names using `clsx` and `tailwind-merge`.
 * This utility is useful for conditionally applying Tailwind CSS classes.
 *
 * @param inputs - Class names or class name arrays/objects.
 * @returns A single string of combined class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format.
 *
 * @param date - The date string or Date object to format.
 * @returns A formatted date string (e.g., "January 1, 2023").
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Converts a string to a URL-friendly slug.
 *
 * @param str - The string to convert.
 * @returns A URL-friendly slug (e.g., "hello-world").
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove consecutive hyphens
}

/**
 * Truncates a string to a specified length and adds an ellipsis if necessary.
 *
 * @param str - The string to truncate.
 * @param length - The maximum length of the string.
 * @returns The truncated string.
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

/**
 * Generates a random string of a specified length.
 *
 * @param length - The length of the random string.
 * @returns A random string.
 */
export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounces a function to limit how often it can be called.
 *
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to wait before calling the function.
 * @returns A debounced version of the function.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 *
 * @param value - The value to check.
 * @returns `true` if the value is empty, otherwise `false`.
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}