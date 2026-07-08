import { logger } from '../config/logger';

export const sendOtpSms = async (mobile: string, otp: string): Promise<void> => {
  // No SMS gateway wired up yet — log instead of sending.
  // Swap this body for a real provider call (Twilio/MSG91/etc.) when one is chosen;
  // callers only depend on this function's signature.
  logger.info(`OTP for ${mobile}: ${otp}`);
  await Promise.resolve();
};