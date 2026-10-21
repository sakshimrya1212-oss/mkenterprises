export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-16 bg-gold-gradient" />
      <span className="text-gold text-xs">◆</span>
      <span className="h-px w-16 bg-gold-gradient" />
    </div>
  );
}

export function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-2xl md:text-3xl uppercase tracking-brand">{title}</h2>
      <Divider className="mt-3" />
      {sub && <p className="mt-3 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export const DISCLAIMER =
  "These statements have not been evaluated by FSSAI/AYUSH. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your doctor before use.";
