import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    q: "Comment fonctionne le crédit d'impôt de 50 % ?",
    a: "Pour le ménage à votre domicile, vous bénéficiez d'un crédit d'impôt égal à 50 % des sommes versées (plafond de 12 000 € par an et par foyer). Concrètement, une heure facturée 30 € ne vous coûte réellement que 15 €. Roudjine Clean travaille via la coopérative Accès SAP, déclarée services à la personne, ce qui vous ouvre ce droit.",
  },
  {
    q: "Qu'est-ce que l'avance immédiate ?",
    a: "L'avance immédiate vous permet de ne payer que la moitié de la prestation dès le départ, sans attendre votre déclaration d'impôts. Le crédit d'impôt est déduit directement, vous n'avancez donc que votre reste à charge réel.",
  },
  {
    q: "Le crédit d'impôt s'applique-t-il au nettoyage de bureaux ?",
    a: "Non. Le crédit d'impôt de 50 % concerne uniquement les prestations réalisées au domicile des particuliers. Pour le nettoyage de bureaux, commerces et locaux professionnels, nous établissons un devis adapté sans crédit d'impôt.",
  },
  {
    q: "Dans quelles communes intervenez-vous ?",
    a: "Nous intervenons à Nîmes et dans tout le Gard rhodanien : Caissargues, Bouillargues, Rodilhan, Marguerittes, Garons, Milhaud, Saint-Gilles, Vauvert et les communes voisines. Contactez-nous pour vérifier votre secteur.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            FAQ
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Tout savoir avant de commencer
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-pretty leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
