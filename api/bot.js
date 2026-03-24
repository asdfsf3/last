export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "Bot route is working"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed"
      });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({
        ok: false,
        message: "Missing TELEGRAM_BOT_TOKEN"
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

    const message = body.message;

    if (!message) {
      return res.status(200).json({
        ok: true,
        message: "No message received"
      });
    }

    const chatId = message.chat?.id;
    const text = message.text || "";

    if (!chatId) {
      return res.status(200).json({
        ok: true,
        message: "No chat id"
      });
    }

    if (text === "/start") {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: "👋 البوت شغال"
        })
      });
    }

    if (text === "/clear") {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🧹 تم تنظيف السجل"
        })
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
