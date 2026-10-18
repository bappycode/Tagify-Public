import Image from "next/image";

type LogoProps = { size?: number; className?: string; title?: string };

const wrap = (children: React.ReactNode, p: LogoProps) => (
  <svg
    width={p.size ?? 20}
    height={p.size ?? 20}
    viewBox="0 0 24 24"
    className={p.className}
    role="img"
    aria-label={p.title}
  >
    {children}
  </svg>
);

export const MetaLogo = (p: LogoProps) =>
  wrap(
    <path
      fill="#1877F2"
      d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z"
    />,
    { title: "Meta", ...p },
  );

export const GoogleAnalyticsLogo = (p: LogoProps) =>
  wrap(
    <>
      <rect x="15" y="3" width="6" height="18" rx="3" fill="#F9AB00" />
      <rect x="9" y="9" width="6" height="12" rx="3" fill="#E37400" />
      <circle cx="6" cy="18" r="3" fill="#E37400" />
    </>,
    { title: "Google Analytics 4", ...p },
  );

export const TikTokLogo = (p: LogoProps) =>
  wrap(
    <path
      fill="currentColor"
      d="M19.6 6.7a5.4 5.4 0 0 1-3.2-1V15a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2 2.8V2h2.7a5.4 5.4 0 0 0 3.2 4z"
    />,
    { title: "TikTok", ...p },
  );

export const SnapchatLogo = (p: LogoProps) =>
  wrap(
    <path
      fill="#FFFC00"
      stroke="#0d0d0d"
      strokeWidth="0.6"
      d="M12 2c3.3 0 5.4 2.6 5.4 6 0 .8-.1 1.6-.2 2.2.6.3 1.3.4 1.8.4.5 0 .9.4.9.9 0 .9-1.8 1.4-2.5 1.7-.1.6.7 1.9 2.4 2.6.4.2.6.6.4 1-.4.9-2 1.4-3 1.5-.1.2-.2.7-.4 1.1-.1.3-.4.5-.7.5-.5 0-1.1-.3-2.2-.3-1.5 0-2 1.5-3.9 1.5s-2.4-1.5-3.9-1.5c-1.1 0-1.7.3-2.2.3-.3 0-.6-.2-.7-.5-.2-.4-.3-.9-.4-1.1-1-.1-2.6-.6-3-1.5-.2-.4 0-.8.4-1 1.7-.7 2.5-2 2.4-2.6-.7-.3-2.5-.8-2.5-1.7 0-.5.4-.9.9-.9.5 0 1.2-.1 1.8-.4-.1-.6-.2-1.4-.2-2.2 0-3.4 2.1-6 5.4-6z"
    />,
    { title: "Snapchat", ...p },
  );

export const GoogleAdsLogo = (p: LogoProps) => (
  <Image
    src="/images/google-ads.webp"
    width={p.size ?? 20}
    height={p.size ?? 20}
    className={p.className}
    alt={p.title ?? "Google Ads"}
  />
);

export const GtmLogo = (p: LogoProps) =>
  wrap(
    <>
      <path d="M3 12 12 3l9 9-9 9z" fill="#8AB4F8" />
      <path d="M12 3v18l9-9z" fill="#4285F4" />
      <circle cx="12" cy="12" r="2.2" fill="#fff" />
    </>,
    { title: "Google Tag Manager", ...p },
  );

export const CloudflareLogo = (p: LogoProps) =>
  wrap(
    <path
      fill="#F38020"
      d="M16.8 13.7c.2-.7-.1-1.4-.7-1.6l-9.6-.2c-.1 0-.2 0-.2-.1s0-.2.1-.2l9.7-.2c1.2 0 2.4-1 2.8-2.2l.5-1.5c0-.1 0-.2-.1-.2A6 6 0 0 0 8.4 9c-2 .2-3.5 1.8-3.8 3.7C2.4 13 1 14.7 1 16.8c0 .2 0 .4.1.6 0 .1.2.2.3.2h14.7c.2 0 .3-.1.3-.3z"
    />,
    { title: "Cloudflare", ...p },
  );

export const GoogleLogo = (p: LogoProps) =>
  wrap(
    <>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </>,
    { title: "Google", ...p },
  );

export const GithubLogo = (p: LogoProps) =>
  wrap(
    <path
      fill="currentColor"
      d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"
    />,
    { title: "GitHub", ...p },
  );
