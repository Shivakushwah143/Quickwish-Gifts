
const NewsletterSection = () => {
  return (
    <section className="bg-red-600 text-white py-8 px-4 mt-2">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Stay Updated</h2>
        <p className="text-pink-100 mb-4">Get exclusive offers and gift ideas</p>
        
        <div className="flex gap-2 max-w-sm mx-auto bg-gray-100 rounded-sm">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-3 py-2 rounded text-black"
          />
          <button className="bg-white text-red-600 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;