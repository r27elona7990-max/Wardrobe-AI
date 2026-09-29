"use server";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});

function parseConfiguredBaseUrl(configuredUrl: string) {
  const normalizedConfiguredUrl = configuredUrl.trim().replace(/^["']|["']$/g, "");

  try {
    const url = new URL(normalizedConfiguredUrl);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url;
    }
  } catch {
    // Development accepts host-only values such as localhost:3000 below.
  }

  if (process.env.NODE_ENV !== "production") {
    return new URL(`http://${normalizedConfiguredUrl}`);
  }

  throw new Error("APP_URL or NEXTAUTH_URL must be a valid http(s) URL.");
}

function canUseLocalResetFallback(baseUrl: URL) {
  return (
    process.env.NODE_ENV !== "production" ||
    baseUrl.hostname === "localhost" ||
    baseUrl.hostname === "127.0.0.1" ||
    baseUrl.hostname.startsWith("192.168.") ||
    baseUrl.hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(baseUrl.hostname)
  );
}

async function getPasswordResetBaseUrl() {
  const configuredUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL;

  if (configuredUrl) {
    return parseConfiguredBaseUrl(configuredUrl);
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");

  if (host) {
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    return new URL(`${protocol}://${host}`);
  }

  if (process.env.NODE_ENV !== "production") {
    return new URL("http://localhost:3000");
  }

  throw new Error("Missing APP_URL or NEXTAUTH_URL.");
}

export async function requestPasswordReset(formData: FormData) {
  const emailValue = formData.get("email");
  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

  const validatedFields = forgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return { error: "Please enter a valid email address." };
  }

  const rateLimit = await enforceRateLimit("forgot-password", email, {
    limit: 4,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      success: true,
      message: "If an account with that email exists, we've sent a reset link.",
    };
  }

  try {
    const baseUrl = await getPasswordResetBaseUrl();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return a generic success message to prevent email enumeration
      return { success: true, message: "If an account with that email exists, we've sent a reset link." };
    }

    // Only the hash is stored, so a database leak cannot expose usable links.
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Clear any existing reset tokens for this user to invalidate old links
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Save the new token
    await prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        expiresAt,
        userId: user.id,
      },
    });

    const resetUrl = new URL("/reset-password", baseUrl);
    resetUrl.searchParams.set("token", token);

    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetLink: resetUrl.toString(),
      });
    } catch (error) {
      if (canUseLocalResetFallback(baseUrl)) {
        console.warn("Password reset email failed; using local reset link:", error);
        console.warn("Reset link:", resetUrl.toString());

        return {
          success: true,
          message: "Email delivery failed locally, but a reset link was generated.",
          devResetLink: resetUrl.toString(),
        };
      }

      // Do not leave a valid token behind if its email was never delivered.
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      throw error;
    }

    return {
      success: true,
      message: "If an account with that email exists, we've sent a reset link.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      error:
        "We couldn't send the reset email right now. Please try again shortly.",
    };
  }
}
