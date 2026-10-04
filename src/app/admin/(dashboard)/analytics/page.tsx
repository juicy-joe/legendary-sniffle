import { prisma } from "@/lib/prisma";

// First-party traffic dashboard, backed entirely by this project's own
// PageView table (see prisma/schema.prisma) rather than GA4 — that keeps
// this page working today with real numbers, with no external account or
// Data API credentials required. Only records written after this feature
// shipped exist, so a brand-new deploy will show an empty/zero chart until
// real visits start granting analytics consent (src/lib/analytics/consent.ts)
// and the client beacon (src/components/analytics/PageViewTracker.tsx) fires.
export const dynamic = "force-dynamic";

const DAYS = 30;

type Row = {
  path: string;
  referrer: string | null;
  device: string;
  country: string | null;
  sessionId: string;
  createdAt: Date;
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function topEntries(counts: Map<string, number>, limit: number): [string, number][] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function TrafficChart({ series, max }: { series: { label: string; value: number }[]; max: number }) {
  const width = 760;
  const height = 220;
  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barGap = 3;
  const barW = series.length > 0 ? chartW / series.length - barGap : 0;
  const safeMax = max > 0 ? max : 1;

  // Show a date label roughly every 5 bars so the axis doesn't become
  // illegible at 30 data points.
  const labelEvery = Math.ceil(series.length / 7);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Daily page views over the last ${series.length} days`}
        className="h-auto w-full"
      >
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeOpacity={0.15}
        />
        {series.map((point, i) => {
          const barH = (point.value / safeMax) * chartH;
          const x = padding.left + i * (barW + barGap);
          const y = height - padding.bottom - barH;
          const showLabel = i % labelEvery === 0 || i === series.length - 1;
          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={Math.max(barW, 1)}
                height={Math.max(barH, point.value > 0 ? 1 : 0)}
                fill="var(--color-gold-dark)"
                opacity={point.value > 0 ? 0.85 : 0.08}
                rx={1}
              >
                <title>{`${point.label}: ${point.value} views`}</title>
              </rect>
              {showLabel && (
                <text
                  x={x + barW / 2}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill="currentColor"
                  opacity={0.55}
                >
                  {point.label.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-[11px] text-ink/45">
        Page views per day, last {series.length} days.
      </figcaption>
    </figure>
  );
}

export default async function AdminAnalyticsPage() {
  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const rows: Row[] = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { path: true, referrer: true, device: true, country: true, sessionId: true, createdAt: true },
  });

  const totalViews = rows.length;
  const uniqueSessions = new Set(rows.map((r) => r.sessionId)).size;
  const avgViewsPerSession = uniqueSessions > 0 ? (totalViews / uniqueSessions).toFixed(1) : "0";

  const dailyCounts = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dailyCounts.set(dayKey(d), 0);
  }
  const pathCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();

  for (const row of rows) {
    const key = dayKey(row.createdAt);
    dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
    pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
    const ref = row.referrer && row.referrer !== "direct" ? row.referrer : "Direct";
    referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1);
    deviceCounts.set(row.device, (deviceCounts.get(row.device) ?? 0) + 1);
    countryCounts.set(row.country ?? "Unknown", (countryCounts.get(row.country ?? "Unknown") ?? 0) + 1);
  }

  const series = Array.from(dailyCounts.entries()).map(([label, value]) => ({ label, value }));
  const maxDaily = Math.max(0, ...series.map((s) => s.value));

  const topPages = topEntries(pathCounts, 8);
  const topReferrers = topEntries(referrerCounts, 8);
  const topCountries = topEntries(countryCounts, 8);
  const deviceTotal = Array.from(deviceCounts.values()).reduce((a, b) => a + b, 0);
  const deviceOrder = ["desktop", "mobile", "tablet"];
  const deviceRows = deviceOrder
    .filter((d) => deviceCounts.has(d))
    .map((d) => ({ device: d, count: deviceCounts.get(d) ?? 0 }));

  const summary = [
    { label: "Page Views", value: totalViews.toLocaleString() },
    { label: "Sessions", value: uniqueSessions.toLocaleString() },
    { label: "Views / Session", value: avgViewsPerSession },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-light text-ink">Traffic</h1>
      <p className="mt-1 text-sm text-ink/65">
        First-party page-view data collected directly from ollerialight.com — no external analytics
        account needed. Only visits where the visitor accepted cookies are counted.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-[6px] border border-ink/10 bg-paper p-5">
            <p className="font-serif text-3xl text-gold-dark font-feature-tabular">{s.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/65">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[6px] border border-ink/10 bg-paper p-5">
        <TrafficChart series={series} max={maxDaily} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[6px] border border-ink/10 bg-paper p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">Top Pages</p>
          <ul className="mt-3 space-y-2">
            {topPages.length === 0 && <li className="text-sm text-ink/45">No data yet.</li>}
            {topPages.map(([path, count]) => (
              <li key={path} className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-ink/80">{path}</span>
                <span className="font-feature-tabular text-ink/55">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[6px] border border-ink/10 bg-paper p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">Top Referrers</p>
          <ul className="mt-3 space-y-2">
            {topReferrers.length === 0 && <li className="text-sm text-ink/45">No data yet.</li>}
            {topReferrers.map(([ref, count]) => (
              <li key={ref} className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-ink/80">{ref}</span>
                <span className="font-feature-tabular text-ink/55">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[6px] border border-ink/10 bg-paper p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">Devices</p>
          <ul className="mt-3 space-y-3">
            {deviceRows.length === 0 && <li className="text-sm text-ink/45">No data yet.</li>}
            {deviceRows.map(({ device, count }) => {
              const pct = deviceTotal > 0 ? Math.round((count / deviceTotal) * 100) : 0;
              return (
                <li key={device}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-ink/80">{device}</span>
                    <span className="font-feature-tabular text-ink/55">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/8">
                    <div className="h-full rounded-full bg-gold-dark" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-[6px] border border-ink/10 bg-paper p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">Top Countries</p>
          <ul className="mt-3 space-y-2">
            {topCountries.length === 0 && <li className="text-sm text-ink/45">No data yet.</li>}
            {topCountries.map(([country, count]) => (
              <li key={country} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-ink/80">{country}</span>
                <span className="font-feature-tabular text-ink/55">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
