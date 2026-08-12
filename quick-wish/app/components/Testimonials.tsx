"use client";

import Image from "next/image";

const moments = [
  {
    id: 1,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.34.57_AM_420x.webp?v=1722247483",
    label: "Unboxed in Indore",
    text: "The wrapping felt so personal.",
  },
  {
    id: 2,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.35.10_AM_420x.webp?v=1722247483",
    label: "Delivered today",
    text: "Reached before the birthday dinner.",
  },
  {
    id: 3,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.35.12_AM_420x.webp?v=1722247483",
    label: "Custom note",
    text: "The message made it feel handmade.",
  },
  {
    id: 4,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.35.14_AM_1_420x.webp?v=1722247483",
    label: "Happy surprise",
    text: "Beautiful flowers and careful packing.",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-[color:var(--tint-cream)] px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="rounded-full bg-[color:var(--tint-peach)] px-3 py-1 text-xs font-bold text-[color:var(--wine)]">
              Real moments
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--plum)] sm:text-4xl lux-serif">
              Delivered today. Remembered longer.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              Customer photos, unboxing moments, and small messages that made the gift feel alive.
            </p>
          </div>
          <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--wine)]">100+ happy deliveries</p>
            <p className="text-sm font-semibold text-[color:var(--plum)]">Across Indore, with same-day care.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {moments.map((moment) => (
            <div
              key={moment.id}
              className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-72 bg-[color:var(--ivory)]">
                <Image
                  src={moment.img}
                  alt={moment.label}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-bold text-[color:var(--wine)] shadow-sm">
                  {moment.label}
                </span>
              </div>
              <div className="p-3">
                <p className="rounded-lg bg-[color:var(--ivory)] px-3 py-2 text-sm font-semibold text-[color:var(--plum)]">
                  “{moment.text}”
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
