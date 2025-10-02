import { betterAuth } from "better-auth";
import { sendEmail } from "./services/emailService.js";
import { prismaAdapter } from "better-auth/adapters/prisma";

// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "./prisma/generated/prisma/index.js";
const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: ["https://projectflow.semantic.com.ar"],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      sendEmail(
        user.email,
        "Reset your password",
        `Click the link to reset your password: ${url}`,
      );
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    fields: {
      role: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "enum",
        enum: ["ADMIN", "USER"],
        default: "USER",
      },
    },
  },
});
