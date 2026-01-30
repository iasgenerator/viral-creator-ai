import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    const [userId, platform] = state.split(':');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let accessToken = '';
    let refreshToken = '';
    let expiresAt: string | null = null;
    let accountName = '';

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

    // Échange du code contre un access token selon la plateforme
    switch (platform) {
      case 'youtube': {
        const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
        const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');
        
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId!,
            client_secret: clientSecret!,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token;
        
        if (tokenData.expires_in) {
          const expiresDate = new Date();
          expiresDate.setSeconds(expiresDate.getSeconds() + tokenData.expires_in);
          expiresAt = expiresDate.toISOString();
        }

        // Récupérer le nom de la chaîne
        const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const channelData = await channelResponse.json();
        accountName = channelData.items?.[0]?.snippet?.title || 'Chaîne YouTube';
        break;
      }

      case 'tiktok': {
        const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
        const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');
        
        const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_key: clientKey!,
            client_secret: clientSecret!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
          })
        });

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.data?.access_token;
        refreshToken = tokenData.data?.refresh_token;
        
        if (tokenData.data?.expires_in) {
          const expiresDate = new Date();
          expiresDate.setSeconds(expiresDate.getSeconds() + tokenData.data.expires_in);
          expiresAt = expiresDate.toISOString();
        }

        accountName = 'Compte TikTok';
        break;
      }

      case 'instagram': {
        const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
        const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');
        
        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code
          })
        });

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
        accountName = tokenData.user?.username || 'Compte Instagram';
        break;
      }
    }

    // Encrypt tokens before storing
    const { data: encryptedAccessToken } = await supabaseClient
      .rpc('encrypt_token', { token: accessToken });
    
    const { data: encryptedRefreshToken } = refreshToken 
      ? await supabaseClient.rpc('encrypt_token', { token: refreshToken })
      : { data: null };

    // Save connection with encrypted tokens only
    const { error } = await supabaseClient
      .from('platform_connections')
      .insert({
        user_id: userId,
        platform,
        access_token_encrypted: encryptedAccessToken,
        refresh_token_encrypted: encryptedRefreshToken,
        expires_at: expiresAt,
        account_name: accountName,
        is_active: true
      });

    if (error) throw error;

    // Rediriger vers la page des connexions
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || '';
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/connections`
      }
    });

  } catch (error) {
    console.error('Error in oauth-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || '';
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/connections?error=${encodeURIComponent(errorMessage)}`
      }
    });
  }
});
