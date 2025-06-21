
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit3, Trash2, Copy, Save, FileText, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { platforms } from "@/services/aiService";

interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string;
  platform: string;
  template_content: string;
  variables: string[];
  category: string;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const ContentTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  // Form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    platform: "",
    template_content: "",
    category: "general",
    is_public: false
  });

  const categories = [
    { id: "general", name: "General" },
    { id: "marketing", name: "Marketing" },
    { id: "social", name: "Social Media" },
    { id: "blog", name: "Blog Posts" },
    { id: "email", name: "Email" },
    { id: "announcement", name: "Announcements" },
    { id: "promotional", name: "Promotional" }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      // Fetch both user's templates and public templates
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const createTemplate = async () => {
    if (!user || !templateForm.name || !templateForm.template_content || !templateForm.platform) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Extract variables from template content (words with {{}})
      const variables = Array.from(
        templateForm.template_content.matchAll(/\{\{(\w+)\}\}/g)
      ).map(match => match[1]);

      const { error } = await supabase
        .from('content_templates')
        .insert({
          user_id: user.id,
          name: templateForm.name,
          description: templateForm.description,
          platform: templateForm.platform,
          template_content: templateForm.template_content,
          variables,
          category: templateForm.category,
          is_public: templateForm.is_public,
          usage_count: 0
        });

      if (error) throw error;

      toast.success('Template created successfully!');
      setTemplateForm({
        name: "",
        description: "",
        platform: "",
        template_content: "",
        category: "general",
        is_public: false
      });
      setIsCreateDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('content_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.template_content);
    toast.success('Template copied to clipboard!');
  };

  const useTemplate = async (template: Template) => {
    try {
      // Increment usage count
      const { error } = await supabase
        .from('content_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);

      if (error) throw error;

      // Navigate to repurpose page with template
      const encodedTemplate = encodeURIComponent(template.template_content);
      window.location.href = `/dashboard/repurpose?template=${encodedTemplate}&platform=${template.platform}`;
    } catch (error: any) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || template.platform === selectedPlatform;
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Content Templates</h1>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable content template with variables like {`{{productName}}`} or {`{{date}}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Template Name</label>
                    <Input
                      placeholder="e.g., Product Launch Post"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Platform</label>
                    <Select value={templateForm.platform} onValueChange={(value) => setTemplateForm({...templateForm, platform: value})}>
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
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    placeholder="Brief description of when to use this template"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({...templateForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Template Content</label>
                  <Textarea
                    placeholder={`🚀 Exciting news! We're launching {{productName}} on {{date}}!\n\n{{productDescription}}\n\n✨ Key features:\n• {{feature1}}\n• {{feature2}}\n• {{feature3}}\n\n#ProductLaunch #{{productCategory}}`}
                    value={templateForm.template_content}
                    onChange={(e) => setTemplateForm({...templateForm, template_content: e.target.value})}
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{{variableName}}`} for dynamic content that can be replaced when using the template
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={templateForm.is_public}
                      onChange={(e) => setTemplateForm({...templateForm, is_public: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Make this template public</span>
                  </label>
                  
                  <Button onClick={createTemplate}>
                    <Save className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {template.user_id === user?.id && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {platforms.find(p => p.id === template.platform)?.name}
                    </Badge>
                    <Badge variant="outline">{template.category}</Badge>
                    {template.is_public && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                    {template.template_content}
                  </div>

                  {template.variables.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Used {template.usage_count} times
                    </div>
                    <Button
                      size="sm"
                      onClick={() => useTemplate(template)}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No templates found. Create your first template!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentTemplates;
