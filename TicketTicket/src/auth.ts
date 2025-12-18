import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Line from "next-auth/providers/line"
import Discord from "next-auth/providers/discord"
import { supabaseAdmin } from "@/lib/supabase"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Line({
      clientId: process.env.AUTH_LINE_ID,
      clientSecret: process.env.AUTH_LINE_SECRET,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return true;

      try {
        // 檢查用戶是否已存在
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('provider', account.provider)
          .eq('provider_id', account.providerAccountId)
          .single();

        if (!existingUser) {
          // 新用戶，插入資料庫
          await supabaseAdmin.from('users').insert({
            email: user.email,
            username: user.name || user.email.split('@')[0],
            avatar_url: user.image,
            provider: account.provider,
            provider_id: account.providerAccountId,
          });
        } else {
          // 更新頭像和名稱
          await supabaseAdmin
            .from('users')
            .update({
              username: user.name || user.email.split('@')[0],
              avatar_url: user.image,
              updated_at: new Date().toISOString(),
            })
            .eq('provider', account.provider)
            .eq('provider_id', account.providerAccountId);
        }
      } catch (error) {
        console.error('Error syncing user to database:', error);
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.dbUserId) {
        session.user.dbId = token.dbUserId as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;

        // 獲取資料庫中的用戶ID
        try {
          const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('provider', account.provider)
            .eq('provider_id', account.providerAccountId)
            .single();

          if (dbUser) {
            token.dbUserId = dbUser.id;
          }
        } catch (error) {
          console.error('Error fetching user from database:', error);
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});
