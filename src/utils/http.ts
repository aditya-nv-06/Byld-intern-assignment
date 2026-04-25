import type { Request, Response } from "express";
import type { ApiResponse } from "./types";

const sendSuccess = <T>(
  res: Response<ApiResponse<T>>,
  statusCode: number,
  message: string,
  data?: T
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (
  req: Request,
  res: Response<ApiResponse>,
  statusCode: number,
  message: string,
  errorCode: string,
  details?: string[]
) => {
  const logPayload = { errorCode, details, statusCode };

  if (statusCode >= 500) {
    req.log.error(logPayload, message);
  } else {
    req.log.warn(logPayload, message);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details,
  });
};

export {
  sendError,
  sendSuccess,
};