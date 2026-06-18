import { Brush, Hammer, Wind, Sofa, Building2, Bug, type LucideIcon } from "lucide-react"

export interface ServicePackage {
  id: string
  label: string // universal label (e.g. "Studio / T1", "T2")
  price: number
}

export interface ServiceDef {
  id: string
  icon: LucideIcon
  nameKey: string
  descKey: string
  /** hourly option, if the service can be billed per hour */
  hourly?: {
    rate: number
    allowMaterial?: boolean
    labelKey: string
  }
  /** fixed-price packages, if any */
  packages?: ServicePackage[]
  packagesTitleKey?: string
  /** lowest displayed "from" price for the landing card */
  fromLabel: string
  /** whether the service is eligible for the 50% home-service tax credit */
  taxEligible: boolean
}

export const MATERIAL_SURCHARGE = 5

export const services: ServiceDef[] = [
  {
    id: "menage",
    icon: Brush,
    nameKey: "svc.menage.name",
    descKey: "svc.menage.desc",
    hourly: { rate: 30, allowMaterial: true, labelKey: "lbl.regular" },
    packagesTitleKey: "lbl.springTitle",
    packages: [
      { id: "menage-t1", label: "Studio / T1", price: 150 },
      { id: "menage-t2", label: "T2", price: 220 },
      { id: "menage-t3", label: "T3", price: 290 },
      { id: "menage-t4", label: "T4", price: 360 },
    ],
    fromLabel: "30 €/h",
    taxEligible: true,
  },
  {
    id: "remise",
    icon: Hammer,
    nameKey: "svc.remise.name",
    descKey: "svc.remise.desc",
    packagesTitleKey: "lbl.restoreTitle",
    packages: [
      { id: "remise-t1", label: "Studio / T1", price: 250 },
      { id: "remise-t2", label: "T2", price: 350 },
      { id: "remise-t3", label: "T3", price: 450 },
      { id: "remise-t4", label: "T4", price: 540 },
    ],
    fromLabel: "250 €",
    taxEligible: true,
  },
  {
    id: "vitres",
    icon: Wind,
    nameKey: "svc.vitres.name",
    descKey: "svc.vitres.desc",
    hourly: { rate: 30, labelKey: "lbl.hourly" },
    fromLabel: "30 €/h",
    taxEligible: true,
  },
  {
    id: "canape",
    icon: Sofa,
    nameKey: "svc.canape.name",
    descKey: "svc.canape.desc",
    hourly: { rate: 30, labelKey: "lbl.hourly" },
    fromLabel: "60 €",
    taxEligible: true,
  },
  {
    id: "bureaux",
    icon: Building2,
    nameKey: "svc.bureaux.name",
    descKey: "svc.bureaux.desc",
    hourly: { rate: 35, allowMaterial: true, labelKey: "lbl.hourly" },
    fromLabel: "35 €/h",
    taxEligible: false,
  },
  {
    id: "nuisibles",
    icon: Bug,
    nameKey: "svc.nuisibles.name",
    descKey: "svc.nuisibles.desc",
    hourly: { rate: 40, labelKey: "lbl.hourly" },
    fromLabel: "40 €/h",
    taxEligible: false,
  },
]

export function getService(id: string) {
  return services.find((s) => s.id === id)
}
