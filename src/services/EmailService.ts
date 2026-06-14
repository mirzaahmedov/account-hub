import { MailtrapClient } from "mailtrap";
import { renderTemplate } from "@/lib/template";

export class EmailService {
  static readonly client = new MailtrapClient({
    token: process.env.EMAIL_CLIENT_TOKEN,
  });

  static async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.APP_URL}/api/v1/users/verify-email?token=${token}`;
    const html = await renderTemplate("verificationEmail", {
      verifyUrl,
    });

    try {
      await EmailService.client.send({
        from: {
          email: process.env.EMAIL_SENDER_ADDRESS,
        },
        to: [
          {
            email,
          },
        ],
        subject: "Verify your email",
        text: `Verify your email: ${verifyUrl}`,
        html: html,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
