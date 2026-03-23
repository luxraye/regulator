export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-bocra-navy mb-6">About BOCRA</h1>
      <div className="prose max-w-none space-y-4 text-gray-700 leading-relaxed">
        <p>
          Botswana Communications Regulatory Authority (BOCRA) was established through the
          Communications Regulatory Authority Act, 2012 (CRA Act) on the 1st of April 2013 to
          regulate the communications sector in Botswana.
        </p>
        <p>
          BOCRA oversees telecommunications, Internet and Information and Communications
          Technologies (ICTs), radio communications, broadcasting, postal services and related
          matters.
        </p>
        <h2 className="text-xl font-semibold text-bocra-navy mt-8">Our Mandate</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Regulate telecommunications, broadcasting, and postal services</li>
          <li>Manage the radio frequency spectrum</li>
          <li>Administer the .bw country code top-level domain</li>
          <li>Type-approve communications equipment</li>
          <li>Protect consumers of communications services</li>
          <li>Promote competition in the communications sector</li>
        </ul>
        <h2 className="text-xl font-semibold text-bocra-navy mt-8">Digital Transformation</h2>
        <p>
          This platform represents BOCRA&apos;s commitment to digital transformation. Through our
          innovative &ldquo;Instances&rdquo; system, we enable secure, transparent, and automated
          regulatory compliance that replaces traditional manual reporting with tamper-proof
          digital processes.
        </p>
      </div>
    </div>
  );
}
