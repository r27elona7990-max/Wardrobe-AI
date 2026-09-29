type PasswordResetEmail = {
  to: string;
  resetLink: string;
};

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error(
      "Password reset email is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  }

  return { apiKey, from };
}

function logDevelopmentResetLink(to: string, resetLink: string, reason: string) {
  console.warn(
    [
      `Password reset email skipped in development: ${reason}`,
      `Recipient: ${to}`,
      `Reset link: ${resetLink}`,
    ].join("\n"),
  );
}

export async function sendPasswordResetEmail({
  to,
  resetLink,
}: PasswordResetEmail) {
  let config: ReturnType<typeof getEmailConfig>;

  try {
    config = getEmailConfig();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      logDevelopmentResetLink(
        to,
        resetLink,
        error instanceof Error ? error.message : "email is not configured.",
      );
      return;
    }

    throw error;
  }

  const { apiKey, from } = config;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your Wardrobe AI password",
        text: [
          "We received a request to reset your Wardrobe AI password.",
          "",
          `Reset your password: ${resetLink}`,
          "",
          "This link expires in 1 hour. If you did not request this, you can ignore this email.",
        ].join("\n"),
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717;">
            <h1 style="font-size: 24px;">Reset your password</h1>
            <p>We received a request to reset your Wardrobe AI password.</p>
            <p style="margin: 28px 0;">
              <a
                href="${resetLink}"
                style="background: #171717; color: #ffffff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;"
              >
                Reset password
              </a>
            </p>
            <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
            <p style="font-size: 12px; color: #737373; overflow-wrap: anywhere;">${resetLink}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Resend rejected the password reset email: ${details}`);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      logDevelopmentResetLink(
        to,
        resetLink,
        error instanceof Error ? error.message : "email could not be sent.",
      );
      return;
    }

    throw error;
  }
}
