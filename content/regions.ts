import type { Region, Stop } from './types'

const letterStop = (regionId: string, id: string, newLetters: string[], words: string[]): Stop => ({
  id,
  regionId,
  kind: 'letter',
  newLetters,
  case: 'upper',
  words,
})

const storyStop = (regionId: string, id: string, words: string[]): Stop => ({
  id,
  regionId,
  kind: 'story',
  newLetters: [],
  case: 'upper',
  words,
})

export const regions: Region[] = [
  {
    id: 'r1',
    name: 'Поляна',
    art: 'meadow.webp',
    stops: [
      letterStop('r1', 'r1-s1', ['А', 'М'], ['МАМА']),
      letterStop('r1', 'r1-s2', ['О'], ['МАМО', 'МОМА']),
      letterStop('r1', 'r1-s3', ['У'], ['УМА']),
      storyStop('r1', 'r1-story', ['МАМА', 'МАМО', 'МОМА']),
    ],
  },
  {
    id: 'r2',
    name: 'Гора',
    art: 'forest.webp',
    stops: [
      letterStop('r2', 'r2-s1', ['Л'], ['ЛАМА']),
      letterStop('r2', 'r2-s2', ['Н'], ['ЛУНА']),
      letterStop('r2', 'r2-s3', ['Е'], ['ЛАЛЕ', 'ЕЛА', 'ЕЛЕН']),
      letterStop('r2', 'r2-s4', ['И'], ['ЛИМОН']),
      storyStop('r2', 'r2-story', ['ЛАМА', 'ЛУНА', 'ЕЛА', 'ЕЛЕН', 'ЛИМОН']),
    ],
  },
  {
    id: 'r3',
    name: 'Река',
    art: 'river.webp',
    stops: [
      letterStop('r3', 'r3-s1', ['Р'], ['МОРЕ', 'РАМО']),
      letterStop('r3', 'r3-s2', ['С'], ['ЛИСА', 'СЛОН']),
      letterStop('r3', 'r3-s3', ['Т'], ['ТОРТА', 'СТОЛ']),
      letterStop('r3', 'r3-s4', ['Ъ'], ['СЪН', 'ТРЪН']),
      storyStop('r3', 'r3-story', ['МОРЕ', 'РАМО', 'ЛИСА', 'СЛОН', 'ТОРТА', 'СТОЛ', 'СЪН', 'ТРЪН']),
    ],
  },
]
