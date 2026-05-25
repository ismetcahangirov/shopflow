// src/utils/slugify.ts
// Converts human-readable strings to URL-safe slugs

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace Azerbaijani/Russian characters
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    // Replace spaces and special chars with hyphens
    .replace(/[\s\W]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}
