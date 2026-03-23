export default async function handler(req, res) {
  try {
    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return res.status(500).json({
        ok: false,
        error: "DISCORD_WEBHOOK_URL is missing"
      });
    }

    return res.status(200).json({
      ok: true,
      webhook_found: true
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
