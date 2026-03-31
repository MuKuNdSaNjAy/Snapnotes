const CATEGORIES = ["Work", "Personal", "Ideas", "Todo", "Other"];

/**
 * Uses the Anthropic API (via a proxy-safe fetch) to categorize a note.
 * Falls back to "Other" if the API key is missing or the call fails.
 */
export async function categorizeNote(content) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) return "Other";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 16,
        messages: [
          {
            role: "user",
            content: `Classify this note into exactly one category from: ${CATEGORIES.join(
              ", "
            )}.\nReply with only the category word.\n\nNote: "${content}"`,
          },
        ],
      }),
    });

    if (!response.ok) return "Other";

    const data = await response.json();
    const raw = data?.content?.[0]?.text?.trim() ?? "";
    const match = CATEGORIES.find(
      (c) => c.toLowerCase() === raw.toLowerCase()
    );
    return match ?? "Other";
  } catch {
    return "Other";
  }
}
