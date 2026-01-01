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
    const { user_id, date } = await req.json();
    
    console.log('get_dashboard_data called with:', { user_id, date });

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock data for testing
    const mockSchedule = [
      { day: 0, hour: 9, task: "مراجعة الرياضيات", duration: 2, color: "primary" },
      { day: 0, hour: 14, task: "قراءة الفصل الخامس", duration: 1.5, color: "secondary" },
      { day: 1, hour: 10, task: "حل تمارين الفيزياء", duration: 2, color: "primary" },
      { day: 1, hour: 15, task: "مراجعة الكيمياء", duration: 1, color: "secondary" },
      { day: 2, hour: 8, task: "مشروع البرمجة", duration: 3, color: "primary" },
      { day: 3, hour: 11, task: "مراجعة الرياضيات", duration: 2, color: "secondary" },
      { day: 4, hour: 9, task: "قراءة الفصل السادس", duration: 1.5, color: "primary" },
      { day: 5, hour: 10, task: "تحضير العرض", duration: 2, color: "secondary" },
    ];

    // Get current day (Saturday = 0 for Arabic week)
    const jsDay = new Date(date).getDay();
    const arabicDay = jsDay === 6 ? 0 : jsDay + 1; // Convert: Sat=0, Sun=1, etc.

    const todaySessions = mockSchedule.filter(s => s.day === arabicDay);

    const response = {
      today_sessions: todaySessions,
      today_progress: {
        total_minutes: 120,
        avg_focus: 4.2
      },
      schedule: mockSchedule
    };

    console.log('Dashboard data generated successfully');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in get_dashboard_data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
