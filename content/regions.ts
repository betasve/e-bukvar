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
    stops: [
      letterStop('r1', 'r1-s1', ['А', 'М'], ['МАМА']),
      letterStop('r1', 'r1-s2', ['О'], ['МАМА']),
      letterStop('r1', 'r1-s3', ['У'], ['МАМА']),
      storyStop('r1', 'r1-story', ['МАМА']),
    ],
  },
  {
    id: 'r2',
    name: 'Гора',
    stops: [
      letterStop('r2', 'r2-s1', ['Л'], ['ЛАМА']),
      letterStop('r2', 'r2-s2', ['Н'], ['ЛУНА', 'ЛАМА']),
      letterStop('r2', 'r2-s3', ['Е'], ['ЛАЛЕ', 'ЛУНА']),
      letterStop('r2', 'r2-s4', ['И'], ['ЛИМОН', 'ЛАЛЕ']),
      storyStop('r2', 'r2-story', ['МАМА', 'ЛАМА', 'ЛУНА', 'ЛАЛЕ', 'ЛИМОН']),
    ],
  },
]
