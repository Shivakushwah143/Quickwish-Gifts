
const NewsletterSection = () => {
  return (
    <section className="bg-[color:var(--ivory)] py-10 px-4 mt-2">
      <div className="max-w-3xl mx-auto lux-card px-6 py-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold lux-serif text-[color:var(--plum)] mb-2">
          Notes for the thoughtful giver
        </h2>
        <p className="text-[color:var(--muted)] mb-6">
          Gentle reminders, new arrivals, and quiet inspirations from Indore.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 px-4 py-3 rounded-xl border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] bg-[color:var(--surface)] text-[color:var(--plum)]"
          />
          <button className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-5 py-3 rounded-xl font-medium text-sm hover:bg-[#3b182f] transition-all">
            Join the Letter
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
