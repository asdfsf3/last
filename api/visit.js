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

    const message = [
      "--------------------------",
      "📥 New Visit",
      `📄 Page: ${page}`,
      `⏰ Client Time: ${clientTime}`,
      `🖥 Server Time: ${serverTime}`,
      `🌍 Country: ${country}`,
      `🏙 City: ${city}`,
      `🗺 Region: ${region}`,
      `🕓 Timezone: ${timezone}`,
      `🌐 Browser: ${parsed.browser}`,
      `💻 OS: ${parsed.os}`,
      `📱 Device: ${parsed.deviceType}`
    ].join("\n");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({
        ok: false,
        message: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID"
      });
    }

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok || !telegramData.ok) {
      return res.status(500).json({
        ok: false,
        message: "Telegram send failed",
        details: telegramData
      });
    }

    return res.status(200).json({ ok: true });
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
