export interface DistributorPage {
  slug: string;
  category: "distributor";
  seoTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string;
  programFeatures: { title: string; description: string }[];
  idealFor: string[];
  processSteps: { step: string; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  cta: { primary: { label: string; href: string }; secondary?: { label: string; href: string } };
  relatedLinks: { label: string; href: string }[];
}

export const distributorPages: DistributorPage[] = [
  {
    slug: "distributor-program",
    category: "distributor",
    seoTitle: "Yak Chew Distributor Program | Prime Pet Food Wholesale",
    metaDescription:
      "Become a Prime Pet Food distributor. Wholesale Himalayan yak cheese dog chews for regional distributors, pet food brokers, and multi-location buyers. Apply today.",
    h1: "Prime Pet Food Distributor Program — Wholesale Yak Cheese Dog Chews",
    subtitle:
      "Partner with Prime Pet Food to distribute Himalayan yak cheese dog chews to pet retailers in your region.",
    intro:
      "Prime Pet Food is looking for regional distributors, pet food brokers, and high-volume wholesale partners who want to add premium Himalayan yak cheese dog chews to their portfolio. Our distributor program offers competitive wholesale pricing, dedicated account support, marketing materials, and the flexibility to serve independent pet stores, grooming chains, and boarding facilities in your territory.",
    programFeatures: [
      {
        title: "Competitive distributor pricing",
        description:
          "Distributor pricing is structured to give you margin when selling to your retail accounts. Volume tiers reward consistent ordering.",
      },
      {
        title: "Dedicated account manager",
        description:
          "Every distributor account gets a named contact at Prime Pet Food for quotes, reorders, and support.",
      },
      {
        title: "Marketing materials included",
        description:
          "Product sheets, shelf talkers, and digital assets available to help your retail accounts merchandise effectively.",
      },
      {
        title: "Flexible order quantities",
        description:
          "Order by the case or by the pallet. We work with distributors at various volume levels.",
      },
      {
        title: "Consistent product supply",
        description:
          "We maintain inventory buffers for distributor accounts to ensure you can fulfill your retail customers reliably.",
      },
      {
        title: "Private label available",
        description:
          "High-volume distributors can explore private label options. See our private label page for details.",
      },
    ],
    idealFor: [
      "Regional pet food distributors",
      "Pet product brokers and sales agencies",
      "Multi-location pet store chains",
      "Online wholesale marketplaces",
      "Subscription box companies",
      "Pet specialty buying groups",
    ],
    processSteps: [
      {
        step: "1",
        title: "Apply for distributor account",
        description:
          "Submit your business details through our wholesale application. Select Distributor as your business type.",
      },
      {
        step: "2",
        title: "Account review and pricing discussion",
        description:
          "Our team reviews your application and reaches out to discuss your volume, territory, and pricing structure.",
      },
      {
        step: "3",
        title: "Sample and onboarding",
        description:
          "We send samples of all SKUs and provide product materials to help you present to your retail accounts.",
      },
      {
        step: "4",
        title: "First order and portal access",
        description:
          "Place your first order through the wholesale portal. Your account is set up with distributor pricing and terms.",
      },
    ],
    faqs: [
      {
        question: "What volume is required to qualify for distributor pricing?",
        answer:
          "Distributor pricing is available for accounts ordering $5,000+ per month or 50+ cases per order. We are flexible for growing distributors — contact us to discuss your situation.",
      },
      {
        question: "Do you offer exclusive territory rights for distributors?",
        answer:
          "We do not offer exclusive territory rights at this time, but we work collaboratively with distributors to avoid direct conflicts in their core markets.",
      },
      {
        question: "Can distributors get private label yak chews?",
        answer:
          "Yes. Private label is available for high-volume distributors. Visit our private label page or contact us to discuss requirements.",
      },
      {
        question: "What payment terms are available for distributors?",
        answer:
          "Established distributor accounts can access net-30 payment terms. New accounts typically start with ACH or credit card. Terms are discussed during account setup.",
      },
      {
        question: "Do you provide marketing support for distributors?",
        answer:
          "Yes. We provide product sheets, shelf talkers, and digital assets. We can also co-develop materials for your specific retail accounts.",
      },
    ],
    cta: {
      primary: { label: "Apply for distributor account", href: "/apply" },
      secondary: { label: "View bulk pricing options", href: "/bulk-yak-cheese-dog-chews" },
    },
    relatedLinks: [
      { label: "Bulk Yak Cheese Dog Chews", href: "/bulk-yak-cheese-dog-chews" },
      { label: "Private Label Yak Chews", href: "/private-label-yak-chews" },
      { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
  },
  {
    slug: "private-label-yak-chews",
    category: "distributor",
    seoTitle: "Private Label Yak Cheese Dog Chews | Custom Branding for Retailers",
    metaDescription:
      "Private label Himalayan yak cheese dog chews for pet brands, distributors, and retailers. Custom packaging, your brand, our quality. Request a quote today.",
    h1: "Private Label Yak Cheese Dog Chews — Your Brand, Our Quality",
    subtitle:
      "Launch your own branded yak cheese dog chews with Prime Pet Food private label manufacturing and fulfillment.",
    intro:
      "Want to sell yak cheese dog chews under your own brand? Prime Pet Food offers private label programs for pet brands, distributors, online retailers, and subscription box companies that want to build brand equity in the natural chew category. We handle sourcing, quality control, and packaging — you focus on selling your brand.",
    programFeatures: [
      {
        title: "Custom packaging and branding",
        description:
          "Your logo, your brand colors, your product name. We produce packaging to your specifications.",
      },
      {
        title: "All sizes available",
        description:
          "Private label available for small, medium, large, and XL yak chews. Mix sizes to build a complete product line.",
      },
      {
        title: "Quality control included",
        description:
          "Every private label batch goes through the same quality checks as our Prime Pet Food branded products.",
      },
      {
        title: "UPC and barcode support",
        description:
          "We can include your UPC codes on packaging for retail-ready private label products.",
      },
      {
        title: "Minimum order quantities",
        description:
          "Private label programs have minimum order requirements. Contact us to discuss your volume and timeline.",
      },
      {
        title: "Competitive private label pricing",
        description:
          "Private label pricing is structured to give you strong margin when selling under your brand.",
      },
    ],
    idealFor: [
      "Pet brands looking to expand into natural chews",
      "Online pet retailers building private label lines",
      "Subscription box companies",
      "Regional distributors building house brands",
      "Pet store chains wanting exclusive products",
      "Pet influencers and content creators launching product lines",
    ],
    processSteps: [
      {
        step: "1",
        title: "Request a private label quote",
        description:
          "Contact us with your volume requirements, size preferences, and branding vision. We will provide a detailed quote.",
      },
      {
        step: "2",
        title: "Packaging design and approval",
        description:
          "Work with our team to finalize packaging design. We provide templates and review your artwork.",
      },
      {
        step: "3",
        title: "Sample production",
        description:
          "We produce a sample run with your packaging for approval before full production.",
      },
      {
        step: "4",
        title: "Production and fulfillment",
        description:
          "Full production run completed and shipped to your warehouse or drop-shipped to your customers.",
      },
    ],
    faqs: [
      {
        question: "What is the minimum order for private label yak chews?",
        answer:
          "Minimum order quantities for private label vary by size and packaging configuration. Contact us to discuss your specific requirements and we will provide a custom quote.",
      },
      {
        question: "How long does private label production take?",
        answer:
          "Typical private label lead time is 4–8 weeks from artwork approval to delivery. Rush options may be available for established accounts.",
      },
      {
        question: "Can I get samples before committing to a private label order?",
        answer:
          "Yes. We strongly recommend sampling our standard products before committing to a private label program. Contact us to arrange samples.",
      },
      {
        question: "Do you handle the packaging design or do I need to provide artwork?",
        answer:
          "We provide packaging templates and can work with your designer or ours. Final artwork approval is required before production.",
      },
      {
        question: "Can I private label just one size or do I need a full line?",
        answer:
          "You can start with a single size. Many private label customers start with their best-selling size and expand from there.",
      },
    ],
    cta: {
      primary: { label: "Request private label quote", href: "/apply" },
      secondary: { label: "View distributor program", href: "/distributor-program" },
    },
    relatedLinks: [
      { label: "Distributor Program", href: "/distributor-program" },
      { label: "Bulk Yak Cheese Dog Chews", href: "/bulk-yak-cheese-dog-chews" },
      { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
  },
];
