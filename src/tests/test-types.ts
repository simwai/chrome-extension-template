// ---------------------------------------------------------------------------
// test-types.ts — shared test utilities and type helpers
// ---------------------------------------------------------------------------

import type sinon from 'sinon'

/** Minimal chrome stub shape — extend as your tests require more APIs. */
export type ChromeStub = {
  storage: {
    sync: {
      get: sinon.SinonStub
      set: sinon.SinonStub
    }
  }
  tabs: {
    update: sinon.SinonStub
  }
  runtime: {
    lastError: chrome.runtime.LastError | undefined
  }
}
