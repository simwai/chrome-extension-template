// ---------------------------------------------------------------------------
// background.ts — service worker entry point
//
// WHY a service worker (MV3): Chrome no longer supports persistent background
// pages. Service workers are event-driven and terminate when idle, so all
// persistent state must live in chrome.storage — never in module-level variables.
//
// IMPORTANT: event listeners must be registered synchronously at the top level
// of the module, before any awaited expressions. Chrome will not reconnect a
// listener that was registered inside an async callback.
// ---------------------------------------------------------------------------

import {NavigationHandler} from './navigation-handler.js'
import {HostRepository} from './host-repository.js'
import {type HostEntry} from './types.js'

// ---------------------------------------------------------------------------
// 1. Declare the hosts your extension should act on.
//    These must match the host_permissions in src/manifest.json.
// ---------------------------------------------------------------------------
const hosts: HostEntry[] = [
  // TODO: replace with your target hosts
  {hostSuffix: 'example.com'},
]

// ---------------------------------------------------------------------------
// 2. Wire up the handler — chrome is injected so tests can mock it.
//    The `typeof chrome !== 'undefined'` guard prevents the block from
//    executing when the module is imported inside the AVA test runner.
// ---------------------------------------------------------------------------
if (typeof chrome !== 'undefined') {
  const hostRepository = new HostRepository(hosts)
  const handler = new NavigationHandler(hostRepository, chrome)

  chrome.webNavigation.onBeforeNavigate.addListener(
    async (details) => {
      await handler.handleNavigation(details)
    },
    // Passing the host filter here means Chrome only wakes the service worker
    // for matching navigations — important for battery and performance.
    {url: hosts},
  )
}
