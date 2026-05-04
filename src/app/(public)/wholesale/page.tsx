import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Wholesale Program | Prime Pet Food",
  description:
    "Wholesale Himalayan Yak Cheese chews for pet stores, groomers, daycare, vet clinics, boutiques, and distributors.",
};

const buyerTypes = [
  "Independent pet stores",
  "Groomers and salons",
  "Dog daycare and boarding",
  "Veterinary clinics",
  "Boutique pet shops",
  "Regional distributors",
];

const economics = [
  ["Protected pricing", "Wholesale pricing is visible only after approval so retail partners can preserve margin."],
  ["Case-pack ordering", "Each SKU shows MOQ and case-pack rules before you submit an order request."],
  ["Invoice workflow", "Submit the order online; our team confirms availability and follows up with invoice details."],
  ["Reorder speed", "Approved buyers can reorder from order history and keep fast-moving chews in stock."],
];

export default function WholesalePage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <Link href="/" className="text-sm font-semibold text-[#1d4b43]">
            Prime Pet Food
          </Link>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Wholesale yak cheese chews for retailers that need margin, clarity, and fast reorders.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b5563] sm:text-lg">
            Prime Pet Food gives approved B2B buyers a protected wholesale catalog with case-pack rules,
            MSRP guidance, invoice-based ordering, and a portal designed for repeat replenishment.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163d36]"
            >
              Apply for wholesale pricing
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#fcfbf9]"
            >
              Preview catalog
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e4dc] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Image
              src="/logoedited.jpg"
              alt="Prime Pet Food logo"
              width={88}
              height={88}
              className="h-20 w-20 object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                Wholesale access includes
              </p>
              <p className="mt-1 text-lg font-semibold text-[#111827]">Pricing, MOQ, case packs, invoices, and reorders</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Review time", "Usually 1 business day"],
              ["Payment", "Invoice / ACH preferred"],
              ["Catalog", "Pricing gated by approval"],
              ["Ordering", "Case-pack aware cart"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <dt className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-[#111827]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-y border-[#e7e4dc] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Who this is for</h2>
            <p className="mt-3 text-sm leading-6 text-[#4b5563]">
              The program is built for businesses buying inventory for resale or customer-facing service counters.
            </p>
          </div>
          <ul className="grid gap-2 text-sm text-[#374151] sm:grid-cols-2 lg:col-span-2">
            {buyerTypes.map((type) => (
              <li key={type} className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] px-3 py-2 font-medium">
                {type}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {economics.map(([title, description]) => (
            <article key={title} className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1d4b43]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#4b5563]">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#1d4b43]/20 bg-[#eef6f3] p-6">
          <h2 className="text-xl font-semibold">How ordering works</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ["1", "Apply with business details"],
              ["2", "Get approved for gated pricing"],
              ["3", "Build a case-pack order"],
              ["4", "Receive invoice and fulfillment updates"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-xl bg-white p-4">
                <p className="text-xs font-bold text-[#1d4b43]">Step {step}</p>
                <p className="mt-2 text-sm font-medium text-[#111827]">{label}</p>
              </div>
            ))}
          </div>
          <Link
            href="/apply"
            className="mt-6 inline-flex rounded-xl bg-[#1d4b43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163d36]"
          >
            Start wholesale application
          </Link>
        </div>
      </section>
    </main>
  );
}
