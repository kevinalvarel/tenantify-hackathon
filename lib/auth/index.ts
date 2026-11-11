import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { db } from "@/drizzle";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema },
  }),
  baseURL: process.env.BASE_URL || process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: ["developer", "association"],
      roles: {
        developer: adminAc,
        association: adminAc,
        seller: userAc,
        customer: userAc,
      },
    }),
    nextCookies(),
  ],
});
