
import { useState, useEffect } from 'react';
import { Calendar, Clock, Send, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { socialMediaManager, type ScheduledPost } from '@/lib/socialMedia';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ScheduleCalendarProps {
  prefilledContent?: string;
  onScheduled?: () => void;
}

const ScheduleCalendar = ({ prefilledContent = '', onScheduled }: ScheduleCalendarProps) => {
  const [content, setContent] = useState(prefilledContent);
  const [platform, setPlatform] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const { user } = useAuth();

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  useEffect(() => {
    if (prefilledContent) {
      setContent(prefilledContent);
    }
  }, [prefilledContent]);

  useEffect(() => {
    loadScheduledPosts();
  }, [user]);

  const loadScheduledPosts = async () => {
    if (!user) return;
    
    try {
      const posts = await socialMediaManager.getScheduledPosts(user.id);
      setScheduledPosts(posts);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
    }
  };

  const handleSchedule = async () => {
    if (!user) {
      toast.error('Please login to schedule posts');
      return;
    }

    if (!content.trim() || !platform || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (scheduledDateTime <= new Date()) {
      toast.error('Please select a future date and time');
      return;
    }

    setIsScheduling(true);
    try {
      await socialMediaManager.schedulePost({
        userId: user.id,
        platform,
        content: content.trim(),
        scheduledFor: scheduledDateTime,
      });

      toast.success('Post scheduled successfully!');
      setContent('');
      setPlatform('');
      setScheduledDate('');
      setScheduledTime('');
      
      // Reload scheduled posts
      await loadScheduledPosts();
      
      if (onScheduled) {
        onScheduled();
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-500" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      default:
        return <Send className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatScheduledDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Schedule Form */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Calendar className="w-6 h-6 mr-3 text-purple-600" />
            Schedule Content
          </CardTitle>
          <CardDescription className="text-lg">
            Schedule your repurposed content to be posted automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="platform" className="text-base font-semibold">
              Platform
            </Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="input-modern">
                <SelectValue placeholder="Select platform to post on" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">
                  <div className="flex items-center space-x-2">
                    <Twitter className="w-4 h-4 text-blue-500" />
                    <span>Twitter</span>
                  </div>
                </SelectItem>
                <SelectItem value="linkedin">
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    <span>LinkedIn</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="content" className="text-base font-semibold">
              Content to Post
            </Label>
            <Textarea
              id="content"
              placeholder="Enter or paste the content you want to schedule..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="input-modern resize-none"
            />
            <div className="text-sm text-gray-500">
              {content.length} characters
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="date" className="text-base font-semibold">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="input-modern"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="time" className="text-base font-semibold">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="input-modern"
              />
            </div>
          </div>

          <Button 
            onClick={handleSchedule} 
            className="w-full btn-primary-modern text-lg py-4"
            disabled={!content.trim() || !platform || !scheduledDate || !scheduledTime || isScheduling}
          >
            {isScheduling ? (
              <>
                <Clock className="w-5 h-5 mr-3 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-3" />
                Schedule Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Posts */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Clock className="w-6 h-6 mr-3 text-emerald-600" />
            Scheduled Posts
          </CardTitle>
          <CardDescription className="text-lg">
            Your upcoming scheduled content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No scheduled posts yet</p>
              <p className="text-sm">Schedule your first post above!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(post.platform)}
                      <span className="font-medium capitalize text-gray-700">
                        {post.platform}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        post.status === 'posted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatScheduledDate(post.scheduledFor)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleCalendar;
