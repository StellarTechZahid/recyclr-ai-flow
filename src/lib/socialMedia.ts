
import { supabase } from '@/integrations/supabase/client';

export interface SocialMediaAccount {
  id: string;
  platform: 'twitter' | 'linkedin';
  username: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface ScheduledPost {
  id: string;
  userId: string;
  platform: string;
  content: string;
  scheduledFor: Date;
  status: 'scheduled' | 'posted' | 'failed';
  mediaUrls?: string[];
}

export class SocialMediaManager {
  async connectTwitter(userId: string): Promise<string> {
    // Generate OAuth URL for Twitter
    const redirectUri = `${window.location.origin}/auth/twitter/callback`;
    const state = `${userId}-${Date.now()}`;
    
    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=tweet.read%20tweet.write%20users.read&` +
      `state=${state}&` +
      `code_challenge=challenge&` +
      `code_challenge_method=plain`;
    
    return twitterAuthUrl;
  }

  async connectLinkedIn(userId: string): Promise<string> {
    // Generate OAuth URL for LinkedIn
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
    const state = `${userId}-${Date.now()}`;
    
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=w_member_social%20r_liteprofile&` +
      `state=${state}`;
    
    return linkedinAuthUrl;
  }

  async schedulePost(post: Omit<ScheduledPost, 'id' | 'status'>): Promise<string> {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: post.userId,
        platform: post.platform,
        content: post.content,
        scheduled_date: post.scheduledFor.toISOString().split('T')[0],
        scheduled_time: post.scheduledFor.toTimeString().split(' ')[0],
        status: 'scheduled'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async getScheduledPosts(userId: string): Promise<ScheduledPost[]> {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;

    return data.map(post => ({
      id: post.id,
      userId: post.user_id,
      platform: post.platform,
      content: post.content,
      scheduledFor: new Date(`${post.scheduled_date}T${post.scheduled_time}`),
      status: post.status as 'scheduled' | 'posted' | 'failed'
    }));
  }
}

export const socialMediaManager = new SocialMediaManager();
