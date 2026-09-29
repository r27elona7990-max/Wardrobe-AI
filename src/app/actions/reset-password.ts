"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rateLimit";

const resetPasswordSchema = z.object({
  token: z.string().length(64),
  password: z.string().min(8).max(72),
});

export async function resetPassword(formData: FormData) {
  const tokenValue = formData.get("token");
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");
  const token = typeof tokenValue === "string" ? tokenValue : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const confirmPassword =
    typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const validatedFields = resetPasswordSchema.safeParse({ token, password });

  if (!validatedFields.success) {
    return { error: "Use a password between 8 and 72 characters." };
  }

  const rateLimit = await enforceRateLimit("reset-password", token.slice(0, 16), {
    limit: 6,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return { error: "Too many reset attempts. Please request a new link later." };
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!resetRecord) {
      return { error: "Invalid or expired reset token." };
    }

    if (new Date() > resetRecord.expiresAt) {
      // Delete the expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      });
      return { error: "This reset link has expired. Please request a new one." };
    }

    // Hash the new password
    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Something went wrong while resetting your password." };
  }
}
