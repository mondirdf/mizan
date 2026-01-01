import { supabase } from './supabase';

async function callAPI(endpoint: string, body: any) {
  console.log(`[API] Calling ${endpoint} with:`, body);
  
  try {
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: body
    });
    
    if (error) {
      console.error(`[API] Error:`, error);
      throw error;
    }
    
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Failed:`, error);
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