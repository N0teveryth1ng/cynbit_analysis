// Fixes SEO-01, SEO-02, SEO-03.
// app/layout.tsx (or a shared metadata module).

import type { Metadata } from 'next';

const SITE = 'https://www.cynbit.in'; // one canonical host; 301 the other

export const metadata: Metadata = {
  metadataBase: new URL(SITE),

  // SEO-03: brand appears once. Child pages set only their own title.
  title: {
    default: 'Cynbit Technologies | AI Automation & Software Solutions, Jaipur',
    template: '%s | Cynbit Technologies',
  },
  description:
    'AI automation, autonomous agents and custom software development from Jaipur, India.',

  // SEO-02: canonical on the same host as everything else.
  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    siteName: 'Cynbit Technologies',
    locale: 'en_IN',
    url: '/',
    // SEO-01: raster image; most social platforms do not render SVG previews.
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Cynbit Technologies' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.png'],
  },
  // The "keywords" meta tag is ignored by search engines; omit it.
};
