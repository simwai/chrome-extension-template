// ---------------------------------------------------------------------------
// validator.ts — URL validation rules
//
// WHY: keeping validation logic out of the NavigationHandler keeps each class
// focused on one concern and makes the rules trivial to unit-test in Node.js
// without any Chrome API involvement.
// ---------------------------------------------------------------------------

import {type HostRepository} from './host-repository.js'

export class Validator {
  private readonly hostRepository: HostRepository

  public constructor(hostRepository: HostRepository) {
    this.hostRepository = hostRepository
  }

  /**
   * Returns true when the URL's host is in the registered host list.
   * Strip 'www.' so both bare and www-prefixed domains match.
   */
  public isSupportedHost(url: URL): boolean {
    return this.hostRepository.hostnames.includes(url.host.replace('www.', ''))
  }

  /**
   * Additional validation beyond host matching.
   * TODO: replace with rules relevant to your extension's use case.
   *
   * @example
   * // Only act on product pages, not login or checkout pages
   * public isActionablePage(url: URL): boolean {
   *   return !url.pathname.startsWith('/login') &&
   *          !url.pathname.startsWith('/checkout')
   * }
   */
  public isActionablePage(_url: URL): boolean {
    // Default: all pages on supported hosts are actionable.
    // Replace this logic with your own URL pattern checks.
    return true
  }
}
