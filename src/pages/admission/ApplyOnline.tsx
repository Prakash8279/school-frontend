import { useState } from "react";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, FileText } from "lucide-react";

const ApplyOnline = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    classApplying: "",
    phone: "",
    email: "",
    address: "",
    previousSchool: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email body with form data
    const emailSubject = `New Admission Application - ${formData.studentName}`;
    const emailBody = `
=== NEW ADMISSION APPLICATION ===

--- Student Details ---
Student Name: ${formData.studentName}
Date of Birth: ${formData.dob}
Gender: ${formData.gender}
Class Applying For: ${formData.classApplying}

--- Parent Details ---
Father's Name: ${formData.fatherName}
Mother's Name: ${formData.motherName}
Phone Number: ${formData.phone}
Email: ${formData.email || 'Not provided'}

--- Other Details ---
Address: ${formData.address}
Previous School: ${formData.previousSchool || 'Not provided'}

================================
    `.trim();
    
    // Open email client with pre-filled data
    const mailtoLink = `mailto:rntpublics@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    toast.success("Opening email client... Please send the email to complete your application!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Apply Online</h1>
              <p className="text-xl text-gray-600">Fill the form below to apply for admission</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Student Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Student Name *</Label>
                      <Input
                        id="studentName"
                        value={formData.studentName}
                        onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="classApplying">Class Applying For *</Label>
                      <Select value={formData.classApplying} onValueChange={(value) => setFormData({...formData, classApplying: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nursery">Nursery</SelectItem>
                          <SelectItem value="lkg">LKG</SelectItem>
                          <SelectItem value="ukg">UKG</SelectItem>
                          <SelectItem value="1">Class 1</SelectItem>
                          <SelectItem value="2">Class 2</SelectItem>
                          <SelectItem value="3">Class 3</SelectItem>
                          <SelectItem value="4">Class 4</SelectItem>
                          <SelectItem value="5">Class 5</SelectItem>
                          <SelectItem value="6">Class 6</SelectItem>
                          <SelectItem value="7">Class 7</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Parent Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Parent Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fatherName">Father's Name *</Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motherName">Mother's Name *</Label>
                      <Input
                        id="motherName"
                        value={formData.motherName}
                        onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Address & Previous School */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Other Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="previousSchool">Previous School (if any)</Label>
                      <Input
                        id="previousSchool"
                        value={formData.previousSchool}
                        onChange={(e) => setFormData({...formData, previousSchool: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                  <Send className="w-5 h-5 mr-2" />
                  Submit Application
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default ApplyOnline;
