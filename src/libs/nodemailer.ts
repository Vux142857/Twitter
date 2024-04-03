import nodemailer from "nodemailer";
import 'dotenv/config'

const emailConfig = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT as string) || 465,
    secure: process.env.EMAIL_SECURE === "true" || true,
    auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASSWORD as string,
    },
    tls: {
        rejectUnauthorized: false,
    },
};

interface MessageEmail {
    subject: string;
    text: string;
}

enum TypeEmail {
    TEXT = "text",
    LINK = "link",
}

class MailService {
    private transporter: any;
    constructor() {
        this.transporter = nodemailer.createTransport(emailConfig);
    }

    private async sendMail(mailSendTo: string, message: MessageEmail, type: TypeEmail) {
        try {
            const content = `
          <div style="padding: 10px; background-color: #003375">
              <div style="padding: 10px; background-color: white;">
                  <h4 style="color: #0085ff">Hello</h4>
                  <span style="color: black">${message.text}</span>
              </div>
          </div>
        `;
            const link = `
      <div style="padding: 10px; background-color: #003375">
          <div style="padding: 10px; background-color: white;">
              <h4 style="color: #0085ff">Hello <3</h4>
              <p>Click to <a style="color: black" href="${message.text}">${message.subject}</a></p>
          </div>
      </div>
    `;
            const mainOptions = {
                from: emailConfig.auth.user,
                to: mailSendTo,
                subject: message.subject,
                text: "Your text is here",
                html: content,
            };
            if (type == TypeEmail.LINK) {
                mainOptions.html = link;
            }

            await this.transporter.sendMail(mainOptions);
        } catch (error) {
            console.log(error);
        }
    }

    async sendMailVerify(mailSendTo: string, verifyEmailToken: string) {
        const message = {
            subject: "Verify your account",
            text: process.env.CLIENT as string + "/verify/" + verifyEmailToken,
        };
        await this.sendMail(mailSendTo, message, TypeEmail.LINK);
    }

    async sendMailForgotPassword(mailSendTo: string, forgotPasswordToken: string) {
        const message = {
            subject: "Reset your password",
            text: (process.env.CLIENT as string) + "/reset/" + forgotPasswordToken,
        };
        await this.sendMail(mailSendTo, message, TypeEmail.LINK);
    }
}

const mailService = new MailService();
export default mailService