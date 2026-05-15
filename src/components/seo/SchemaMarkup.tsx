import { SITE_URL } from "@/lib/site-url";

interface OrganizationSchemaProps {
  type: "Organization";
}

interface ProductSchemaProps {
  type: "Product";
  name: string;
  description: string;
  brand?: string;
  url: string;
}

interface ArticleSchemaProps {
  type: "Article";
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}

interface WebPageSchemaProps {
  type: "WebPage";
  name: string;
  description: string;
  url: string;
}

type SchemaProps =
  | OrganizationSchemaProps
  | ProductSchemaProps
  | ArticleSchemaProps
  | WebPageSchemaProps;

const BASE_URL = SITE_URL;

function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Prime Pet Food",
    url: BASE_URL,
    logo: `${BASE_URL}/logoedited.jpg`,
    description:
      "Prime Pet Food supplies wholesale Himalayan yak cheese dog chews to pet stores, groomers, daycares, vet clinics, and distributors across the USA.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "wholesale sales",
      url: `${BASE_URL}/apply`,
    },
    sameAs: ["https://theprimepetfood.com"],
  };
}

function buildProductSchema(props: ProductSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: props.name,
    description: props.description,
    brand: {
      "@type": "Brand",
      name: props.brand ?? "Prime Pet Food",
    },
    url: props.url,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Prime Pet Food",
      },
    },
  };
}

function buildArticleSchema(props: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.headline,
    description: props.description,
    url: props.url,
    datePublished: props.datePublished ?? "2024-01-01",
    dateModified: props.dateModified ?? new Date().toISOString().split("T")[0],
    author: {
      "@type": "Organization",
      name: "Prime Pet Food",
    },
    publisher: {
      "@type": "Organization",
      name: "Prime Pet Food",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logoedited.jpg`,
      },
    },
  };
}

function buildWebPageSchema(props: WebPageSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: props.name,
    description: props.description,
    url: props.url,
    publisher: {
      "@type": "Organization",
      name: "Prime Pet Food",
    },
  };
}

export default function SchemaMarkup(props: SchemaProps) {
  let schema: object;

  switch (props.type) {
    case "Organization":
      schema = buildOrganizationSchema();
      break;
    case "Product":
      schema = buildProductSchema(props);
      break;
    case "Article":
      schema = buildArticleSchema(props);
      break;
    case "WebPage":
      schema = buildWebPageSchema(props);
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
