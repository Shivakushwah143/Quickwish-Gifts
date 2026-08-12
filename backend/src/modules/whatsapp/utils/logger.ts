const formatMeta = (meta?: Record<string, unknown>): string => {
  if (!meta) {
    return "";
  }

  const entries = Object.entries(meta)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`);

  return entries.length > 0 ? ` ${entries.join(" ")}` : "";
};

export const whatsappLog = {
  info: (traceId: string, message: string, meta?: Record<string, unknown>): void => {
    console.log(`[whatsapp][${traceId}] ${message}${formatMeta(meta)}`);
  },
  warn: (traceId: string, message: string, meta?: Record<string, unknown>): void => {
    console.warn(`[whatsapp][${traceId}] ${message}${formatMeta(meta)}`);
  },
  error: (traceId: string, message: string, meta?: Record<string, unknown>): void => {
    console.error(`[whatsapp][${traceId}] ${message}${formatMeta(meta)}`);
  },
  debug: (traceId: string, message: string, meta?: Record<string, unknown>): void => {
    console.debug(`[whatsapp][${traceId}] ${message}${formatMeta(meta)}`);
  },
};
