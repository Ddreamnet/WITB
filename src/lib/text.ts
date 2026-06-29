// Türkçe'ye duyarlı, aksan/şapka farkını yok sayan normalize.
// Hem saklanan nameLower hem de arama sorgusu bununla geçirilir; böylece
// "sargi" yazınca "Sargı bezi" bulunur.

const MAP: Record<string, string> = {
  ı: 'i', i: 'i', İ: 'i', I: 'i',
  ğ: 'g', ü: 'u', ş: 's', ö: 'o', ç: 'c',
  â: 'a', î: 'i', û: 'u',
}

export function normalizeText(input: string): string {
  const lower = input.toLocaleLowerCase('tr')
  let out = ''
  for (const ch of lower) out += MAP[ch] ?? ch
  return out.trim()
}
