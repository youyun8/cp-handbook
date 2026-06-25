'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="rounded-xl px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
    >
      登出
    </button>
  );
}
