import { join } from 'path'
import { check } from 'typings-tester'

test('TypeScript types', () => {
  expect(() => {
    check([join(__dirname, 'test.ts')], join(__dirname, 'tsconfig.json'))
  }).not.toThrow()
})
