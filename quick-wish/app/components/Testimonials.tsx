// components/Testimonials.tsx
"use client";
import React from "react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.34.57_AM_420x.webp?v=1722247483",
    // name: "Anjali",
    // text: "They are sooo pretty 😍😍 Thank you so much, love them ❤️❤️❤️",
  },
  {
    id: 2,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.35.10_AM_420x.webp?v=1722247483",
    // name: "Chaitra",
    // text: "Hey I received the package. Thanks a lot it’s so beautiful!! 🌸",
  },
  {
    id: 3,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.35.12_AM_420x.webp?v=1722247483",
    // name: "Siddhesh",
    // text: "My girl loved the gift. Super happy with your work. Keep it up! 💐",
  },
  {
    id: 4,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.35.14_AM_1_420x.webp?v=1722247483",
    // name: "Nisha",
    // text: "Best gift I ever got for myself 💕 Definitely ordering again!",
  },
  {
    id: 5,
    img: "https://floreal.in/cdn/shop/files/WhatsApp_Image_2024-07-29_at_10.35.10_AM_420x.webp?v=1722247483",
    // name: "Rahul",
    // text: "The bouquet was beyond expectations 🌻 She loved it a lot!",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-10 bg-gray-50 overflow-hidden">
      <h2 className="text-center text-2xl lg:text-4xl font-bold mb-6">
        Customer About Us
      </h2>

      {/* marquee wrapper */}
      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {testimonials.concat(testimonials).map((t, i) => (
            <div
              key={i}
              className="w-72 sm:w-80 lg:w-96 mx-1 flex-shrink-0"
            >
              <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center">
                <Image
                  src={t.img}
                  alt={t.img}
                  width={400}
                  height={500}
                  className="rounded-xl object-cover mb-3"
                />
              
               
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
