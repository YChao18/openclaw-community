import { VerificationCodePurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AUTH_CODE_COOLDOWN_SECONDS,
  AUTH_CODE_HOURLY_LIMIT,
  AUTH_CODE_MAX_ATTEMPTS,
  AUTH_CODE_TTL_MINUTES,
} from "@/lib/auth/config";
import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/auth/crypto";
import {
  isValidEmailAddress,
  normalizeEmail,
} from "@/lib/auth/email-address";
import { sendAuthCodeEmail } from "@/lib/auth/send-auth-code";
import { currentUserSelect } from "@/lib/user/service";

type SendCodeResult =
  | {
      deliveryMode: "fallback" | "resend";
      ok: true;
      retryAfterSeconds: number;
    }
  | {
      message: string;
      ok: false;
      retryAfterSeconds?: number;
    };

type VerifyCodeResult =
  | {
      isNewUser: boolean;
      ok: true;
      userId: string;
    }
  | {
      message: string;
      ok: false;
    };

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function isValidEmail(email: string) {
  return isValidEmailAddress(email);
}

export function isValidVerificationCode(code: string) {
  return /^\d{6}$/.test(code.trim());
}

export async function issueEmailLoginCode(params: {
  email: string;
  sendIp?: string | null;
}): Promise<SendCodeResult> {
  const email = normalizeEmail(params.email);

  if (!isValidEmailAddress(email)) {
    return {
      message: "请输入有效的邮箱地址。",
      ok: false,
    };
  }

  const now = new Date();
  const cooldownStart = new Date(
    now.getTime() - AUTH_CODE_COOLDOWN_SECONDS * 1000,
  );
  const hourlyWindowStart = new Date(now.getTime() - 60 * 60 * 1000);

  const [latestCode, recentCodes] = await Promise.all([
    prisma.emailVerificationCode.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
      where: {
        email,
        purpose: VerificationCodePurpose.LOGIN,
      },
    }),
    prisma.emailVerificationCode.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
      },
      where: {
        createdAt: {
          gte: hourlyWindowStart,
        },
        email,
        purpose: VerificationCodePurpose.LOGIN,
      },
    }),
  ]);

  if (latestCode && latestCode.createdAt >= cooldownStart) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(
        (latestCode.createdAt.getTime() +
          AUTH_CODE_COOLDOWN_SECONDS * 1000 -
          now.getTime()) /
          1000,
      ),
    );

    return {
      message: `发送过于频繁，请在 ${retryAfterSeconds} 秒后重试。`,
      ok: false,
      retryAfterSeconds,
    };
  }

  if (recentCodes.length >= AUTH_CODE_HOURLY_LIMIT) {
    const retryAfterSeconds = Math.max(
      60,
      Math.ceil(
        (recentCodes[0].createdAt.getTime() +
          60 * 60 * 1000 -
          now.getTime()) /
          1000,
      ),
    );

    return {
      message: "该邮箱发送过于频繁，请稍后再试。",
      ok: false,
      retryAfterSeconds,
    };
  }

  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(email, code);
  const expiresAt = addMinutes(now, AUTH_CODE_TTL_MINUTES);

  const created = await prisma.$transaction(async (tx) => {
    await tx.emailVerificationCode.updateMany({
      data: {
        invalidatedAt: now,
      },
      where: {
        consumedAt: null,
        email,
        invalidatedAt: null,
        purpose: VerificationCodePurpose.LOGIN,
      },
    });

    return tx.emailVerificationCode.create({
      data: {
        codeHash,
        email,
        expiresAt,
        purpose: VerificationCodePurpose.LOGIN,
        sendIp: params.sendIp ?? null,
      },
      select: {
        id: true,
      },
    });
  });

  try {
    const deliveryMode = await sendAuthCodeEmail({
      code,
      email,
    });

    return {
      deliveryMode,
      ok: true,
      retryAfterSeconds: AUTH_CODE_COOLDOWN_SECONDS,
    };
  } catch (error) {
    await prisma.emailVerificationCode.update({
      data: {
        invalidatedAt: new Date(),
      },
      where: {
        id: created.id,
      },
    });

    console.error("Failed to send auth code email", error);

    return {
      message: "验证码发送失败，请稍后重试。",
      ok: false,
    };
  }
}

export async function verifyEmailLoginCode(params: {
  code: string;
  email: string;
}): Promise<VerifyCodeResult> {
  const email = normalizeEmail(params.email);
  const code = params.code.trim();

  if (!isValidEmailAddress(email)) {
    return {
      message: "请输入有效的邮箱地址。",
      ok: false,
    };
  }

  if (!isValidVerificationCode(code)) {
    return {
      message: "请输入 6 位数字验证码。",
      ok: false,
    };
  }

  const now = new Date();
  const record = await prisma.emailVerificationCode.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      email,
      purpose: VerificationCodePurpose.LOGIN,
    },
  });

  if (!record) {
    return {
      message: "验证码已失效，请重新获取。",
      ok: false,
    };
  }

  if (record.consumedAt || record.invalidatedAt || record.expiresAt <= now) {
    return {
      message: "验证码已失效，请重新获取。",
      ok: false,
    };
  }

  if (record.attemptCount >= AUTH_CODE_MAX_ATTEMPTS) {
    await prisma.emailVerificationCode.update({
      data: {
        invalidatedAt: now,
      },
      where: {
        id: record.id,
      },
    });

    return {
      message: "验证码输入次数过多，请重新获取。",
      ok: false,
    };
  }

  const codeHash = hashVerificationCode(email, code);

  if (codeHash !== record.codeHash) {
    const nextAttemptCount = record.attemptCount + 1;

    await prisma.emailVerificationCode.update({
      data: {
        attemptCount: nextAttemptCount,
        invalidatedAt:
          nextAttemptCount >= AUTH_CODE_MAX_ATTEMPTS ? now : undefined,
      },
      where: {
        id: record.id,
      },
    });

    return {
      message:
        nextAttemptCount >= AUTH_CODE_MAX_ATTEMPTS
          ? "验证码输入次数过多，请重新获取。"
          : "验证码不正确，请检查后重试。",
      ok: false,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const activeCode = await tx.emailVerificationCode.findUnique({
      where: {
        id: record.id,
      },
    });

    if (
      !activeCode ||
      activeCode.consumedAt ||
      activeCode.invalidatedAt ||
      activeCode.expiresAt <= now ||
      activeCode.codeHash !== codeHash
    ) {
      return null;
    }

    await tx.emailVerificationCode.update({
      data: {
        consumedAt: now,
      },
      where: {
        id: activeCode.id,
      },
    });

    const existingUser = await tx.user.findUnique({
      select: currentUserSelect,
      where: {
        email,
      },
    });

    if (existingUser) {
      const updatedUser =
        existingUser.emailVerified === null
          ? await tx.user.update({
              data: {
                emailVerified: now,
              },
              select: currentUserSelect,
              where: {
                id: existingUser.id,
              },
            })
          : existingUser;

      return {
        isNewUser: false,
        userId: updatedUser.id,
      };
    }

    const newUser = await tx.user.create({
      data: {
        email,
        emailVerified: now,
      },
      select: currentUserSelect,
    });

    return {
      isNewUser: true,
      userId: newUser.id,
    };
  });

  if (!result) {
    return {
      message: "验证码已失效，请重新获取。",
      ok: false,
    };
  }

  return {
    isNewUser: result.isNewUser,
    ok: true,
    userId: result.userId,
  };
}
