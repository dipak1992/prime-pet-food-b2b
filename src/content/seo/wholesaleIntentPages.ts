export interface FAQ {
  question: string;
  answer: string;
}

export interface CTABlock {
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface WholesaleIntentPage {
  slug: string;
  category: "wholesale-intent";
  seoTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string;
  buyerBenefits: { title: string; description: string }[];
  productBenefits: { title: string; description: string }[];
  cta: CTABlock;
  faqs: FAQ[];
  relatedLinks: RelatedLink[];
  schemaType: "Product" | "Service" | "WebPage";
}

export const wholesaleIntentPages: WholesaleIntentPage[] = [
  {
    slug: "wholesale-yak-cheese-dog-chews",
    category: "wholesale-intent",
    seoTitle: "Wholesale Yak Cheese Dog Chews | Prime Pet Food B2B",
    metaDescription:
      "Buy wholesale Himalayan yak cheese dog chews direct from Prime Pet Food. Protected pricing, case-pack ordering, and fast reorders for approved pet retailers.",
    h1: "Wholesale Yak Cheese Dog Chews for Pet Retailers",
    subtitle:
      "Protected wholesale pricing, case-pack rules, and invoice-based ordering for approved B2B buyers.",
    intro:
      "Prime Pet Food supplies Himalayan yak cheese dog chews to independent pet stores, groomers, boarding facilities, vet clinics, and regional distributors across the United States. Our wholesale program gives approved buyers access to protected pricing, clear MOQ and case-pack requirements, and a streamlined portal for repeat reorders — so you can keep your shelves stocked without the friction.",
    buyerBenefits: [
      {
        title: "Protected wholesale pricing",
        description:
          "Pricing is gated behind approval so your retail margin stays intact. No public price leaks.",
      },
      {
        title: "Case-pack ordering",
        description:
          "Every SKU shows MOQ and case-pack rules before you commit. No surprise minimums.",
      },
      {
        title: "Invoice-based workflow",
        description:
          "Submit orders online and receive a formal invoice. ACH payment preferred for approved accounts.",
      },
      {
        title: "Fast reorder portal",
        description:
          "Reorder from your order history in seconds. Keep fast-moving chews in stock without re-entering details.",
      },
      {
        title: "MSRP guidance included",
        description:
          "We provide suggested retail pricing so you can price confidently and protect your margin.",
      },
      {
        title: "Dedicated account support",
        description:
          "Approved buyers get direct access to our wholesale team for custom quotes and volume questions.",
      },
    ],
    productBenefits: [
      {
        title: "100% natural single ingredient",
        description:
          "Made from yak and cow milk. No artificial preservatives, no rawhide, no chemicals.",
      },
      {
        title: "Long-lasting chew",
        description:
          "Harder than bully sticks and antlers for most dogs. Keeps dogs occupied longer — better perceived value for your customers.",
      },
      {
        title: "High-margin SKU",
        description:
          "Yak chews command premium retail pricing. Wholesale buyers typically achieve 40–60% gross margin.",
      },
      {
        title: "Multiple sizes available",
        description:
          "Small, medium, large, and XL sizes to serve every dog breed and weight class in your store.",
      },
      {
        title: "Shelf-stable and easy to display",
        description:
          "No refrigeration required. Long shelf life makes inventory management simple.",
      },
      {
        title: "Proven customer repeat purchase",
        description:
          "Dogs love them and owners come back. High repeat purchase rate drives consistent reorder revenue.",
      },
    ],
    cta: {
      primary: { label: "Apply for wholesale pricing", href: "/apply" },
      secondary: { label: "Preview the catalog", href: "/catalog" },
    },
    faqs: [
      {
        question: "What is the minimum order for wholesale yak chews?",
        answer:
          "Minimum order quantities vary by SKU and are displayed clearly in the wholesale catalog after approval. Most case packs start at 12–24 units per SKU.",
      },
      {
        question: "How long does wholesale approval take?",
        answer:
          "Most applications are reviewed within 1 business day. You will receive an email with next steps once your account is approved.",
      },
      {
        question: "Do you offer samples before I commit to a wholesale order?",
        answer:
          "Yes. Approved wholesale applicants can request samples through the portal. Contact our team after applying to arrange a sample shipment.",
      },
      {
        question: "What payment methods do you accept for wholesale orders?",
        answer:
          "We prefer ACH bank transfer for approved wholesale accounts. Invoice terms are available for established buyers. Credit card is also accepted.",
      },
      {
        question: "Can I get custom sizing or private label yak chews?",
        answer:
          "Yes. We offer private label and custom size programs for distributors and high-volume buyers. Visit our private label page or contact us directly.",
      },
      {
        question: "Do you ship wholesale orders across the USA?",
        answer:
          "Yes. We ship to all 50 states. Shipping costs and lead times are confirmed at the time of invoice.",
      },
    ],
    relatedLinks: [
      { label: "Bulk Yak Cheese Dog Chews", href: "/bulk-yak-cheese-dog-chews" },
      { label: "Distributor Program", href: "/distributor-program" },
      { label: "Private Label Yak Chews", href: "/private-label-yak-chews" },
      { label: "Yak Chews vs Rawhide for Retailers", href: "/yak-chews-vs-rawhide-for-retailers" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
    schemaType: "Product",
  },
  {
    slug: "bulk-yak-cheese-dog-chews",
    category: "wholesale-intent",
    seoTitle: "Bulk Yak Cheese Dog Chews | Wholesale Pricing for High-Volume Buyers",
    metaDescription:
      "Order bulk Himalayan yak cheese dog chews at wholesale prices. Volume discounts, custom case packs, and ACH invoicing for distributors and large pet retailers.",
    h1: "Bulk Himalayan Yak Cheese Dog Chews — Wholesale Volume Pricing",
    subtitle:
      "Volume pricing, custom case packs, and dedicated account support for high-volume buyers and distributors.",
    intro:
      "Need to order yak cheese dog chews in bulk? Prime Pet Food works with distributors, multi-location pet store chains, subscription box companies, and online resellers who need consistent volume, competitive pricing, and reliable fulfillment. Our bulk wholesale program is built for buyers who move serious inventory.",
    buyerBenefits: [
      {
        title: "Volume-tiered pricing",
        description:
          "The more you order, the better your unit cost. Volume tiers are discussed during account setup.",
      },
      {
        title: "Custom case configurations",
        description:
          "Need a specific mix of sizes? We can configure custom case packs for high-volume accounts.",
      },
      {
        title: "Dedicated account manager",
        description:
          "Bulk buyers get a named contact for quotes, reorders, and fulfillment questions.",
      },
      {
        title: "Flexible payment terms",
        description:
          "Net-30 terms available for established bulk accounts. ACH and wire transfer accepted.",
      },
      {
        title: "Consistent supply chain",
        description:
          "We maintain inventory buffers for bulk accounts so you are not caught out of stock.",
      },
      {
        title: "Drop-ship options available",
        description:
          "For online resellers and subscription boxes, we can discuss drop-ship fulfillment arrangements.",
      },
    ],
    productBenefits: [
      {
        title: "Himalayan sourced, USA distributed",
        description:
          "Authentic yak and cow milk chews sourced from the Himalayas and distributed from our US warehouse.",
      },
      {
        title: "Consistent quality across batches",
        description:
          "Every batch is quality-checked before shipping. Bulk buyers get the same quality as single-case orders.",
      },
      {
        title: "Full size range available in bulk",
        description:
          "Small through XL available in bulk quantities. Mix sizes to serve your full customer base.",
      },
      {
        title: "Long shelf life",
        description:
          "12+ month shelf life makes bulk purchasing practical. No spoilage risk with proper storage.",
      },
      {
        title: "Retail-ready packaging",
        description:
          "Individual chews come in retail-ready packaging with UPC codes and product information.",
      },
      {
        title: "High repeat purchase product",
        description:
          "Dogs finish chews and owners reorder. Bulk buyers benefit from predictable sell-through.",
      },
    ],
    cta: {
      primary: { label: "Request bulk pricing quote", href: "/apply" },
      secondary: { label: "View distributor program", href: "/distributor-program" },
    },
    faqs: [
      {
        question: "What qualifies as a bulk order for yak chews?",
        answer:
          "Bulk pricing typically applies to orders of 10+ cases per SKU or $2,000+ per order. Contact us to discuss your volume and we will provide a custom quote.",
      },
      {
        question: "Can I get volume discounts on mixed SKU orders?",
        answer:
          "Yes. We calculate volume discounts on total order value, not per-SKU. Mixing sizes and products still qualifies for volume pricing.",
      },
      {
        question: "Do you offer net-30 payment terms for bulk orders?",
        answer:
          "Net-30 terms are available for established bulk accounts with a track record of on-time payment. New accounts typically start with ACH or credit card.",
      },
      {
        question: "How quickly can you fulfill a large bulk order?",
        answer:
          "Standard bulk orders ship within 3–5 business days. Very large orders may require 7–10 days. We will confirm lead time at the time of quote.",
      },
      {
        question: "Can I get a sample of each size before placing a bulk order?",
        answer:
          "Yes. We encourage bulk buyers to sample all sizes before committing to large quantities. Request samples through your wholesale application.",
      },
    ],
    relatedLinks: [
      { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
      { label: "Distributor Program", href: "/distributor-program" },
      { label: "Private Label Yak Chews", href: "/private-label-yak-chews" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
    schemaType: "Product",
  },
  {
    slug: "wholesale-dog-chews-for-pet-stores",
    category: "wholesale-intent",
    seoTitle: "Wholesale Dog Chews for Pet Stores | High-Margin Natural Chews",
    metaDescription:
      "Stock your pet store with wholesale Himalayan yak cheese dog chews. High margin, long shelf life, strong repeat purchase. Apply for wholesale pricing today.",
    h1: "Wholesale Dog Chews for Pet Stores — High Margin, Natural, Long-Lasting",
    subtitle:
      "Give your customers the natural chew they keep coming back for — and protect your margin with wholesale pricing.",
    intro:
      "Independent pet stores need products that sell themselves, drive repeat visits, and hold strong margin. Himalayan yak cheese dog chews from Prime Pet Food check every box. They are natural, long-lasting, shelf-stable, and priced to give pet store owners 40–60% gross margin at standard retail. Our wholesale program is built specifically for independent and boutique pet stores that want a premium chew section without the complexity.",
    buyerBenefits: [
      {
        title: "40–60% gross margin",
        description:
          "Yak chews retail for $8–$25 depending on size. Wholesale pricing gives independent stores strong margin on every unit.",
      },
      {
        title: "No refrigeration required",
        description:
          "Shelf-stable product means no cold storage, no spoilage, and simple inventory management.",
      },
      {
        title: "Strong repeat purchase",
        description:
          "Dogs love yak chews and owners come back for more. High repeat purchase rate drives consistent foot traffic.",
      },
      {
        title: "Easy to merchandise",
        description:
          "Retail-ready packaging with UPC codes. Easy to display on pegs, shelves, or in a dedicated chew section.",
      },
      {
        title: "MSRP guidance provided",
        description:
          "We provide suggested retail pricing so you can price confidently without undercutting other retailers.",
      },
      {
        title: "Fast reorder portal",
        description:
          "Reorder from your order history in the wholesale portal. Keep shelves stocked without phone calls.",
      },
    ],
    productBenefits: [
      {
        title: "100% natural — no rawhide",
        description:
          "Customers increasingly avoid rawhide. Yak chews are a natural, digestible alternative that sells on its own merits.",
      },
      {
        title: "Long-lasting chew time",
        description:
          "Most dogs spend 30–90 minutes on a single chew. Customers perceive strong value compared to cheaper treats.",
      },
      {
        title: "All sizes for all dogs",
        description:
          "Small through XL sizes mean you can serve every customer who walks in, from Chihuahuas to Great Danes.",
      },
      {
        title: "Clean label",
        description:
          "Ingredient list: yak milk, cow milk, salt, lime juice. Customers love the simplicity.",
      },
      {
        title: "Himalayan origin story",
        description:
          "The authentic Himalayan origin is a compelling retail story that helps staff sell the product.",
      },
      {
        title: "Microwaveable puff bonus",
        description:
          "When the chew gets small, owners can microwave it into a crunchy puff treat. Customers love this feature.",
      },
    ],
    cta: {
      primary: { label: "Apply for pet store wholesale pricing", href: "/apply" },
      secondary: { label: "See high-margin dog treat guide", href: "/best-high-margin-dog-treats-for-pet-stores" },
    },
    faqs: [
      {
        question: "What is the minimum order for pet store wholesale accounts?",
        answer:
          "Minimum orders are displayed per SKU in the wholesale catalog. Most pet stores start with a mixed case of sizes to test sell-through before committing to larger quantities.",
      },
      {
        question: "Do you provide a planogram or display guide for pet stores?",
        answer:
          "Yes. Approved wholesale accounts can request our retail shelf display guide, which includes recommended facings, size assortment, and pricing suggestions.",
      },
      {
        question: "How do I reorder when I run low?",
        answer:
          "Approved buyers use the wholesale portal to reorder from their order history. You can also set up reorder reminders so you never run out of your best-selling sizes.",
      },
      {
        question: "Can I get a sample before my first wholesale order?",
        answer:
          "Yes. We encourage pet store owners to sample the product before ordering. Request samples through your wholesale application.",
      },
      {
        question: "Do you offer exclusive territory pricing for pet stores?",
        answer:
          "We do not offer exclusive territories, but we do protect wholesale pricing so your retail margin is not undercut by online sellers.",
      },
    ],
    relatedLinks: [
      { label: "Best High-Margin Dog Treats for Pet Stores", href: "/best-high-margin-dog-treats-for-pet-stores" },
      { label: "Yak Chews vs Rawhide for Retailers", href: "/yak-chews-vs-rawhide-for-retailers" },
      { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
    schemaType: "Product",
  },
];
