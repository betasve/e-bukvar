import type { Word } from './types'

// Words without a picture can only be used for "build the word", never for "read and match".
export const words: Word[] = [
  { text: 'МАМА', syllables: ['МА', 'МА'], picture: '1F469-200D-1F37C' },
  { text: 'МАМО', syllables: ['МА', 'МО'], picture: '1F469-200D-1F37C' },
  { text: 'МОМА', syllables: ['МО', 'МА'], picture: '1F467' },
  { text: 'УМА', syllables: ['У', 'МА'] },
  { text: 'ЛАМА', syllables: ['ЛА', 'МА'], picture: '1F999' },
  { text: 'ЛУНА', syllables: ['ЛУ', 'НА'], picture: '1F319' },
  { text: 'ЛАЛЕ', syllables: ['ЛА', 'ЛЕ'], picture: '1F337' },
  { text: 'ЕЛА', syllables: ['Е', 'ЛА'], picture: '1F332' },
  { text: 'ЕЛЕН', syllables: ['Е', 'ЛЕН'], picture: '1F98C' },
  { text: 'ЛИМОН', syllables: ['ЛИ', 'МОН'], picture: '1F34B' },
  { text: 'МОРЕ', syllables: ['МО', 'РЕ'], picture: '1F30A' },
  { text: 'РАМО', syllables: ['РА', 'МО'], picture: '1F4AA' },
  { text: 'ЛИСА', syllables: ['ЛИ', 'СА'], picture: '1F98A' },
  { text: 'СЛОН', syllables: ['СЛОН'], picture: '1F418' },
  { text: 'ТОРТА', syllables: ['ТОР', 'ТА'], picture: '1F382' },
  { text: 'СТОЛ', syllables: ['СТОЛ'], picture: '1FA91' },
  { text: 'СЪН', syllables: ['СЪН'], picture: '1F634' },
  { text: 'ТРЪН', syllables: ['ТРЪН'], picture: '1F335' },
]
