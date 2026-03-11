export type EmailDeliveryMode = "fallback" | "resend";

type SendEmailInput = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

async function sendWithResend(input: SendEmailInput): Promise<EmailDeliveryMode> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      html: input.html,
      subject: input.subject,
      text: input.text,
      to: [input.to],
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}.`);
  }

  return "resend";
}

async function sendWithConsole(input: SendEmailInput): Promise<EmailDeliveryMode> {
  console.info("[auth-email:fallback] 当前为开发模式，验证码已输出到服务端日志，不代表真实邮件已发送。", {
    subject: input.subject,
    text: input.text,
    to: input.to,
  });

  return "fallback";
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<EmailDeliveryMode> {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    return sendWithResend(input);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing RESEND_API_KEY or MAIL_FROM.");
  }

  return sendWithConsole(input);
}
