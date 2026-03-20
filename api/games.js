const MAX_BODY_SIZE = 1024 * 10; // 10 KB
const requestCounts = new Map(); // Rate limit in-memory

function getRateLimitKey(req) {
  return (
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown"
  );
}

function isRateLimited(key) {
  const now = Date.now();
  const window = 60000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }

  const timestamps = requestCounts.get(key);
  const recentRequests = timestamps.filter((t) => now - t < window);

  if (recentRequests.length >= maxRequests) {
    return true;
  }

  recentRequests.push(now);
  requestCounts.set(key, recentRequests);
  return false;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    // 0. Rate limit check
    const clientKey = getRateLimitKey(req);
    if (isRateLimited(clientKey)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    // 1. Obtener token de Twitch
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" },
    );

    if (!tokenRes.ok) {
      const errorDetail = await tokenRes
        .json()
        .catch(() => ({ message: tokenRes.statusText }));
      return res
        .status(502)
        .json({ error: "Twitch auth failed", detail: errorDetail });
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res
        .status(500)
        .json({ error: "Failed to get token", detail: tokenData });
    }

    // 2. Leer el body del request (con límite de tamaño)
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
        if (data.length > MAX_BODY_SIZE) {
          req.pause();
          reject(new Error(`Payload too large (max ${MAX_BODY_SIZE} bytes)`));
        }
      });
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });

    // 3. Llamar a IGDB
    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "text/plain",
      },
      body: body,
    });

    if (!igdbRes.ok) {
      const errorDetail = await igdbRes.text().catch(() => "unknown");
      return res
        .status(igdbRes.status)
        .json({ error: "IGDB request failed", detail: errorDetail });
    }

    const data = await igdbRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
