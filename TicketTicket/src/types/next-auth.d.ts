import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      dbId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    dbId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    dbUserId?: string
    provider?: string
    providerAccountId?: string
  }
}
