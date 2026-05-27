"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const validatedFields = resetPasswordSchema.safeParse({ token, password });

  if (!validatedFields.success) {
    return { error: "Invalid password format (must be at least 6 characters)." };
  }

  try {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
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
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Update the user
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashed },
    });

    // Clean up all tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetRecord.userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Something went wrong while resetting your password." };
  }
}
