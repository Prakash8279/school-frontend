import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { 
  Save, 
  Home, 
  Info, 
  Phone, 
  Image as ImageIcon,
  Bell,
  Upload,
  Trash2,
  Edit,
  Plus,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  emoji: string;
  image_path: string;
  display_order: number;
  is_active: boolean;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  notice_type: string;
  is_important: boolean;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const LandingPageManagement = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form states for each section
  const [homeContent, setHomeContent] = useState({
    badge: "",
    title: "",
    titleHighlight: "",
    subtitle: "",
    applyButtonText: "",
    learnMoreButtonText: "",
    stats_students_value: "",
    stats_students_label: "",
    stats_ratio_value: "",
    stats_ratio_label: "",
    stats_years_value: "",
    stats_years_label: "",
  });

  const [aboutContent, setAboutContent] = useState({
    title: "",
    titleHighlight: "",
    description: "",
    missionTitle: "",
    missionText: "",
  });

  const [contactContent, setContactContent] = useState({
    title: "",
    titleHighlight: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    formTitle: "",
    formDescription: "",
  });

  const [galleryContent, setGalleryContent] = useState({
    title: "",
    titleHighlight: "",
    description: "",
  });

  const [newImage, setNewImage] = useState({
    title: "",
    category: "Activities",
    emoji: "📸",
    file: null as File | null,
  });

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    notice_type: "general",
    is_important: false,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchLandingContent();
    fetchGalleryImages();
    fetchNotices();
  }, []);

  const fetchLandingContent = async () => {
    try {
      const response = await fetch(`${API_URL}/landing/content`);
      const data = await response.json();
      
      if (data.success) {
        const { content } = data.data;
        
        // Set home content
        setHomeContent({
          badge: content.home.badge || "",
          title: content.home.title || "",
          titleHighlight: content.home.titleHighlight || "",
          subtitle: content.home.subtitle || "",
          applyButtonText: content.home.applyButtonText || "",
          learnMoreButtonText: content.home.learnMoreButtonText || "",
          stats_students_value: content.home.stats?.students?.value || "",
          stats_students_label: content.home.stats?.students?.label || "",
          stats_ratio_value: content.home.stats?.ratio?.value || "",
          stats_ratio_label: content.home.stats?.ratio?.label || "",
          stats_years_value: content.home.stats?.years?.value || "",
          stats_years_label: content.home.stats?.years?.label || "",
        });

        // Set about content
        setAboutContent({
          title: content.about.title || "",
          titleHighlight: content.about.titleHighlight || "",
          description: content.about.description || "",
          missionTitle: content.about.missionTitle || "",
          missionText: content.about.missionText || "",
        });

        // Set contact content
        setContactContent({
          title: content.contact.title || "",
          titleHighlight: content.contact.titleHighlight || "",
          description: content.contact.description || "",
          phone: content.contact.phone || "",
          email: content.contact.email || "",
          address: content.contact.address || "",
          formTitle: content.contact.formTitle || "",
          formDescription: content.contact.formDescription || "",
        });

        // Set gallery content
        setGalleryContent({
          title: content.gallery.title || "",
          titleHighlight: content.gallery.titleHighlight || "",
          description: content.gallery.description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching landing content:", error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch(`${API_URL}/landing/gallery`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      const data = await response.json();
      if (data.success) {
        setGalleryImages(data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${API_URL}/landing/notices`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      const data = await response.json();
      if (data.success) {
        setNotices(data.data);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const saveContent = async (section: string, content: Record<string, string>) => {
    setLoading(true);
    try {
      const updates = Object.entries(content).map(([field_key, field_value]) => ({
        section,
        field_key,
        field_value,
      }));

      const response = await fetch(`${API_URL}/landing/content/bulk`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} content saved!`);
      } else {
        toast.error("Failed to save content");
      }
    } catch (error) {
      toast.error("Error saving content");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!newImage.file) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", newImage.file);
      formData.append("title", newImage.title);
      formData.append("category", newImage.category);
      formData.append("emoji", newImage.emoji);

      const response = await fetch(`${API_URL}/landing/gallery`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Image uploaded successfully!");
        setUploadDialogOpen(false);
        setNewImage({ title: "", category: "Activities", emoji: "📸", file: null });
        fetchGalleryImages();
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`${API_URL}/landing/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Image deleted!");
        fetchGalleryImages();
      }
    } catch (error) {
      toast.error("Error deleting image");
    }
  };

  const toggleImageActive = async (image: GalleryImage) => {
    try {
      const response = await fetch(`${API_URL}/landing/gallery/${image.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify({ ...image, is_active: !image.is_active }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(image.is_active ? "Image hidden" : "Image visible");
        fetchGalleryImages();
      }
    } catch (error) {
      toast.error("Error updating image");
    }
  };

  const saveNotice = async () => {
    setLoading(true);
    try {
      const url = editingNotice
        ? `${API_URL}/landing/notices/${editingNotice.id}`
        : `${API_URL}/landing/notices`;
      
      const method = editingNotice ? "PUT" : "POST";
      const body = editingNotice 
        ? { ...editingNotice, ...newNotice }
        : newNotice;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingNotice ? "Notice updated!" : "Notice created!");
        setNoticeDialogOpen(false);
        setEditingNotice(null);
        setNewNotice({
          title: "",
          content: "",
          notice_type: "general",
          is_important: false,
          start_date: "",
          end_date: "",
        });
        fetchNotices();
      }
    } catch (error) {
      toast.error("Error saving notice");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const response = await fetch(`${API_URL}/landing/notices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Notice deleted!");
        fetchNotices();
      }
    } catch (error) {
      toast.error("Error deleting notice");
    }
  };

  const emojiOptions = ["📸", "🎒", "🏆", "😊", "⭐", "🎨", "📚", "🏫", "🎉", "🌟", "🎭", "⚽", "🎵", "🔬", "💻"];
  const categoryOptions = ["Activities", "Awards", "Students", "Events", "Campus", "Sports", "Arts"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Landing Page Management</h1>
        <Button onClick={() => window.open("/", "_blank")} variant="outline">
          <Eye className="w-4 h-4 mr-2" /> Preview Website
        </Button>
      </div>

      <Tabs defaultValue="home" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="home" className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Home
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="w-4 h-4" /> About
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Gallery
          </TabsTrigger>
          <TabsTrigger value="notices" className="flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notices
          </TabsTrigger>
        </TabsList>

        {/* Home Section */}
        <TabsContent value="home">
          <Card>
            <CardHeader>
              <CardTitle>Home Section Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Badge Text</Label>
                  <Input
                    value={homeContent.badge}
                    onChange={(e) => setHomeContent({ ...homeContent, badge: e.target.value })}
                    placeholder="🎨 Nursery to 8th Grade Excellence"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={homeContent.title}
                    onChange={(e) => setHomeContent({ ...homeContent, title: e.target.value })}
                    placeholder="Where Young Minds"
                  />
                </div>
                <div>
                  <Label>Title Highlight</Label>
                  <Input
                    value={homeContent.titleHighlight}
                    onChange={(e) => setHomeContent({ ...homeContent, titleHighlight: e.target.value })}
                    placeholder="Grow & Thrive"
                  />
                </div>
                <div>
                  <Label>Apply Button Text</Label>
                  <Input
                    value={homeContent.applyButtonText}
                    onChange={(e) => setHomeContent({ ...homeContent, applyButtonText: e.target.value })}
                    placeholder="Apply Now 🚀"
                  />
                </div>
                <div>
                  <Label>Learn More Button Text</Label>
                  <Input
                    value={homeContent.learnMoreButtonText}
                    onChange={(e) => setHomeContent({ ...homeContent, learnMoreButtonText: e.target.value })}
                    placeholder="Learn More 📚"
                  />
                </div>
              </div>
              <div>
                <Label>Subtitle</Label>
                <Textarea
                  value={homeContent.subtitle}
                  onChange={(e) => setHomeContent({ ...homeContent, subtitle: e.target.value })}
                  placeholder="A nurturing primary school environment..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Students Value</Label>
                    <Input
                      value={homeContent.stats_students_value}
                      onChange={(e) => setHomeContent({ ...homeContent, stats_students_value: e.target.value })}
                      placeholder="400+"
                    />
                    <Label>Students Label</Label>
                    <Input
                      value={homeContent.stats_students_label}
                      onChange={(e) => setHomeContent({ ...homeContent, stats_students_label: e.target.value })}
                      placeholder="Happy Students 🎓"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ratio Value</Label>
                    <Input
                      value={homeContent.stats_ratio_value}
                      onChange={(e) => setHomeContent({ ...homeContent, stats_ratio_value: e.target.value })}
                      placeholder="30:1"
                    />
                    <Label>Ratio Label</Label>
                    <Input
                      value={homeContent.stats_ratio_label}
                      onChange={(e) => setHomeContent({ ...homeContent, stats_ratio_label: e.target.value })}
                      placeholder="Student-Teacher 👥"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years Value</Label>
                    <Input
                      value={homeContent.stats_years_value}
                      onChange={(e) => setHomeContent({ ...homeContent, stats_years_value: e.target.value })}
                      placeholder="10+"
                    />
                    <Label>Years Label</Label>
                    <Input
                      value={homeContent.stats_years_label}
                      onChange={(e) => setHomeContent({ ...homeContent, stats_years_label: e.target.value })}
                      placeholder="Years of Fun 🎉"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => saveContent("home", homeContent)} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> Save Home Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Section Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={aboutContent.title}
                    onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                    placeholder="About Our"
                  />
                </div>
                <div>
                  <Label>Title Highlight</Label>
                  <Input
                    value={aboutContent.titleHighlight}
                    onChange={(e) => setAboutContent({ ...aboutContent, titleHighlight: e.target.value })}
                    placeholder="Primary School"
                  />
                </div>
                <div>
                  <Label>Mission Title</Label>
                  <Input
                    value={aboutContent.missionTitle}
                    onChange={(e) => setAboutContent({ ...aboutContent, missionTitle: e.target.value })}
                    placeholder="Our Mission"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={aboutContent.description}
                  onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Mission Text</Label>
                <Textarea
                  value={aboutContent.missionText}
                  onChange={(e) => setAboutContent({ ...aboutContent, missionText: e.target.value })}
                  rows={4}
                />
              </div>
              <Button onClick={() => saveContent("about", aboutContent)} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> Save About Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Section */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Section Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={contactContent.title}
                    onChange={(e) => setContactContent({ ...contactContent, title: e.target.value })}
                    placeholder="Get in"
                  />
                </div>
                <div>
                  <Label>Title Highlight</Label>
                  <Input
                    value={contactContent.titleHighlight}
                    onChange={(e) => setContactContent({ ...contactContent, titleHighlight: e.target.value })}
                    placeholder="Touch"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={contactContent.phone}
                    onChange={(e) => setContactContent({ ...contactContent, phone: e.target.value })}
                    placeholder="+917061337068"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={contactContent.email}
                    onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })}
                    placeholder="rntpublics@gmail.com"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={contactContent.address}
                    onChange={(e) => setContactContent({ ...contactContent, address: e.target.value })}
                    placeholder="R.N.T Public School Janki Nagar"
                  />
                </div>
                <div>
                  <Label>Form Title</Label>
                  <Input
                    value={contactContent.formTitle}
                    onChange={(e) => setContactContent({ ...contactContent, formTitle: e.target.value })}
                    placeholder="Send Us a Message 💌"
                  />
                </div>
                <div>
                  <Label>Form Description</Label>
                  <Input
                    value={contactContent.formDescription}
                    onChange={(e) => setContactContent({ ...contactContent, formDescription: e.target.value })}
                    placeholder="We typically respond within 24 hours! ⏰"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={contactContent.description}
                  onChange={(e) => setContactContent({ ...contactContent, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={() => saveContent("contact", contactContent)} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> Save Contact Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Section */}
        <TabsContent value="gallery">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gallery Management</CardTitle>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> Upload Image
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Gallery Image</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewImage({ ...newImage, file: e.target.files?.[0] || null })}
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newImage.title}
                        onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                        placeholder="Image title"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newImage.category}
                        onValueChange={(value) => setNewImage({ ...newImage, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Emoji</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {emojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewImage({ ...newImage, emoji })}
                            className={`text-2xl p-2 rounded-lg transition-all ${
                              newImage.emoji === emoji ? "bg-primary/20 scale-110" : "hover:bg-muted"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleImageUpload} disabled={loading} className="w-full">
                      <Upload className="w-4 h-4 mr-2" /> Upload
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Gallery Settings */}
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-4">Gallery Section Settings</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={galleryContent.title}
                      onChange={(e) => setGalleryContent({ ...galleryContent, title: e.target.value })}
                      placeholder="Campus"
                    />
                  </div>
                  <div>
                    <Label>Title Highlight</Label>
                    <Input
                      value={galleryContent.titleHighlight}
                      onChange={(e) => setGalleryContent({ ...galleryContent, titleHighlight: e.target.value })}
                      placeholder="Gallery"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={galleryContent.description}
                      onChange={(e) => setGalleryContent({ ...galleryContent, description: e.target.value })}
                      placeholder="Explore our colorful facilities..."
                    />
                  </div>
                </div>
                <Button onClick={() => saveContent("gallery", galleryContent)} disabled={loading} className="mt-4">
                  <Save className="w-4 h-4 mr-2" /> Save Gallery Settings
                </Button>
              </div>

              {/* Gallery Images Grid */}
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group rounded-xl overflow-hidden border-2 ${
                      image.is_active ? "border-green-500" : "border-red-500 opacity-50"
                    }`}
                  >
                    <img
                      src={image.image_path.startsWith('/uploads') 
                        ? `${API_URL.replace('/api', '')}${image.image_path}` 
                        : image.image_path}
                      alt={image.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleImageActive(image)}
                      >
                        {image.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImage(image.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                      <p className="text-white text-sm truncate">{image.emoji} {image.title}</p>
                      <p className="text-white/70 text-xs">{image.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {galleryImages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No gallery images yet. Upload your first image!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notices Section */}
        <TabsContent value="notices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notice Board Management</CardTitle>
              <Dialog open={noticeDialogOpen} onOpenChange={(open) => {
                setNoticeDialogOpen(open);
                if (!open) {
                  setEditingNotice(null);
                  setNewNotice({
                    title: "",
                    content: "",
                    notice_type: "general",
                    is_important: false,
                    start_date: "",
                    end_date: "",
                  });
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Notice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingNotice ? "Edit Notice" : "Add New Notice"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        placeholder="Notice title"
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={newNotice.content}
                        onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                        placeholder="Notice content"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newNotice.notice_type}
                          onValueChange={(value) => setNewNotice({ ...newNotice, notice_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="result">Result</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          checked={newNotice.is_important}
                          onCheckedChange={(checked) => setNewNotice({ ...newNotice, is_important: checked })}
                        />
                        <Label>Important</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={newNotice.start_date}
                          onChange={(e) => setNewNotice({ ...newNotice, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={newNotice.end_date}
                          onChange={(e) => setNewNotice({ ...newNotice, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={saveNotice} disabled={loading} className="w-full">
                      <Save className="w-4 h-4 mr-2" /> {editingNotice ? "Update" : "Create"} Notice
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`p-4 rounded-lg border ${
                      notice.is_important ? "border-red-500 bg-red-50" : "border-gray-200"
                    } ${!notice.is_active ? "opacity-50" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notice.title}</h3>
                          {notice.is_important && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Important</span>
                          )}
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded capitalize">
                            {notice.notice_type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notice.start_date && `From: ${notice.start_date}`}
                          {notice.end_date && ` To: ${notice.end_date}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNotice(notice);
                            setNewNotice({
                              title: notice.title,
                              content: notice.content,
                              notice_type: notice.notice_type,
                              is_important: notice.is_important,
                              start_date: notice.start_date?.split('T')[0] || "",
                              end_date: notice.end_date?.split('T')[0] || "",
                            });
                            setNoticeDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteNotice(notice.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {notices.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No notices yet. Add your first notice!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandingPageManagement;

