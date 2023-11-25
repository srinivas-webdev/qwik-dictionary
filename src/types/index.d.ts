export type { Media, Meaning, PhraseDetails };

declare global {
  interface Media {
    url: string,
    publicId?: string,
    type: string
  }
  interface Meaning {
    name: string,
    examples?: string[]
    media?: Media []
  }
  type PhraseDetails = {
    name: string,
    meanings: Meaning[]
  }
}