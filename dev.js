import http from "http";
import fs from "fs";
import handler from "./api/games.js";

// Load .env.local manually
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const PORT = 3000;

// Wrapper para adaptar Node HTTP a Vercel API
function wrapResponse(res) {
  res.statusCode = 200;

  res.status = function (code) {
    this.statusCode = code;
    return this;
  };

  res.json = function (data) {
    this.setHeader("Content-Type", "application/json");
    this.end(JSON.stringify(data));
    return this;
  };

  return res;
}

const server = http.createServer(async (req, res) => {
  // Only handle /api/games
  if (req.url === "/api/games") {
    try {
      await handler(req, wrapResponse(res));
    } catch (err) {
      console.error("Handler error:", err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal server error",
          message: err.message,
        }),
      );
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`📝 POST http://localhost:${PORT}/api/games`);
  console.log(`   with Apicalypse body: fields name; search "zelda"; limit 5;`);
  console.log(
    `\n⚠️  Make sure .env.local has TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET\n`,
  );
});
