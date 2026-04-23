import type { NextFunction, Request, Response } from "express";
import { UserError } from "../error.ts";

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // 이미 헤더가 전송된 경우 express.js 의 기본 오류 핸들러에게 처리를 넘김.
  // 기본 오류 핸들러는 연결을 닫고 요청을 실패 처리함.
  // (참조: https://expressjs.com/en/guide/error-handling.html 의 "The default error handler" 섹션)
  if (res.headersSent) {
    return next(error);
  }

  req.log.error(error)

  if (error instanceof UserError) {
    res.status(error.code).json({
      status: "error",
      error,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Unexpected internal error",
    });
  }
}
