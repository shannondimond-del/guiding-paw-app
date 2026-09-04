// Shared by create-program-checkout-session.js and
// create-membership-checkout-session.js — both need the same Stripe
// Customer for a given account, created once and reused for every future
// checkout (one-time or subscription) from that account.
export async function getOrCreateStripeCustomer(supabase, stripe, user) {
  const { data: userRow, error: userRowError } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (userRowError) throw userRowError;

  if (userRow?.stripe_customer_id) return userRow.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { supabase_user_id: user.id },
  });
  await supabase.from("users").upsert(
    { id: user.id, stripe_customer_id: customer.id },
    { onConflict: "id" }
  );
  return customer.id;
}
