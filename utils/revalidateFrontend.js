/**
 * Tells the public Next.js site to re-render pages after a content save, so
 * admin edits are live on the next page view instead of waiting for the 60s
 * ISR window.
 *
 * Needs two env vars — without them this is a silent no-op, so local
 * development and the current deployment keep working unchanged:
 *   FRONTEND_URL       e.g. https://chameri.vercel.app  (no trailing slash)
 *   REVALIDATE_SECRET  same value as on the Next.js side
 */

const REQUEST_TIMEOUT_MS = 6000;

/**
 * @param {string[]} paths routes on the public site, e.g. ['/', '/about']
 * @returns {Promise<void>} never rejects — a failed ping must not fail a save
 */
const revalidateFrontend = async (paths) => {
  const baseUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  const secret = process.env.REVALIDATE_SECRET;

  if (!baseUrl || !secret || !paths?.length) return;

  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[revalidate] ${paths.join(", ")} -> HTTP ${res.status} ${detail.slice(0, 200)}`
      );
      return;
    }

    console.log(`[revalidate] refreshed ${paths.join(", ")}`);
  } catch (err) {
    // Timeout, DNS failure, frontend down — the page still refreshes on its
    // own within 60s, so this is worth logging but never worth failing on.
    console.error(`[revalidate] ${paths.join(", ")} failed:`, err?.message || err);
  }
};

module.exports = { revalidateFrontend };
