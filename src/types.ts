// ---------------------------------------------------------------------------
// types.ts — shared domain types
//
// Define the data shapes your extension works with here.
// Keep types narrow and explicit — avoid broad `Record<string, any>` unless
// you are modelling genuinely open-ended storage payloads.
// ---------------------------------------------------------------------------

/**
 * Represents a single host entry the extension is allowed to act on.
 * Extend this with per-host configuration fields as needed.
 *
 * @example
 * { hostSuffix: 'example.com', enabled: true }
 */
export type HostEntry = {
  hostSuffix: string
}

/**
 * Shape of the user settings persisted via chrome.storage.sync.
 * All fields should be optional so a fresh install degrades gracefully.
 */
export type UserSettings = {
  // TODO: add your own settings fields here
  enabled?: boolean
}
