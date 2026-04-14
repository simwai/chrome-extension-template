// ---------------------------------------------------------------------------
// host-repository.ts — registry of hosts the extension acts on
//
// WHY: centralising the host list in one place means the manifest
// host_permissions, the webNavigation filter, and the validation layer all
// derive from a single source of truth — no risk of them drifting apart.
// ---------------------------------------------------------------------------

import {type HostEntry} from './types.js'

export class HostRepository {
  public readonly entries: HostEntry[]

  public constructor(entries: HostEntry[]) {
    this.entries = entries
  }

  /** Returns the plain hostname strings, e.g. ['example.com', 'other.io'] */
  public get hostnames(): string[] {
    return this.entries.map((e) => e.hostSuffix)
  }
}
