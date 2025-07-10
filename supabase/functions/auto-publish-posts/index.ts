import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-PUBLISH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep("Auto-publish function started");

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

        // Simulate posting to social media platforms
        let success = false;
        let errorMessage = null;

        if (post.platform === 'twitter') {
          // Twitter API integration would go here
          // For now, simulate success with some random chance
          success = Math.random() > 0.1; // 90% success rate
          if (!success) errorMessage = 'Twitter API rate limit exceeded';
        } else if (post.platform === 'linkedin') {
          // LinkedIn API integration would go here
          success = Math.random() > 0.05; // 95% success rate
          if (!success) errorMessage = 'LinkedIn posting failed';
        } else {
          errorMessage = `Unsupported platform: ${post.platform}`;
        }

        // Generate mock engagement data
        const engagementData = success ? {
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 100) + 10,
          shares: Math.floor(Math.random() * 20) + 2,
          comments: Math.floor(Math.random() * 30) + 5,
          clicks: Math.floor(Math.random() * 50) + 5,
        } : null;

        // Update post status and add analytics
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

        // Insert analytics data for successful posts
        if (success && engagementData) {
          const { error: analyticsError } = await supabaseClient
            .from('post_analytics')
            .insert({
              post_id: post.id,
              user_id: post.user_id,
              platform: post.platform,
              views: engagementData.views,
              likes: engagementData.likes,
              shares: engagementData.shares,
              comments: engagementData.comments,
              clicks: engagementData.clicks,
              engagement_rate: ((engagementData.likes + engagementData.shares + engagementData.comments) / engagementData.views * 100),
              recorded_at: new Date().toISOString()
            });

          if (analyticsError) {
            logStep("Error inserting analytics", { postId: post.id, error: analyticsError });
          } else {
            logStep("Analytics recorded", { postId: post.id, engagement: engagementData });
          }
        }

        results.push({
          id: post.id,
          platform: post.platform,
          success,
          error: errorMessage,
          engagement: engagementData
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

    logStep("Auto-publish completed", { totalProcessed: results.length });

    return new Response(JSON.stringify({
      message: 'Auto-publish completed',
      processed: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in auto-publish", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      message: 'Failed to auto-publish posts'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});