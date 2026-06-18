/**
 * PAYMENT CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Fill in your credentials here. Every payment method reads from this file.
 * Nothing else needs to change — the UI picks up the values automatically.
 */

export const PAYMENT_CONFIG = {
  /**
   * CARD / STRIPE LINK
   * Create a Payment Link in your Stripe Dashboard (no API key needed).
   * Paste the URL here: https://buy.stripe.com/XXXXXXXX
   * The order amount and reference will be appended as URL parameters.
   */
  stripeLinkUrl: "https://buy.stripe.com/REPLACE_ME",

  /**
   * PAYPAL.ME
   * Your PayPal.me username (without the https://paypal.me/ prefix).
   * Example: "zynclean" → https://paypal.me/zynclean
   */
  paypalUsername: "REPLACE_ME",

  /**
   * WERO
   * The phone number linked to your Wero account (international format).
   * Example: "+33768526712"
   */
  weroPhone: "+33768526712",

  /**
   * BANK TRANSFER
   * Your IBAN and BIC. Displayed to the customer so they can wire the money.
   */
  iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
  bic: "XXXXXXXX",
  bankName: "Votre banque",

  /**
   * BUSINESS INFO (shown on bank transfer instructions)
   */
  beneficiary: "Zynclean",
} as const
