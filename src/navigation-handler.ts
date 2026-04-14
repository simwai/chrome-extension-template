// ---------------------------------------------------------------------------
// navigation-handler.ts — core navigation interception logic
//
// WHY: the chrome global is injected as a constructor argument rather than
// referenced directly. This makes the entire class testable in Node.js via
// sinon stubs — no Chrome runtime required.
//
// The handler is intentionally thin: it orchestrates the flow (validate →
// read settings → act) but delegates validation and host lookup to dedicated
// classes so each concern stays independently testable.
// ---------------------------------------------------------------------------

import {type HostRepository} from './host-repository.js'
import {Validator} from './validator.js'

export class NavigationHandler {
  // Exposed publicly so tests can assert on interactions if needed.
  public readonly chrome: any

  private readonly validator: Validator
  private readonly hostRepository: HostRepository

  public constructor(hostRepository: HostRepository, chrome: any) {
    this.hostRepository = hostRepository
    this.validator = new Validator(this.hostRepository)
    this.chrome = chrome
  }

  /**
   * Entry point called by the webNavigation.onBeforeNavigate listener.
   * Guard conditions exit early — happy path flows straight through.
   */
  public async handleNavigation(details: chrome.webNavigation.WebNavigationUrlCallbackDetails): Promise<void> {
    const url = new URL(details.url)

    // 1. Check the host is one we care about.
    if (!this.validator.isSupportedHost(url)) return

    // 2. Apply any additional URL-pattern rules.
    if (!this.validator.isActionablePage(url)) return

    // 3. Read user settings from synced storage.
    let settings: Record<string, any>
    try {
      settings = await this.getSettings()
    } catch (error) {
      console.error('[chrome-extension-template] Failed to read settings:', error)
      return
    }

    // 4. Guard: respect the user's enabled toggle.
    if (settings['enabled'] === false) return

    // 5. TODO: implement your extension's core action here.
    //    Examples:
    //      - Redirect the tab:       this.redirectTab(details.tabId, newUrl)
    //      - Execute a content script injected via scripting API
    //      - Post a message to the offscreen document
    console.log('[chrome-extension-template] Acting on navigation:', details.url)
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async getSettings(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      this.chrome.storage.sync.get(null, (result: Record<string, any>) => {
        if (this.chrome.runtime.lastError) {
          reject(this.chrome.runtime.lastError)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * Redirects the active tab to a new URL.
   * Call this from handleNavigation() once you have computed the target URL.
   */
  protected redirectTab(tabId: number, url: string): void {
    this.chrome.tabs.update(tabId, {url})
  }
}
