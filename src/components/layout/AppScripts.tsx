import Script from "next/script";

export default function AppScripts() {
  return (
    <Script id="sbp-layout-bootstrap" strategy="afterInteractive">
      {`window.dispatchEvent(new Event("sbp:layout-ready"));`}
    </Script>
  );
}
