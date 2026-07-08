// src/app/[locale]/[...rest]/page.tsx
// Catch-all for unknown routes under a locale (e.g. /az/does-not-exist).
// Next.js only renders [locale]/not-found.tsx when notFound() is thrown from
// within a route — not for arbitrary unmatched paths. Without this catch-all,
// such paths would fall through to the non-localized global 404. Calling
// notFound() here routes them to the localized not-found page instead (issue #50).
// A catch-all has the lowest routing priority, so real routes always win.

import { notFound } from 'next/navigation';

export default function CatchAllNotFound(): never {
  notFound();
}
