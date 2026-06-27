import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

async function revokeGitHubOAuthGrant(accessToken: string) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`https://api.github.com/applications/${clientId}/grant`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify({ access_token: accessToken })
  });

  if (!res.ok && res.status !== 404) {
    console.warn(`Failed to revoke GitHub OAuth grant: ${res.status} ${res.statusText}`);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email',
          // GitHub supports prompt=select_account to force an account picker on every OAuth login.
          prompt: 'select_account'
        }
      }
    })
  ],
  events: {
    async signIn({ account }) {
      if (account?.provider !== 'github' || typeof account.access_token !== 'string') {
        return;
      }

      try {
        await revokeGitHubOAuthGrant(account.access_token);
      } catch (error) {
        console.warn('Failed to revoke GitHub OAuth grant:', error);
      }
    }
  },
  callbacks: {
    async session({ session, token }) {
      // Attach GitHub user id to session
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
});

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
