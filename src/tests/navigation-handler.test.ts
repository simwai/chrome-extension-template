import test from 'ava'
import sinon from 'sinon'
import {NavigationHandler} from '../navigation-handler.js'
import {HostRepository} from '../host-repository.js'
import {type ChromeStub} from './test-types.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChrome(overrides?: Partial<ChromeStub>): ChromeStub {
  return {
    storage: {
      sync: {
        get: sinon.stub().callsFake((_keys, cb) => {
          cb({enabled: true})
        }),
        set: sinon.stub().resolves(),
      },
    },
    tabs: {
      update: sinon.stub(),
    },
    runtime: {
      lastError: undefined,
    },
    ...overrides,
  }
}

function makeDetails(url: string, tabId = 1): chrome.webNavigation.WebNavigationUrlCallbackDetails {
  return {url, tabId, frameId: 0, parentFrameId: -1, processId: 0, timeStamp: Date.now()}
}

const hosts = [{hostSuffix: 'example.com'}]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('handleNavigation does nothing for an unsupported host', async (t) => {
  const chrome = makeChrome()
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await handler.handleNavigation(makeDetails('https://unrelated.com/page'))

  t.false((chrome.storage.sync.get as sinon.SinonStub).called)
})

test('handleNavigation reads settings for a supported host', async (t) => {
  const chrome = makeChrome()
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await handler.handleNavigation(makeDetails('https://example.com/page'))

  t.true((chrome.storage.sync.get as sinon.SinonStub).called)
})

test('handleNavigation exits early when enabled is false', async (t) => {
  const chrome = makeChrome()
  ;(chrome.storage.sync.get as sinon.SinonStub).callsFake((_keys: unknown, cb: (r: Record<string, unknown>) => void) => {
    cb({enabled: false})
  })
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await handler.handleNavigation(makeDetails('https://example.com/page'))

  // tabs.update should never be called because the extension is disabled
  t.false((chrome.tabs.update as sinon.SinonStub).called)
})

test('handleNavigation handles storage errors gracefully', async (t) => {
  const chrome = makeChrome()
  ;(chrome.storage.sync.get as sinon.SinonStub).callsFake((_keys: unknown, cb: (r: Record<string, unknown>) => void) => {
    chrome.runtime.lastError = {message: 'Storage error'}
    cb({})
  })
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  // Should not throw
  await t.notThrowsAsync(async () => {
    await handler.handleNavigation(makeDetails('https://example.com/page'))
  })
})
