
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Send, Edit3, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { platforms } from "@/services/aiService";
import type { Tables } from "@/integrations/supabase/types";

type ScheduledPost = Tables<'scheduled_posts'>;

const ContentScheduling = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { user } = useAuth();

  useEffect(() => {
    fetchScheduledPosts();
  }, [user]);

  const fetchScheduledPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    }
  };

  const handleSchedulePost = async () => {
    if (!user || !selectedDate || !selectedTime || !selectedPlatform || !postTitle || !postContent) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          title: postTitle,
          content: postContent,
          platform: selectedPlatform,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          status: 'scheduled'
        });

      if (error) throw error;

      toast.success('Post scheduled successfully!');
      
      // Reset form
      setPostTitle("");
      setPostContent("");
      setSelectedPlatform("");
      setSelectedTime("");
      
      // Refresh the list
      fetchScheduledPosts();
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteScheduledPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast.success('Scheduled post deleted');
      fetchScheduledPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getPostsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return scheduledPosts.filter(post => post.scheduled_date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      twitter: 'bg-sky-100 text-sky-800',
      linkedin: 'bg-blue-100 text-blue-800',
      instagram: 'bg-pink-100 text-pink-800',
      facebook: 'bg-indigo-100 text-indigo-800',
      youtube: 'bg-red-100 text-red-800',
      blog: 'bg-purple-100 text-purple-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Content Scheduling</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Clock className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Schedule Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Post</CardTitle>
                <CardDescription>Plan your content for future publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Post Title</label>
                  <Input
                    placeholder="Enter post title..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Write your post content..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Platform</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Time</label>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSchedulePost} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Schedule Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Schedule View */}
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Posts Calendar</CardTitle>
                  <CardDescription>View your scheduled content by date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDate && (
                      <div>
                        <h3 className="font-medium mb-3">
                          Posts for {format(selectedDate, 'MMMM d, yyyy')}
                        </h3>
                        <div className="space-y-2">
                          {getPostsForDate(selectedDate).map((post) => (
                            <div key={post.id} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge className={getPlatformColor(post.platform)}>
                                      {platforms.find(p => p.id === post.platform)?.name || post.platform}
                                    </Badge>
                                    <Badge className={getStatusColor(post.status || 'scheduled')}>
                                      {post.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">{post.scheduled_time}</span>
                                  </div>
                                  <h4 className="font-medium">{post.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {post.content}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-4">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => deleteScheduledPost(post.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {getPostsForDate(selectedDate).length === 0 && (
                            <p className="text-gray-500 text-center py-8">
                              No posts scheduled for this date
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Scheduled Posts</CardTitle>
                  <CardDescription>Manage all your scheduled content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledPosts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getPlatformColor(post.platform)}>
                                {platforms.find(p => p.id === post.platform)?.name || post.platform}
                              </Badge>
                              <Badge className={getStatusColor(post.status || 'scheduled')}>
                                {post.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(new Date(post.scheduled_date), 'MMM d, yyyy')} at {post.scheduled_time}
                              </span>
                            </div>
                            <h4 className="font-medium mb-1">{post.title}</h4>
                            <p className="text-sm text-gray-600">{post.content}</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteScheduledPost(post.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {scheduledPosts.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No scheduled posts yet. Create your first scheduled post!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentScheduling;
