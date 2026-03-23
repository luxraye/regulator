import Link from "next/link";
import { ExternalLink, MapPin, Phone, Mail, Clock } from "lucide-react";

const socialLinks = [
  { label: "Facebook", url: "https://www.facebook.com/ABORACRA/" },
  { label: "Twitter / X", url: "https://twitter.com/ABORACRA" },
  { label: "LinkedIn", url: "https://www.linkedin.com/company/bocra" },
  { label: "YouTube", url: "https://www.youtube.com/@bocra" },
];

export function Footer() {
  return (
    <footer className="bg-bocra-navy text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand + About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-bocra-blue" />
                <span className="w-2.5 h-2.5 rounded-full bg-bocra-green" />
                <span className="w-2.5 h-2.5 rounded-full bg-bocra-amber" />
                <span className="w-2.5 h-2.5 rounded-full bg-bocra-orange" />
              </div>
              <span className="font-bold text-white">BOCRA</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Botswana Communications Regulatory Authority. Regulating
              telecommunications, broadcasting, postal and internet services in
              the public interest.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/50 hover:text-white transition-colors"
                  title={s.label}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About BOCRA</Link></li>
              <li><Link href="/licensing" className="hover:text-white transition-colors">Licensing</Link></li>
              <li><Link href="/publications" className="hover:text-white transition-colors">Publications</Link></li>
              <li><Link href="/complaints" className="hover:text-white transition-colors">File a Complaint</Link></li>
              <li><Link href="/legacy" className="hover:text-white transition-colors">Legacy Services</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.bocra.org.bw/tariffs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Tariffs <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a href="https://www.bocra.org.bw/faqs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  FAQs <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a href="https://www.bocra.org.bw/privacy-notice" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Privacy Notice <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a href="https://staffmail.bocra.org.bw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  BOCRA Staff Mail <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a href="https://www.bocra.org.bw/annual-reports" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Annual Reports <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-bocra-amber" />
                <span>Plot 50671, Independence Avenue<br />Gaborone, Botswana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-bocra-green" />
                <a href="tel:+2673957755" className="hover:text-white transition-colors">+267 395 7755</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-bocra-blue" />
                <a href="mailto:info@bocra.org.bw" className="hover:text-white transition-colors">info@bocra.org.bw</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-bocra-orange" />
                <span>Mon&ndash;Fri: 07:30&ndash;16:30</span>
              </li>
            </ul>
            {/* Map placeholder */}
            <div className="mt-4 rounded-lg overflow-hidden border border-white/10 h-28 bg-white/5 flex items-center justify-center text-xs text-white/30">
              <a
                href="https://maps.google.com/?q=-24.6546,25.9258"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors flex flex-col items-center gap-1"
              >
                <MapPin className="w-5 h-5" />
                View on Google Maps
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Botswana Communications Regulatory Authority. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <a href="https://www.bocra.org.bw/privacy-notice" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Privacy</a>
            <a href="https://www.bocra.org.bw/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Terms</a>
            <a href="https://www.bocra.org.bw/faqs" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">FAQs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
