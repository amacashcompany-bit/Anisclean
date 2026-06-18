"use server"

export type ContactFormState = {
  status: "idle" | "success" | "error"
  message?: string
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim()
  const phone = formData.get("phone")?.toString().trim()
  const service = formData.get("service")?.toString().trim()
  const zone = formData.get("zone")?.toString().trim()
  const date = formData.get("date")?.toString().trim()
  const details = formData.get("details")?.toString().trim()
  const consent = formData.get("consent")?.toString()

  if (!name || !phone) {
    return { status: "error", message: "Nom et téléphone sont requis." }
  }

  if (!consent) {
    return { status: "error", message: "Vous devez accepter la politique de confidentialité." }
  }

  // In a real project, send email / save to DB / push to WhatsApp webhook etc.
  // For now we log and return success so the form confirms immediately.
  console.log("[contact] New request", { name, phone, service, zone, date, details })

  return {
    status: "success",
    message: "Votre demande a bien été envoyée. Nous vous répondons sous 24 h.",
  }
}
