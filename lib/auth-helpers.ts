import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserById } from '@/lib/db/userActions';
import type { User } from '@/lib/db/schema';

type SessionUser = { id: string; email: string; role: string; onboarded: boolean };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as Record<string, unknown>;
  return { id: u.id as string, email: u.email as string, role: u.role as string, onboarded: u.onboarded as boolean };
}

export async function requireAuth() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/sign-in');

  if (!sessionUser.onboarded) {
    if (sessionUser.role === 'pending_dm') redirect('/onboarding/pending');
    if (sessionUser.role === 'rejected') redirect('/onboarding/rejected');
    if (sessionUser.role !== 'superadmin') redirect('/onboarding');
  }

  return sessionUser;
}

export async function requireDm() {
  const user = await requireAuth();
  if (user.role !== 'dm' && user.role !== 'superadmin') redirect('/my-character');
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if (user.role !== 'superadmin') redirect('/');
  return user;
}

export async function requirePlayer() {
  const user = await requireAuth();
  if (user.role === 'dm' || user.role === 'superadmin') redirect('/');
  return user;
}
