"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
// Note: this project's Button uses render prop, not asChild
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"

function ZyncleanMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#0ea5e9" />
      <path
        d="M20 7 C20 7 28 16 28 21.5 C28 25.6 24.4 29 20 29 C15.6 29 12 25.6 12 21.5 C12 16 20 7 20 7Z"
        fill="white" fillOpacity="0.25"
      />
      <path
        d="M14 15.5 H26 L14 24.5 H26"
        stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

interface Props {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "sign-up") {
        const res = await signUp.email({ email, password, name })
        if (res.error) { setError(res.error.message ?? "Erreur lors de l'inscription"); return }
      } else {
        const res = await signIn.email({ email, password })
        if (res.error) { setError(res.error.message ?? "Email ou mot de passe incorrect"); return }
      }
      router.push("/")
      router.refresh()
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <ZyncleanMark />
            <div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-foreground">zyn</span>
                <span style={{ color: "#0ea5e9" }}>cleen</span>
              </span>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "sign-in" ? "Connectez-vous à votre compte" : "Créez votre compte gratuitement"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "sign-up" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder={mode === "sign-up" ? "8 caractères minimum" : "Votre mot de passe"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "sign-up" ? 8 : 1}
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Masquer" : "Afficher"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="mt-1 h-11 bg-sky-500 text-white hover:bg-sky-400">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement…</>
              ) : mode === "sign-in" ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>

          {/* Switch link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "sign-in" ? (
              <>Pas encore de compte ?{" "}
                <Link href="/sign-up" className="font-semibold text-sky-500 hover:underline">S&apos;inscrire</Link>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <Link href="/sign-in" className="font-semibold text-sky-500 hover:underline">Se connecter</Link>
              </>
            )}
          </p>

          {/* Benefits for sign-up */}
          {mode === "sign-up" && (
            <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-900/40 dark:bg-sky-950/30">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">Avantages membres</p>
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Portefeuille rechargeable
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Points de fidélité convertibles en argent
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Historique complet de vos services
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
