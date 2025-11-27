import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { platform } = await req.json();

    if (!['youtube', 'tiktok', 'instagram'].includes(platform)) {
      throw new Error('Invalid platform');
    }

    // URLs OAuth de base (à configurer avec vos vrais clients OAuth)
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;
    
    let authUrl = '';
    
    switch (platform) {
      case 'youtube':
        // YouTube OAuth - nécessite YOUTUBE_CLIENT_ID
        const youtubeClientId = Deno.env.get('YOUTUBE_CLIENT_ID');
        if (!youtubeClientId) {
          throw new Error('YouTube OAuth non configuré');
        }
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${youtubeClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=https://www.googleapis.com/auth/youtube.upload&` +
          `state=${user.id}:youtube&` +
          `access_type=offline`;
        break;
        
      case 'tiktok':
        // TikTok OAuth - nécessite TIKTOK_CLIENT_KEY
        const tiktokClientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
        if (!tiktokClientKey) {
          throw new Error('TikTok OAuth non configuré');
        }
        authUrl = `https://www.tiktok.com/v2/auth/authorize?` +
          `client_key=${tiktokClientKey}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=video.upload&` +
          `state=${user.id}:tiktok`;
        break;
        
      case 'instagram':
        // Instagram OAuth - nécessite INSTAGRAM_CLIENT_ID
        const instagramClientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
        if (!instagramClientId) {
          throw new Error('Instagram OAuth non configuré');
        }
        authUrl = `https://api.instagram.com/oauth/authorize?` +
          `client_id=${instagramClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=instagram_basic,instagram_content_publish&` +
          `response_type=code&` +
          `state=${user.id}:instagram`;
        break;
    }

    return new Response(
      JSON.stringify({ authUrl }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in oauth-connect:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
