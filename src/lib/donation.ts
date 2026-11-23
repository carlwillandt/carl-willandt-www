/**
 * Rahallisen tuen maksutietojen käsittely. Arvot tulevat Decap CMS:stä, jossa Carl
 * voi kirjoittaa tai liittää ne mihin muotoon tahansa (välit, pienet kirjaimet,
 * Wordista mukaan tarttuneet näkymättömät merkit).
 */

/** Tilinumero pelkkinä kirjaimina ja numeroina, isoilla kirjaimilla. Tyhjä, jos arvoa ei ole. */
export function normalizeIban(raw?: string | null): string {
  return (raw ?? '').replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

/** Näyttömuoto neljän merkin ryhmissä: FI07 5730 0821 7235 96. */
export function formatIban(normalized: string): string {
  return normalized.replace(/(.{4})(?=.)/g, '$1 ');
}

/** IBAN-tarkistussumma (ISO 13616, mod 97). Odottaa normalizeIbanin tuloksen. */
export function isValidIban(normalized: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(normalized)) return false;
  if (normalized.startsWith('FI') && normalized.length !== 18) return false;
  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let remainder = 0;
  for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  return remainder === 1;
}

/** MobilePay/Vipps-numero pelkkinä numeroina. Tyhjä, jos arvoa ei ole. */
export function normalizeMobilepay(raw?: string | null): string {
  return (raw ?? '').replace(/\D/g, '');
}
