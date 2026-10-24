import type { Phrase } from './types'

// Questions instead of imperatives: the voice stresses "намЕри"/"прочЕти" wrongly in the imperative.
export const phrases: Phrase[] = [
  { id: 'find-letter', text: 'Коя е буквата?' },
  { id: 'match-hand', text: 'Коя буква е същата?' },
  { id: 'watch-blend', text: 'Слушай как буквите се събират' },
  { id: 'drag-blend', text: 'Събери буквите' },
  { id: 'find-syllable', text: 'Коя е сричката?' },
  { id: 'build-word', text: 'Подреди думата' },
  { id: 'read-word', text: 'Прочети думата и намери картинката' },
  { id: 'bravo', text: 'Браво!' },
  { id: 'try-again', text: 'Опитай пак' },
  { id: 'sticker', text: 'Спечели стикер!' },
]
