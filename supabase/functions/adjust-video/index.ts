import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, currentScript, userRequest, projectTheme, metadata } = await req.json();
    
    console.log('Adjusting video:', videoId);
    console.log('User request:', userRequest);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const voiceConfig = metadata?.voice_config || { type: 'alloy', tone: 'neutral' };
    const videoConfig = metadata?.video_config || { type: 'real', hasSubtitles: true };

    // Call Lovable AI to adjust the script
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            
Tu dois modifier un script de vidéo courte selon les demandes de l'utilisateur.

Contexte du projet:
- Thème: ${projectTheme || 'Non spécifié'}
- Type de voix: ${voiceConfig.type} avec un ton ${voiceConfig.tone}
- Type de vidéo: ${videoConfig.type === 'real' ? 'vidéo réelle en arrière-plan' : 'vidéo générée par IA'}
- Sous-titres: ${videoConfig.hasSubtitles ? 'activés' : 'désactivés'}

Script actuel:
${currentScript}

RÈGLES IMPORTANTES:
1. Garde le format [HOOK], [BODY], [CTA] si présent
2. Conserve la même durée approximative
3. Applique EXACTEMENT les modifications demandées
4. Le contenu doit rester viral et engageant
5. Réponds en français

Format de réponse:
- Commence par une brève explication de ce que tu as modifié (1-2 phrases)
- Ensuite écris "---SCRIPT---" sur une nouvelle ligne
- Puis le nouveau script complet`
          },
          {
            role: 'user',
            content: `Modification demandée: ${userRequest}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes, veuillez réessayer dans quelques instants' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits IA épuisés' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the response to extract message and updated script
    let message = aiResponse;
    let updatedScript = null;

    if (aiResponse.includes('---SCRIPT---')) {
      const parts = aiResponse.split('---SCRIPT---');
      message = parts[0].trim();
      updatedScript = parts[1].trim();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message,
        updatedScript
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in adjust-video:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
