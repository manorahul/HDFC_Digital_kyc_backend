// config/redis.js
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("Missing REDIS_URL in .env");
}

const client = createClient({
  url: redisUrl,
  socket: {
    tls: true,                 // ⭐ REQUIRED for Upstash
    rejectUnauthorized: false // ⭐ Prevents TLS handshake issues
  },
});

client.on("error", (err) => console.error("Redis connection error:", err));

(async () => {
  try {
    await client.connect();
    console.log("🎉 Connected to Upstash Redis Successfully!");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

export default client;
