"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  const validatedFields = forgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return a generic success message to prevent email enumeration
      return { success: true, message: "If an account with that email exists, we've sent a reset link." };
    }

    // Generate a secure crypto token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Clear any existing reset tokens for this user to invalidate old links
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Save the new token
    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Generate the reset link (relative to localhost for now)
    // In production, this should use the absolute URL from NEXTAUTH_URL or similar
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // IMPORTANT: Since we don't have an email provider, we will log it to the console
    console.log("=========================================");
    console.log("PASSWORD RESET REQUESTED FOR:", email);
    console.log("RESET LINK:", resetLink);
    console.log("=========================================");

    return { 
      success: true, 
      message: "Reset link has been generated.",
      devResetLink: resetLink // Exposing this in dev for easy testing
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Something went wrong while requesting a password reset." };
  }
}
