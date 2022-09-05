import { NextApiHandler } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);
export default authHandler;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'youremail@example.com',
          autocomplete: 'current-password',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.passwordHash) return null; // user not yet registered or not yet registered with password

        const passwordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (passwordCorrect) {
          user.passwordHash = ''; // not sure if this is really necessary
          return user;
        }

        return null;
      },
    }),
  ],
  session: {
    // need to use JWT for storing sessions, otherwise CredentialsProvider won't fire session callback - see https://github.com/nextauthjs/next-auth/issues/3970
    // could also implement workaround for using strategy: 'database', but don't care at this point - see https://github.com/nextauthjs/next-auth/discussions/4394#discussioncomment-3293618
    // NOTE: for now, DON'T change this to 'database'; withAuth() Middleware only works with 'jwt'! https://next-auth.js.org/tutorials/securing-pages-and-api-routes#nextjs-middleware
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
};
