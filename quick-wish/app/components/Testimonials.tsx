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
    <section className="w-full bg-[#fffaf4] px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="rounded-full bg-[#fff0e7] px-3 py-1 text-xs font-bold text-[#b54e36]">
              Real moments
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-[#2b1d25] sm:text-4xl lux-serif">
              Delivered today. Remembered longer.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f5d66]">
              Customer photos, unboxing moments, and small messages that made the gift feel alive.
            </p>
          </div>
          <div className="rounded-lg border border-[#ead7c5] bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8b3f2f]">100+ happy deliveries</p>
            <p className="text-sm font-semibold text-[#2b1d25]">Across Indore, with same-day care.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {moments.map((moment) => (
            <div
              key={moment.id}
              className="overflow-hidden rounded-lg border border-[#ead7c5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-72 bg-[#fbf4ec]">
                <Image
                  src={moment.img}
                  alt={moment.label}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#b54e36] shadow-sm">
                  {moment.label}
                </span>
              </div>
              <div className="p-3">
                <p className="rounded-lg bg-[#f8f3ec] px-3 py-2 text-sm font-semibold text-[#2b1d25]">
                  "{moment.text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
