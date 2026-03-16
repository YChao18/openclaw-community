import { VerificationCodePurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AUTH_CODE_COOLDOWN_SECONDS,
  AUTH_CODE_HOURLY_LIMIT,
  AUTH_CODE_IP_LIMIT,
  AUTH_CODE_IP_WINDOW_MINUTES,
  AUTH_CODE_MAX_ATTEMPTS,
  AUTH_CODE_TTL_MINUTES,
  AUTH_VERIFIED_TOKEN_TTL_MINUTES,
} from "@/lib/auth/config";
import {
  generateOneTimeToken,
  generateVerificationCode,
  hashOneTimeToken,
  hashVerificationCode,
} from "@/lib/auth/crypto";
import { isValidEmailAddress, normalizeEmail } from "@/lib/auth/email-address";
import { type EmailDeliveryMode } from "@/lib/auth/email";
import { verifyPasswordHash, hashPassword } from "@/lib/auth/password";
import { sendVerificationCodeEmail } from "@/lib/auth/send-auth-code";

type AuthActionPurpose = "register" | "reset_password";

type ServiceError = {
  code: string;
  message: string;
  ok: false;
  retryAfterSeconds?: number;
};

type SendCodeResult =
  | {
      deliveryMode?: EmailDeliveryMode;
      ok: true;
      retryAfterSeconds: number;
    }
  | ServiceError;

type VerifyCodeResult =
  | {
      actionToken: string;
      actionTokenExpiresAt: Date;
      ok: true;
    }
  | ServiceError;

type PasswordActionResult =
  | {
      ok: true;
      userId: string;
    }
  | ServiceError;

type PasswordLoginResult =
  | {
      ok: true;
      userId: string;
    }
  | ServiceError;

const PURPOSE_MAP: Record<AuthActionPurpose, VerificationCodePurpose> = {
  register: VerificationCodePurpose.REGISTER,
  reset_password: VerificationCodePurpose.RESET_PASSWORD,
};

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getPurposeValue(purpose: AuthActionPurpose) {
  return PURPOSE_MAP[purpose];
}

export function isValidEmail(email: string) {
  return isValidEmailAddress(email);
}

export function isValidVerificationCode(code: string) {
  return /^\d{6}$/.test(code.trim());
}

function invalidEmailError(): ServiceError {
  return {
    code: "INVALID_EMAIL",
    message: "请输入有效的邮箱地址。",
    ok: false,
  };
}

async function enforceSendRateLimits(params: {
  email: string;
  purpose: VerificationCodePurpose;
  sendIp?: string | null;
}) {
  const now = new Date();
  const cooldownStart = new Date(
    now.getTime() - AUTH_CODE_COOLDOWN_SECONDS * 1000,
  );
  const hourlyWindowStart = new Date(now.getTime() - 60 * 60 * 1000);
  const ipWindowStart = new Date(
    now.getTime() - AUTH_CODE_IP_WINDOW_MINUTES * 60 * 1000,
  );

  const [latestCode, recentCodes, recentIpCodes] = await Promise.all([
    prisma.emailVerificationCode.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
      where: {
        email: params.email,
        purpose: params.purpose,
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
        email: params.email,
        purpose: params.purpose,
      },
    }),
    params.sendIp
      ? prisma.emailVerificationCode.findMany({
          select: {
            id: true,
          },
          where: {
            createdAt: {
              gte: ipWindowStart,
            },
            purpose: params.purpose,
            sendIp: params.sendIp,
          },
        })
      : Promise.resolve([]),
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
      code: "CODE_COOLDOWN",
      message: `发送过于频繁，请在 ${retryAfterSeconds} 秒后重试。`,
      ok: false,
      retryAfterSeconds,
    } satisfies ServiceError;
  }

  if (recentCodes.length >= AUTH_CODE_HOURLY_LIMIT) {
    const retryAfterSeconds = Math.max(
      60,
      Math.ceil(
        (recentCodes[0].createdAt.getTime() + 60 * 60 * 1000 - now.getTime()) /
          1000,
      ),
    );

    return {
      code: "EMAIL_RATE_LIMITED",
      message: "该邮箱请求过于频繁，请稍后再试。",
      ok: false,
      retryAfterSeconds,
    } satisfies ServiceError;
  }

  if (recentIpCodes.length >= AUTH_CODE_IP_LIMIT) {
    return {
      code: "IP_RATE_LIMITED",
      message: "当前请求过于频繁，请稍后再试。",
      ok: false,
      retryAfterSeconds: AUTH_CODE_COOLDOWN_SECONDS,
    } satisfies ServiceError;
  }

  return null;
}

async function createVerificationCode(params: {
  email: string;
  purpose: AuthActionPurpose;
  sendIp?: string | null;
}) {
  const email = normalizeEmail(params.email);

  if (!isValidEmailAddress(email)) {
    return invalidEmailError();
  }

  const purpose = getPurposeValue(params.purpose);
  const rateLimitError = await enforceSendRateLimits({
    email,
    purpose,
    sendIp: params.sendIp,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const now = new Date();
  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(email, code);
  const expiresAt = addMinutes(now, AUTH_CODE_TTL_MINUTES);

  const created = await prisma.$transaction(async (tx) => {
    await tx.emailVerificationCode.updateMany({
      data: {
        invalidatedAt: now,
        verifiedTokenExpiresAt: null,
        verifiedTokenHash: null,
      },
      where: {
        email,
        invalidatedAt: null,
        purpose,
      },
    });

    return tx.emailVerificationCode.create({
      data: {
        codeHash,
        email,
        expiresAt,
        purpose,
        sendIp: params.sendIp ?? null,
      },
      select: {
        id: true,
      },
    });
  });

  return {
    code,
    createdId: created.id,
    email,
    ok: true,
    retryAfterSeconds: AUTH_CODE_COOLDOWN_SECONDS,
  } as const;
}

async function deliverVerificationCode(params: {
  code: string;
  email: string;
  purpose: AuthActionPurpose;
}) {
  return sendVerificationCodeEmail({
    code: params.code,
    email: params.email,
    purpose: params.purpose,
  });
}

async function issueCode(params: {
  email: string;
  purpose: AuthActionPurpose;
  sendIp?: string | null;
  shouldSendEmail: boolean;
}): Promise<SendCodeResult> {
  const result = await createVerificationCode(params);

  if (!result.ok) {
    return result;
  }

  if (!params.shouldSendEmail) {
    return {
      ok: true,
      retryAfterSeconds: result.retryAfterSeconds,
    } satisfies SendCodeResult;
  }

  try {
    const deliveryMode = await deliverVerificationCode({
      code: result.code,
      email: result.email,
      purpose: params.purpose,
    });

    return {
      deliveryMode,
      ok: true,
      retryAfterSeconds: result.retryAfterSeconds,
    } satisfies SendCodeResult;
  } catch (error) {
    await prisma.emailVerificationCode.update({
      data: {
        invalidatedAt: new Date(),
      },
      where: {
        id: result.createdId,
      },
    });

    console.error("Failed to send verification code email", error);

    if (
      error instanceof Error &&
      (error.message.startsWith("Missing ") ||
        error.message.startsWith("Unsupported EMAIL_PROVIDER"))
    ) {
      const configError: ServiceError = {
        code: "EMAIL_CONFIG_ERROR",
        message: "邮件服务配置不完整，请联系管理员检查邮件环境变量。",
        ok: false,
      };

      return configError;
    }

    const sendError: ServiceError = {
      code: "EMAIL_SEND_FAILED",
      message: "邮件发送失败，请稍后重试。",
      ok: false,
    };

    return sendError;
  }
}

async function verifyCode(params: {
  code: string;
  email: string;
  purpose: AuthActionPurpose;
}): Promise<VerifyCodeResult> {
  const email = normalizeEmail(params.email);
  const code = params.code.trim();

  if (!isValidEmailAddress(email)) {
    return invalidEmailError();
  }

  if (!isValidVerificationCode(code)) {
    return {
      code: "INVALID_CODE_FORMAT",
      message: "请输入 6 位数字验证码。",
      ok: false,
    };
  }

  const now = new Date();
  const purpose = getPurposeValue(params.purpose);
  const record = await prisma.emailVerificationCode.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      email,
      purpose,
    },
  });

  if (!record) {
    return {
      code: "CODE_NOT_FOUND",
      message: "验证码无效或已过期，请重新获取。",
      ok: false,
    };
  }

  if (record.consumedAt || record.invalidatedAt || record.expiresAt <= now) {
    return {
      code: "CODE_EXPIRED",
      message: "验证码无效或已过期，请重新获取。",
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
      code: "CODE_LOCKED",
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
      code:
        nextAttemptCount >= AUTH_CODE_MAX_ATTEMPTS
          ? "CODE_LOCKED"
          : "CODE_MISMATCH",
      message:
        nextAttemptCount >= AUTH_CODE_MAX_ATTEMPTS
          ? "验证码输入次数过多，请重新获取。"
          : "验证码不正确，请检查后重试。",
      ok: false,
    };
  }

  const actionToken = generateOneTimeToken();
  const actionTokenHash = hashOneTimeToken(actionToken);
  const actionTokenExpiresAt = addMinutes(now, AUTH_VERIFIED_TOKEN_TTL_MINUTES);

  const verified = await prisma.$transaction(async (tx) => {
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
        verifiedTokenExpiresAt: actionTokenExpiresAt,
        verifiedTokenHash: actionTokenHash,
      },
      where: {
        id: activeCode.id,
      },
    });

    return true;
  });

  if (!verified) {
    return {
      code: "CODE_EXPIRED",
      message: "验证码无效或已过期，请重新获取。",
      ok: false,
    };
  }

  return {
    actionToken,
    actionTokenExpiresAt,
    ok: true,
  };
}

async function consumeVerifiedToken(params: {
  email: string;
  purpose: AuthActionPurpose;
  token: string;
}) {
  const email = normalizeEmail(params.email);

  if (!isValidEmailAddress(email) || !params.token.trim()) {
    return null;
  }

  const now = new Date();
  const tokenHash = hashOneTimeToken(params.token.trim());
  const purpose = getPurposeValue(params.purpose);

  const record = await prisma.emailVerificationCode.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      consumedAt: {
        not: null,
      },
      email,
      invalidatedAt: null,
      purpose,
      verifiedTokenExpiresAt: {
        gt: now,
      },
      verifiedTokenHash: tokenHash,
    },
  });

  if (!record) {
    return null;
  }

  return {
    id: record.id,
  };
}

export async function issueRegistrationCode(params: {
  email: string;
  sendIp?: string | null;
}): Promise<SendCodeResult> {
  const email = normalizeEmail(params.email);

  if (!isValidEmailAddress(email)) {
    return invalidEmailError();
  }

  const existingUser = await prisma.user.findUnique({
    select: {
      id: true,
      passwordHash: true,
    },
    where: {
      email,
    },
  });

  if (existingUser?.passwordHash) {
    return {
      code: "EMAIL_ALREADY_REGISTERED",
      message: "该邮箱已完成注册，请直接使用邮箱和密码登录。",
      ok: false,
    };
  }

  return issueCode({
    email,
    purpose: "register",
    sendIp: params.sendIp,
    shouldSendEmail: true,
  });
}

export async function verifyRegistrationCode(params: {
  code: string;
  email: string;
}): Promise<VerifyCodeResult> {
  return verifyCode({
    code: params.code,
    email: params.email,
    purpose: "register",
  });
}

export async function completeRegistration(params: {
  email: string;
  password: string;
  token: string;
}): Promise<PasswordActionResult> {
  const email = normalizeEmail(params.email);
  const tokenRecord = await consumeVerifiedToken({
    email,
    purpose: "register",
    token: params.token,
  });

  if (!tokenRecord) {
    return {
      code: "REGISTER_TOKEN_INVALID",
      message: "注册会话已失效，请重新获取验证码。",
      ok: false,
    };
  }

  const passwordHash = await hashPassword(params.password);
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        select: {
          emailVerified: true,
          id: true,
          passwordHash: true,
        },
        where: {
          email,
        },
      });

      if (user?.passwordHash) {
        return {
          alreadyRegistered: true,
        } as const;
      }

      const savedUser = user
        ? await tx.user.update({
            data: {
              emailVerified: user.emailVerified ?? now,
              passwordHash,
            },
            select: {
              id: true,
            },
            where: {
              id: user.id,
            },
          })
        : await tx.user.create({
            data: {
              email,
              emailVerified: now,
              passwordHash,
            },
            select: {
              id: true,
            },
          });

      await tx.emailVerificationCode.update({
        data: {
          invalidatedAt: now,
          verifiedTokenExpiresAt: null,
          verifiedTokenHash: null,
        },
        where: {
          id: tokenRecord.id,
        },
      });

      return {
        alreadyRegistered: false,
        userId: savedUser.id,
      } as const;
    });

    if (result.alreadyRegistered) {
      return {
        code: "EMAIL_ALREADY_REGISTERED",
        message: "该邮箱已完成注册，请直接登录。",
        ok: false,
      };
    }

    return {
      ok: true,
      userId: result.userId,
    };
  } catch (error) {
    console.error("Failed to complete registration", error);

    return {
      code: "REGISTER_FAILED",
      message: "注册暂时不可用，请稍后重试。",
      ok: false,
    };
  }
}

export async function loginWithEmailPassword(params: {
  email: string;
  password: string;
}): Promise<PasswordLoginResult> {
  const email = normalizeEmail(params.email);

  if (!isValidEmailAddress(email)) {
    return invalidEmailError();
  }

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      passwordHash: true,
    },
    where: {
      email,
    },
  });

  if (!user?.passwordHash) {
    return {
      code: "INVALID_CREDENTIALS",
      message: "邮箱或密码不正确。",
      ok: false,
    };
  }

  const matches = await verifyPasswordHash(params.password, user.passwordHash);

  if (!matches) {
    return {
      code: "INVALID_CREDENTIALS",
      message: "邮箱或密码不正确。",
      ok: false,
    };
  }

  return {
    ok: true,
    userId: user.id,
  };
}

export async function issueForgotPasswordCode(params: {
  email: string;
  sendIp?: string | null;
}): Promise<SendCodeResult> {
  const email = normalizeEmail(params.email);

  if (!isValidEmailAddress(email)) {
    return invalidEmailError();
  }

  const existingUser = await prisma.user.findUnique({
    select: {
      id: true,
      passwordHash: true,
    },
    where: {
      email,
    },
  });

  return issueCode({
    email,
    purpose: "reset_password",
    sendIp: params.sendIp,
    shouldSendEmail: Boolean(existingUser?.passwordHash),
  });
}

export async function verifyForgotPasswordCode(params: {
  code: string;
  email: string;
}): Promise<VerifyCodeResult> {
  return verifyCode({
    code: params.code,
    email: params.email,
    purpose: "reset_password",
  });
}

export async function resetPassword(params: {
  email: string;
  password: string;
  token: string;
}): Promise<PasswordActionResult> {
  const email = normalizeEmail(params.email);
  const tokenRecord = await consumeVerifiedToken({
    email,
    purpose: "reset_password",
    token: params.token,
  });

  if (!tokenRecord) {
    return {
      code: "RESET_TOKEN_INVALID",
      message: "重置会话已失效，请重新获取验证码。",
      ok: false,
    };
  }

  const passwordHash = await hashPassword(params.password);
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        select: {
          id: true,
          passwordHash: true,
        },
        where: {
          email,
        },
      });

      if (!user?.passwordHash) {
        return null;
      }

      await tx.user.update({
        data: {
          emailVerified: now,
          passwordHash,
        },
        where: {
          id: user.id,
        },
      });

      await tx.emailVerificationCode.update({
        data: {
          invalidatedAt: now,
          verifiedTokenExpiresAt: null,
          verifiedTokenHash: null,
        },
        where: {
          id: tokenRecord.id,
        },
      });

      return {
        userId: user.id,
      };
    });

    if (!result) {
      return {
        code: "RESET_TOKEN_INVALID",
        message: "重置会话已失效，请重新获取验证码。",
        ok: false,
      };
    }

    return {
      ok: true,
      userId: result.userId,
    };
  } catch (error) {
    console.error("Failed to reset password", error);

    return {
      code: "RESET_PASSWORD_FAILED",
      message: "密码重置失败，请稍后重试。",
      ok: false,
    };
  }
}
