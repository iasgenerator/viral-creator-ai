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

    const { projectId } = await req.json();
    console.log('Generating videos for project:', projectId);

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    console.log('Project details:', project);

    // Prepare voice and video configuration
    const voiceConfig = {
      type: project.voice_type || 'alloy',
      tone: project.voice_tone || 'neutral'
    };
    
    const videoConfig = {
      type: project.video_type || 'real',
      hasSubtitles: project.has_subtitles !== false
    };
    
    const contentLanguage = project.language || 'fr';
    const languageNames: Record<string, string> = {
      fr: 'français',
      en: 'English',
      es: 'español',
      de: 'Deutsch',
      it: 'italiano',
      pt: 'português',
      nl: 'Nederlands',
      pl: 'polski',
      ru: 'русский',
      ja: '日本語',
      zh: '中文',
      ar: 'العربية'
    };

    // Generate 10 videos with AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const videosToGenerate = 10;
    
    for (let i = 0; i < videosToGenerate; i++) {
      console.log(`Generating video ${i + 1}/${videosToGenerate}`);
      
      // Generate script with AI
      const scriptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are an expert in creating viral content for social media. 
              You create captivating scripts for short videos (TikTok, Instagram Reels, YouTube Shorts).
              
              CRITICAL: The entire script MUST be written in ${languageNames[contentLanguage] || contentLanguage}.
              
              Voice configuration: ${voiceConfig.type} with a ${voiceConfig.tone} tone
              Video type: ${videoConfig.type === 'real' ? 'real background video' : 'AI-generated video'}
              Subtitles: ${videoConfig.hasSubtitles ? 'enabled' : 'disabled'}
              
              Important rules:
              - The script must be catchy from the first 3 seconds
              - Use short and punchy sentences adapted to the ${voiceConfig.tone} tone
              - Add elements of surprise or emotion
              - End with a strong call to action (CTA)
              - Adapt the tone to the theme (${voiceConfig.tone})
              ${videoConfig.type === 'real' ? '- The script must accompany a real background video' : '- The script must describe scenes for an AI-generated video'}
              ${videoConfig.hasSubtitles ? '- The text will be displayed as subtitles, so favor short and readable sentences' : ''}
              - The script must last exactly ${project.duration} seconds when read aloud
              - WRITE EVERYTHING IN ${languageNames[contentLanguage] || contentLanguage}`
            },
            {
              role: 'user',
              content: `Create a unique viral script on this theme: ${project.theme}
              
              Description: ${project.description}
              Duration: ${project.duration} seconds
              Platform: ${project.platform}
              Language: ${languageNames[contentLanguage] || contentLanguage}
              
              Script format:
              [HOOK - 3 seconds]: ultra catchy opening line
              [BODY - ${project.duration - 8} seconds]: main content with 2-3 key points
              [CTA - 5 seconds]: engaging call to action
              
              IMPORTANT: Write the entire script in ${languageNames[contentLanguage] || contentLanguage}!
              Make this script #${i + 1} completely different from the previous ones!`
            }
          ],
          temperature: 1.0,
        }),
      });

      const scriptData = await scriptResponse.json();
      const script = scriptData.choices[0].message.content;

      // Determine platforms based on user selection
      let platforms: string[] = [];
      if (project.platform === 'both') {
        platforms = ['tiktok', 'instagram', 'youtube'];
      } else if (project.platform === 'tiktok') {
        platforms = ['tiktok', 'youtube'];
      } else if (project.platform === 'instagram') {
        platforms = ['instagram', 'youtube'];
      }

      // Calculate optimal publishing time (spread throughout the day)
      const now = new Date();
      const hoursToAdd = Math.floor(i * 2.4); // Spread 10 videos over 24 hours
      const scheduledTime = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);

      // Store video in database
      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          project_id: projectId,
          script: script,
          status: 'scheduled',
          scheduled_for: scheduledTime.toISOString(),
          platforms: platforms,
          metadata: {
            video_number: i + 1,
            total_videos: videosToGenerate,
            generated_at: new Date().toISOString(),
            voice_config: voiceConfig,
            video_config: videoConfig
          }
        });

      if (insertError) {
        console.error(`Error inserting video ${i + 1}:`, insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${videosToGenerate} vidéos générées et planifiées avec succès`,
        videosGenerated: videosToGenerate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-videos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});