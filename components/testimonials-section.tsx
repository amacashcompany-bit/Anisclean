"use client"

import { useState, useTransition } from "react"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/providers/i18n-provider"
import { submitReview } from "@/lib/db/admin-actions"

type Review = {
  id: number
  name: string
  city: string | null
  rating: number
  text: string
  createdAt: Date
}

type Props = {
  initialReviews: Review[]
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange?: (v: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Note">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className="cursor-pointer transition-transform hover:scale-110 disabled:cursor-default"
          disabled={!onChange}
        >
          <Star
            className="h-6 w-6"
            fill={(hover || value) >= n ? "#fbbf24" : "none"}
            stroke={(hover || value) >= n ? "#fbbf24" : "currentColor"}
          />
        </button>
      ))}
    </div>
  )
}

export function TestimonialsSection({ initialReviews }: Props) {
  const { t } = useI18n()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({ name: "", city: "", rating: 5, text: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = t("form.errName")
    if (!form.text.trim()) e.text = "Veuillez écrire un avis."
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    startTransition(async () => {
      await submitReview({
        name: form.name,
        city: form.city || undefined,
        rating: form.rating,
        text: form.text,
      })
      setSubmitted(true)
      setShowForm(false)
      setForm({ name: "", city: "", rating: 5, text: "" })
    })
  }

  const displayReviews = reviews.length > 0 ? reviews : []

  return (
    <section id="avis" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-sm font-medium text-accent">
            {t("reviews.badge")}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("reviews.title")}
          </h2>
          {displayReviews.length > 0 && (
            <p className="mt-3 text-muted-foreground">
              {displayReviews.length} avis &middot; note moyenne{" "}
              <strong className="text-foreground">
                {(displayReviews.reduce((s, r) => s + r.rating, 0) / displayReviews.length).toFixed(1)}
              </strong>{" "}
              / 5
            </p>
          )}
        </div>

        {displayReviews.length === 0 ? (
          <p className="text-center text-muted-foreground mb-10">{t("reviews.empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {displayReviews.map((review) => (
              <Card key={review.id} className="border-border bg-card">
                <CardContent className="flex h-full flex-col gap-4 pt-6">
                  <StarRating value={review.rating} />
                  <blockquote className="flex-1 text-pretty leading-relaxed text-foreground">
                    &ldquo;{review.text}&rdquo;
                  </blockquote>
                  <div className="mt-2">
                    <p className="font-semibold text-foreground">{review.name}</p>
                    {review.city && (
                      <p className="text-sm text-muted-foreground">{review.city}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit review area */}
        <div className="mt-12 flex flex-col items-center gap-4">
          {submitted && (
            <p className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-800">
              {t("reviews.thanks")}
            </p>
          )}

          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {t("reviews.cta")}
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-5 text-lg font-bold text-foreground">{t("reviews.formTitle")}</h3>

              <div className="flex flex-col gap-4">
                {/* Rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">{t("reviews.rating")}</label>
                  <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rev-name" className="text-sm font-medium text-foreground">
                    {t("form.name")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Prénom N."
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rev-city" className="text-sm font-medium text-foreground">
                    {t("form.city")}
                  </label>
                  <input
                    id="rev-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Nîmes"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Review text */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rev-text" className="text-sm font-medium text-foreground">
                    {t("reviews.yourReview")} <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="rev-text"
                    rows={4}
                    value={form.text}
                    onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="Décrivez votre expérience..."
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    aria-invalid={!!errors.text}
                  />
                  {errors.text && <p className="text-xs text-destructive">{errors.text}</p>}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
                  >
                    {isPending ? "..." : t("reviews.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent/10"
                  >
                    {t("admin.cancel")}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
