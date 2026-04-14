import test from 'ava'
import {NavigationHandler} from '../navigation-handler.js'
import {HostRepository} from '../host-repository.js'
import {spy, type ChromeStub} from './test-types.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChrome(
  getImplementation: (
    _keys: unknown,
    callback: (result: Record<string, unknown>) => void,
  ) => void = (_keys, callback) => {
    callback({enabled: true})
  },
): ChromeStub {
  const stub: ChromeStub = {
    storage: {
      sync: {
        get: spy(getImplementation),
        set: spy(async (_data: Record<string, unknown>) => undefined),
      },
    },
    tabs: {
      update: spy((_tabId: number, _properties: {url: string}) => undefined),
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
  return {url, tabId, timeStamp: Date.now()}
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
  const chrome = makeChrome((_keys, callback) => {
    callback({enabled: false})
  })
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await handler.handleNavigation(makeDetails('https://example.com/page'))

  // Tabs.update must never be called when the extension is disabled
  t.is(chrome.tabs.update.calls.length, 0)
})

test('handleNavigation handles storage errors gracefully', async (t) => {
  const chrome = makeChrome((_keys, callback) => {
    chrome.runtime.lastError = {message: 'Storage error'}
    callback({})
  })
  const handler = new NavigationHandler(new HostRepository(hosts), chrome)

  await t.notThrowsAsync(async () => {
    await handler.handleNavigation(makeDetails('https://example.com/page'))
  })
})
