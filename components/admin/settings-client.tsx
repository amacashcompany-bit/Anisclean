"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import { upsertSiteSetting } from "@/lib/db/admin-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, CheckCircle } from "lucide-react"

interface Props {
  settings: Record<string, string>
}

export function AdminSettingsClient({ settings }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    companyName: settings["companyName"] ?? "Zyncleen",
    companyPhone: settings["companyPhone"] ?? "",
    companyEmail: settings["companyEmail"] ?? "",
    companyAddress: settings["companyAddress"] ?? "",
    companyCity: settings["companyCity"] ?? "Nîmes",
    invoicePrefix: settings["invoicePrefix"] ?? "INV",
    taxRate: settings["taxRate"] ?? "20",
  })

  function handleSave() {
    startTransition(async () => {
      await Promise.all(
        Object.entries(form).map(([key, value]) => upsertSiteSetting(key, value))
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  const fields: { key: keyof typeof form; labelKey: string; type?: string }[] = [
    { key: "companyName", labelKey: "admin.settings.companyName" },
    { key: "companyPhone", labelKey: "admin.settings.companyPhone", type: "tel" },
    { key: "companyEmail", labelKey: "admin.settings.companyEmail", type: "email" },
    { key: "companyAddress", labelKey: "admin.settings.companyAddress" },
    { key: "companyCity", labelKey: "admin.settings.companyCity" },
  ]

  const invoiceFields: { key: keyof typeof form; labelKey: string; type?: string }[] = [
    { key: "invoicePrefix", labelKey: "admin.settings.invoicePrefix" },
    { key: "taxRate", labelKey: "admin.settings.taxRate", type: "number" },
  ]

  return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold">{t("admin.settings.title")}</h1>
      </div>

      {/* Company info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations de l&apos;entreprise</CardTitle>
          <CardDescription>Ces informations apparaissent sur vos factures.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {fields.map(({ key, labelKey, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{t(labelKey)}</Label>
              <Input
                type={type ?? "text"}
                value={form[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invoice settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paramètres des factures</CardTitle>
          <CardDescription>Préfixe de numérotation et taux de TVA par défaut.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {invoiceFields.map(({ key, labelKey, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{t(labelKey)}</Label>
              <Input
                type={type ?? "text"}
                value={form[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending} className="gap-2">
          {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
          {pending ? "Enregistrement..." : saved ? t("admin.settings.saved") : t("admin.save")}
        </Button>
        {saved && (
          <p className="text-sm text-green-600">{t("admin.settings.saved")}</p>
        )}
      </div>
    </div>
  )
}
