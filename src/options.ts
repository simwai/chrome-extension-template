// ---------------------------------------------------------------------------
// options.ts — options page logic
//
// WHY chrome.storage.sync: settings are automatically replicated across the
// user's Chrome profile on all devices. No backend or account system needed.
//
// UX pattern: write on every input event (no save button). This matches
// Chrome's own extension UX guidelines and reduces friction.
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  await restoreOptions()

  // Wire up change listeners for every settings input.
  // TODO: add your own input IDs here.
  document
    .querySelector<HTMLInputElement>('#enabled')
    ?.addEventListener('change', handleEnabledChange)
})

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

export async function saveOptions(patch: Record<string, unknown>): Promise<void> {
  await chrome.storage.sync.set(patch)
  console.log('[chrome-extension-template] Options saved:', patch)
}

export async function restoreOptions(): Promise<void> {
  const stored = await chrome.storage.sync.get({
    // Provide defaults for every key so a fresh install is never undefined.
    // TODO: add your own defaults here.
    enabled: true,
  })

  const enabledInput = document.querySelector<HTMLInputElement>('#enabled')
  if (enabledInput) {
    enabledInput.checked = stored['enabled'] as boolean
  }
}

// ---------------------------------------------------------------------------
// Event handlers — one per setting
// TODO: duplicate this pattern for each additional setting you add.
// ---------------------------------------------------------------------------

export async function handleEnabledChange(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  await saveOptions({enabled: target.checked})
}
