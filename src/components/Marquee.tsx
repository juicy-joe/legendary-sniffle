export default function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden border-y border-ink/10 bg-paper-dim py-5"
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee gap-16">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-16 whitespace-nowrap font-serif text-lg italic tracking-wide text-ink/65"
          >
            {item}
            <span className="text-gold">&#10022;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
