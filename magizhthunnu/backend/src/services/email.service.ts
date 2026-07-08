import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'],
  port: Number(process.env['SMTP_PORT'] ?? 587),
  auth: { user: process.env['SMTP_USER'], pass: process.env['SMTP_PASS'] },
});

export const sendVerificationEmail = async (to: string, link: string): Promise<void> => {
  await transporter.sendMail({
    from: process.env['EMAIL_FROM'] ?? 'no-reply@magizhthunnu.in',
    to,
    subject: 'Verify your Magizhthunnu account',
    html: `<p>Click the link below to verify your email address:</p><p><a href="${link}">${link}</a></p>`,
  });
  logger.info(`Verification email sent to ${to}`);
};