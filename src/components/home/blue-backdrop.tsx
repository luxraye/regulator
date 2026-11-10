/** A quiet backdrop for dark sections styled in CEDA ink and warm amber/orange glows. */
export function BlueBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#3a2a24] via-[#2d1f1a] to-[#201511]" />
      <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-ceda-orange/20 blur-3xl" />
      <div className="absolute -bottom-48 right-[-10%] h-[560px] w-[560px] rounded-full bg-ceda-amber/15 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
