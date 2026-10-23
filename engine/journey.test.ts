import { expect, test } from 'vitest'
import { content } from '../content'
import { stopStatus } from './journey'
import { completeStop, emptyProgress } from './progress'

test('stopStatus: r1-s1 open, r1-s2 locked until r1-s1 completed', () => {
  const p = emptyProgress('p')
  expect(stopStatus(content, p, 'r1-s1')).toBe('open')
  expect(stopStatus(content, p, 'r1-s2')).toBe('locked')
  const done = completeStop(content, p, 'r1-s1', 1).progress
  expect(stopStatus(content, done, 'r1-s1')).toBe('done')
  expect(stopStatus(content, done, 'r1-s2')).toBe('open')
  expect(stopStatus(content, done, 'r1-s3')).toBe('locked')
})

test('first stop of the next region opens after the previous region story stop', () => {
  let p = emptyProgress('p')
  for (const id of ['r1-s1', 'r1-s2', 'r1-s3']) p = completeStop(content, p, id, 1).progress
  expect(stopStatus(content, p, 'r2-s1')).toBe('locked')
  p = completeStop(content, p, 'r1-story', 1).progress
  expect(stopStatus(content, p, 'r2-s1')).toBe('open')
})
