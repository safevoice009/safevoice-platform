// src/js/supabase-client.js
// Supabase client helper for SafeVoice (optional, client-side only)
// Usage:
//   await initSupabase(supabaseUrl, supabaseAnonKey)
//   await insertPost(postObject)

let supabaseClient = null;

export async function initSupabase(url, anonKey) {
  if (!url || !anonKey) throw new Error('Supabase URL and anon key are required');
  // dynamic import of supabase-js ESM bundle
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabaseClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { 'x-client-platform': 'safevoice-web' } }
    });
    return supabaseClient;
  } catch (err) {
    console.error('Failed to load Supabase client', err);
    throw err;
  }
}

export async function insertPost(post) {
  if (!supabaseClient) throw new Error('Supabase client not initialized');
  // minimal privacy: do NOT attach wallet addresses or IP addresses.
  // Accept an object: { id, college, category, content, isMemorial, memorialName, memorialMsg, createdAt, ipfs }
  const safePost = {
    id: post.id,
    college: post.college || 'Unknown',
    category: post.category || 'other',
    content: post.content || '',
    is_memorial: !!post.isMemorial,
    memorial_name: post.memorialName || null,
    memorial_msg: post.memorialMsg || null,
    created_at: post.createdAt || new Date().toISOString(),
    ipfs: post.ipfs || null
  };
  try {
    const { data, error } = await supabaseClient.from('posts').insert([safePost]);
    if (error) {
      console.warn('Supabase insert error', error);
      return { error };
    }
    return { data };
  } catch (err) {
    console.error('Supabase insert failed', err);
    return { error: err };
  }
}