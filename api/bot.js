export default async function handler(req, res) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const message = body.message;

    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // إذا كتب clear
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

    // إذا كتب start
    if (text === "/start") {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: "👋 هلا بيك، البوت شغال"
        })
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
