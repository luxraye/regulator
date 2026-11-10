export interface RegulatoryAuthority {
  acronym: string;
  name: string;
  mandate: string;
  website: string;
  phone: string;
  email?: string;
  physicalAddress: string;
  verified: boolean;
  verificationNotes?: string;
}

export const REGULATORY_AUTHORITIES: RegulatoryAuthority[] = [
  {
    acronym: "CIPA",
    name: "Companies and Intellectual Property Authority",
    mandate: "Company registration, business name registration, IP & patent protection, and copyright enforcement.",
    website: "https://www.cipa.co.bw",
    phone: "+267 367 3700",
    email: "info@cipa.co.bw",
    physicalAddress: "Plot 54358, Prime Plaza, CBD, Gaborone",
    verified: true,
  },
  {
    acronym: "BURS",
    name: "Botswana Unified Revenue Service",
    mandate: "Tax compliance, TIN issuance, VAT registration, customs clearance, and corporate tax assessments.",
    website: "https://www.burs.org.bw",
    phone: "+267 363 8000 / Toll-Free 17649",
    email: "feedback@burs.org.bw",
    physicalAddress: "Plot 53976, Kudumatse Drive, Gaborone",
    verified: true,
  },
  {
    acronym: "NBFIRA",
    name: "Non-Bank Financial Institutions Regulatory Authority",
    mandate: "Licensing and regulation of FinTech, micro-lending, asset management, and non-bank financial services.",
    website: "https://www.nbfira.org.bw",
    phone: "+267 310 2595",
    email: "info@nbfira.org.bw",
    physicalAddress: "Exponential Building, Plot 54351, CBD, Gaborone",
    verified: true,
  },
  {
    acronym: "BOCRA",
    name: "Botswana Communications Regulatory Authority",
    mandate: "Telecommunications, Internet service provision, spectrum licensing, and postal regulation.",
    website: "https://www.bocra.org.bw",
    phone: "+267 395 7755",
    email: "info@bocra.org.bw",
    physicalAddress: "Plot 50671, Independence Avenue, Gaborone",
    verified: true,
  },
  {
    acronym: "CCA",
    name: "Competition and Consumer Authority",
    mandate: "Prevention of anti-competitive trade practices, merger assessments, and consumer protection.",
    website: "https://www.cca.co.bw",
    phone: "+267 393 4278",
    email: "info@cca.co.bw",
    physicalAddress: "Plot 28, Matsitama Road, Main Mall, Gaborone",
    verified: true,
  },
  {
    acronym: "IDPC",
    name: "Information and Data Protection Commission",
    mandate: "Statutory oversight under Data Protection Act 2018: personal data privacy, data controller registration.",
    website: "https://www.gov.bw",
    phone: "+267 361 2000",
    email: "dataprotection@gov.bw",
    physicalAddress: "Government Enclave, Khama Crescent, Gaborone",
    verified: false,
    verificationNotes: "Partially verified: Government ministry portal operational; statutory independent commission web domain currently in gazetted launch transition.",
  },
  {
    acronym: "BOBS",
    name: "Botswana Bureau of Standards",
    mandate: "Product quality standards, metrology, technical testing, certification, and calibration.",
    website: "https://www.bobstandards.org.bw",
    phone: "+267 390 3200",
    email: "infodesk@bobstandards.org.bw",
    physicalAddress: "Plot 55745, Main Airport Road, Block 8, Gaborone",
    verified: true,
  },
  {
    acronym: "LEA",
    name: "Local Enterprise Authority",
    mandate: "Entrepreneurship development, business coaching, incubation facilities, and SME market access.",
    website: "https://www.lea.co.bw",
    phone: "+267 364 4000 / Toll-Free 0800 100 257",
    email: "botswanalea@lea.co.bw",
    physicalAddress: "Lot 61440, Fairgrounds Office Park, Block B, Gaborone",
    verified: true,
  },
];
