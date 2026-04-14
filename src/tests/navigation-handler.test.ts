import test from 'ava'
import {NavigationHandler} from '../navigation-handler.js'
import {HostRepository} from '../host-repository.js'
import {spy, type ChromeStub} from './test-types.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChrome(
  getImpl: (
    _keys: unknown,
    cb: (result: Record<string, unknown>) => void,
  ) => void = (_keys, cb) => {
    cb({enabled: true})
  },
): ChromeStub {
  const stub: ChromeStub = {
    storage: {
      sync: {
        get: spy(getImpl),
        set: spy(async () => undefined),
      },
    },
    tabs: {
      update: spy(() => undefined),
    },
    runtime: {
      lastError: undefined,
    },
  }

  return stub
}

function makeDetails(
  url: string,
  tabId = 1,
): chrome.webNavigation.WebNavigationUrlCallbackDetails {
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

  t.is(chrome.storage.sync.get.calls.length, 0)
})

test('handleNavigation reads settings for a supported host', async (t) => {
  const chrome = makeChrome()
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await handler.handleNavigation(makeDetails('https://example.com/page'))

  t.is(chrome.storage.sync.get.calls.length, 1)
})

test('handleNavigation exits early when enabled is false', async (t) => {
  const chrome = makeChrome((_keys, cb) => {
    cb({enabled: false})
  })
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await handler.handleNavigation(makeDetails('https://example.com/page'))

  // tabs.update must never be called when the extension is disabled
  t.is(chrome.tabs.update.calls.length, 0)
})

test('handleNavigation handles storage errors gracefully', async (t) => {
  const chrome = makeChrome((_keys, cb) => {
    chrome.runtime.lastError = {message: 'Storage error'}
    cb({})
  })
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await t.notThrowsAsync(async () => {
    await handler.handleNavigation(makeDetails('https://example.com/page'))
  })
})
