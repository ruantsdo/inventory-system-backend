import type { NextFunction, Request, Response } from "express";
import {
  loginSchema,
  resetPasswordFirstStepSchema,
  resetPasswordSecondStepSchema,
} from "./auth.schema";
import { AuthService } from "./auth.service";

const IS_PROD = process.env.NODE_ENV === "production";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);

    const { accessToken, refreshToken, accessExpiresMs, refreshExpiresMs, session } =
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
      path: "/refresh-token",
    });

    res.status(200).json({ status: "ok", session });
  } catch (err) {
    next(err);
  }
}

export async function checkSessionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await AuthService.getSession(req.user!.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshTokenStr = req.cookies?.refresh_token as string | undefined;

    if (!refreshTokenStr) {
      res.status(401).json({ status: "unauthorized", message: "Refresh token ausente." });
      return;
    }

    const { accessToken, refreshToken, accessExpiresMs, refreshExpiresMs } =
      await AuthService.refresh(refreshTokenStr);

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
      path: "/refresh-token",
    });

    res.status(200).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: userId } = req.user!;

    const refreshTokenStr = req.cookies?.refresh_token as string | undefined;
    if (refreshTokenStr) {
      try {
        const { decodeJwt } = await import("jose");
        const payload = decodeJwt(refreshTokenStr);
        if (payload.jti) {
          await AuthService.revokeUserSession(userId, payload.jti);
        }
      } catch {}
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
      path: "/refresh-token",
    });

    res.status(200).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordFirstStepController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = resetPasswordFirstStepSchema.parse(req.body);
    await AuthService.resetPasswordFirstStep(input);
    res.status(200).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordSecondStepController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.params.token ?? req.body.token;
    const input = resetPasswordSecondStepSchema.parse({ ...req.body, token });
    await AuthService.resetPasswordSecondStep(input);
    res.status(200).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}
