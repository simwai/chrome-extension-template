import test from 'ava'
import {HostRepository} from '../host-repository.js'
import {Validator} from '../validator.js'

const repo = new HostRepository([
  {hostSuffix: 'example.com'},
  {hostSuffix: 'other.io'},
])
const validator = new Validator(repo)

// --- isSupportedHost ---

test('isSupportedHost returns true for a registered host', (t) => {
  t.true(validator.isSupportedHost(new URL('https://example.com/page')))
})

test('isSupportedHost strips www prefix before matching', (t) => {
  t.true(validator.isSupportedHost(new URL('https://www.example.com/page')))
})

test('isSupportedHost returns false for an unregistered host', (t) => {
  t.false(validator.isSupportedHost(new URL('https://unrelated.com/page')))
})

// --- isActionablePage ---
// TODO: replace these with tests for your actual URL rules once you
// implement isActionablePage() in validator.ts.

test('isActionablePage returns true by default', (t) => {
  t.true(validator.isActionablePage(new URL('https://example.com/any-path')))
})
