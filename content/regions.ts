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

// Five letters per region, easier ones first (see the design spec, section 5.1).
// Stop ids are positions, so moving a stop needs a progress migration (engine/progress.ts).
export const regions: Region[] = [
  {
    id: 'r1',
    name: 'Поляна',
    art: 'meadow.webp',
    stops: [
      letterStop('r1', 'r1-s1', ['А', 'М'], ['МАМА']),
      letterStop('r1', 'r1-s2', ['О'], ['МАМО', 'МОМА']),
      letterStop('r1', 'r1-s3', ['У'], ['УМА']),
      letterStop('r1', 'r1-s4', ['Л'], ['ЛАМА']),
      storyStop('r1', 'r1-story', ['МАМА', 'МАМО', 'МОМА', 'ЛАМА']),
    ],
  },
  {
    id: 'r2',
    name: 'Гора',
    art: 'forest.webp',
    stops: [
      letterStop('r2', 'r2-s1', ['Н'], ['ЛУНА']),
      letterStop('r2', 'r2-s2', ['Е'], ['ЛАЛЕ', 'ЕЛА', 'ЕЛЕН']),
      letterStop('r2', 'r2-s3', ['И'], ['ЛИМОН']),
      letterStop('r2', 'r2-s4', ['Р'], ['МОРЕ', 'РАМО']),
      letterStop('r2', 'r2-s5', ['С'], ['ЛИСА', 'СЛОН']),
      storyStop('r2', 'r2-story', ['ЛУНА', 'ЛАЛЕ', 'ЕЛЕН', 'ЛИМОН', 'МОРЕ', 'РАМО', 'ЛИСА', 'СЛОН']),
    ],
  },
  {
    id: 'r3',
    name: 'Река',
    art: 'river.webp',
    stops: [
      letterStop('r3', 'r3-s1', ['Т'], ['ТОРТА', 'СТОЛ']),
      letterStop('r3', 'r3-s2', ['Ъ'], ['СЪН', 'ТРЪН']),
      letterStop('r3', 'r3-s3', ['Б'], ['БАБА', 'РИБА', 'БАНАН']),
      letterStop('r3', 'r3-s4', ['В'], ['СОВА', 'ВАНА']),
      letterStop('r3', 'r3-s5', ['П'], ['ПИЛЕ', 'ЛАПА']),
      storyStop('r3', 'r3-story', ['ТОРТА', 'СТОЛ', 'ТРЪН', 'БАБА', 'РИБА', 'БАНАН', 'СОВА', 'ПИЛЕ']),
    ],
  },
  {
    id: 'r4',
    name: 'Планина',
    art: 'mountain.webp',
    stops: [
      letterStop('r4', 'r4-s1', ['Я'], ['МЯСТО', 'ЯМА']),
      letterStop('r4', 'r4-s2', ['Д'], ['ДЯДО', 'ДОМ', 'ВОДА', 'ДИНЯ']),
      letterStop('r4', 'r4-s3', ['К'], ['КОТКА', 'КОН', 'РАКЕТА', 'ЯБЪЛКА']),
      letterStop('r4', 'r4-s4', ['Г'], ['ГЪБА', 'ГЪСКА', 'ЯГОДА']),
      letterStop('r4', 'r4-s5', ['З'], ['ЗАЕК', 'КОЗА', 'ЗЕБРА']),
      storyStop('r4', 'r4-story', ['ДЯДО', 'ВОДА', 'КОТКА', 'КОН', 'ГЪБА', 'КОЗА', 'ЗАЕК', 'ЯБЪЛКА']),
    ],
  },
  {
    id: 'r5',
    name: 'Село',
    art: 'village.webp',
    stops: [
      letterStop('r5', 'r5-s1', ['Ж'], ['ЖАБА', 'НОЖ']),
      letterStop('r5', 'r5-s2', ['Ш'], ['МИШКА', 'КРУША', 'ШАПКА']),
      letterStop('r5', 'r5-s3', ['Ч'], ['ЧАША', 'ЧАДЪР', 'ЧЕРЕША']),
      letterStop('r5', 'r5-s4', ['Ц'], ['ПИЦА', 'ЦВЕТЕ', 'ЦИРК']),
      letterStop('r5', 'r5-s5', ['Х'], ['ХЛЯБ', 'МУХА', 'ХАМСТЕР']),
      storyStop('r5', 'r5-story', ['ЖАБА', 'МИШКА', 'КРУША', 'ЧАША', 'ЧАДЪР', 'ПИЦА', 'ЦВЕТЕ', 'ХЛЯБ']),
    ],
  },
  {
    id: 'r6',
    name: 'Море',
    art: 'sea-side.webp',
    stops: [
      letterStop('r6', 'r6-s1', ['Ф'], ['ФЛАГ', 'ЖИРАФ', 'ФЕЯ']),
      letterStop('r6', 'r6-s2', ['Ю'], ['КЛЮЧ', 'ЮМРУК']),
      letterStop('r6', 'r6-s3', ['Й'], ['ЧАЙ', 'ЯЙЦЕ', 'МАЙМУНА']),
      letterStop('r6', 'r6-s4', ['Щ'], ['КЪЩА', 'ГУЩЕР', 'ЩИПКА']),
      letterStop('r6', 'r6-s5', ['Ь'], ['ПОЩАЛЬОН', 'ФРИЗЬОР', 'БУЛЬОН']),
      storyStop('r6', 'r6-story', ['ФЛАГ', 'ЖИРАФ', 'КЛЮЧ', 'ЧАЙ', 'МАЙМУНА', 'КЪЩА', 'ГУЩЕР', 'ПОЩАЛЬОН']),
    ],
  },
]
