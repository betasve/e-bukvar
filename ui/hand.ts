// Handwritten letters are primer-traced SVGs in public/hand/ (imported by tools/import-hand-letters.ts).

/** File name for a letter: its codepoint, because upper and lower case would clash on case-insensitive disks. */
export function handFileName(letter: string): string {
  return `${letter.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}.svg`
}
