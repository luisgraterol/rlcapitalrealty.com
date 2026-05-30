const SUPABASE_URL      = '%%SUPABASE_URL%%';
const SUPABASE_ANON_KEY = '%%SUPABASE_ANON_KEY%%';

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirect to /auth/login.html if no active session. Returns session if valid.
async function requireAuth() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) {
    window.location.replace('/auth/login.html');
    return null;
  }
  return session;
}

// Redirect to /admin.html if a session already exists (used on login page).
async function redirectIfLoggedIn() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (session) window.location.replace('/admin.html');
}

async function logout() {
  await window.supabaseClient.auth.signOut();
  window.location.replace('/auth/login.html');
}
