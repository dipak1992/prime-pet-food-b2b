export interface LocationPage {
  slug: string;
  state: string;
  stateCode: string;
  city?: string;
  category: "location";
  seoTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string;
  shippingNote: string;
  localContext: string;
  faqs: { question: string; answer: string }[];
  relatedLinks: { label: string; href: string }[];
}

export const locationPages: LocationPage[] = [
  {
    slug: "texas",
    state: "Texas",
    stateCode: "TX",
    category: "location",
    seoTitle: "Wholesale Yak Cheese Dog Chews in Texas | Prime Pet Food",
    metaDescription:
      "Supply your Texas pet store, groomer, or daycare with wholesale Himalayan yak cheese dog chews. Fast shipping to Dallas, Houston, Austin, San Antonio, and all of Texas.",
    h1: "Wholesale Yak Cheese Dog Chews — Texas Pet Retailers",
    subtitle:
      "Serving pet stores, groomers, boarding facilities, and distributors across Texas with wholesale natural dog chews.",
    intro:
      "Texas is home to thousands of independent pet stores, grooming salons, dog daycares, and boarding facilities — all looking for high-margin, natural products their customers love. Prime Pet Food supplies wholesale Himalayan yak cheese dog chews to approved B2B buyers across Texas, from Dallas–Fort Worth and Houston to Austin, San Antonio, and beyond. Our wholesale program gives Texas pet businesses protected pricing, clear case-pack rules, and a portal built for fast reorders.",
    shippingNote:
      "We ship wholesale orders to all Texas zip codes. Standard wholesale orders to Texas typically arrive in 2–4 business days from our distribution center. Freight options available for large bulk orders.",
    localContext:
      "Texas pet owners are passionate about their dogs and increasingly demand natural, clean-label treats. Yak cheese chews fit perfectly into the premium pet product trend that is growing across Texas's major metro areas and suburban markets. Independent pet stores in Texas consistently report strong sell-through on natural chews.",
    faqs: [
      {
        question: "Do you ship wholesale yak chews to Texas?",
        answer:
          "Yes. We ship to all Texas zip codes. Standard wholesale orders typically arrive in 2–4 business days.",
      },
      {
        question: "Can Texas pet stores apply for wholesale pricing?",
        answer:
          "Yes. Any Texas-based pet store, groomer, daycare, boarding facility, or vet clinic can apply for a wholesale account. Most applications are reviewed within 1 business day.",
      },
      {
        question: "Are there Texas distributors for Prime Pet Food yak chews?",
        answer:
          "We work with select distributors in Texas. If you are a distributor interested in carrying our products, please apply through our distributor program page.",
      },
      {
        question: "What is the minimum order for Texas wholesale buyers?",
        answer:
          "Minimum order quantities are displayed per SKU in the wholesale catalog after approval. Most Texas buyers start with a mixed case to test sell-through.",
      },
    ],
    relatedLinks: [
      { label: "Wholesale Dog Chews — Dallas", href: "/wholesale/locations/texas/dallas" },
      { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
      { label: "Distributor Program", href: "/distributor-program" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
  },
  {
    slug: "dallas",
    state: "Texas",
    stateCode: "TX",
    city: "Dallas",
    category: "location",
    seoTitle: "Wholesale Yak Cheese Dog Chews in Dallas TX | Prime Pet Food",
    metaDescription:
      "Wholesale Himalayan yak cheese dog chews for Dallas pet stores, groomers, and daycares. Protected pricing, fast shipping to Dallas-Fort Worth, apply today.",
    h1: "Wholesale Yak Cheese Dog Chews — Dallas, Texas",
    subtitle:
      "Supplying Dallas–Fort Worth pet retailers and groomers with premium wholesale natural dog chews.",
    intro:
      "Dallas–Fort Worth is one of the fastest-growing pet markets in the United States. With a booming population of dog owners and a strong independent pet retail scene, DFW pet businesses need reliable wholesale suppliers for premium natural products. Prime Pet Food supplies wholesale Himalayan yak cheese dog chews to approved pet stores, grooming salons, dog daycares, and boarding facilities across Dallas, Fort Worth, Plano, Frisco, McKinney, and the greater DFW metroplex.",
    shippingNote:
      "Dallas-area wholesale orders typically arrive in 1–3 business days. We ship to all Dallas, Fort Worth, Plano, Frisco, McKinney, Arlington, and DFW metro zip codes.",
    localContext:
      "Dallas pet owners are among the most engaged in the country. The DFW market has a strong appetite for premium, natural pet products. Independent pet stores in Dallas consistently outperform on natural chew categories, and yak cheese chews are a top-selling item in boutique pet shops across the metroplex.",
    faqs: [
      {
        question: "Do you supply wholesale dog chews to Dallas pet stores?",
        answer:
          "Yes. We supply approved wholesale accounts across Dallas, Fort Worth, and the entire DFW metroplex. Apply for a wholesale account to get started.",
      },
      {
        question: "How fast does wholesale shipping arrive in Dallas?",
        answer:
          "Dallas-area orders typically arrive in 1–3 business days from our distribution center.",
      },
      {
        question: "Can Dallas groomers and daycares get wholesale pricing?",
        answer:
          "Yes. Groomers, dog daycares, and boarding facilities in Dallas qualify for wholesale pricing. Apply with your business details and we will review within 1 business day.",
      },
      {
        question: "Is there a Dallas-area sales rep I can talk to?",
        answer:
          "Our wholesale team handles all Dallas accounts directly. After applying, you will be connected with a team member who can answer questions about your specific needs.",
      },
    ],
    relatedLinks: [
      { label: "Wholesale Dog Chews — Texas", href: "/wholesale/locations/texas" },
      { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
      { label: "Best High-Margin Dog Treats for Pet Stores", href: "/best-high-margin-dog-treats-for-pet-stores" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
  },
];

// Scalable state data for programmatic location pages
export interface StateData {
  name: string;
  code: string;
  slug: string;
  majorCities: string[];
  marketNote: string;
  shippingDays: string;
}

export const stateData: StateData[] = [
  {
    name: "Texas",
    code: "TX",
    slug: "texas",
    majorCities: ["Dallas", "Houston", "Austin", "San Antonio", "Fort Worth"],
    marketNote:
      "Texas is one of the largest pet markets in the US with a strong independent pet retail scene across its major metros.",
    shippingDays: "2–4 business days",
  },
  {
    name: "California",
    code: "CA",
    slug: "california",
    majorCities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"],
    marketNote:
      "California pet owners are among the most health-conscious in the country, driving strong demand for natural, clean-label dog treats.",
    shippingDays: "3–5 business days",
  },
  {
    name: "Florida",
    code: "FL",
    slug: "florida",
    majorCities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
    marketNote:
      "Florida's year-round warm climate and active outdoor culture drives strong pet ownership and premium pet product demand.",
    shippingDays: "2–4 business days",
  },
  {
    name: "New York",
    code: "NY",
    slug: "new-york",
    majorCities: ["New York City", "Buffalo", "Albany", "Rochester", "Syracuse"],
    marketNote:
      "New York's dense urban pet market and premium-oriented consumers make it a strong market for natural dog chews.",
    shippingDays: "2–3 business days",
  },
  {
    name: "Illinois",
    code: "IL",
    slug: "illinois",
    majorCities: ["Chicago", "Aurora", "Naperville", "Rockford", "Springfield"],
    marketNote:
      "Chicago's large urban pet market and strong independent pet retail community drives consistent demand for premium natural chews.",
    shippingDays: "2–3 business days",
  },
  {
    name: "Colorado",
    code: "CO",
    slug: "colorado",
    majorCities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"],
    marketNote:
      "Colorado's outdoor-oriented dog owners are highly engaged with premium natural pet products.",
    shippingDays: "2–3 business days",
  },
  {
    name: "Washington",
    code: "WA",
    slug: "washington",
    majorCities: ["Seattle", "Spokane", "Tacoma", "Bellevue", "Olympia"],
    marketNote:
      "Seattle and the Pacific Northwest have a strong culture of natural, sustainable pet products.",
    shippingDays: "3–5 business days",
  },
  {
    name: "Georgia",
    code: "GA",
    slug: "georgia",
    majorCities: ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens"],
    marketNote:
      "Atlanta's growing pet market and expanding suburban pet retail scene creates strong wholesale opportunities.",
    shippingDays: "2–3 business days",
  },
];
