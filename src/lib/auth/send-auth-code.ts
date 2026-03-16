import {
  buildRegisterCodeEmail,
  buildResetPasswordCodeEmail,
} from "@/lib/auth/email-templates";
import { sendEmail, type EmailDeliveryMode } from "@/lib/auth/email";

type SendVerificationCodeInput = {
  code: string;
  email: string;
  purpose: "register" | "reset_password";
};

export async function sendVerificationCodeEmail({
  code,
  email,
  purpose,
}: SendVerificationCodeInput): Promise<EmailDeliveryMode> {
  const template =
    purpose === "register"
      ? buildRegisterCodeEmail(code)
      : buildResetPasswordCodeEmail(code);

  return sendEmail({
    html: template.html,
    subject: template.subject,
    text: template.text,
    to: email,
  });
}
