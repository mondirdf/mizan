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
    const { user_id, week_start, week_end } = await req.json();
    
    console.log('weekly_reflect called with:', { user_id, week_start, week_end });

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock reflection data
    const response = {
      planned_hours: 14,
      actual_hours: 11.5,
      avg_focus: 4.1,
      best_time: "صباحاً (9-11)",
      ai_message: "أداء رائع هذا الأسبوع! لاحظت أنك أكثر إنتاجية في الصباح. حاول تخصيص المهام الصعبة لهذا الوقت.",
      daily_focus: [4, 5, 3, 4, 5, 4, 3], // Sat-Fri
      completed_tasks: 12,
      total_tasks: 15
    };

    console.log('Weekly reflection generated successfully');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in weekly_reflect:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
