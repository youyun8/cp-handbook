import { auth } from '@/lib/auth';
import { isStaticExport } from '@/lib/runtime';
import { NextResponse } from 'next/server';

// GET: load progress from GitHub Gist
export async function GET() {
  if (isStaticExport) {
    return NextResponse.json({ data: null });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_GIST_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    // List gists to find cp-handbook progress gist
    const listRes = await fetch('https://api.github.com/gists', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });
    const gists: Array<{ id: string; description: string; files: Record<string, unknown> }> =
      await listRes.json();
    const target = gists.find((g) => g.description === `cp-handbook-progress-${session.user.id}`);

    if (!target) {
      return NextResponse.json({ data: null }); // No saved progress yet
    }

    const gistRes = await fetch(`https://api.github.com/gists/${target.id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    const gist = await gistRes.json();
    const content = (gist.files['progress.json'] as { content: string } | undefined)?.content;
    return NextResponse.json({ data: content ? JSON.parse(content) : null });
  } catch {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

// POST: save progress to GitHub Gist
export async function POST(req: Request) {
  if (isStaticExport) {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 501 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_GIST_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const body = await req.json();
  const content = JSON.stringify({
    ...body,
    userId: session.user.id,
    updatedAt: new Date().toISOString()
  });

  try {
    // Check if gist already exists
    const listRes = await fetch('https://api.github.com/gists', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    const gists: Array<{ id: string; description: string }> = await listRes.json();
    const existing = gists.find((g) => g.description === `cp-handbook-progress-${session.user.id}`);

    const method = existing ? 'PATCH' : 'POST';
    const url = existing
      ? `https://api.github.com/gists/${existing.id}`
      : 'https://api.github.com/gists';

    const saveRes = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: `cp-handbook-progress-${session.user.id}`,
        public: false,
        files: { 'progress.json': { content } }
      })
    });

    if (!saveRes.ok) throw new Error(`GitHub API error: ${saveRes.status}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
