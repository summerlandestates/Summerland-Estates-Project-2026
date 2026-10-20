import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Article content is stored as raw HTML. Links entered without a scheme
// (e.g. href="www.example.com") resolve as relative paths on our own domain,
// which sends readers back to the site instead of the external URL.
export function normalizeArticleLinks(html: string) {
  return html.replace(/href=(['"])(?!https?:\/\/|mailto:|tel:|#|\/|data:)/gi, "href=$1https://");
}
