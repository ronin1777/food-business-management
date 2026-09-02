type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={[
        "rounded-lg border bg-card shadow-sm",
        className,
      ].join(" ")}
    >
      <div className="border-b px-5 py-4">
        <h2 className="text-sm font-semibold">
          {title}
        </h2>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}