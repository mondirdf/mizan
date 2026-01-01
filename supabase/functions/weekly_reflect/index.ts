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
    const { user_id, week_start, week_end } = await req.json();
    
    console.log('weekly_reflect called with:', { user_id, week_start, week_end });

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch scheduled hours for the week
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedules')
      .select('duration_hours')
      .eq('user_id', user_id)
      .eq('week_start', week_start);

    if (scheduleError) {
      console.error('Error fetching schedules:', scheduleError);
      throw scheduleError;
    }

    const planned_hours = (scheduleData || []).reduce((sum, s) => sum + (s.duration_hours || 0), 0);

    // Fetch actual hours from pomodoro_sessions and manual_progress
    const [pomodoroResult, manualResult] = await Promise.all([
      supabase
        .from('pomodoro_sessions')
        .select('actual_minutes, focus_rating, logged_at')
        .eq('user_id', user_id)
        .gte('logged_at', week_start)
        .lte('logged_at', week_end),
      supabase
        .from('manual_progress')
        .select('minutes, focus_rating, logged_at')
        .eq('user_id', user_id)
        .gte('logged_at', week_start)
        .lte('logged_at', week_end)
    ]);

    if (pomodoroResult.error) {
      console.error('Error fetching pomodoro sessions:', pomodoroResult.error);
    }
    if (manualResult.error) {
      console.error('Error fetching manual progress:', manualResult.error);
    }

    const pomodoroData = pomodoroResult.data || [];
    const manualData = manualResult.data || [];

    // Calculate actual hours
    const pomodoroMinutes = pomodoroData.reduce((sum, p) => sum + (p.actual_minutes || 0), 0);
    const manualMinutes = manualData.reduce((sum, m) => sum + (m.minutes || 0), 0);
    const actual_hours = (pomodoroMinutes + manualMinutes) / 60;

    // Calculate average focus
    const allRatings = [
      ...pomodoroData.map(p => p.focus_rating),
      ...manualData.map(m => m.focus_rating)
    ].filter(r => r != null);

    const avg_focus = allRatings.length > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length) * 10) / 10
      : 0;

    // Calculate daily focus (Saturday = 0 to Friday = 6)
    const daily_focus: number[] = [0, 0, 0, 0, 0, 0, 0];
    const daily_counts: number[] = [0, 0, 0, 0, 0, 0, 0];

    const processEntry = (logged_at: string, rating: number) => {
      const date = new Date(logged_at);
      const jsDay = date.getDay();
      const arabicDay = jsDay === 6 ? 0 : jsDay + 1;
      daily_focus[arabicDay] += rating;
      daily_counts[arabicDay]++;
    };

    pomodoroData.forEach(p => {
      if (p.logged_at && p.focus_rating) {
        processEntry(p.logged_at, p.focus_rating);
      }
    });

    manualData.forEach(m => {
      if (m.logged_at && m.focus_rating) {
        processEntry(m.logged_at, m.focus_rating);
      }
    });

    const daily_focus_avg = daily_focus.map((total, i) => 
      daily_counts[i] > 0 ? Math.round((total / daily_counts[i]) * 10) / 10 : 0
    );

    // Find best time (hour with most productivity)
    const hourlyMinutes: Record<number, number> = {};
    
    pomodoroData.forEach(p => {
      if (p.logged_at) {
        const hour = new Date(p.logged_at).getHours();
        hourlyMinutes[hour] = (hourlyMinutes[hour] || 0) + (p.actual_minutes || 0);
      }
    });

    manualData.forEach(m => {
      if (m.logged_at) {
        const hour = new Date(m.logged_at).getHours();
        hourlyMinutes[hour] = (hourlyMinutes[hour] || 0) + (m.minutes || 0);
      }
    });

    let best_time = '';
    const hours = Object.keys(hourlyMinutes).map(Number);
    if (hours.length > 0) {
      const bestHour = hours.reduce((a, b) => hourlyMinutes[a] > hourlyMinutes[b] ? a : b);
      if (bestHour >= 5 && bestHour < 12) {
        best_time = 'صباحاً';
      } else if (bestHour >= 12 && bestHour < 17) {
        best_time = 'ظهراً';
      } else if (bestHour >= 17 && bestHour < 21) {
        best_time = 'مساءً';
      } else {
        best_time = 'ليلاً';
      }
    }

    // Count completed tasks (tasks with any logged progress)
    const tasksWithProgress = new Set([
      ...pomodoroData.filter(p => p.actual_minutes > 0).map(() => 'pomodoro'),
      ...manualData.map(m => m.minutes > 0 ? 'manual' : null).filter(Boolean)
    ]);

    const { data: totalTasks } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id);

    const response = {
      planned_hours: Math.round(planned_hours * 10) / 10,
      actual_hours: Math.round(actual_hours * 10) / 10,
      avg_focus,
      best_time,
      ai_message: '', // AI layer will generate this
      daily_focus: daily_focus_avg,
      completed_tasks: pomodoroData.length + manualData.length,
      total_tasks: totalTasks?.length || 0
    };

    console.log('Weekly reflection generated successfully for user:', user_id);

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
