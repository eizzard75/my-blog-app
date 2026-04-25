const stats = [
  { value: "10,000+", label: "Content Creators" },
  { value: "500K+", label: "Blog Posts Generated" },
  { value: "10x", label: "Faster Than Manual Writing" },
  { value: "4.9/5", label: "Average User Rating" },
];

export function Stats() {
  return (
    <section className="border-y bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold tracking-tight sm:text-4xl">
                {value}
              </div>
              <p className="mt-1 text-sm text-primary-foreground/70">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
