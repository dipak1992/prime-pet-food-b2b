interface ComparisonRow {
  attribute: string;
  yakChews: string;
  competitor: string;
  winner: "yak" | "competitor" | "tie";
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
  yakLabel?: string;
  competitorLabel: string;
}

export default function ComparisonTable({
  rows,
  yakLabel = "Yak Cheese Chews",
  competitorLabel,
}: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e7e4dc]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e7e4dc] bg-[#f7f7fb]">
            <th className="px-4 py-3 text-left font-semibold text-[#374151]">Feature</th>
            <th className="px-4 py-3 text-left font-semibold text-[#1d4b43]">{yakLabel}</th>
            <th className="px-4 py-3 text-left font-semibold text-[#374151]">{competitorLabel}</th>
            <th className="px-4 py-3 text-center font-semibold text-[#374151]">Winner</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e7e4dc] bg-white">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-[#f7f7fb]">
              <td className="px-4 py-3 font-medium text-[#111827]">{row.attribute}</td>
              <td className="px-4 py-3 text-[#374151]">{row.yakChews}</td>
              <td className="px-4 py-3 text-[#374151]">{row.competitor}</td>
              <td className="px-4 py-3 text-center">
                {row.winner === "yak" ? (
                  <span className="inline-flex items-center rounded-full bg-[#fff7ed] px-2 py-0.5 text-xs font-semibold text-[#1d4b43]">
                    Yak Chews ✓
                  </span>
                ) : row.winner === "competitor" ? (
                  <span className="inline-flex items-center rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-semibold text-[#374151]">
                    {competitorLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[#fef9c3] px-2 py-0.5 text-xs font-semibold text-[#854d0e]">
                    Tie
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
