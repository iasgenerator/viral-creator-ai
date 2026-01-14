import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction pour générer des hashtags basés sur le script
function generateHashtags(script: string, theme: string): string[] {
  const hashtags = ['#viral', '#shorts'];
  
  // Ajouter des hashtags basés sur le thème
  const themeWords = theme.toLowerCase().split(' ');
  themeWords.forEach(word => {
    if (word.length > 3) {
      hashtags.push(`#${word.replace(/[^a-z0-9]/g, '')}`);
    }
  });
  
  // Extraire des mots-clés du script
  const keywords = script.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 5)
    .slice(0, 3);
  
  keywords.forEach(word => {
    const cleaned = word.replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 3) {
      hashtags.push(`#${cleaned}`);
    }
  });
  
  return [...new Set(hashtags)].slice(0, 10);
}

// Fonction pour rafraîchir le token OAuth
async function refreshAccessToken(
  platform: string,
  refreshToken: string,
  connectionId: string,
  supabase: any
): Promise<string | null> {
  try {
    let tokenUrl = '';
    let clientId = '';
    let clientSecret = '';
    
    switch (platform) {
      case 'youtube':
        tokenUrl = 'https://oauth2.googleapis.com/token';
        clientId = Deno.env.get('YOUTUBE_CLIENT_ID') || '';
        clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET') || '';
        break;
      case 'tiktok':
        tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        clientId = Deno.env.get('TIKTOK_CLIENT_KEY') || '';
        clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET') || '';
        break;
      case 'instagram':
        tokenUrl = 'https://graph.instagram.com/refresh_access_token';
        clientId = Deno.env.get('INSTAGRAM_CLIENT_ID') || '';
        clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET') || '';
        break;
      default:
        return null;
    }
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    
    if (!response.ok) {
      console.error(`Failed to refresh ${platform} token:`, await response.text());
      return null;
    }
    
    const data = await response.json();
    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in;
    
    // Mettre à jour le token dans la base de données
    await supabase
      .from('platform_connections')
      .update({
        access_token: newAccessToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);
    
    return newAccessToken;
  } catch (error) {
    console.error(`Error refreshing ${platform} token:`, error);
    return null;
  }
}

// Vérifier et rafraîchir le token si nécessaire
async function ensureValidToken(connection: any, supabase: any): Promise<string> {
  const now = new Date();
  const expiresAt = connection.expires_at ? new Date(connection.expires_at) : null;
  
  // Si le token expire dans moins de 5 minutes, le rafraîchir
  if (expiresAt && expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log(`Token for ${connection.platform} expiring soon, refreshing...`);
    const newToken = await refreshAccessToken(
      connection.platform,
      connection.refresh_token,
      connection.id,
      supabase
    );
    
    return newToken || connection.access_token;
  }
  
  return connection.access_token;
}

// Publier sur YouTube
async function publishToYouTube(
  videoUrl: string,
  title: string,
  description: string,
  hashtags: string[],
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const videoDescription = `${description}\n\n${hashtags.join(' ')}`;
    
    // 1. Télécharger la vidéo depuis l'URL
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();
    
    // 2. Upload la vidéo sur YouTube
    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary=boundary',
        },
        body: createMultipartBody({
          snippet: {
            title: title,
            description: videoDescription,
            categoryId: '22', // People & Blogs
            tags: hashtags.map(h => h.replace('#', '')),
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          }
        }, videoBlob)
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error(`YouTube upload failed: ${await uploadResponse.text()}`);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Publier sur TikTok
async function publishToTikTok(
  videoUrl: string,
  title: string,
  hashtags: string[],
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const caption = `${title}\n\n${hashtags.join(' ')}`;
    
    // 1. Initialiser l'upload
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: title,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: 0, // Will be filled by TikTok
        }
      })
    });
    
    if (!initResponse.ok) {
      throw new Error(`TikTok init failed: ${await initResponse.text()}`);
    }
    
    const initData = await initResponse.json();
    
    // 2. Upload la vidéo
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();
    
    const uploadResponse = await fetch(initData.data.upload_url, {
      method: 'PUT',
      body: videoBlob,
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`TikTok upload failed: ${await uploadResponse.text()}`);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Publier sur Instagram
async function publishToInstagram(
  videoUrl: string,
  caption: string,
  hashtags: string[],
  accessToken: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fullCaption = `${caption}\n\n${hashtags.join(' ')}`;
    
    // 1. Créer le conteneur média
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: videoUrl,
          caption: fullCaption,
          access_token: accessToken,
        })
      }
    );
    
    if (!containerResponse.ok) {
      throw new Error(`Instagram container creation failed: ${await containerResponse.text()}`);
    }
    
    const containerData = await containerResponse.json();
    const creationId = containerData.id;
    
    // 2. Attendre que la vidéo soit prête
    let status = 'IN_PROGRESS';
    let attempts = 0;
    while (status === 'IN_PROGRESS' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(
        `https://graph.facebook.com/v18.0/${creationId}?fields=status_code&access_token=${accessToken}`
      );
      
      const statusData = await statusResponse.json();
      status = statusData.status_code;
      attempts++;
    }
    
    if (status !== 'FINISHED') {
      throw new Error(`Instagram video processing failed with status: ${status}`);
    }
    
    // 3. Publier la vidéo
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        })
      }
    );
    
    if (!publishResponse.ok) {
      throw new Error(`Instagram publish failed: ${await publishResponse.text()}`);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helper pour créer un corps multipart
function createMultipartBody(metadata: any, videoBlob: Blob): string {
  const boundary = 'boundary';
  let body = '';
  
  body += `--${boundary}\r\n`;
  body += 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
  body += JSON.stringify(metadata);
  body += '\r\n';
  
  body += `--${boundary}\r\n`;
  body += 'Content-Type: video/mp4\r\n\r\n';
  body += videoBlob;
  body += '\r\n';
  
  body += `--${boundary}--`;
  
  return body;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking for videos to publish...');

    // Find videos scheduled for now
    const now = new Date();
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(`
        *,
        projects!inner(user_id, title, theme)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())
      .limit(50);

    if (videosError) throw videosError;

    console.log(`Found ${videos?.length || 0} videos to publish`);

    if (!videos || videos.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No videos to publish at this time', processed: 0, results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const video of videos) {
      try {
        console.log(`Processing video ${video.id}`);

        // Get platform connections for user with decrypted tokens
        const { data: connections, error: connectionsError } = await supabase
          .rpc('get_user_decrypted_connections', { p_user_id: video.projects.user_id });

        if (connectionsError) throw connectionsError;

        if (!connections || connections.length === 0) {
          console.log(`No platform connections found for user ${video.projects.user_id}`);
          
          await supabase
            .from('videos')
            .update({
              status: 'failed',
              error_message: 'No platform connections configured'
            })
            .eq('id', video.id);

          results.push({
            videoId: video.id,
            status: 'failed',
            reason: 'No platform connections'
          });
          continue;
        }

        // Générer les hashtags
        const hashtags = generateHashtags(
          video.script || video.projects.title,
          video.projects.theme
        );
        
        console.log(`Generated hashtags: ${hashtags.join(', ')}`);

        // Publish to each connected platform
        const publishResults = [];
        for (const platform of video.platforms) {
          const connection = connections.find((c: any) => c.platform === platform);
          
          if (!connection) {
            console.log(`No connection for ${platform}`);
            publishResults.push({ platform, status: 'skipped', reason: 'not connected' });
            continue;
          }

          // Ensure token is valid
          const accessToken = await ensureValidToken(connection, supabase);
          
          let result: any = { platform, status: 'failed', error: 'Unknown error' };
          
          try {
            switch (platform) {
              case 'youtube':
                const ytResult = await publishToYouTube(
                  video.video_url,
                  video.projects.title,
                  video.script || video.projects.theme,
                  hashtags,
                  accessToken
                );
                result = { platform, status: ytResult.success ? 'success' : 'failed', error: ytResult.error || 'Unknown error' };
                break;
                
              case 'tiktok':
                const ttResult = await publishToTikTok(
                  video.video_url,
                  video.projects.title,
                  hashtags,
                  accessToken
                );
                result = { platform, status: ttResult.success ? 'success' : 'failed', error: ttResult.error || 'Unknown error' };
                break;
                
              case 'instagram':
                const igResult = await publishToInstagram(
                  video.video_url,
                  video.projects.title,
                  hashtags,
                  accessToken,
                  connection.account_id || ''
                );
                result = { platform, status: igResult.success ? 'success' : 'failed', error: igResult.error || 'Unknown error' };
                break;
            }
          } catch (error: any) {
            result = { platform, status: 'failed', error: error.message };
          }
          
          console.log(`${platform} publish result:`, result);
          publishResults.push(result);
        }

        // Calculate revenue by platform (simulated for now)
        const revenueByPlatform = {
          tiktok: 0,
          instagram: 0,
          youtube: 0
        };

        publishResults.forEach(result => {
          if (result.status === 'success') {
            const simulatedRevenue = Math.random() * 45 + 5;
            revenueByPlatform[result.platform as keyof typeof revenueByPlatform] = parseFloat(simulatedRevenue.toFixed(2));
          }
        });

        // Update video status
        await supabase
          .from('videos')
          .update({
            status: 'published',
            published_at: now.toISOString(),
            metadata: {
              ...video.metadata,
              publish_results: publishResults,
              revenue: revenueByPlatform,
              hashtags: hashtags
            }
          })
          .eq('id', video.id);

        results.push({
          videoId: video.id,
          status: 'published',
          platforms: publishResults
        });
      } catch (error: any) {
        console.error(`Error publishing video ${video.id}:`, error);
        
        await supabase
          .from('videos')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', video.id);

        results.push({
          videoId: video.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in publish-videos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
