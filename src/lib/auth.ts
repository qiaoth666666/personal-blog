import NextAuth from 'next-auth'
import { compare } from 'bcryptjs'
import { queryOne } from '@/lib/db'
import type { User } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    // 绕过 Credentials() 包装 — NextAuth v5 beta.31 的 Credentials()
    // 将 authorize 放入 options 而非 provider 顶层，导致始终返回 null
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await queryOne<User & RowDataPacket>(
            'SELECT * FROM `User` WHERE username = ?',
            [credentials.username],
          )

          if (!user) {
            return null
          }

          const isValid = await compare(credentials.password, user.password)

          if (!isValid) {
            return null
          }

          return {
            id: user.id.toString(),
            name: user.username,
          }
        } catch {
          return null
        }
      },
    } as any,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
