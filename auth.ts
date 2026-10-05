import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { allowedIdentity } from './lib/auth-policy';

const providers = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub] : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : []),
];
export const loginReady = () => Boolean(process.env.AUTH_SECRET && providers.length);
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  callbacks: {
    signIn({ account, profile }) {
      return Boolean(account && allowedIdentity(`${account.provider}:${account.providerAccountId}`, profile?.email, profile?.email_verified));
    },
    jwt({ token, account, profile }) {
      if (account) {
        token.owner = `${account.provider}:${account.providerAccountId}`;
        token.verifiedEmail = profile?.email_verified === true;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = allowedIdentity(token.owner, token.email, token.verifiedEmail) ? String(token.owner) : '';
      return session;
    },
  },
});

export async function currentOwner() {
  if (!loginReady()) return undefined;
  return (await auth())?.user?.id || undefined;
}
