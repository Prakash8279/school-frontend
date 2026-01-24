import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw, Home, Info, Images, Mail, Plus, Trash2, Upload, Bell, Eye, EyeOff, Edit, Link, Monitor } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  emoji: string;
  image_path: string;
  external_url?: string;
  image_type: 'upload' | 'external';
  display_order: number;
  is_active: boolean;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  notice_type: string;
  is_important: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

interface Feature {
  title: string;
  description: string;
  emoji: string;
}

interface LandingContent {
  home: {
    badge?: string;
    title?: string;
    titleHighlight?: string;
    subtitle?: string;
    applyButtonText?: string;
    learnMoreButtonText?: string;
    stats?: {
      students?: { value?: string; label?: string };
      ratio?: { value?: string; label?: string };
      years?: { value?: string; label?: string };
    };
  };
  about: {
    title?: string;
    titleHighlight?: string;
    description?: string;
    missionTitle?: string;
    missionText?: string;
    features?: string;
  };
  contact: {
    title?: string;
    titleHighlight?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    formTitle?: string;
    formDescription?: string;
  };
  gallery: {
    title?: string;
    titleHighlight?: string;
    description?: string;
    images: GalleryImage[];
  };
}

const defaultContent: LandingContent = {
  home: {
    badge: "🎨 Nursery to 8th Grade Excellence",
    title: "Where Young Minds",
    titleHighlight: "Grow & Thrive",
    subtitle: "A nurturing primary school environment where children develop strong foundations! 🌈",
    applyButtonText: "Apply Now 🚀",
    learnMoreButtonText: "Learn More 📚",
    stats: {
      students: { value: "400+", label: "Happy Students 🎓" },
      ratio: { value: "30:1", label: "Student-Teacher 👥" },
      years: { value: "10+", label: "Years of Fun 🎉" },
    },
  },
  about: {
    title: "About Our",
    titleHighlight: "Primary School",
    description: "For over 25 years, we've been nurturing young minds!",
    missionTitle: "Our Mission",
    missionText: "To nurture curious, confident, and kind young learners!",
    features: JSON.stringify([
      { title: "Age-Appropriate Learning", description: "Engaging curriculum for young learners.", emoji: "📚" },
      { title: "Caring Teachers", description: "Dedicated educators who understand child development.", emoji: "👩‍🏫" },
      { title: "Holistic Development", description: "Focus on academics, arts, sports, and social-emotional learning.", emoji: "🏆" },
    ]),
  },
  contact: {
    title: "Get in",
    titleHighlight: "Touch",
    description: "We'd love to show you around our school!",
    phone: "+917061337068",
    email: "rntpublics@gmail.com",
    address: "R.N.T Public School Janki Nagar",
    formTitle: "Send Us a Message 💌",
    formDescription: "We typically respond within 24 hours! ⏰",
  },
  gallery: {
    title: "Campus",
    titleHighlight: "Gallery",
    description: "Explore our colorful facilities! 🏫🎉",
    images: []
  }
};

const LandingPageEdit = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const isAdmin = userInfo?.role === "admin";
  const token = userInfo?.token;

  const [content, setContent] = useState<LandingContent | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImage, setNewImage] = useState({
    file: null as File | null,
    title: "",
    category: "Activities",
    emoji: "📷",
    uploadType: "file" as "file" | "url",
    externalUrl: ""
  });
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    notice_type: "general",
    is_important: false,
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const contentRes = await fetch(`${API_URL}/landing/content`);
      const contentData = await contentRes.json();
      
      if (contentData.success) {
        setContent(contentData.data.content || defaultContent);
        const aboutFeatures = contentData.data.content?.about?.features;
        if (aboutFeatures && typeof aboutFeatures === 'string') {
          try {
            setFeatures(JSON.parse(aboutFeatures));
          } catch {
            setFeatures([]);
          }
        }
      }

      const galleryRes = await fetch(`${API_URL}/landing/gallery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const galleryData = await galleryRes.json();
      if (galleryData.success) {
        setGalleryImages(galleryData.data || []);
      }

      const noticesRes = await fetch(`${API_URL}/landing/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const noticesData = await noticesRes.json();
      if (noticesData.success) {
        setNotices(noticesData.data || []);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load landing page data");
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Only admin can edit landing page content.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !content) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const updates: { section: string; field_key: string; field_value: string }[] = [];

      Object.entries(content.home).forEach(([key, value]) => {
        if (key === 'stats' && typeof value === 'object') {
          Object.entries(value as Record<string, { value?: string; label?: string }>).forEach(([statKey, statValue]) => {
            if (statValue?.value) updates.push({ section: 'home', field_key: `stats_${statKey}_value`, field_value: statValue.value });
            if (statValue?.label) updates.push({ section: 'home', field_key: `stats_${statKey}_label`, field_value: statValue.label });
          });
        } else if (typeof value === 'string') {
          updates.push({ section: 'home', field_key: key, field_value: value });
        }
      });

      Object.entries(content.about).forEach(([key, value]) => {
        if (key !== 'features' && typeof value === 'string') {
          updates.push({ section: 'about', field_key: key, field_value: value });
        }
      });
      updates.push({ section: 'about', field_key: 'features', field_value: JSON.stringify(features) });

      Object.entries(content.contact).forEach(([key, value]) => {
        if (typeof value === 'string') {
          updates.push({ section: 'contact', field_key: key, field_value: value });
        }
      });

      ['title', 'titleHighlight', 'description'].forEach(key => {
        const value = content.gallery[key as keyof typeof content.gallery];
        if (typeof value === 'string') {
          updates.push({ section: 'gallery', field_key: key, field_value: value });
        }
      });

      const res = await fetch(`${API_URL}/landing/content/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Landing page content saved successfully! 🎉");
      } else {
        toast.error(data.message || "Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will reset all content to default values.")) {
      setContent(defaultContent);
      setFeatures(JSON.parse(defaultContent.about.features || "[]"));
      toast.success("Content reset to defaults. Click Save to apply.");
    }
  };

  const updateContent = (section: keyof LandingContent, updates: any) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: {
        ...content[section],
        ...updates,
      },
    });
  };

  const addFeature = () => {
    setFeatures([...features, { title: "New Feature", description: "Description of the new feature.", emoji: "✨" }]);
    toast.success("New feature added!");
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    toast.success("Feature removed.");
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  const handleImageUpload = async () => {
    if (newImage.uploadType === 'file' && !newImage.file) {
      toast.error("Please select an image file");
      return;
    }
    if (newImage.uploadType === 'url' && !newImage.externalUrl) {
      toast.error("Please enter image URL");
      return;
    }

    setUploadingImage(true);
    try {
      let res;
      
      if (newImage.uploadType === 'file') {
        // Upload file from computer
        const formData = new FormData();
        formData.append('image', newImage.file!);
        formData.append('title', newImage.title || 'Gallery Image');
        formData.append('category', newImage.category);
        formData.append('emoji', newImage.emoji);

        res = await fetch(`${API_URL}/landing/gallery`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        // Add external URL (Google Drive, etc.)
        res = await fetch(`${API_URL}/landing/gallery/external`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            title: newImage.title || 'Gallery Image',
            category: newImage.category,
            emoji: newImage.emoji,
            external_url: newImage.externalUrl
          })
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Image added successfully! 🎉");
        setShowUploadDialog(false);
        setNewImage({ file: null, title: "", category: "Activities", emoji: "📷", uploadType: "file", externalUrl: "" });
        fetchAllData();
      } else {
        toast.error(data.message || "Failed to add image");
      }
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteGalleryImage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`${API_URL}/landing/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setGalleryImages(galleryImages.filter(img => img.id !== id));
        toast.success("Image deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete image");
      }
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const toggleImageActive = async (image: GalleryImage) => {
    try {
      const res = await fetch(`${API_URL}/landing/gallery/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...image, is_active: !image.is_active })
      });

      const data = await res.json();
      if (data.success) {
        setGalleryImages(galleryImages.map(img => 
          img.id === image.id ? { ...img, is_active: !img.is_active } : img
        ));
        toast.success(`Image ${!image.is_active ? 'shown' : 'hidden'} on landing page`);
      }
    } catch (error) {
      toast.error("Failed to update image");
    }
  };

  const handleSaveNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast.error("Please fill in title and content");
      return;
    }

    try {
      if (editingNotice) {
        const res = await fetch(`${API_URL}/landing/notices/${editingNotice.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...newNotice, is_active: editingNotice.is_active })
        });

        const data = await res.json();
        if (data.success) {
          toast.success("Notice updated successfully!");
          fetchAllData();
        }
      } else {
        const res = await fetch(`${API_URL}/landing/notices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newNotice)
        });

        const data = await res.json();
        if (data.success) {
          toast.success("Notice created successfully!");
          fetchAllData();
        }
      }

      setShowNoticeDialog(false);
      setEditingNotice(null);
      setNewNotice({ title: "", content: "", notice_type: "general", is_important: false, start_date: "", end_date: "" });
    } catch (error) {
      toast.error("Failed to save notice");
    }
  };

  const deleteNotice = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const res = await fetch(`${API_URL}/landing/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setNotices(notices.filter(n => n.id !== id));
        toast.success("Notice deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete notice");
    }
  };

  const toggleNoticeActive = async (notice: Notice) => {
    try {
      const res = await fetch(`${API_URL}/landing/notices/${notice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...notice, is_active: !notice.is_active })
      });

      const data = await res.json();
      if (data.success) {
        setNotices(notices.map(n => 
          n.id === notice.id ? { ...n, is_active: !n.is_active } : n
        ));
        toast.success(`Notice ${!notice.is_active ? 'shown' : 'hidden'} on landing page`);
      }
    } catch (error) {
      toast.error("Failed to update notice");
    }
  };

  const editNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      content: notice.content,
      notice_type: notice.notice_type,
      is_important: notice.is_important,
      start_date: notice.start_date?.split('T')[0] || "",
      end_date: notice.end_date?.split('T')[0] || ""
    });
    setShowNoticeDialog(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Landing Page Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit Home, About, Gallery, Contact & Notices - All changes saved to database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="home">
            <Home className="w-4 h-4 mr-2" />
            Home
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="w-4 h-4 mr-2" />
            About
          </TabsTrigger>
          <TabsTrigger value="gallery">
            <Images className="w-4 h-4 mr-2" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="w-4 h-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="notices">
            <Bell className="w-4 h-4 mr-2" />
            Notices
          </TabsTrigger>
        </TabsList>

        {/* HOME TAB */}
        <TabsContent value="home" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Home Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input
                  value={content.home.badge || ""}
                  onChange={(e) => updateContent("home", { badge: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.home.title || ""}
                    onChange={(e) => updateContent("home", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.home.titleHighlight || ""}
                    onChange={(e) => updateContent("home", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subtitle / Description</Label>
                <Textarea
                  value={content.home.subtitle || ""}
                  onChange={(e) => updateContent("home", { subtitle: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Apply Button Text</Label>
                  <Input
                    value={content.home.applyButtonText || ""}
                    onChange={(e) => updateContent("home", { applyButtonText: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Learn More Button Text</Label>
                  <Input
                    value={content.home.learnMoreButtonText || ""}
                    onChange={(e) => updateContent("home", { learnMoreButtonText: e.target.value })}
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-lg font-bold mb-4 block">Statistics</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Students Count</Label>
                    <Input
                      value={content.home.stats?.students?.value || ""}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            students: { ...content.home.stats?.students, value: e.target.value },
                          },
                        })
                      }
                    />
                    <Input
                      value={content.home.stats?.students?.label || ""}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            students: { ...content.home.stats?.students, label: e.target.value },
                          },
                        })
                      }
                      placeholder="Label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ratio</Label>
                    <Input
                      value={content.home.stats?.ratio?.value || ""}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            ratio: { ...content.home.stats?.ratio, value: e.target.value },
                          },
                        })
                      }
                    />
                    <Input
                      value={content.home.stats?.ratio?.label || ""}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            ratio: { ...content.home.stats?.ratio, label: e.target.value },
                          },
                        })
                      }
                      placeholder="Label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years</Label>
                    <Input
                      value={content.home.stats?.years?.value || ""}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            years: { ...content.home.stats?.years, value: e.target.value },
                          },
                        })
                      }
                    />
                    <Input
                      value={content.home.stats?.years?.label || ""}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            years: { ...content.home.stats?.years, label: e.target.value },
                          },
                        })
                      }
                      placeholder="Label"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT TAB */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.about.title || ""}
                    onChange={(e) => updateContent("about", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.about.titleHighlight || ""}
                    onChange={(e) => updateContent("about", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.about.description || ""}
                  onChange={(e) => updateContent("about", { description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Title</Label>
                <Input
                  value={content.about.missionTitle || ""}
                  onChange={(e) => updateContent("about", { missionTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Text</Label>
                <Textarea
                  value={content.about.missionText || ""}
                  onChange={(e) => updateContent("about", { missionText: e.target.value })}
                  rows={4}
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-bold">Features</Label>
                  <Button size="sm" onClick={addFeature} variant="outline">
                    <Plus className="w-4 h-4 mr-2" /> Add Feature
                  </Button>
                </div>
                
                {features.map((feature, index) => (
                  <Card key={index} className="mb-4 bg-muted/20">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <Label>Feature {index + 1} - Title</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 mt-6"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Emoji</Label>
                        <Input
                          value={feature.emoji}
                          onChange={(e) => updateFeature(index, 'emoji', e.target.value)}
                          placeholder="📚"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GALLERY TAB */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gallery Section</CardTitle>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload New Image
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.gallery.title || ""}
                    onChange={(e) => updateContent("gallery", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.gallery.titleHighlight || ""}
                    onChange={(e) => updateContent("gallery", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.gallery.description || ""}
                  onChange={(e) => updateContent("gallery", { description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-lg font-bold mb-4 block">
                  Gallery Images ({galleryImages.length} images - No size limit! 🎉)
                </Label>
                
                {galleryImages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No images yet. Click "Upload New Image" to add images to the gallery.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((image) => (
                      <Card key={image.id} className={`overflow-hidden ${!image.is_active ? 'opacity-50' : ''}`}>
                        <div className="relative h-40 bg-gray-100">
                          <img 
                            src={image.image_type === 'external' ? image.external_url : `http://localhost:5000${image.image_path}`} 
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            <span className={`text-xs px-2 py-1 rounded ${image.image_type === 'external' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                              {image.image_type === 'external' ? '🔗 URL' : '📁 File'}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button 
                              size="icon" 
                              variant="secondary"
                              className="h-8 w-8"
                              onClick={() => toggleImageActive(image)}
                              title={image.is_active ? "Hide from gallery" : "Show in gallery"}
                            >
                              {image.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button 
                              size="icon" 
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => deleteGalleryImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm truncate">{image.emoji} {image.title}</p>
                          <p className="text-xs text-muted-foreground">{image.category}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT TAB */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.contact.title || ""}
                    onChange={(e) => updateContent("contact", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.contact.titleHighlight || ""}
                    onChange={(e) => updateContent("contact", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.contact.description || ""}
                  onChange={(e) => updateContent("contact", { description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={content.contact.phone || ""}
                    onChange={(e) => updateContent("contact", { phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={content.contact.email || ""}
                    onChange={(e) => updateContent("contact", { email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={content.contact.address || ""}
                    onChange={(e) => updateContent("contact", { address: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input
                  value={content.contact.formTitle || ""}
                  onChange={(e) => updateContent("contact", { formTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Form Description</Label>
                <Textarea
                  value={content.contact.formDescription || ""}
                  onChange={(e) => updateContent("contact", { formDescription: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTICES TAB */}
        <TabsContent value="notices" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notice Board Management</CardTitle>
              <Button onClick={() => {
                setEditingNotice(null);
                setNewNotice({ title: "", content: "", notice_type: "general", is_important: false, start_date: "", end_date: "" });
                setShowNoticeDialog(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Notice
              </Button>
            </CardHeader>
            <CardContent>
              {notices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notices yet. Click "Add New Notice" to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <Card key={notice.id} className={`${!notice.is_active ? 'opacity-50' : ''}`}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {notice.is_important && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Important</span>
                              )}
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">{notice.notice_type}</span>
                              {!notice.is_active && (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Hidden</span>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg">{notice.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                            {(notice.start_date || notice.end_date) && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {notice.start_date && `From: ${new Date(notice.start_date).toLocaleDateString()}`}
                                {notice.end_date && ` - To: ${new Date(notice.end_date).toLocaleDateString()}`}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => toggleNoticeActive(notice)}>
                              {notice.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => editNotice(notice)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteNotice(notice.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Image Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Upload Type Selection */}
            <div className="space-y-2">
              <Label>Choose Image Source</Label>
              <div className="flex gap-2">
                <Button 
                  variant={newImage.uploadType === 'file' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewImage({ ...newImage, uploadType: 'file' })}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  From Computer
                </Button>
                <Button 
                  variant={newImage.uploadType === 'url' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewImage({ ...newImage, uploadType: 'url' })}
                >
                  <Link className="w-4 h-4 mr-2" />
                  From URL
                </Button>
              </div>
            </div>

            {/* File Upload Option */}
            {newImage.uploadType === 'file' && (
              <div className="space-y-2">
                <Label>Select Image (Max 10MB)</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setNewImage({ ...newImage, file: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP
                </p>
              </div>
            )}

            {/* URL Option */}
            {newImage.uploadType === 'url' && (
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input 
                  type="url"
                  value={newImage.externalUrl}
                  onChange={(e) => setNewImage({ ...newImage, externalUrl: e.target.value })}
                  placeholder="https://drive.google.com/... or any image URL"
                />
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Google Drive:</strong> Get shareable link → Replace "file/d/" with "uc?export=view&id=" 
                  <br />
                  Example: https://drive.google.com/uc?export=view&id=FILE_ID
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                placeholder="Image title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newImage.category} onValueChange={(val) => setNewImage({ ...newImage, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activities">Activities</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Campus">Campus</SelectItem>
                    <SelectItem value="Students">Students</SelectItem>
                    <SelectItem value="Awards">Awards</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Emoji</Label>
                <Input 
                  value={newImage.emoji}
                  onChange={(e) => setNewImage({ ...newImage, emoji: e.target.value })}
                  placeholder="📷"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleImageUpload} 
              disabled={uploadingImage || (newImage.uploadType === 'file' ? !newImage.file : !newImage.externalUrl)}
            >
              {uploadingImage && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {newImage.uploadType === 'file' ? 'Upload' : 'Add Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notice Dialog */}
      <Dialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="Notice title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                placeholder="Notice content"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newNotice.notice_type} onValueChange={(val) => setNewNotice({ ...newNotice, notice_type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch 
                  checked={newNotice.is_important}
                  onCheckedChange={(checked) => setNewNotice({ ...newNotice, is_important: checked })}
                />
                <Label>Mark as Important</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date (Optional)</Label>
                <Input 
                  type="date"
                  value={newNotice.start_date}
                  onChange={(e) => setNewNotice({ ...newNotice, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Input 
                  type="date"
                  value={newNotice.end_date}
                  onChange={(e) => setNewNotice({ ...newNotice, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoticeDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveNotice}>
              {editingNotice ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPageEdit;

