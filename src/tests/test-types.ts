// ---------------------------------------------------------------------------
// test-types.ts — shared test utilities and type helpers
//
// No third-party stub library. Fakes are plain functions with a `calls`
// array appended so tests can assert on call count and arguments.
// ---------------------------------------------------------------------------

/** A minimal spy function — tracks every invocation without any library. */
export type SpyFn<TArgs extends unknown[] = unknown[], TReturn = void> = {
  (...args: TArgs): TReturn
  calls: TArgs[]
}

export function spy<TArgs extends unknown[] = unknown[], TReturn = void>(
  impl: (...args: TArgs) => TReturn,
): SpyFn<TArgs, TReturn> {
  const calls: TArgs[] = []
  const fn = (...args: TArgs): TReturn => {
    calls.push(args)
    return impl(...args)
  }

  fn.calls = calls
  return fn
}

/** Minimal chrome stub shape. Extend as your tests require more APIs. */
export type ChromeStub = {
  storage: {
    sync: {
      get: SpyFn<[unknown, (result: Record<string, unknown>) => void]>
      set: SpyFn<[Record<string, unknown>], Promise<void>>
    }
  }
  tabs: {
    update: SpyFn<[number, {url: string}]>
  }
  runtime: {
    lastError: chrome.runtime.LastError | undefined
  }
}
