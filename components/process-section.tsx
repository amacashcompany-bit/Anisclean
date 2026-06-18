const steps = [
  {
    num: "01",
    title: "Votre demande",
    desc: "Vous nous décrivez votre besoin via le devis en ligne, par téléphone ou WhatsApp.",
  },
  {
    num: "02",
    title: "Le rendez-vous",
    desc: "Nous convenons d'un créneau qui vous arrange et fixons les détails de la prestation.",
  },
  {
    num: "03",
    title: "C'est propre",
    desc: "Nous intervenons avec soin. Pour le domicile, vous profitez du crédit d'impôt de 50 %.",
  },
]

export function ProcessSection() {
  return (
    <section id="process" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            Simple et rapide
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Comment ça se passe
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="relative rounded-2xl border border-border bg-card p-8">
              <span className="text-5xl font-extrabold text-accent/20">{step.num}</span>
              <h3 className="mt-4 text-xl font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
