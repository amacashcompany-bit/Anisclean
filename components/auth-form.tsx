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

function AniscleanMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#0ea5e9" />
      <path
        d="M20 7 C20 7 28 16 28 21.5 C28 25.6 24.4 29 20 29 C15.6 29 12 25.6 12 21.5 C12 16 20 7 20 7Z"
        fill="white" fillOpacity="0.25"
      />
      <path
        d="M20 10 L12 28 H16 L17.5 24 H22.5 L24 28 H28 L20 10ZM18.5 21 L20 15.5 L21.5 21 H18.5Z"
        fill="white"
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
            <AniscleanMark />
            <div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-foreground">anis</span>
                <span style={{ color: "#0ea5e9" }}>clean</span>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "sign-in" ? "Se connecter" : "Créer un compte"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "sign-in" ? (
              <p>
                Pas encore de compte ?{" "}
                <Link href="/sign-up" className="font-medium text-primary hover:underline">
                  S'inscrire
                </Link>
              </p>
            ) : (
              <p>
                Déjà un compte ?{" "}
                <Link href="/sign-in" className="font-medium text-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}