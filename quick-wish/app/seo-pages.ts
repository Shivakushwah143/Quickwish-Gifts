export type SeoPageConfig = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  h2: string;
  seoCopy: string[];
  relatedLinks: Array<{ label: string; href: string }>;
  faq: Array<{ question: string; answer: string }>;
  canonical: string;
  schemaType?: string;
};

const siteUrl = "https://www.onewish.fun";

export const seoPages: SeoPageConfig[] = [
  {
    slug: "gift-hampers",
    title: "Gift Hampers",
    description: "Premium gift hampers for birthdays, anniversaries, festivals, and corporate gifting.",
    h1: "Gift Hampers for every occasion",
    intro: "Explore curated gift hampers that balance presentation, value, and fast delivery intent.",
    h2: "Why people choose QuickWish hampers",
    seoCopy: [
      "Our hamper pages are built to capture commercial search intent around curated gifting.",
      "Each hamper collection connects directly to related product and occasion pages to keep users moving toward purchase.",
      "Use this page as the main doorway for premium hamper searches in India and Indore.",
    ],
    relatedLinks: [
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Gifts in Indore", href: "/gifts-in-indore" },
      { label: "All Gifts", href: "/products" },
    ],
    faq: [
      { question: "Do gift hampers work for corporate gifting?", answer: "Yes. Gift hampers are a strong fit for corporate and bulk gifting because they feel premium and flexible." },
      { question: "Can I send a hamper same day?", answer: "Eligible hampers can be arranged for same-day delivery depending on the product and location." },
    ],
    canonical: `${siteUrl}/gift-hampers`,
  },
  {
    slug: "crochet-bouquets",
    title: "Crochet Bouquets",
    description: "Handmade crochet bouquets for gifting, keepsakes, and premium surprise moments.",
    h1: "Crochet Bouquets that last longer than flowers",
    intro: "A dedicated page for a high-intent long-tail gift category that can rank on its own.",
    h2: "Perfect for keepsake gifting",
    seoCopy: [
      "Crochet bouquet searches are highly specific and deserve a dedicated landing page.",
      "This page targets both transactional and comparison intent with clear internal links.",
      "It supports the brand's handcrafted and personalized gifting positioning.",
    ],
    relatedLinks: [
      { label: "Personalized Gifts", href: "/personalized-gifts" },
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
    ],
    faq: [
      { question: "Are crochet bouquets giftable for birthdays?", answer: "Yes. They work well for birthdays, anniversaries, and keepsake-style gifting." },
      { question: "Do you have related handmade gifts?", answer: "Yes. The store includes personalized gifts and curated hamper options." },
    ],
    canonical: `${siteUrl}/crochet-bouquets`,
  },
  {
    slug: "chocolate-bouquets",
    title: "Chocolate Bouquets",
    description: "Chocolate bouquets for birthdays, surprises, and budget-friendly gifting.",
    h1: "Chocolate Bouquets for sweet gifting",
    intro: "A commercially strong page for buyers who want affordable, fast-moving gift ideas.",
    h2: "Why chocolate bouquets convert well",
    seoCopy: [
      "Chocolate bouquet searches show clear buying intent and benefit from a dedicated page.",
      "This page connects budget, occasion, and delivery signals to improve internal relevance.",
      "It can also support same-day and budget-based discovery flows.",
    ],
    relatedLinks: [
      { label: "Gifts Under Rs 499", href: "/gifts-under-499" },
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
    ],
    faq: [
      { question: "Are chocolate bouquets budget friendly?", answer: "Yes. They often fit budget gifting and impulse purchase intent." },
      { question: "Can they be delivered in Indore?", answer: "Yes, eligible chocolate bouquet products can be surfaced for Indore delivery." },
    ],
    canonical: `${siteUrl}/chocolate-bouquets`,
  },
  {
    slug: "personalized-gifts",
    title: "Personalized Gifts",
    description: "Personalized gifts for birthdays, anniversaries, and meaningful celebrations.",
    h1: "Personalized Gifts made for one person only",
    intro: "This page captures high-converting search intent around custom and personalized gifting.",
    h2: "Why personalization matters",
    seoCopy: [
      "Personalized gifts attract buyers with strong purchase intent and higher average order value.",
      "The page links to occasion, recipient, and city pages to reinforce topical authority.",
      "It gives search engines a clear hub for custom gifting relevance.",
    ],
    relatedLinks: [
      { label: "Gifts for Wife", href: "/gifts-for-wife" },
      { label: "Gift Hampers", href: "/gift-hampers" },
      { label: "Corporate Gifts", href: "/corporate-gifts" },
    ],
    faq: [
      { question: "What counts as a personalized gift?", answer: "Any gift with custom text, name, message, or designed-for-one-person presentation." },
      { question: "Is personalization good for anniversaries?", answer: "Yes. Personalized gifts are one of the strongest anniversary purchase intents." },
    ],
    canonical: `${siteUrl}/personalized-gifts`,
  },
  {
    slug: "birthday-gifts",
    title: "Birthday Gifts",
    description: "Birthday gifts with flowers, hampers, cakes, and same-day delivery options.",
    h1: "Birthday Gifts that feel thoughtful",
    intro: "A commercial landing page focused on birthday buying intent and related gifting combinations.",
    h2: "Birthday gifting that converts",
    seoCopy: [
      "Birthday intent is one of the most important transactional clusters in gifting.",
      "The page links to recipient and budget variations to help users refine quickly.",
      "It should be one of the primary SEO entry points for the brand.",
    ],
    relatedLinks: [
      { label: "Gifts for Girlfriend", href: "/gifts-for-girlfriend" },
      { label: "Gifts Under Rs 499", href: "/gifts-under-499" },
      { label: "Birthday Gifts Indore", href: "/birthday-gifts-indore" },
    ],
    faq: [
      { question: "Can birthday gifts be delivered same day?", answer: "Yes. Eligible birthday gifts can be surfaced for same-day delivery." },
      { question: "Do you have budget birthday gifts?", answer: "Yes. Budget pages help users find birthday gifts across price bands." },
    ],
    canonical: `${siteUrl}/birthday-gifts`,
  },
  {
    slug: "anniversary-gifts",
    title: "Anniversary Gifts",
    description: "Anniversary gifts and romantic surprises for couples and partners.",
    h1: "Anniversary Gifts for meaningful moments",
    intro: "This page targets romantic purchase intent and links into recipient and location pages.",
    h2: "Anniversary gifting ideas",
    seoCopy: [
      "Anniversary queries are commercially valuable and deserve a dedicated hub page.",
      "Related recipient and city links increase internal relevance and crawl depth.",
      "This page supports romantic gifting and relationship-based navigation.",
    ],
    relatedLinks: [
      { label: "Gifts for Wife", href: "/gifts-for-wife" },
      { label: "Gifts for Husband", href: "/gifts-for-husband" },
      { label: "Gift Hampers", href: "/gift-hampers" },
    ],
    faq: [
      { question: "Are anniversary gifts available in Indore?", answer: "Yes. The city and product pages together support anniversary delivery intent in Indore." },
      { question: "Do you have romantic gift options?", answer: "Yes. Romantic gifting sits naturally under anniversary and couple-oriented pages." },
    ],
    canonical: `${siteUrl}/anniversary-gifts`,
  },
  {
    slug: "wedding-gifts",
    title: "Wedding Gifts",
    description: "Wedding gifts, elegant hampers, and premium gifting ideas for couples and families.",
    h1: "Wedding Gifts for couples and celebrations",
    intro: "A high-intent page for wedding gifting searches and premium purchasing behavior.",
    h2: "Elegant gifting for weddings",
    seoCopy: [
      "Wedding gifts are a strong commercial topic with room for gifts, hampers, and premium sets.",
      "Use this page to catch wedding-related discovery before users bounce to competitors.",
      "Internal links help connect wedding intent to hamper and recipient pages.",
    ],
    relatedLinks: [
      { label: "Gift Hampers", href: "/gift-hampers" },
      { label: "Corporate Gifts", href: "/corporate-gifts" },
      { label: "Gifts for Wife", href: "/gifts-for-wife" },
    ],
    faq: [
      { question: "Are wedding gifts available as hampers?", answer: "Yes. Hamper-style wedding gifting is one of the most useful commercial bundles." },
      { question: "Can I personalize wedding gifts?", answer: "Yes. Personalized gifting pages should support wedding buyer intent well." },
    ],
    canonical: `${siteUrl}/wedding-gifts`,
  },
  {
    slug: "corporate-gifts",
    title: "Corporate Gifts",
    description: "Corporate gifts for employee appreciation, client gifting, and bulk orders.",
    h1: "Corporate Gifts for businesses",
    intro: "A conversion-focused page for bulk and B2B gifting intent.",
    h2: "Why corporate gifting matters",
    seoCopy: [
      "Corporate gift pages attract high-value bulk intent and can outperform generic product pages.",
      "The page should connect to hamper, personalized, and city pages for local delivery use cases.",
      "This is one of the most monetizable SEO clusters for gifting stores.",
    ],
    relatedLinks: [
      { label: "Gift Hampers", href: "/gift-hampers" },
      { label: "Gifts in Indore", href: "/gifts-in-indore" },
      { label: "Personalized Gifts", href: "/personalized-gifts" },
    ],
    faq: [
      { question: "Can I order corporate gifts in bulk?", answer: "Yes. Corporate gifting pages should support bulk and business intent." },
      { question: "Can corporate gifts be personalized?", answer: "Yes. Personalization can improve corporate gifting conversion rates." },
    ],
    canonical: `${siteUrl}/corporate-gifts`,
  },
  {
    slug: "same-day-delivery",
    title: "Same Day Delivery",
    description: "Same day gift delivery for fast gifting decisions in Indore and nearby areas.",
    h1: "Same Day Delivery Gifts",
    intro: "A local-intent page for users who need speed and availability more than browsing depth.",
    h2: "Fast gifting without friction",
    seoCopy: [
      "Same-day pages capture urgent transactional searches and reduce dependency on the homepage.",
      "The internal linking should point to category and budget pages for immediate refinement.",
      "This page is essential for local search conversion intent.",
    ],
    relatedLinks: [
      { label: "Gift Shop Indore", href: "/gift-shop-indore" },
      { label: "Gift Hampers Indore", href: "/gift-hampers-indore" },
      { label: "Birthday Gifts Indore", href: "/birthday-gifts-indore" },
    ],
    faq: [
      { question: "Is same day delivery available in Indore?", answer: "Yes. The page is designed to support same-day delivery intent in Indore." },
      { question: "What gifts are best for same day?", answer: "Flowers, cakes, chocolate bouquets, and compact hampers usually work best." },
    ],
    canonical: `${siteUrl}/same-day-delivery`,
  },
  {
    slug: "midnight-delivery",
    title: "Midnight Delivery",
    description: "Midnight gift delivery for birthdays, anniversaries, and surprise celebrations.",
    h1: "Midnight Delivery Gifts",
    intro: "A premium urgency page for buyers looking for high-emotion surprise delivery.",
    h2: "Midnight surprise gifting",
    seoCopy: [
      "Midnight delivery is a high-value keyword cluster with strong purchase intent.",
      "The page should route to romantic, birthday, and recipient pages for relevance.",
      "This is one of the clearest commercial opportunities in gifting SEO.",
    ],
    relatedLinks: [
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Anniversary Gifts", href: "/anniversary-gifts" },
      { label: "Gifts Under Rs 499", href: "/gifts-under-499" },
    ],
    faq: [
      { question: "Do you offer midnight delivery?", answer: "Yes, this landing page targets midnight gifting intent and surprise delivery use cases." },
      { question: "Which gifts work well at midnight?", answer: "Flowers, cakes, custom hampers, and romantic gifts are the strongest fits." },
    ],
    canonical: `${siteUrl}/midnight-delivery`,
  },
  {
    slug: "gift-shop-indore",
    title: "Gift Shop Indore",
    description: "QuickWish Gifts is a premium gift shop in Indore with same day delivery and curated gifting.",
    h1: "Gift Shop in Indore",
    intro: "A local SEO page for Indore intent, combining location relevance with commercial gifting queries.",
    h2: "Why QuickWish fits local search intent",
    seoCopy: [
      "Local pages should support discovery for customers searching by city and delivery speed.",
      "This page reinforces NAP-style local intent and internal links to commercial categories.",
      "It can support future local citations and map-based optimization.",
    ],
    relatedLinks: [
      { label: "Gifts in Indore", href: "/gifts-in-indore" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
      { label: "Birthday Gifts Indore", href: "/birthday-gifts-indore" },
    ],
    faq: [
      { question: "Is QuickWish a gift shop in Indore?", answer: "Yes. This page positions the brand for local search visibility in Indore." },
      { question: "Can I get same-day gifts in Indore?", answer: "Yes. Same-day delivery intent is a major part of the local SEO strategy." },
    ],
    canonical: `${siteUrl}/gift-shop-indore`,
  },
  {
    slug: "birthday-gifts-indore",
    title: "Birthday Gifts Indore",
    description: "Birthday gifts in Indore with same-day delivery, curated hampers, and personalized options.",
    h1: "Birthday Gifts in Indore",
    intro: "A city-specific intent page for one of the highest-value transactional gift searches.",
    h2: "Fast birthday gifting in your city",
    seoCopy: [
      "City + occasion pages often convert well because the search intent is explicit.",
      "This page connects birthday intent with Indore local relevance and same-day delivery.",
      "It should become one of the most important local landing pages.",
    ],
    relatedLinks: [
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Gift Shop Indore", href: "/gift-shop-indore" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
    ],
    faq: [
      { question: "Can birthday gifts be delivered in Indore?", answer: "Yes. This page is built specifically for birthday gifting in Indore." },
      { question: "Are personalized birthday gifts available?", answer: "Yes. Personalized and hamper pages should be linked from this landing page." },
    ],
    canonical: `${siteUrl}/birthday-gifts-indore`,
  },
  {
    slug: "crochet-bouquet-indore",
    title: "Crochet Bouquet Indore",
    description: "Crochet bouquet delivery in Indore for handmade and keepsake-style gifting.",
    h1: "Crochet Bouquet in Indore",
    intro: "A niche city page that can capture long-tail, low-competition search traffic.",
    h2: "Handmade gifting in Indore",
    seoCopy: [
      "Specific product + city pages often rank with less competition than broad category pages.",
      "This page should be linked from crochet bouquet and local hub pages.",
      "It supports the handcrafted positioning of the brand.",
    ],
    relatedLinks: [
      { label: "Crochet Bouquets", href: "/crochet-bouquets" },
      { label: "Gifts in Indore", href: "/gifts-in-indore" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
    ],
    faq: [
      { question: "Do you deliver crochet bouquets in Indore?", answer: "Yes. This landing page is intended for Indore delivery intent." },
      { question: "Are crochet bouquets good for gifting?", answer: "Yes. They work well as keepsakes and premium handmade gifts." },
    ],
    canonical: `${siteUrl}/crochet-bouquet-indore`,
  },
  {
    slug: "gift-hampers-indore",
    title: "Gift Hampers Indore",
    description: "Gift hampers in Indore for birthdays, anniversaries, and same day gifting.",
    h1: "Gift Hampers in Indore",
    intro: "A local commercial page focused on one of the strongest gifting product types.",
    h2: "Curated hampers for Indore customers",
    seoCopy: [
      "Gift hamper + city combinations are strong commercial SEO opportunities.",
      "This page connects directly to hamper, budget, and same-day intent.",
      "It should be one of the cornerstone local landing pages.",
    ],
    relatedLinks: [
      { label: "Gift Hampers", href: "/gift-hampers" },
      { label: "Gift Shop Indore", href: "/gift-shop-indore" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
    ],
    faq: [
      { question: "Are gift hampers available in Indore?", answer: "Yes. This page is specifically designed for Indore hamper searches." },
      { question: "Can hampers be personalized?", answer: "Yes. Personalized and hamper pages should reinforce each other." },
    ],
    canonical: `${siteUrl}/gift-hampers-indore`,
  },
  {
    slug: "same-day-gift-delivery-indore",
    title: "Same Day Gift Delivery Indore",
    description: "Same day gift delivery in Indore for urgent gifting and surprise occasions.",
    h1: "Same Day Gift Delivery in Indore",
    intro: "A high-intent local delivery page that can capture urgent buyer searches.",
    h2: "Why same-day matters in Indore",
    seoCopy: [
      "Urgent local delivery searches are highly transactional and worth dedicated landing pages.",
      "This page should connect to gift types, budgets, and occasion pages.",
      "It is a strong fit for searchers ready to buy immediately.",
    ],
    relatedLinks: [
      { label: "Same Day Delivery", href: "/same-day-delivery" },
      { label: "Gifts in Indore", href: "/gifts-in-indore" },
      { label: "Birthday Gifts Indore", href: "/birthday-gifts-indore" },
    ],
    faq: [
      { question: "Is same day gift delivery available in Indore?", answer: "Yes. This page supports same-day local delivery intent in Indore." },
      { question: "Which gift types are best for same day?", answer: "Compact bouquets, chocolate bouquets, and hampers usually perform best." },
    ],
    canonical: `${siteUrl}/same-day-gift-delivery-indore`,
  },
  {
    slug: "midnight-gift-delivery-indore",
    title: "Midnight Gift Delivery Indore",
    description: "Midnight gift delivery in Indore for birthdays, love, and surprise moments.",
    h1: "Midnight Gift Delivery in Indore",
    intro: "A premium local page for midnight delivery searches with emotional buying intent.",
    h2: "Surprise gifting at midnight",
    seoCopy: [
      "Midnight delivery is one of the strongest urgency-intent keywords in gifting.",
      "The page should connect to romantic, birthday, and budget pages for topical depth.",
      "This can be a strong local growth page for QuickWish.",
    ],
    relatedLinks: [
      { label: "Midnight Delivery", href: "/midnight-delivery" },
      { label: "Anniversary Gifts", href: "/anniversary-gifts" },
      { label: "Gift Shop Indore", href: "/gift-shop-indore" },
    ],
    faq: [
      { question: "Do you offer midnight delivery in Indore?", answer: "Yes. This page is built for midnight gift delivery search intent in Indore." },
      { question: "What gifts work best at midnight?", answer: "Flowers, cakes, and romantic gift sets usually perform best." },
    ],
    canonical: `${siteUrl}/midnight-gift-delivery-indore`,
  },
  {
    slug: "gifts-for-wife",
    title: "Gifts for Wife",
    description: "Gift ideas for wife including flowers, hampers, personalized gifts, and romantic surprises.",
    h1: "Gifts for Wife",
    intro: "Recipient pages capture relationship intent and improve the site’s topical authority.",
    h2: "Thoughtful gifts for your wife",
    seoCopy: [
      "Recipient pages help search engines map gifting intent to relationship-specific needs.",
      "This page should link into anniversary and personalized pages for conversion support.",
      "It creates a stronger semantic layer for romantic gifting.",
    ],
    relatedLinks: [
      { label: "Anniversary Gifts", href: "/anniversary-gifts" },
      { label: "Personalized Gifts", href: "/personalized-gifts" },
      { label: "Flower Bouquets", href: "/products?category=Flower Bouquets" },
    ],
    faq: [
      { question: "What gifts are best for wife?", answer: "Personalized gifts, flowers, hampers, and romantic anniversary picks are strong options." },
      { question: "Should this page link to anniversary gifts?", answer: "Yes. That internal link is important for relevance and discovery." },
    ],
    canonical: `${siteUrl}/gifts-for-wife`,
  },
  {
    slug: "gifts-for-husband",
    title: "Gifts for Husband",
    description: "Gift ideas for husband with personalized, anniversary, and romantic options.",
    h1: "Gifts for Husband",
    intro: "A recipient page for relationship intent and higher converting long-tail searches.",
    h2: "Best gift ideas for husband",
    seoCopy: [
      "Recipient pages help QuickWish capture more specific search intent than generic category pages.",
      "This page should reinforce anniversary, personalized, and budget-based discovery paths.",
      "It strengthens the site’s relationship-based topical map.",
    ],
    relatedLinks: [
      { label: "Anniversary Gifts", href: "/anniversary-gifts" },
      { label: "Personalized Gifts", href: "/personalized-gifts" },
      { label: "Gift Hampers", href: "/gift-hampers" },
    ],
    faq: [
      { question: "What gifts are best for husband?", answer: "Personalized gifts, hampers, and romantic anniversary products usually convert well." },
      { question: "Should this page link to anniversary gifts?", answer: "Yes. That strengthens internal relevance and helps users continue shopping." },
    ],
    canonical: `${siteUrl}/gifts-for-husband`,
  },
  {
    slug: "gifts-for-girlfriend",
    title: "Gifts for Girlfriend",
    description: "Gifts for girlfriend with romantic, personalized, and same-day delivery options.",
    h1: "Gifts for Girlfriend",
    intro: "A romantic recipient page that can support strong commercial search traffic.",
    h2: "Thoughtful gifts for girlfriend",
    seoCopy: [
      "This page supports romantic transactional intent and can be linked from anniversary and midnight delivery pages.",
      "It helps broaden topical coverage for gifting queries in India.",
      "It should connect to flowers, chocolate bouquets, and personalized gifts.",
    ],
    relatedLinks: [
      { label: "Anniversary Gifts", href: "/anniversary-gifts" },
      { label: "Midnight Delivery", href: "/midnight-delivery" },
      { label: "Chocolate Bouquets", href: "/chocolate-bouquets" },
    ],
    faq: [
      { question: "What gifts are best for girlfriend?", answer: "Romantic flowers, chocolate bouquets, and personalized gifts are strong choices." },
      { question: "Can I get same-day delivery?", answer: "Yes. Same-day and midnight delivery pages should support this intent." },
    ],
    canonical: `${siteUrl}/gifts-for-girlfriend`,
  },
  {
    slug: "gifts-for-boyfriend",
    title: "Gifts for Boyfriend",
    description: "Gift ideas for boyfriend including personalized gifts, bouquets, and premium surprises.",
    h1: "Gifts for Boyfriend",
    intro: "A high-intent recipient page to expand relationship-based discoverability.",
    h2: "Popular gifts for boyfriend",
    seoCopy: [
      "Boyfriend gifting searches deserve a dedicated page to improve semantic coverage.",
      "Connect this page to romantic and same-day delivery pages for stronger conversion flow.",
      "It can also support budget and personalized gift discovery.",
    ],
    relatedLinks: [
      { label: "Personalized Gifts", href: "/personalized-gifts" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
      { label: "Gift Hampers", href: "/gift-hampers" },
    ],
    faq: [
      { question: "What gifts are best for boyfriend?", answer: "Personalized and romantic gift sets often perform well." },
      { question: "Can it be delivered in Indore?", answer: "Yes. The city pages support local delivery intent in Indore." },
    ],
    canonical: `${siteUrl}/gifts-for-boyfriend`,
  },
  {
    slug: "gifts-for-mother",
    title: "Gifts for Mother",
    description: "Mother's gifts including flowers, cakes, hampers, and thoughtful surprises.",
    h1: "Gifts for Mother",
    intro: "A parent recipient page for one of the most consistent gifting intents.",
    h2: "Thoughtful gifts for mother",
    seoCopy: [
      "Mother gifting can support seasonal campaigns and evergreen ranking opportunities.",
      "This page should link to flowers, hampers, and occasion-based pages.",
      "It strengthens the family-oriented topical cluster.",
    ],
    relatedLinks: [
      { label: "Flower Bouquets", href: "/products?category=Flower Bouquets" },
      { label: "Gift Hampers", href: "/gift-hampers" },
      { label: "Birthday Gifts", href: "/birthday-gifts" },
    ],
    faq: [
      { question: "What gifts are best for mother?", answer: "Flowers, hampers, and personalized gifts are strong options." },
      { question: "Can this page help Mother's Day SEO?", answer: "Yes. It can be expanded into a seasonal cluster later." },
    ],
    canonical: `${siteUrl}/gifts-for-mother`,
  },
  {
    slug: "gifts-for-father",
    title: "Gifts for Father",
    description: "Gifts for father with premium, personalized, and celebration-focused options.",
    h1: "Gifts for Father",
    intro: "A father-recipient page that supports family gifting intent and premium products.",
    h2: "Meaningful gifts for father",
    seoCopy: [
      "Father gifting intent is highly relevant for birthdays, appreciation, and seasonal campaigns.",
      "This page should link into personalized and premium category pages.",
      "It helps broaden family-based keyword coverage.",
    ],
    relatedLinks: [
      { label: "Personalized Gifts", href: "/personalized-gifts" },
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Corporate Gifts", href: "/corporate-gifts" },
    ],
    faq: [
      { question: "What gifts are best for father?", answer: "Personalized items and premium hampers are strong choices." },
      { question: "Can it support Father's Day content later?", answer: "Yes. This page can become a seasonal hub for Father's Day." },
    ],
    canonical: `${siteUrl}/gifts-for-father`,
  },
  {
    slug: "gifts-for-sister",
    title: "Gifts for Sister",
    description: "Gifts for sister with flowers, chocolates, and personalized presents.",
    h1: "Gifts for Sister",
    intro: "A family recipient page that captures common gift searches with lighter competition.",
    h2: "Gift ideas for sister",
    seoCopy: [
      "Family recipient pages help the brand rank for natural-language gifting searches.",
      "This page should connect to chocolate bouquets, flowers, and birthday pages.",
      "It strengthens broader site coverage without needing a separate product catalog.",
    ],
    relatedLinks: [
      { label: "Chocolate Bouquets", href: "/chocolate-bouquets" },
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Personalized Gifts", href: "/personalized-gifts" },
    ],
    faq: [
      { question: "What gifts are best for sister?", answer: "Flowers, chocolates, and personalized gifts are common choices." },
      { question: "Should sister pages link to birthday gifts?", answer: "Yes. That is usually the main intent." },
    ],
    canonical: `${siteUrl}/gifts-for-sister`,
  },
  {
    slug: "gifts-for-brother",
    title: "Gifts for Brother",
    description: "Gifts for brother with premium, personalized, and celebration-focused ideas.",
    h1: "Gifts for Brother",
    intro: "A sibling-recipient page that expands family gifting coverage.",
    h2: "Gift ideas for brother",
    seoCopy: [
      "Brother gifting searches are common and should be covered explicitly.",
      "This page should connect to personalized and birthday pages.",
      "It adds semantic depth to the family gifting cluster.",
    ],
    relatedLinks: [
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Personalized Gifts", href: "/personalized-gifts" },
      { label: "Gift Hampers", href: "/gift-hampers" },
    ],
    faq: [
      { question: "What gifts are best for brother?", answer: "Personalized gifts and practical hampers are strong options." },
      { question: "Can brother pages support Raksha Bandhan later?", answer: "Yes. That is a natural seasonal expansion." },
    ],
    canonical: `${siteUrl}/gifts-for-brother`,
  },
  {
    slug: "gifts-for-best-friend",
    title: "Gifts for Best Friend",
    description: "Best friend gifts with birthday, friendship, and personalized options.",
    h1: "Gifts for Best Friend",
    intro: "A friendship recipient page for a strong everyday gifting intent.",
    h2: "Thoughtful gifts for best friend",
    seoCopy: [
      "Friendship gifting is a frequent search category and benefits from its own landing page.",
      "This page should link to birthday gifts, budget pages, and personalized gifts.",
      "It also pairs well with blog content around friendship day and best-friend gift ideas.",
    ],
    relatedLinks: [
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Personalized Gifts", href: "/personalized-gifts" },
      { label: "Gifts Under Rs 499", href: "/gifts-under-499" },
    ],
    faq: [
      { question: "What gifts are best for best friend?", answer: "Chocolates, personalized gifts, and budget hampers are common winners." },
      { question: "Can this page support Friendship Day content?", answer: "Yes. It can evolve into a seasonal cluster page." },
    ],
    canonical: `${siteUrl}/gifts-for-best-friend`,
  },
  {
    slug: "gifts-under-299",
    title: "Gifts Under Rs 299",
    description: "Affordable gifts under Rs 299 for budget-conscious gifting.",
    h1: "Gifts Under Rs 299",
    intro: "A budget landing page that captures cost-sensitive transactional searches.",
    h2: "Budget gifts that still feel thoughtful",
    seoCopy: [
      "Budget pages convert well because the price intent is explicit and purchase-ready.",
      "This page should link to chocolate bouquets and same-day delivery pages.",
      "It helps QuickWish compete on price-filtered search results.",
    ],
    relatedLinks: [
      { label: "Chocolate Bouquets", href: "/chocolate-bouquets" },
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
    ],
    faq: [
      { question: "Are there gifts under Rs 299?", answer: "Yes. Budget pages should surface lower-priced gifting options." },
      { question: "Do budget gifts still look premium?", answer: "Yes. Presentation matters even at lower price points." },
    ],
    canonical: `${siteUrl}/gifts-under-299`,
  },
  {
    slug: "gifts-under-499",
    title: "Gifts Under Rs 499",
    description: "Gifts under Rs 499 with budget-friendly gifting and fast delivery intent.",
    h1: "Gifts Under Rs 499",
    intro: "A key budget page for high-volume searches with purchase intent.",
    h2: "Best value gifts under Rs 499",
    seoCopy: [
      "This is one of the strongest entry pages for budget-conscious buyers.",
      "Budget + category + local pages can work together to improve ranking and conversion.",
      "This page should be one of the site’s major SEO hubs.",
    ],
    relatedLinks: [
      { label: "Chocolate Bouquets", href: "/chocolate-bouquets" },
      { label: "Birthday Gifts", href: "/birthday-gifts" },
      { label: "Gift Hampers", href: "/gift-hampers" },
    ],
    faq: [
      { question: "Can I get gifts under Rs 499?", answer: "Yes. This page is built to target that budget range." },
      { question: "Are these gifts good for birthdays?", answer: "Yes. Budget birthday gifting is a major conversion use case." },
    ],
    canonical: `${siteUrl}/gifts-under-499`,
  },
];

export const seoPageSlugs = seoPages.map((page) => page.slug);
