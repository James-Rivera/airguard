import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = "airguard123";

const users = [
  {
    email: "homeowner@airguard.demo",
    name: "Homeowner",
    role: "homeowner",
  },
  {
    email: "safety@airguard.demo",
    name: "Safety Officer",
    role: "member",
  },
  {
    email: "admin@airguard.demo",
    name: "Administrator",
    role: "administrator",
  },
];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertAuthUser(seedUser) {
  const existing = await findUserByEmail(seedUser.email);
  const userMetadata = { name: seedUser.name, role: seedUser.role };

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      email: seedUser.email,
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: seedUser.email,
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (error) throw error;
  return data.user;
}

async function upsertProfile(authUser, seedUser) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: authUser.id,
      email: seedUser.email,
      name: seedUser.name,
      role: seedUser.role,
      onboarding_complete: false,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

for (const seedUser of users) {
  const authUser = await upsertAuthUser(seedUser);
  await upsertProfile(authUser, seedUser);
  console.log(`Seeded ${seedUser.email} as ${seedUser.role}`);
}

console.log("Demo users are ready.");
