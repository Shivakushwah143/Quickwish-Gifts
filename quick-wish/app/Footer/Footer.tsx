import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[color:var(--plum)] px-4 py-10 text-[color:var(--ivory)]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-[color:var(--gold)] lux-serif">
              QuickWish
            </h3>
            <p className="mb-4 text-sm text-[color:var(--ivory)]/70">
              Indore’s premium gifting atelier, crafting moments with quiet elegance.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-[color:var(--gold)]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[color:var(--ivory)]/70">
              <li>
                <Link href="/about-us" className="transition-colors hover:text-[color:var(--gold)]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/gifts-in-indore" className="transition-colors hover:text-[color:var(--gold)]">
                  Gifts in Indore
                </Link>
              </li>
              <li>
                <Link href="/birthday-gifts" className="transition-colors hover:text-[color:var(--gold)]">
                  Birthday Gifts
                </Link>
              </li>
              <li>
                <Link href="/anniversary-gifts" className="transition-colors hover:text-[color:var(--gold)]">
                  Anniversary Gifts
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-[color:var(--gold)]">
                  All Gifts
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-[color:var(--gold)]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[color:var(--ivory)]/20 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-xs">
              <span className="text-[color:var(--ivory)]/70">care@quickwish.in</span>
            </div>

            <div className="flex space-x-2">
              <div className="rounded bg-[color:var(--ivory)] px-2 py-1 text-xs font-bold text-[color:var(--plum)]">
                COD
              </div>
              <div className="rounded bg-[color:var(--ivory)] px-2 py-1 text-xs font-bold text-[color:var(--plum)]">
                UPI
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-[color:var(--ivory)]/60">
            © 2025 QuickWish. All rights reserved. Crafted in India.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
