import { randomUUID } from "crypto";
import { createClient, type User as SupabaseAuthUser } from "@supabase/supabase-js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function createSupabaseAdminClient() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export async function findAuthUserByEmail(email: string): Promise<SupabaseAuthUser | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail) || null;
    if (match) {
      return match;
    }

    if (data.users.length < 100) {
      break;
    }
  }

  return null;
}

export async function ensureAuthUser(params: {
  email: string;
  name: string;
  password?: string;
  mustChangePassword?: boolean;
}): Promise<SupabaseAuthUser> {
  const { email, name, password, mustChangePassword = false } = params;
  const supabaseAdmin = createSupabaseAdminClient();
  const normalizedEmail = email.toLowerCase();

  const existingUser = await findAuthUserByEmail(normalizedEmail);
  if (existingUser) {
    if (password) {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password,
        user_metadata: {
          ...(existingUser.user_metadata || {}),
          full_name: name,
          must_change_password: mustChangePassword,
        },
      });

      if (error) {
        throw new Error(`Failed to update auth user: ${error.message}`);
      }

      return data.user;
    }

    return existingUser;
  }

  const generatedPassword = password || `${randomUUID()}Aa1!`;
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password: generatedPassword,
    email_confirm: true,
    user_metadata: {
      full_name: name,
      must_change_password: mustChangePassword,
    },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create auth user: ${error?.message || "Unknown error"}`);
  }

  return data.user;
}

export async function generateSetPasswordLink(params: {
  email: string;
  redirectTo: string;
}): Promise<string> {
  const { email, redirectTo } = params;
  const supabaseAdmin = createSupabaseAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: email.toLowerCase(),
    options: { redirectTo },
  });

  if (error) {
    throw new Error(`Failed to generate set-password link: ${error.message}`);
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    throw new Error("Failed to generate set-password link: empty action link");
  }

  return actionLink;
}