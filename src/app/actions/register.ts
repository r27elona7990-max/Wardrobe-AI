"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export async function registerUser(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const validatedFields = registerSchema.safeParse({
    email,
    password,
    name,
  });

  if (!validatedFields.success) {
    return { error: "Invalid input fields." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists." };
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong during registration." };
  }
}
