// src/components/Footer/Footer.tsx

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-bold mb-3 text-pink-400">QuickWish</h3>
            <p className="text-gray-400 text-sm mb-4">
              India's largest gifting platform, spreading happiness since 2023.
            </p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">i</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-pink-400">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Track Order</a></li>
              <li><a href="#" className="hover:text-white">Help & FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4 text-xs">
              {/* <span className="text-gray-400">📞 9009917446</span> */}
              <span className="text-gray-400">✉️ care@QuickWish@gmail.com</span>
            </div>
            
            <div className="flex space-x-2">
              <div className="bg-white px-2 py-1 rounded text-xs text-gray-900 font-bold">COd</div>
              <div className="bg-white px-2 py-1 rounded text-xs text-gray-900 font-bold">UPI</div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-4">
            © 2025  QuickWish. All rights reserved. Made with ❤️ in India
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;