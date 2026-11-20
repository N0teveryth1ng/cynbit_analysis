'use client';

// Fixes SEC-08: load Google Analytics only after the visitor opts in.
// Mount once in the root layout:  <ConsentAnalytics />
// Set NEXT_PUBLIC_GA_ID in the hosting environment instead of hardcoding it.
//
// Consent rules differ by audience and jurisdiction (for example the DPDP Act
// 2023 in India, GDPR for EU visitors). Confirm the wording with whoever owns
// compliance; this is a technical pattern, not legal advice.

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const STORAGE_KEY = 'analytics-consent';

type Choice = 'granted' | 'denied' | null;

export default function ConsentAnalytics() {
  const [choice, setChoice] = useState<Choice>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'granted' || saved === 'denied') setChoice(saved);
    } catch {
      // storage unavailable (private mode): treat as "not chosen yet"
    }
  }, []);

  function save(next: 'granted' | 'denied') {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore: the choice still applies for this page view
    }
    setChoice(next);
  }

  return (
    <>
      {choice === 'granted' && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {choice === null && (
        <div role="dialog" aria-label="Analytics cookies" className="consent-banner">
          <p>We use analytics cookies to understand how the site is used.</p>
          <button type="button" onClick={() => save('granted')}>
            Accept
          </button>
          <button type="button" onClick={() => save('denied')}>
            Decline
          </button>
        </div>
      )}
    </>
  );
}
