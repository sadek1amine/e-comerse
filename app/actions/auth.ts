'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

/**
 * Helper to build Supabase Client in Server Actions
 * Using Next.js 15 async cookies
 */
async function getSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Handled server component write limitation gracefully
        }
      },
    },
  });
}

/**
 * Register Customer Server Action
 */
export async function signUpAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const preferredLanguage = (formData.get('lang') || 'ar') as 'ar' | 'en';

  if (!email || !password) {
    return { error: 'Email and password are required fields.' };
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        preferred_language: preferredLanguage,
        role: 'customer' // Enforced at trigger level, but verified here
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Verification email sent. Please check your inbox.' };
}

/**
 * Standard Email & Password Login Server Action
 */
export async function loginWithPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both your email and password.' };
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to account dashboard on successful authentication
  redirect('/account');
}

/**
 * Passwordless Magic Link Login Server Action
 */
export async function loginWithMagicLinkAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email address is required.' };
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Magic Link successfully sent to your email.' };
}

/**
 * Log Out Server Action
 */
export async function signOutAction() {
  const supabase = await getSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * OAuth Provider Initiation (returns redirect URL to calling flow)
 */
export async function signInWithOAuthAction(provider: 'google' | 'apple') {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  });

  if (error) {
    throw new Error(`OAuth initiation failed: ${error.message}`);
  }

  if (data?.url) {
    redirect(data.url);
  }
}
