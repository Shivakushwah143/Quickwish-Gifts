// src/components/Footer/Footer.tsx

const Footer = () => {
  return (
    <footer className="bg-[color:var(--plum)] text-[color:var(--ivory)] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-[color:var(--gold)] lux-serif">QuickWish</h3>
            <p className="text-[color:var(--ivory)]/70 text-sm mb-4">
              Indore’s premium gifting atelier, crafting moments with quiet elegance.
            </p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-[color:var(--wine)] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-[color:var(--wine)] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-[color:var(--wine)] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">i</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="  text-sm font-semibold mb-3 text-[color:var(--gold)]">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[color:var(--ivory)]/70">
              <li><a href="#" className="hover:text-[color:var(--gold)] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[color:var(--gold)] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[color:var(--gold)] transition-colors">Track an Order</a></li>
              <li><a href="#" className="hover:text-[color:var(--gold)] transition-colors">Help</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[color:var(--ivory)]/20 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4 text-xs">
              <span className="text-[color:var(--ivory)]/70">care@quickwish.in</span>
            </div>
            
            <div className="flex space-x-2">
              <div className="bg-[color:var(--ivory)] px-2 py-1 rounded text-xs text-[color:var(--plum)] font-bold">COD</div>
              <div className="bg-[color:var(--ivory)] px-2 py-1 rounded text-xs text-[color:var(--plum)] font-bold">UPI</div>
            </div>
          </div>
          
          <div className="text-center text-xs text-[color:var(--ivory)]/60 mt-4">
            © 2025 QuickWish. All rights reserved. Crafted in India.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
