
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SCHEDULE-POSTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get current time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    logStep("Checking for posts to publish", { currentDate, currentTime });

    // Find scheduled posts that are ready to be published
    const { data: scheduledPosts, error: fetchError } = await supabaseClient
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_date', currentDate)
      .lte('scheduled_time', currentTime);

    if (fetchError) {
      logStep("Error fetching scheduled posts", fetchError);
      throw fetchError;
    }

    logStep("Found posts to publish", { count: scheduledPosts?.length || 0 });

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return new Response(JSON.stringify({ message: 'No posts to publish' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process each post
    const results = [];
    for (const post of scheduledPosts) {
      try {
        logStep("Processing post", { id: post.id, platform: post.platform });

        // Here you would integrate with actual social media APIs
        // For now, we'll just mark them as posted
        let success = false;
        let errorMessage = null;

        if (post.platform === 'twitter') {
          // Twitter API integration would go here
          success = true; // Mock success
        } else if (post.platform === 'linkedin') {
          // LinkedIn API integration would go here
          success = true; // Mock success
        } else {
          errorMessage = `Unsupported platform: ${post.platform}`;
        }

        // Update post status
        const newStatus = success ? 'posted' : 'failed';
        const { error: updateError } = await supabaseClient
          .from('scheduled_posts')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id);

        if (updateError) {
          logStep("Error updating post status", { postId: post.id, error: updateError });
        } else {
          logStep("Post status updated", { postId: post.id, status: newStatus });
        }

        results.push({
          id: post.id,
          platform: post.platform,
          success,
          error: errorMessage
        });

      } catch (error) {
        logStep("Error processing post", { postId: post.id, error: error.message });
        results.push({
          id: post.id,
          platform: post.platform,
          success: false,
          error: error.message
        });
      }
    }

    logStep("Batch processing completed", { totalProcessed: results.length });

    return new Response(JSON.stringify({
      message: 'Batch processing completed',
      processed: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in schedule-posts", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      message: 'Failed to process scheduled posts'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
