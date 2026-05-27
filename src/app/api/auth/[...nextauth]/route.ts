import NextAuth from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export const GET = async (req: NextRequest, props: { params: Promise<{ nextauth: string[] }> }) => {
  const params = await props.params;
  return handler(req, { params });
};

export const POST = async (req: NextRequest, props: { params: Promise<{ nextauth: string[] }> }) => {
  const params = await props.params;
  return handler(req, { params });
};
