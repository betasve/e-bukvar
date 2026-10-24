import type { Word } from './types'

// Words without a picture can only be used for "build the word", never for "read and match".
export const words: Word[] = [
  { text: 'МАМА', syllables: ['МА', 'МА'], picture: '1F469' },
  { text: 'МАМО', syllables: ['МА', 'МО'], picture: '1F469' },
  { text: 'МОМА', syllables: ['МО', 'МА'], picture: '1F467' },
  { text: 'УМА', syllables: ['У', 'МА'] },
  { text: 'ЛАМА', syllables: ['ЛА', 'МА'], picture: '1F999' },
  { text: 'ЛУНА', syllables: ['ЛУ', 'НА'], picture: '1F319' },
  { text: 'ЛАЛЕ', syllables: ['ЛА', 'ЛЕ'], picture: '1F337' },
  { text: 'ЕЛА', syllables: ['Е', 'ЛА'], picture: '1F332' },
  { text: 'ЕЛЕН', syllables: ['Е', 'ЛЕН'], picture: '1F98C' },
  { text: 'ЛИМОН', syllables: ['ЛИ', 'МОН'], picture: '1F34B' },
]
