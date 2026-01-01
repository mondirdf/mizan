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
    const { user_id, session_id, actual_minutes, focus_rating, note } = await req.json();
    
    console.log('log_pomodoro called with:', { user_id, session_id, actual_minutes, focus_rating, note });

    if (!user_id || !session_id) {
      return new Response(
        JSON.stringify({ error: 'user_id and session_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof actual_minutes !== 'number' || actual_minutes < 0) {
      return new Response(
        JSON.stringify({ error: 'actual_minutes must be a positive number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof focus_rating !== 'number' || focus_rating < 1 || focus_rating > 5) {
      return new Response(
        JSON.stringify({ error: 'focus_rating must be between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In production, save to database here
    console.log('Pomodoro session logged successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم حفظ الجلسة بنجاح',
        data: {
          user_id,
          session_id,
          actual_minutes,
          focus_rating,
          note: note || null,
          logged_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in log_pomodoro:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
