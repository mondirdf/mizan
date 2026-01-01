import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    console.log('generate_schedule called with user_id:', user_id);

    if (!user_id) {
      console.error('Missing user_id');
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // للاختبار: إرجاع جدول وهمي
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

    console.log('Schedule generated successfully for user:', user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        schedule: mockSchedule,
        message: 'تم إنشاء الجدول بنجاح'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in generate_schedule:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
