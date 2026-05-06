import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserById } from '@/lib/db/userActions';

export type SessionUser = { id: string; email: string; role: string; onboarded: boolean };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const u = session.user as Record<string, unknown>;
  const id = u.id as string | undefined;
  const email = u.email as string | undefined;
  if (!id || !email) return null;

  // Sempre rilegge dal DB — evita JWT stale dopo cambio ruolo
  const dbUser = await getUserById(id);
  if (!dbUser) return null;

  return { id, email, role: dbUser.role, onboarded: dbUser.onboarded };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');

  if (!user.onboarded) {
    if (user.role === 'pending_dm') redirect('/onboarding/pending');
    if (user.role === 'rejected') redirect('/onboarding/rejected');
    redirect('/onboarding');
  }

  return user;
}

export async function requireDm(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'dm' && user.role !== 'superadmin') redirect('/my-character');
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'superadmin') redirect('/');
  return user;
}

export async function requirePlayer(): Promise<SessionUser> {
  const user = await requireAuth();
  return user;
}
