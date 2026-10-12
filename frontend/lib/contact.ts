/** Helpers to turn settings strings into safe links. */

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
}

/** Accepts "+91 94143 52319", "9414352319" or "919414352319". */
export function whatsappHref(number: string): string {
  let digits = number.replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  return digits ? `https://wa.me/${digits}` : '';
}
