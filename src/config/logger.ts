import pinoHttp, { type Options as PinoHttpOptions } from "pino-http";
import { randomUUID } from "crypto";

const buildLogger = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const options: PinoHttpOptions = {
    level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
    genReqId: (req, res) => {
      const requestId = req.headers["x-request-id"];
      const id = typeof requestId === "string" && requestId.trim().length > 0 ? requestId : randomUUID();

      res.setHeader("x-request-id", id);
      return id;
    },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) {
        return "error";
      }

      if (res.statusCode >= 400) {
        return "warn";
      }

      return "info";
    },
    customSuccessMessage: (req, res) => `${req.method} ${req.url} completed with ${res.statusCode}`,
    customErrorMessage: (req, res, err) => `${req.method} ${req.url} failed with ${res.statusCode}: ${err.message}`,
    customProps: (req, res) => ({
      requestId: req.id,
      method: req.method,
      path: req.url,
      statusCode: res.statusCode,
    }),
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: (err) => ({
        type: err.name,
        message: err.message,
        stack: err.stack,
      }),
    },
  };

  if (!isProduction) {
    options.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  }

  return pinoHttp(options);
};

export { buildLogger };