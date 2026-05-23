import type { CookieOptions, NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { env } from "../../config/env";
import {
  loginSchema,
  resetPasswordFirstStepSchema,
  resetPasswordSecondStepSchema,
} from "./auth.schema";
import { AuthService } from "./auth.service";

const secret = new TextEncoder().encode(env.JWT_SECRET);

const COOKIE_BASE: Pick<CookieOptions, "httpOnly" | "secure" | "sameSite"> = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

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
      ...COOKIE_BASE,
      maxAge: accessExpiresMs,
    });

    res.cookie("refresh_token", refreshToken, {
      ...COOKIE_BASE,
      maxAge: refreshExpiresMs,
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
    const accessTokenStr = req.cookies?.access_token as string | undefined;
    if (accessTokenStr) {
      try {
        const { payload } = await jwtVerify(accessTokenStr, secret);
        if (payload.sub) {
          const result = await AuthService.getSession(payload.sub);
          if (result.authenticated) {
            res.status(200).json(result);
            return;
          }
        }
      } catch {}
    }

    const refreshTokenStr = req.cookies?.refresh_token as string | undefined;
    if (refreshTokenStr) {
      try {
        const { accessToken, refreshToken, accessExpiresMs, refreshExpiresMs, session } =
          await AuthService.refresh(refreshTokenStr);

        res.cookie("access_token", accessToken, {
          ...COOKIE_BASE,
          maxAge: accessExpiresMs,
        });

        res.cookie("refresh_token", refreshToken, {
          ...COOKIE_BASE,
          maxAge: refreshExpiresMs,
        });

        res.status(200).json({ authenticated: true, session });
        return;
      } catch {}
    }

    res.status(401).json({ authenticated: false, session: null });
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
      ...COOKIE_BASE,
      maxAge: accessExpiresMs,
    });

    res.cookie("refresh_token", refreshToken, {
      ...COOKIE_BASE,
      maxAge: refreshExpiresMs,
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

    res.clearCookie("access_token", COOKIE_BASE);

    res.clearCookie("refresh_token", COOKIE_BASE);

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
