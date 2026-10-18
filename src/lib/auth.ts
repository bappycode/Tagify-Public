import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { db, mongoClient } from "@/lib/db";
import { seedDemoAccount } from "@/server/demo";

export const auth = betterAuth({
  appName: "Tagify",
  database: mongodbAdapter(db, { client: mongoClient }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    async sendResetPassword({ user, url }) {
      console.info(`[auth] Password reset link for ${user.email}: ${url}`);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  account: {
    accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
  },

  user: {
    additionalFields: {
      companyName: { type: "string", required: false },
      website: { type: "string", required: false },
      phone: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "user", input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: (user) => seedDemoAccount(user.id),
      },
    },
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
