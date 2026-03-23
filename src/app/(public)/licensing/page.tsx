import { FileText, Radio, Phone, Mail, Globe, Wifi } from "lucide-react";

const licenseTypes = [
  { icon: <Phone className="w-6 h-6" />, name: "Cellular Licence", description: "Mobile telecommunications network operation" },
  { icon: <Radio className="w-6 h-6" />, name: "Broadcasting Licence", description: "Radio and television broadcasting services" },
  { icon: <Mail className="w-6 h-6" />, name: "Postal Services Licence", description: "Postal and courier service provision" },
  { icon: <Globe className="w-6 h-6" />, name: "VANS Licence", description: "Value-Added Network Services" },
  { icon: <Wifi className="w-6 h-6" />, name: "Radio Frequency Licence", description: "Radio spectrum allocation and usage" },
  { icon: <FileText className="w-6 h-6" />, name: "Type Approval Licence", description: "Communications equipment certification" },
];

export default function LicensingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-bocra-navy mb-4">Licensing</h1>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        BOCRA issues various licences for the provision of communications services in Botswana.
        All operators must hold a valid licence issued by BOCRA.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {licenseTypes.map((lt) => (
          <div
            key={lt.name}
            className="flex items-start gap-4 p-5 bg-white rounded-xl border border-border hover:shadow-sm transition-shadow"
          >
            <div className="text-bocra-blue mt-0.5">{lt.icon}</div>
            <div>
              <h3 className="font-semibold text-bocra-navy">{lt.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{lt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
