import test from 'ava'
import {HostRepository} from '../host-repository.js'

const entries = [
  {hostSuffix: 'example.com'},
  {hostSuffix: 'other.io'},
]

test('hostnames returns plain hostname strings', (t) => {
  const repo = new HostRepository(entries)
  t.deepEqual(repo.hostnames, ['example.com', 'other.io'])
})

test('entries are stored as-is', (t) => {
  const repo = new HostRepository(entries)
  t.deepEqual(repo.entries, entries)
})
