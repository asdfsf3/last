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

    console.log("Telegram update:", JSON.stringify(body, null, 2));

    const message = body.message || body.edited_message;
    if (!message) {
      return res.status(200).json({
        ok: true,
        message: "No message object in update"
      });
    }

    const chatId = message.chat?.id;
    const text = (message.text || "").trim();

    console.log("chatId:", chatId);
    console.log("text:", text);

    if (!chatId) {
      return res.status(200).json({
        ok: true,
        message: "No chat id"
      });
    }

    let replyText = "";

    if (text.startsWith("/start")) {
      replyText = "👋 البوت شغال";
    } else if (text.startsWith("/clear")) {
      replyText = "🧹 تم تنظيف السجل";
    } else if (text.startsWith("/help")) {
      replyText = "الأوامر المتاحة:\n/start\n/clear\n/help";
    } else {
      replyText = `وصلني هذا الأمر: ${text || "بدون نص"}`;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText
      })
    });

    const tgData = await tgRes.json();
    console.log("sendMessage response:", tgData);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("BOT ERROR:", err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
