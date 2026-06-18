"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import { setUserRole } from "@/lib/db/admin-actions"
import type { user } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, Search, ShieldCheck, ShieldX, UserCheck, UserX } from "lucide-react"

type User = InferSelectModel<typeof user>
type Role = "user" | "admin" | "blocked"

interface Props {
  users: User[]
}

const ROLE_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "default",
  user: "secondary",
  blocked: "destructive",
}

export function AdminUsersClient({ users }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")

  function roleLabel(r: string) {
    const m: Record<string, string> = {
      admin: "Admin",
      user: "Utilisateur",
      blocked: "Bloqué",
    }
    return m[r] ?? r
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  function handleRole(userId: string, role: Role) {
    startTransition(async () => {
      await setUserRole(userId, role)
      router.refresh()
    })
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold">{t("admin.users.title")}</h1>
        <Badge variant="secondary" className="ml-auto">{users.length}</Badge>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t("admin.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.name")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.email")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.users.role")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{t("admin.users.joined")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ROLE_BADGE[u.role] ?? "outline"}>
                          {roleLabel(u.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {u.role !== "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-primary"
                              onClick={() => handleRole(u.id, "admin")}
                              disabled={pending}
                              title={t("admin.users.makeAdmin")}
                            >
                              <ShieldCheck className="size-3.5" />
                            </Button>
                          )}
                          {u.role === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleRole(u.id, "user")}
                              disabled={pending}
                              title={t("admin.users.makeUser")}
                            >
                              <UserCheck className="size-3.5" />
                            </Button>
                          )}
                          {u.role !== "blocked" ? (
                            <AlertDialog>
                              <AlertDialogTrigger
                                className="inline-flex items-center justify-center size-7 rounded-lg text-destructive hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                disabled={u.role === "admin"}
                                title={t("admin.users.block")}
                              >
                                <UserX className="size-3.5" />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("admin.users.block")}</AlertDialogTitle>
                                  <AlertDialogDescription>{t("admin.users.blockConfirm")}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleRole(u.id, "blocked")}
                                  >
                                    {t("admin.users.block")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-green-600"
                              onClick={() => handleRole(u.id, "user")}
                              disabled={pending}
                              title={t("admin.users.unblock")}
                            >
                              <ShieldX className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
