import { supabase } from './supabase';

export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.replace('/auth/login');
    return null;
  }
  return session;
}

export async function redirectIfLoggedIn() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) window.location.replace('/admin');
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.replace('/auth/login');
}
