import nodemailer from "nodemailer";
import {
  getEmailFrom,
  getEmailProvider,
  isEmailDevFallbackEnabled,
  type EmailProvider,
} from "@/lib/auth/config";

export type EmailDeliveryMode = EmailProvider | "fallback";

type SendEmailInput = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

let smtpTransporter: nodemailer.Transporter | null = null;

function getResendApiKey() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY for EMAIL_PROVIDER=resend.");
  }

  return process.env.RESEND_API_KEY;
}

function getSmtpTransporter() {
  if (smtpTransporter) {
    return smtpTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Missing SMTP_HOST, SMTP_PORT, SMTP_USER or SMTP_PASS for EMAIL_PROVIDER=smtp.",
    );
  }

  smtpTransporter = nodemailer.createTransport({
    auth: {
      pass,
      user,
    },
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === "true" || Number(port) === 465,
  });

  return smtpTransporter;
}

async function sendWithResend(
  input: SendEmailInput,
): Promise<EmailDeliveryMode> {
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: getEmailFrom(),
      html: input.html,
      subject: input.subject,
      text: input.text,
      to: [input.to],
    }),
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}.`);
  }

  return "resend";
}

async function sendWithSmtp(input: SendEmailInput): Promise<EmailDeliveryMode> {
  const transporter = getSmtpTransporter();

  await transporter.sendMail({
    from: getEmailFrom(),
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: input.to,
  });

  return "smtp";
}

async function sendWithFallback(
  input: SendEmailInput,
  error: Error,
): Promise<EmailDeliveryMode> {
  console.warn(
    "[auth-email:fallback] Development fallback delivered email payload to logs.",
    {
      error: error.message,
      subject: input.subject,
      text: input.text,
      to: input.to,
    },
  );

  return "fallback";
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<EmailDeliveryMode> {
  try {
    const provider = getEmailProvider();

    if (provider === "resend") {
      return await sendWithResend(input);
    }

    return await sendWithSmtp(input);
  } catch (error) {
    if (error instanceof Error && isEmailDevFallbackEnabled()) {
      return sendWithFallback(input, error);
    }

    throw error;
  }
}
