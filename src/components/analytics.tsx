import Script from "next/script";

// Google Analytics 4 measurement ID（来自用户提供的 gtag 片段）。
// 也可在 Vercel 环境变量 NEXT_PUBLIC_GA_ID 中覆盖。
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-LFP31YGTRT";

// Microsoft Clarity project ID（来自用户提供的 Clarity 项目）。
// 也可在 Vercel 环境变量 NEXT_PUBLIC_CLARITY_ID 中覆盖。
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "lx18ztcr4b";

export function Analytics() {
  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>

      {/* Microsoft Clarity */}
      <Script id="ms-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");`}
      </Script>
    </>
  );
}
