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
              content: `Tu es un expert en création de contenu viral pour les réseaux sociaux. 
              Tu crées des scripts captivants pour des vidéos courtes (TikTok, Instagram Reels, YouTube Shorts).
              
              Règles importantes:
              - Le script doit être accrocheur dès les 3 premières secondes
              - Utilise des phrases courtes et percutantes
              - Ajoute des éléments de surprise ou d'émotion
              - Termine avec un appel à l'action (CTA) fort
              - Adapte le ton au thème (humoristique, éducatif, inspirant, etc.)
              - Le script doit durer exactement ${project.duration} secondes quand lu à voix haute`
            },
            {
              role: 'user',
              content: `Crée un script viral unique sur ce thème: ${project.theme}
              
              Description: ${project.description}
              Durée: ${project.duration} secondes
              Plateforme: ${project.platform}
              
              Format du script:
              [HOOK - 3 secondes]: phrase d'accroche ultra percutante
              [CORPS - ${project.duration - 8} secondes]: contenu principal avec 2-3 points clés
              [CTA - 5 secondes]: appel à l'action engageant
              
              Rends ce script #${i + 1} complètement différent des précédents!`
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
            generated_at: new Date().toISOString()
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