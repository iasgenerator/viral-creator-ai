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
        projects!inner(user_id)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())
      .limit(50);

    if (videosError) throw videosError;

    console.log(`Found ${videos?.length || 0} videos to publish`);

    if (!videos || videos.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No videos to publish at this time' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const video of videos) {
      try {
        console.log(`Processing video ${video.id}`);

        // Get platform connections for user
        const { data: connections, error: connectionsError } = await supabase
          .from('platform_connections')
          .select('*')
          .eq('user_id', video.projects.user_id)
          .eq('is_active', true);

        if (connectionsError) throw connectionsError;

        if (!connections || connections.length === 0) {
          console.log(`No platform connections found for user ${video.projects.user_id}`);
          
          // Update video status to failed
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

        // Publish to each connected platform
        const publishResults = [];
        for (const platform of video.platforms) {
          const connection = connections.find(c => c.platform === platform);
          
          if (!connection) {
            console.log(`No connection for ${platform}`);
            publishResults.push({ platform, status: 'skipped', reason: 'not connected' });
            continue;
          }

          // TODO: Implement actual platform publishing
          // For now, we'll simulate success and generate random revenue
          console.log(`Would publish to ${platform} for account ${connection.account_name}`);
          
          // Simulate revenue generation (between 5-50€ per video per platform)
          const simulatedRevenue = Math.random() * 45 + 5;
          
          publishResults.push({ 
            platform, 
            status: 'success',
            revenue: parseFloat(simulatedRevenue.toFixed(2))
          });
        }

        // Calculate revenue by platform
        const revenueByPlatform = {
          tiktok: 0,
          instagram: 0,
          youtube: 0
        };

        publishResults.forEach(result => {
          if (result.status === 'success' && result.revenue) {
            revenueByPlatform[result.platform as keyof typeof revenueByPlatform] = result.revenue;
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
              revenue: revenueByPlatform
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
        
        // Update video status to failed
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