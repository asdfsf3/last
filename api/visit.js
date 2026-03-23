export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

    const page = body.page || "/";
    const serverTime = new Date().toISOString();
    const clientTime = body.time || serverTime;

    const country = req.headers["x-vercel-ip-country"] || "Unknown";
    const region = req.headers["x-vercel-ip-country-region"] || "Unknown";
    const city = req.headers["x-vercel-ip-city"] || "Unknown";
    const timezone = req.headers["x-vercel-ip-timezone"] || "Unknown";

    const ua = req.headers["user-agent"] || "";
    const parsed = parseUserAgent(ua);

    const content = [
          " **-------------------------------------------------------**",
      "📥 **New Visit**",
      `⏰ **Client Time:** ${clientTime}`,
      `🖥 **Server Time:** ${serverTime}`,
      `📄 **Page:** ${page}`,
      `🌍 **Country:** ${country}`,
      `🏙 **City:** ${city}`,
      `🗺 **Region:** ${region}`,
      `🕓 **Timezone:** ${timezone}`,
      `🌐 **Browser:** ${parsed.browser}`,
      `💻 **OS:** ${parsed.os}`,
      `📱 **Device:** ${parsed.deviceType}`,
      `🧾 **UA:** ${ua || "Unknown"}`
    ].join("\n");

    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return res.status(500).json({
        ok: false,
        message: "Missing DISCORD_WEBHOOK_URL env var"
      });
    }

    const discordRes = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      return res.status(500).json({
        ok: false,
        message: "Discord webhook failed",
        details: text
      });
    }

    return res.status(200).json({ ok: true, message: "Visit sent to Discord" });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Server error",
      error: error.message
    });
  }
}

function parseUserAgent(ua) {
  const lower = ua.toLowerCase();

  let browser = "Unknown";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("opr/") || lower.includes("opera")) browser = "Opera";
  else if (lower.includes("chrome/") && !lower.includes("edg/")) browser = "Chrome";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";
  else if (lower.includes("firefox/")) browser = "Firefox";

  let os = "Unknown";
  if (lower.includes("windows nt")) os = "Windows";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("cpu iphone os")) os = "iOS";
  else if (lower.includes("mac os x") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";

  let deviceType = "Computer";
  if (lower.includes("ipad") || (lower.includes("android") && !lower.includes("mobile"))) {
    deviceType = "Tablet";
  } else if (
    lower.includes("mobile") ||
    lower.includes("iphone") ||
    lower.includes("android")
  ) {
    deviceType = "Mobile";
  }

  return { browser, os, deviceType };
}
