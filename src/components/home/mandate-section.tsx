"use client";

import { useState } from "react";
import { Phone, Radio, Mail, Globe, ArrowRight } from "lucide-react";

const mandateTabs = [
  {
    id: "telecoms",
    label: "Telecommunications",
    icon: <Phone className="w-4 h-4" />,
    description:
      "BOCRA regulates all telecommunications services including mobile, fixed-line, and internet service providers in Botswana.",
    items: [
      { title: "Type Approval", desc: "Equipment certification for telecoms devices", url: "https://typeapproval.bocra.org.bw/" },
      { title: "Radio Spectrum Planning", desc: "Allocation and management of the radio frequency spectrum" },
      { title: "The Numbering Plan", desc: "National telecommunications numbering administration" },
      { title: "National Radio Frequency Plan", desc: "Botswana Radio Frequency Band Plan under Section 47 of the CRA Act" },
    ],
  },
  {
    id: "broadcasting",
    label: "Broadcasting",
    icon: <Radio className="w-4 h-4" />,
    description:
      "BOCRA regulates all broadcasting, subscription management services and re-broadcasting activities including Yarona FM, Duma FM, Gabz FM, and eBotswana.",
    items: [
      { title: "Broadcasting Licences", desc: "Commercial radio and television station licensing" },
      { title: "Local Content", desc: "Broadcasters must promote local artists and content" },
      { title: "National Broadcasting Survey", desc: "Audience survey data for the broadcasting sector" },
    ],
  },
  {
    id: "postal",
    label: "Postal Services",
    icon: <Mail className="w-4 h-4" />,
    description:
      "BOCRA supervises the provision of postal services in Botswana. The CRA Act prohibits any person to provide postal services without a valid licence.",
    items: [
      { title: "Postal Sector Framework", desc: "Licensing framework guiding postal service provision" },
      { title: "Courier Services", desc: "Regulation of domestic and international courier operators" },
      { title: "Quality of Service", desc: "Monitoring postal delivery standards and reliability" },
    ],
  },
  {
    id: "internet",
    label: "Internet & ICT",
    icon: <Globe className="w-4 h-4" />,
    description:
      "BOCRA manages Botswana's internet infrastructure including the .bw country code domain, cybersecurity, and electronic communications.",
    items: [
      { title: ".bw ccTLD", desc: "Administration of Botswana's country code top-level domain", url: "https://nic.net.bw/" },
      { title: "bw CIRT", desc: "National Cybersecurity Incident Response Team" },
      { title: "Electronic Evidence", desc: "Admissibility of electronic records under the law" },
      { title: "Electronic Transactions", desc: "Regulation under the Electronic Communications and Transaction Act" },
    ],
  },
];

function getActiveTabClasses(tabId: string) {
  if (tabId === "telecoms") return "bg-bocra-blue text-white shadow-md";
  if (tabId === "broadcasting") return "bg-bocra-green text-white shadow-md";
  if (tabId === "postal") return "bg-bocra-amber text-bocra-navy shadow-md";
  return "bg-bocra-orange text-bocra-navy shadow-md";
}

function getIconBgClasses(tabId: string) {
  if (tabId === "telecoms") return "bg-bocra-blue text-white";
  if (tabId === "broadcasting") return "bg-bocra-green text-white";
  if (tabId === "postal") return "bg-bocra-amber text-bocra-navy";
  return "bg-bocra-orange text-bocra-navy";
}

export function MandateSection() {
  const [activeTab, setActiveTab] = useState("telecoms");
  const active = mandateTabs.find((t) => t.id === activeTab)!;

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-bocra-navy mb-4">
            Our Regulatory Mandate
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            BOCRA is the converged regulator for four key sectors of Botswana&apos;s
            communications industry.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {mandateTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? getActiveTabClasses(tab.id)
                  : "bg-bocra-light text-bocra-navy hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm" key={active.id}>
          <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl ${getIconBgClasses(active.id)} flex items-center justify-center shrink-0`}>
                {active.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-bocra-navy">{active.label}</h3>
                <p className="text-muted-foreground mt-1 leading-relaxed">{active.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {active.items.map((item) => {
                const inner = (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-bocra-light hover:bg-gray-100 transition-colors group">
                    <div className="w-2 h-2 rounded-full bg-bocra-blue mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-bocra-navy group-hover:text-bocra-blue transition-colors">
                        {item.title}
                        {item.url && <ArrowRight className="inline w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
                if (item.url) {
                  return (
                    <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer">
                      {inner}
                    </a>
                  );
                }
                return <div key={item.title}>{inner}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
