"use client"

import { useActionState, useRef } from "react"
import { submitContactForm, type ContactFormState } from "@/app/contact/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const SERVICES = [
  "Ménage & nettoyage",
  "Remise en état",
  "Nettoyage de vitres",
  "Canapés & tapis",
  "Bureaux & locaux",
  "Traitement nuisibles",
  "Autre",
]

const initial: ContactFormState = { status: "idle" }

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initial)
  const formRef = useRef<HTMLFormElement>(null)

  // Once success, the ref is used to reset the form visually
  if (state.status === "success" && formRef.current) {
    formRef.current.reset()
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5">
      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cf-name" className="text-sm font-medium text-foreground">
            Nom complet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cf-name"
            name="name"
            placeholder="Prénom Nom"
            required
            className="h-11"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cf-phone" className="text-sm font-medium text-foreground">
            Téléphone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cf-phone"
            name="phone"
            type="tel"
            placeholder="06 12 34 56 78"
            required
            className="h-11"
          />
        </div>
      </div>

      {/* Service */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-foreground">Prestation souhaitée</Label>
        <Select name="service">
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Choisir une prestation…" />
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-zone" className="text-sm font-medium text-foreground">
          Zone / adresse d&apos;intervention
        </Label>
        <Input
          id="cf-zone"
          name="zone"
          placeholder="Ville, quartier ou adresse"
          className="h-11"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-date" className="text-sm font-medium text-foreground">
          Date souhaitée
        </Label>
        <Input
          id="cf-date"
          name="date"
          type="date"
          className="h-11"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-details" className="text-sm font-medium text-foreground">
          Détails de votre besoin
        </Label>
        <Textarea
          id="cf-details"
          name="details"
          rows={4}
          placeholder="Surface, fréquence, type de besoin…"
          className="resize-none"
        />
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          className="mt-0.5 size-4 rounded border-border accent-primary flex-shrink-0"
          required
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          J&apos;accepte que mes informations soient utilisées pour traiter ma demande,
          conformément à la{" "}
          <a href="#" className="text-primary underline underline-offset-2 hover:text-primary/80">
            politique de confidentialité
          </a>
          . <span className="text-destructive">*</span>
        </span>
      </label>

      {/* Feedback */}
      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.message}
        </div>
      )}
      {state.status === "success" && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
          <CheckCircle2 className="size-4 shrink-0" />
          {state.message}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className={cn(
          "w-full h-12 font-semibold gap-2 text-base",
          "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="size-4" />
            Envoyer ma demande d&apos;intervention
          </>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Réponse rapide · Gratuit et sans engagement
      </p>
    </form>
  )
}
