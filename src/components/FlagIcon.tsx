import type { Locale } from "@/lib/i18n-shared";

// Hand-rolled rather than an icon-pack dependency — only four flags are
// ever needed (see LanguageSwitcher), each simple enough to draw directly.
// Every flag shares the same 20x14 viewBox/rounded-rect mask so they line
// up in the switcher regardless of each country's real flag proportions.
function Mask({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true" className="shrink-0 rounded-[2px]">
      <defs>
        <clipPath id={id}>
          <rect width="20" height="14" rx="2" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </svg>
  );
}

function GB() {
  return (
    <Mask id="flag-gb">
      <rect width="20" height="14" fill="#00247d" />
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="#fff" strokeWidth="2.8" />
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="#cf142b" strokeWidth="1.2" />
      <path d="M10 0 V14 M0 7 H20" stroke="#fff" strokeWidth="4.6" />
      <path d="M10 0 V14 M0 7 H20" stroke="#cf142b" strokeWidth="2.6" />
    </Mask>
  );
}

function ES() {
  return (
    <Mask id="flag-es">
      <rect width="20" height="14" fill="#aa151b" />
      <rect y="3.5" width="20" height="7" fill="#f1bf00" />
    </Mask>
  );
}

function DE() {
  return (
    <Mask id="flag-de">
      <rect width="20" height="14" fill="#ffce00" />
      <rect width="20" height="4.67" fill="#000" />
      <rect y="4.67" width="20" height="4.67" fill="#d00" />
    </Mask>
  );
}

function IS() {
  return (
    <Mask id="flag-is">
      <rect width="20" height="14" fill="#02529c" />
      <path d="M0 5 H20 M7 0 V14" stroke="#fff" strokeWidth="2.6" />
      <path d="M0 5 H20 M7 0 V14" stroke="#dc1e35" strokeWidth="1.3" />
    </Mask>
  );
}

const flags: Partial<Record<Locale, () => React.ReactElement>> = { en: GB, es: ES, de: DE, is: IS };

export default function FlagIcon({ locale }: { locale: Locale }) {
  const Flag = flags[locale] ?? GB;
  return <Flag />;
}
