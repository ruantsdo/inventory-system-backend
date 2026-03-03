import type { NextFunction, Request, Response } from "express";
import { decodeJwt } from "jose";
import { loginSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

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

export async function logoutController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshTokenStr = _req.cookies.refresh_token;

    if (refreshTokenStr) {
      const payload = decodeJwt(refreshTokenStr);
      const userId = payload.sub;
      const jti = payload.jti;

      if (userId && jti) {
        await AuthService.revokeUserSession(userId, jti);
      }
    }

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict",
      path: "/auth/refresh",
    });

    res.status(200).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}
