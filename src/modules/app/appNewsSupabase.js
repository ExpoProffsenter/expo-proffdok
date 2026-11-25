// Expo ProffDok – FASE 28D2
// Supabase-kall for systemnyheter og brukerens "Ikke vis igjen".
// RLS er sikkerhetsgrensen; komponentene inneholder kun UI/dataflyt.

export function fetchLatestActiveAppNews(client) {
  return client
    .from("app_news")
    .select("id,title,message,active,published_at,created_at")
    .eq("active", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export function fetchAppNewsDismissal(client, userId, newsId) {
  return client
    .from("app_news_dismissals")
    .select("news_id,user_id,dismissed_at")
    .eq("user_id", userId)
    .eq("news_id", newsId)
    .maybeSingle();
}

export function dismissAppNews(client, userId, newsId) {
  return client.from("app_news_dismissals").insert({
    user_id: userId,
    news_id: newsId,
  });
}

export function fetchAllAppNews(client) {
  return client
    .from("app_news")
    .select("id,title,message,active,published_at,created_at,updated_at,created_by")
    .order("published_at", { ascending: false })
    .limit(30);
}

export function publishAppNews(client, { title, message, createdBy }) {
  const now = new Date().toISOString();
  return client
    .from("app_news")
    .insert({
      title,
      message,
      active: true,
      published_at: now,
      created_by: createdBy,
      updated_at: now,
    })
    .select("id,title,message,active,published_at,created_at,updated_at,created_by")
    .single();
}

export function setAppNewsActive(client, newsId, active) {
  const now = new Date().toISOString();
  const patch = {
    active: Boolean(active),
    updated_at: now,
  };

  // Reaktivering betyr bevisst republisering og gjør nyheten til nyeste aktive nyhet.
  if (active) patch.published_at = now;

  return client
    .from("app_news")
    .update(patch)
    .eq("id", newsId)
    .select("id,title,message,active,published_at,created_at,updated_at,created_by")
    .single();
}
