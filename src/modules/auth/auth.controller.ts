import type { NextFunction, Request, Response } from "express";
import { loginSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";

const IS_PROD = process.env.NODE_ENV === "production";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const { accessToken, refreshToken, accessExpiresMs, refreshExpiresMs, user } =
      await AuthService.login(input);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict",
      maxAge: accessExpiresMs,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict",
      maxAge: refreshExpiresMs,
      path: "/auth/refresh",
    });

    res.status(200).json({
      status: "ok",
      user,
    });
  } catch (err) {
    next(err);
  }
}
