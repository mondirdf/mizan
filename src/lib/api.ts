const SUPABASE_URL = 'https://voqhuievpxdygxpdijxp.supabase.co/functions/v1'
const ANON_KEY = 'sb_publishable_Q0SMRph_L548lQd1nO9PMg_UQzl5UDK'

async function callAPI(endpoint: string, body: any) {
  console.log(`[API] Calling ${endpoint} with:`, body);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(body)
    });
    
    console.log(`[API] Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error response:`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Fetch failed:`, error);
    throw error;
  }
}

export const api = {
  generateSchedule: (user_id: string) => 
    callAPI('generate_schedule', { user_id }),
  
  logPomodoro: (data: { user_id: string, session_id: string, actual_minutes: number, focus_rating: number, note?: string }) =>
    callAPI('log_pomodoro', data),
  
  logManualProgress: (data: { user_id: string, task_id: string, minutes: number, focus_rating: number, note?: string }) =>
    callAPI('log_manual_progress', data),
  
  getDashboard: (user_id: string, date: string) =>
    callAPI('get_dashboard_data', { user_id, date }),
  
  weeklyReflect: (user_id: string, week_start: string, week_end: string) =>
    callAPI('weekly_reflect', { user_id, week_start, week_end })
}
