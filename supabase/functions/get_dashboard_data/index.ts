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
    const { user_id, date } = await req.json();
    
    console.log('get_dashboard_data called with:', { user_id, date });

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current week start (Saturday)
    const targetDate = date ? new Date(date) : new Date();
    const dayOfWeek = targetDate.getDay();
    const saturdayOffset = dayOfWeek === 6 ? 0 : -(dayOfWeek + 1);
    const weekStart = new Date(targetDate);
    weekStart.setDate(targetDate.getDate() + saturdayOffset);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Fetch schedule for current week
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedules')
      .select(`
        id,
        day_of_week,
        start_hour,
        duration_hours,
        color,
        tasks (id, name)
      `)
      .eq('user_id', user_id)
      .eq('week_start', weekStartStr);

    if (scheduleError) {
      console.error('Error fetching schedules:', scheduleError);
      throw scheduleError;
    }

    // Transform schedule data
    const schedule = (scheduleData || []).map((item: any) => ({
      day: item.day_of_week,
      hour: item.start_hour,
      task: item.tasks?.name || 'مهمة',
      duration: item.duration_hours,
      color: item.color || 'primary'
    }));

    // Get today's day of week (adjusted for Arabic week: Saturday = 0)
    const todayJS = new Date().getDay();
    const todayArabic = todayJS === 6 ? 0 : todayJS + 1;

    // Filter today's sessions
    const today_sessions = schedule
      .filter(s => s.day === todayArabic)
      .map(s => ({ task: s.task, hour: s.hour, duration: s.duration }));

    // Fetch today's progress from pomodoro_sessions and manual_progress
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [pomodoroResult, manualResult] = await Promise.all([
      supabase
        .from('pomodoro_sessions')
        .select('actual_minutes, focus_rating')
        .eq('user_id', user_id)
        .gte('logged_at', todayStart.toISOString())
        .lte('logged_at', todayEnd.toISOString()),
      supabase
        .from('manual_progress')
        .select('minutes, focus_rating')
        .eq('user_id', user_id)
        .gte('logged_at', todayStart.toISOString())
        .lte('logged_at', todayEnd.toISOString())
    ]);

    if (pomodoroResult.error) {
      console.error('Error fetching pomodoro sessions:', pomodoroResult.error);
    }
    if (manualResult.error) {
      console.error('Error fetching manual progress:', manualResult.error);
    }

    const pomodoroData = pomodoroResult.data || [];
    const manualData = manualResult.data || [];

    // Calculate total minutes and average focus
    const pomodoroMinutes = pomodoroData.reduce((sum, p) => sum + (p.actual_minutes || 0), 0);
    const manualMinutes = manualData.reduce((sum, m) => sum + (m.minutes || 0), 0);
    const total_minutes = pomodoroMinutes + manualMinutes;

    const allRatings = [
      ...pomodoroData.map(p => p.focus_rating),
      ...manualData.map(m => m.focus_rating)
    ].filter(r => r != null);

    const avg_focus = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;

    const response = {
      today_sessions,
      today_progress: {
        total_minutes,
        avg_focus: Math.round(avg_focus * 10) / 10
      },
      schedule
    };

    console.log('Dashboard data fetched successfully for user:', user_id);

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
