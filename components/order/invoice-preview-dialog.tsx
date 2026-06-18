"use client"

import { useRef, useState } from "react"
import { Download, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"
import { InvoiceDocument, type InvoiceData } from "@/components/order/invoice-document"

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  data: InvoiceData | null
}) {
  const { t, lang, dir } = useI18n()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    if (!invoiceRef.current || !data) return
    setGenerating(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")])
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight)
      pdf.save(`${data.number}.pdf`)
    } catch (e) {
      console.log("[v0] PDF generation error:", e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-accent" />
            {t("inv.preview")}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{t("inv.success")}</p>

        {/* Scrollable preview; the inner doc has a fixed 720px width */}
        <div className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-3">
          <div className="mx-auto w-fit shadow-sm">
            {data && <InvoiceDocument ref={invoiceRef} data={data} lang={lang} dir={dir} t={t} />}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
            {t("inv.close")}
          </Button>
          <Button onClick={handleDownload} disabled={generating} className="gap-2">
            <Download className="h-4 w-4" />
            {generating ? t("inv.generating") : t("inv.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
