// Fixes A11Y-01 (icon ligature names read aloud / exposed as text).
//
// Option A: keep Material Symbols but hide the ligature text from assistive
// technology. This fixes screen readers; crawlers can still read the text.
type IconProps = { name: string; className?: string };

export function Icon({ name, className = '' }: IconProps) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

// Give the control itself an accessible name, because the icon is now hidden:
//   <button type="button" aria-label="Open menu"><Icon name="menu" /></button>
//   <a href="/story"><Icon name="history_edu" /> Our Story</a>   // visible text names the link

// Option B (preferred long term): replace the icon font with inline SVGs, for
// example lucide-react. No ligature text exists, so nothing leaks to
// crawlers, there is no font download, and PERF-05 is fixed as well:
//
//   import { Menu } from 'lucide-react';
//   <button type="button" aria-label="Open menu"><Menu aria-hidden="true" /></button>
