import type { AuthError, Session } from "@supabase/supabase-js";

import type { LoginInput, RegisterInput } from "@/features/auth/schema/schemas";
import { supabase } from "@/shared/lib/supabase";

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION") return;
    callback(session);
  });
}

const ERROR_MESSAGES: Record<string, string> = {
  "Email not confirmed": "Debes confirmar tu correo antes de iniciar sesión.",
  "Invalid login credentials": "Correo o contraseña incorrectos.",
};

function mapError(error: AuthError | null) {
  if (!error) return null;
  return new Error(ERROR_MESSAGES[error.message] ?? error.message);
}

export async function login({ email, password }: LoginInput) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return mapError(error);
}

export async function register({ name, email, password }: RegisterInput) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  return mapError(error);
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return error;
}
