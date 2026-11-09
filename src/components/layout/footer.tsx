import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const partners = [
  { label: "CEDA", url: "https://www.ceda.co.bw/" },
  { label: "CIPA company registry", url: "https://www.cipa.co.bw/" },
  { label: "Local Enterprise Authority", url: "https://www.lea.co.bw/" },
  { label: "Botswana Innovation Hub", url: "https://www.bih.co.bw/" },
];

export function Footer() {
  return (
    <footer className="fold-top relative bg-ceda-navy text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tone="light" className="mb-4" />
            <p className="text-sm leading-relaxed">
              One place for young Batswana to submit ideas, be scored fairly, follow their application and get funded. Built for
              CEDA&apos;s youth innovation challenge.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Apply</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/calls" className="hover:text-white">Open calls</Link></li>
              <li><Link href="/eligibility" className="hover:text-white">Eligibility checker</Link></li>
              <li><Link href="/register" className="hover:text-white">Create an account</Link></li>
              <li><Link href="/track" className="hover:text-white">Track my idea</Link></li>
              <li><Link href="/ussd-demo" className="hover:text-white">USSD *161#</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">The programme</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/about#how-to-judge" className="hover:text-white">How to judge this portal</Link></li>
              <li><Link href="/about#judging" className="hover:text-white">How judging works</Link></li>
              <li><Link href="/about#integrity" className="hover:text-white">Fairness and integrity</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy notice</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Partners</h4>
            <ul className="space-y-2 text-sm">
              {partners.map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    {p.label} <ExternalLink size={11} className="opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/75 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} CEDA Innovation Portal · Citizen Entrepreneurial Development Agency</p>
          <p>Personal data handled under the Data Protection Act, 2024</p>
        </div>
      </div>
    </footer>
  );
}
