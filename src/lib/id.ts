/** Kısa, çakışmayan kimlik üretir. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Yedek (eski ortamlar)
  return 'id-' + Math.abs(hashString(String(performance.now()) + ':' + counter++)).toString(36)
}

let counter = 0
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}
