import { SectionCard } from "@/components/ui/SectionCard";

const seedProducts = [
  { title: "Himalayan Yak Cheese Chew - Small", sku: "YAK-SM", wholesale: 6.5, msrp: 12.99, moq: 12, casePack: 12 },
  { title: "Himalayan Yak Cheese Chew - Medium", sku: "YAK-MD", wholesale: 8.25, msrp: 15.99, moq: 10, casePack: 10 },
  { title: "Himalayan Yak Cheese Chew - Large", sku: "YAK-LG", wholesale: 10.5, msrp: 19.99, moq: 8, casePack: 8 },
];

export default function ProductsPage() {
  return (
    <SectionCard title="Wholesale catalog" description="Case-pack aware ordering for approved buyers.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[#6b7280]">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">MOQ</th>
              <th className="px-3 py-2">Case pack</th>
              <th className="px-3 py-2">Wholesale</th>
              <th className="px-3 py-2">MSRP</th>
              <th className="px-3 py-2">Add</th>
            </tr>
          </thead>
          <tbody>
            {seedProducts.map((product) => (
              <tr key={product.sku} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9]">
                <td className="px-3 py-3 font-medium text-[#111827]">{product.title}</td>
                <td className="px-3 py-3 text-[#4b5563]">{product.sku}</td>
                <td className="px-3 py-3 text-[#4b5563]">{product.moq}</td>
                <td className="px-3 py-3 text-[#4b5563]">{product.casePack}</td>
                <td className="px-3 py-3 font-semibold text-[#111827]">${product.wholesale.toFixed(2)}</td>
                <td className="px-3 py-3 text-[#4b5563]">${product.msrp.toFixed(2)}</td>
                <td className="px-3 py-3">
                  <button className="rounded-lg bg-[#1d4b43] px-3 py-2 text-xs font-semibold text-white">Add case</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
