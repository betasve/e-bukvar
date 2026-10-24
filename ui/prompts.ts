import type { Step } from '../audio/player'
import { clipKey } from '../content/clips'
import type { PhraseId } from '../content/types'
import type { Exercise } from '../engine/exercises'

const say = (id: PhraseId): Step => ({ clip: clipKey.phrase(id) })

/** What the lesson says when an exercise starts (and when 🔊 is tapped). */
export function promptSteps(ex: Exercise): Step[] {
  switch (ex.kind) {
    case 'hear-letter':
      return [say('find-letter'), { pause: 300 }, { clip: clipKey.letter(ex.letter) }]
    case 'print-hand':
      return [say('match-hand')]
    case 'watch-blend': {
      const [c, v] = [...ex.syllable]
      return [
        say('watch-blend'),
        { pause: 400 },
        { clip: clipKey.letter(c) },
        { pause: 600 },
        { clip: clipKey.letter(v) },
        { pause: 600 },
        { clip: clipKey.syllable(ex.syllable) },
      ]
    }
    case 'hear-syllable':
      return [say('find-syllable'), { pause: 300 }, { clip: clipKey.syllable(ex.syllable) }]
    case 'build-word':
      return [say('build-word'), { pause: 300 }, { clip: clipKey.word(ex.word) }]
    case 'read-match':
      return [say('read-word')]
  }
}

/** Every clip a lesson may play, for preloading. */
export function lessonClips(exercises: Exercise[]): string[] {
  const keys = new Set<string>([clipKey.phrase('bravo'), clipKey.phrase('try-again'), clipKey.phrase('sticker')])
  for (const ex of exercises) {
    for (const step of promptSteps(ex)) if ('clip' in step) keys.add(step.clip)
    if (ex.kind === 'read-match') keys.add(clipKey.word(ex.word))
  }
  return [...keys]
}
