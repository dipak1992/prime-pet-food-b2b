export interface LeadMagnet {
  slug: string;
  category: "lead-magnet";
  seoTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  valueProposition: string;
  bulletPoints: string[];
  formFields: {
    name: string;
    label: string;
    type: "text" | "email" | "select" | "number";
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  thankYouHeading: string;
  thankYouBody: string;
  cta: { primary: { label: string; href: string }; secondary?: { label: string; href: string } };
  relatedLinks: { label: string; href: string }[];
}

export const leadMagnets: LeadMagnet[] = [
  {
    slug: "dog-treat-profit-calculator",
    category: "lead-magnet",
    seoTitle: "Dog Treat Profit Calculator for Pet Stores | Free Tool",
    metaDescription:
      "Calculate your gross margin on dog treats before you buy wholesale. Free pet store profit calculator — see exactly what yak chews earn per unit and per shelf foot.",
    h1: "Dog Treat Profit Calculator for Pet Stores",
    subtitle:
      "See your exact gross margin on yak cheese chews and other dog treats before you place a wholesale order.",
    valueProposition:
      "Stop guessing on margin. This free calculator shows you exactly how much profit you make per unit, per case, and per linear foot of shelf space — so you can make smarter wholesale buying decisions.",
    bulletPoints: [
      "Calculate gross margin percentage on any dog treat",
      "Compare margin across multiple products side by side",
      "See profit per linear foot of shelf space",
      "Estimate monthly profit based on your sell-through rate",
      "Understand how wholesale cost tiers affect your bottom line",
    ],
    formFields: [
      {
        name: "email",
        label: "Business email",
        type: "email",
        required: true,
        placeholder: "you@yourpetstore.com",
      },
      {
        name: "businessName",
        label: "Business name",
        type: "text",
        required: true,
        placeholder: "Your Pet Store",
      },
      {
        name: "businessType",
        label: "Business type",
        type: "select",
        required: true,
        options: [
          "Independent pet store",
          "Groomer / salon",
          "Dog daycare / boarding",
          "Veterinary clinic",
          "Boutique pet shop",
          "Distributor",
          "Other",
        ],
      },
    ],
    thankYouHeading: "Your profit calculator is ready",
    thankYouBody:
      "Use the calculator below to see your exact margin on yak cheese chews and other dog treats. When you are ready to order, apply for a wholesale account to get protected pricing.",
    cta: {
      primary: { label: "Apply for wholesale pricing", href: "/apply" },
      secondary: { label: "View wholesale yak chews", href: "/wholesale-yak-cheese-dog-chews" },
    },
    relatedLinks: [
      { label: "Best High-Margin Dog Treats for Pet Stores", href: "/best-high-margin-dog-treats-for-pet-stores" },
      { label: "Wholesale Dog Chews for Pet Stores", href: "/wholesale-dog-chews-for-pet-stores" },
      { label: "Yak Chews vs Rawhide for Retailers", href: "/yak-chews-vs-rawhide-for-retailers" },
      { label: "Apply for Wholesale Account", href: "/apply" },
    ],
  },
];

// Calculator logic used on the profit calculator page
export interface CalculatorInputs {
  wholesaleCostPerUnit: number;
  retailPricePerUnit: number;
  unitsPerCase: number;
  unitsSoldPerMonth: number;
  shelfFeetUsed: number;
}

export interface CalculatorResults {
  grossMarginPercent: number;
  grossProfitPerUnit: number;
  grossProfitPerCase: number;
  monthlyGrossProfit: number;
  profitPerShelfFoot: number;
  annualGrossProfit: number;
}

export function calculateProfit(inputs: CalculatorInputs): CalculatorResults {
  const grossProfitPerUnit = inputs.retailPricePerUnit - inputs.wholesaleCostPerUnit;
  const grossMarginPercent =
    inputs.retailPricePerUnit > 0
      ? (grossProfitPerUnit / inputs.retailPricePerUnit) * 100
      : 0;
  const grossProfitPerCase = grossProfitPerUnit * inputs.unitsPerCase;
  const monthlyGrossProfit = grossProfitPerUnit * inputs.unitsSoldPerMonth;
  const profitPerShelfFoot =
    inputs.shelfFeetUsed > 0 ? monthlyGrossProfit / inputs.shelfFeetUsed : 0;
  const annualGrossProfit = monthlyGrossProfit * 12;

  return {
    grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    grossProfitPerUnit: Math.round(grossProfitPerUnit * 100) / 100,
    grossProfitPerCase: Math.round(grossProfitPerCase * 100) / 100,
    monthlyGrossProfit: Math.round(monthlyGrossProfit * 100) / 100,
    profitPerShelfFoot: Math.round(profitPerShelfFoot * 100) / 100,
    annualGrossProfit: Math.round(annualGrossProfit * 100) / 100,
  };
}

// Preset products for the calculator
export const calculatorPresets = [
  {
    label: "Yak Chew — Small",
    wholesaleCostPerUnit: 4.5,
    retailPricePerUnit: 9.99,
    unitsPerCase: 24,
  },
  {
    label: "Yak Chew — Medium",
    wholesaleCostPerUnit: 6.5,
    retailPricePerUnit: 14.99,
    unitsPerCase: 18,
  },
  {
    label: "Yak Chew — Large",
    wholesaleCostPerUnit: 9.0,
    retailPricePerUnit: 19.99,
    unitsPerCase: 12,
  },
  {
    label: "Yak Chew — XL",
    wholesaleCostPerUnit: 12.0,
    retailPricePerUnit: 24.99,
    unitsPerCase: 8,
  },
  {
    label: "Bully Stick (6-inch)",
    wholesaleCostPerUnit: 3.5,
    retailPricePerUnit: 7.99,
    unitsPerCase: 50,
  },
  {
    label: "Rawhide Roll",
    wholesaleCostPerUnit: 1.5,
    retailPricePerUnit: 4.99,
    unitsPerCase: 100,
  },
];
