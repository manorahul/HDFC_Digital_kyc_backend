// config/redis.js
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("Missing REDIS_URL in .env");
  // Optionally throw here to fail fast:
  // throw new Error("Missing REDIS_URL");
}

const client = createClient({
  url: redisUrl,
  socket: {
    // use TLS when the URL is rediss:// or provider needs TLS
    tls: redisUrl?.startsWith("rediss://") ? true : false,
  },
});

client.on("error", (err) => console.error("Redis connection error:", err));

(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

export default client;
