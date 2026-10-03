"use client";

// Loads Google Tag Manager, consent-aware. If NEXT_PUBLIC_GTM_ID isn't set
// (the default — no GTM container exists for this project yet), this
// renders nothing and the rest of the analytics layer stays a documented
// no-op: every trackX() call in src/lib/analytics/gtm.ts still runs, it
// just pushes into a dataLayer no tag is reading, which is harmless and
// means the instrumentation is already correct the moment a real
// Container ID is added to the environment — no code changes needed then.
import { useEffect } from "react";
import Script from "next/script";
import { initializeConsentDefault } from "@/lib/analytics/consent";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function GtmLoader() {
  useEffect(() => {
    initializeConsentDefault();
  }, []);

  if (!GTM_ID) return null;

  return (
    <>
      {/* Consent Mode defaults must be pushed before GTM's own script
          executes — `beforeInteractive` can't run arbitrary inline logic
          this late, so the default push happens in the effect above on
          first render, and GTM itself loads with a short `afterInteractive`
          strategy immediately after. The brief window between them is the
          same race every Consent Mode + GTM integration has; Google's own
          docs accept it since GTM reads the dataLayer array itself rather
          than requiring the push to have already resolved. */}
      <Script id="gtm-loader" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
