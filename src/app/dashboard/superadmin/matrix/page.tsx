export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

const scaleLabels: Record<string, string> = {
  SCALE_1: "1 - Major Telecom",
  SCALE_2: "2 - Large Operator",
  SCALE_3: "3 - Medium ISP/Broadcaster",
  SCALE_4: "4 - Small VANS/Courier",
  SCALE_5: "5 - Micro Operator",
  SCALE_6: "6 - Community/Rural",
};

const typeLabels: Record<string, { short: string; full: string }> = {
  TYPE_A: { short: "A", full: "Financial (Mobile Money, Revenue)" },
  TYPE_B: { short: "B", full: "Technical (Spectrum, QoS)" },
  TYPE_C: { short: "C", full: "Public Service (Complaints, Coverage)" },
  TYPE_D: { short: "D", full: "Infrastructure (Towers, Fibre, Sites)" },
  TYPE_E: { short: "E", full: "Security (Cybersecurity, Data Protection)" },
  TYPE_F: { short: "F", full: "Governance (Licensing, HR, Training)" },
};

const SCALES = ["SCALE_1", "SCALE_2", "SCALE_3", "SCALE_4", "SCALE_5", "SCALE_6"];
const TYPES = ["TYPE_A", "TYPE_B", "TYPE_C", "TYPE_D", "TYPE_E", "TYPE_F"];

export default async function MatrixPage() {
  const templates = await prisma.template.findMany({
    orderBy: [{ dataType: "asc" }, { scale: "asc" }],
  });

  const matrix: Record<string, Record<string, typeof templates[0] | null>> = {};
  for (const dt of TYPES) {
    matrix[dt] = {};
    for (const sc of SCALES) {
      matrix[dt][sc] = templates.find((t) => t.dataType === dt && t.scale === sc) || null;
    }
  }

  const totalSlots = TYPES.length * SCALES.length;
  const filledSlots = templates.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Classification Matrix</h1>
        <p className="text-muted-foreground mt-1">
          {TYPES.length} data types &times; {SCALES.length} operator scales = {totalSlots} compliance contexts
          <span className="ml-2 text-bocra-blue font-medium">({filledSlots} templates defined)</span>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium text-muted-foreground text-left min-w-[200px]">
                Data Type / Scale
              </th>
              {SCALES.map((sc) => (
                <th key={sc} className="px-3 py-3 font-medium text-muted-foreground text-center min-w-[120px]">
                  <div className="text-xs">{scaleLabels[sc]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TYPES.map((dt) => (
              <tr key={dt} className="hover:bg-bocra-light/50">
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-bocra-blue mr-2">{typeLabels[dt].short}</span>
                  <span className="text-sm">{typeLabels[dt].full}</span>
                </td>
                {SCALES.map((sc) => {
                  const tmpl = matrix[dt][sc];
                  return (
                    <td key={sc} className="px-3 py-3 text-center">
                      {tmpl ? (
                        <div className="bg-bocra-blue/5 rounded-lg p-2">
                          <span className="font-mono font-bold text-bocra-blue text-sm">{tmpl.code}</span>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{tmpl.name}</p>
                        </div>
                      ) : (
                        <div className="text-muted-foreground/40 text-xs py-2">
                          {typeLabels[dt].short}{sc.replace("SCALE_", "")}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">Scale Guide</p>
          <ul className="space-y-1 text-xs">
            <li><strong>1</strong> &ndash; Major telecoms (Mascom, Orange, BTC)</li>
            <li><strong>2</strong> &ndash; Large operators (national ISPs, broadcasters)</li>
            <li><strong>3</strong> &ndash; Medium operators (regional ISPs, Yarona/Duma FM)</li>
            <li><strong>4</strong> &ndash; Small VANS, courier services</li>
            <li><strong>5</strong> &ndash; Micro operators, niche service providers</li>
            <li><strong>6</strong> &ndash; Community, rural, or emerging operators</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">Data Type Guide</p>
          <ul className="space-y-1 text-xs">
            <li><strong>A</strong> &ndash; Financial: mobile money, revenue, transactions</li>
            <li><strong>B</strong> &ndash; Technical: spectrum usage, QoS, network performance</li>
            <li><strong>C</strong> &ndash; Public Service: complaints, coverage, consumer metrics</li>
            <li><strong>D</strong> &ndash; Infrastructure: tower sites, fibre routes, equipment</li>
            <li><strong>E</strong> &ndash; Security: cybersecurity posture, data protection, incidents</li>
            <li><strong>F</strong> &ndash; Governance: licensing compliance, HR, training, audits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
