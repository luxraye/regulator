"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, FileSearch, BarChart3, Users } from "lucide-react";

const services = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Licensing",
    description: "Apply for and manage telecommunications, broadcasting, and postal licenses.",
    href: "/licensing",
    image: "/images/service-licensing.jpg",
  },
  {
    icon: <FileSearch className="w-8 h-8" />,
    title: "Compliance",
    description: "Submit regulatory compliance data through secure digital Instances.",
    href: "/login",
    image: "/images/service-compliance.jpg",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Publications",
    description: "Access regulatory publications, reports, and industry statistics.",
    href: "/publications",
    image: "/images/service-publications.jpg",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Consumer Protection",
    description: "File complaints and access consumer protection tools.",
    href: "/complaints",
    image: "/images/service-consumer.jpg",
  },
];

function ServiceImage({ src, alt }: { src: string; alt: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-32 object-cover bg-bocra-light"
      onError={() => setHidden(true)}
    />
  );
}

export function ServiceCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((service) => (
        <Link
          key={service.title}
          href={service.href}
          className="group rounded-xl border border-border bg-white hover:shadow-lg hover:border-bocra-blue/30 transition-all duration-200 overflow-hidden"
        >
          <ServiceImage src={service.image} alt={service.title} />
          <div className="p-5">
            <div className="text-bocra-blue mb-3 group-hover:scale-110 transition-transform inline-block">
              {service.icon}
            </div>
            <h3 className="font-semibold text-bocra-navy mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
