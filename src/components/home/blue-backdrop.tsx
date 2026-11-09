/** A quiet backdrop for the blue sections: a deep gradient with two soft glows and a faint top highlight. */
export function BlueBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d5394] via-[#0b4a86] to-[#08386a]" />
      <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-[#2f8cf0]/25 blur-3xl" />
      <div className="absolute -bottom-48 right-[-10%] h-[560px] w-[560px] rounded-full bg-ceda-amber/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}
