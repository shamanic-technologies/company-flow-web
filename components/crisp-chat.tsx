'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * CrispChat component
 * Loads the Crisp chat widget only on the landing page (/)
 * Uses client-side detection to determine if it should load
 */
export default function CrispChat() {
  const pathname = usePathname();
  const [isLandingPage, setIsLandingPage] = useState(false);
  
  useEffect(() => {
    // Check if current page is the landing page
    setIsLandingPage(pathname === '/' || pathname === '');
  }, [pathname]);
  
  if (!isLandingPage) {
    return null;
  }
  
  return (
    <Script strategy="afterInteractive" id="crisp-script">
      {`
        window.$crisp=[];
        window.CRISP_WEBSITE_ID="b65cba08-5896-4142-b94b-d25fcf2bad90";
        (function(){
          d=document;
          s=d.createElement("script");
          s.src="https://client.crisp.chat/l.js";
          s.async=1;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();
      `}
    </Script>
  );
} 