/**
 * lib/rate-limit.ts
 * Rate Limiter en memoria con ventana deslizante por IP
 * Diseñado para proteger endpoints de checkout, login y pagos contra DDoS y spam
 */

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const trackers = new Map<string, RateLimitRecord>();

// Limpieza periódica cada 5 minutos de registros expirados para no saturar memoria
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of trackers.entries()) {
      if (now > record.resetTime) {
        trackers.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60 * 1000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = trackers.get(identifier);

  if (!record || now > record.resetTime) {
    trackers.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}
