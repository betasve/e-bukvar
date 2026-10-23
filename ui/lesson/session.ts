import type { Content } from '../../content'
import { correctAnswer, isScored, itemIdFor, type Exercise } from '../../engine/exercises'
import { findStop } from '../../engine/known'
import { completeStop, recordAnswer, type Progress } from '../../engine/progress'

export type AnswerResult = 'correct' | 'wrong' | 'reveal' | 'ignored'

interface Deps {
  save(p: Progress): Promise<void>
  now(): number
  onSticker(id: string): void
}

/**
 * Runs one lesson: scores answers, saves after each one, and completes the stop only in finish().
 * Kept free of Svelte so the rules (one score per exercise, reveal after two misses) are unit-tested.
 */
export class LessonSession {
  readonly total: number
  private i = 0
  private wrongs = 0
  private solved = false
  private busy = false
  private regionId: string
  private _progress: Progress

  constructor(
    private c: Content,
    private stopId: string,
    private exercises: Exercise[],
    progress: Progress,
    private deps: Deps,
  ) {
    this.total = exercises.length
    this.regionId = findStop(c, stopId).regionId
    this._progress = progress
  }

  get index(): number {
    return this.i
  }
  get current(): Exercise | null {
    return this.exercises[this.i] ?? null
  }
  get progress(): Progress {
    return this._progress
  }
  get meter(): number {
    return this._progress.meter
  }

  async answer(choice: string): Promise<AnswerResult> {
    const ex = this.current
    if (!ex || !isScored(ex) || this.solved || this.busy) return 'ignored'
    if (choice !== correctAnswer(ex)) {
      this.wrongs++
      return this.wrongs >= 2 ? 'reveal' : 'wrong'
    }
    this.solved = true
    this.busy = true
    try {
      const { progress, sticker } = recordAnswer(
        this.c,
        this._progress,
        itemIdFor(ex)!,
        this.wrongs === 0,
        this.regionId,
        this.deps.now(),
      )
      this._progress = progress
      if (sticker) this.deps.onSticker(sticker)
      await this.deps.save(progress)
    } finally {
      this.busy = false
    }
    return 'correct'
  }

  async next(): Promise<void> {
    if (this.i < this.total) this.i++
    this.wrongs = 0
    this.solved = false
  }

  async finish(): Promise<string[]> {
    const { progress, stickers } = completeStop(this.c, this._progress, this.stopId, this.deps.now())
    this._progress = progress
    stickers.forEach((s) => this.deps.onSticker(s))
    await this.deps.save(progress)
    return stickers
  }
}
