import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchResults, ExamResult } from "@/store/slices/resultSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Award, TrendingUp, AlertCircle, Download, RefreshCw, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";
import schoolLogo from "@/assets/school-logo.png";

interface GroupedResult {
  examName: string;
  subjects: ExamResult[];
  totalMarks: number;
  totalObtained: number;
  percentage: number;
  grade: string;
}

const StudentResults = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { results, loading } = useSelector((state: RootState) => state.results);

  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([]);
  const [currentExam, setCurrentExam] = useState<GroupedResult | null>(null);

  const examTypes = ["Mid Term", "Final Term", "Unit Test 1", "Unit Test 2", "Unit Test 3"];

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "D";
  };

  // Fetch results for the logged-in student
  useEffect(() => {
    if (userInfo?.admission_no) {
      dispatch(fetchResults({ admissionNo: userInfo.admission_no }));
    }
  }, [dispatch, userInfo]);

  // Group results by exam
  useEffect(() => {
    const grouped: { [key: string]: ExamResult[] } = {};

    results.forEach((result) => {
      if (!grouped[result.examName]) {
        grouped[result.examName] = [];
      }
      grouped[result.examName].push(result);
    });

    const processedGroups: GroupedResult[] = Object.entries(grouped).map(([examName, subjects]) => {
      const totalObtained = subjects.reduce((sum, s) => sum + Number(s.marksObtained || 0), 0);
      const totalMarks = subjects.reduce((sum, s) => sum + Number(s.totalMarks || 0), 0);
      const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

      return {
        examName,
        subjects,
        totalMarks,
        totalObtained,
        percentage,
        grade: calculateGrade(percentage),
      };
    });

    setGroupedResults(processedGroups);
    
    // Set current exam to first one if available
    if (processedGroups.length > 0 && !currentExam) {
      setCurrentExam(processedGroups[0]);
      setSelectedExam(processedGroups[0].examName);
    }
  }, [results]);

  // Update current exam when selection changes
  useEffect(() => {
    if (selectedExam === "all") {
      setCurrentExam(null);
    } else {
      const exam = groupedResults.find((r) => r.examName === selectedExam);
      setCurrentExam(exam || null);
    }
  }, [selectedExam, groupedResults]);

  const getGradeColor = (grade: string) => {
    if (grade === "A+" || grade === "First") return "bg-green-100 text-green-800";
    if (grade === "A" || grade === "Second") return "bg-blue-100 text-blue-800";
    if (grade === "B+" || grade === "Third") return "bg-purple-100 text-purple-800";
    if (grade === "B") return "bg-yellow-100 text-yellow-800";
    if (grade === "C") return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // School Constants
  const SCHOOL_NAME = "R.N.T. PUBLIC SCHOOL";
  const SCHOOL_TAGLINE = "Jankinagar Basantpur, Siwan (Bihar)";
  const SCHOOL_CONTACT = "Phone: +91-7061337068 | Email: rntpublics@gmail.com";

  // Generate Professional Report Card PDF (Same as Admin)
  const generateReportCard = async () => {
    if (!currentExam) {
      toast.error("Please select an exam to download");
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    
    // Draw outer border (double line effect)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(1);
    pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
    pdf.setLineWidth(0.3);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Load school logo
    let logoData: string | null = null;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = schoolLogo;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      logoData = canvas.toDataURL('image/png');
    } catch (e) {
      console.log('School logo not loaded', e);
    }
    
    // Load student photo
    let studentPhotoData: string | null = null;
    if (userInfo?.image) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/image/base64?path=${encodeURIComponent(userInfo.image)}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            studentPhotoData = data.data;
          }
        }
      } catch (e) {
        console.log('Student photo not loaded', e);
      }
    }
    
    let y = 16;
    
    // Add School Logo on the left side of header
    if (logoData) {
      pdf.addImage(logoData, 'PNG', margin, y - 2, 20, 20);
    }
    
    // Header - School Name (centered, accounting for logo)
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text(SCHOOL_NAME, pageWidth / 2, y + 6, { align: "center" });
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text(SCHOOL_TAGLINE, pageWidth / 2, y + 12, { align: "center" });
    
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    pdf.text(SCHOOL_CONTACT, pageWidth / 2, y + 17, { align: "center" });
    
    y = 38;
    
    // Horizontal line separator
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    
    y += 8;
    
    // Title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROGRESS REPORT CARD", pageWidth / 2, y, { align: "center" });
    
    y += 10;
    
    // STUDENT DETAILS Section Header
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, y, contentWidth, 8);
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.rect(margin, y, contentWidth, 8, 'S');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("STUDENT DETAILS", margin + 3, y + 5.5);
    
    y += 12;
    
    // Student Photo in details section (right side)
    const photoX = pageWidth - margin - 28;
    const photoY = y;
    const photoWidth = 25;
    const photoHeight = 30;
    
    if (studentPhotoData) {
      pdf.addImage(studentPhotoData, 'JPEG', photoX, photoY, photoWidth, photoHeight);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.rect(photoX, photoY, photoWidth, photoHeight);
    } else {
      // Draw placeholder box if no student photo
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.3);
      pdf.rect(photoX, photoY, photoWidth, photoHeight);
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Photo", photoX + photoWidth/2, photoY + photoHeight/2 + 2, { align: "center" });
      pdf.setTextColor(0, 0, 0);
    }
    
    // Student Info Grid
    pdf.setFontSize(10);
    const labelX = margin;
    const valueX = margin + 35;
    
    // Row 1: Name
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Name:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(userInfo?.name || userInfo?.student_name || "-", valueX, y);
    
    y += 6;
    
    // Row 2: Admission No
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Admission No:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(userInfo?.admission_no || "-", valueX, y);
    
    y += 6;
    
    // Row 3: Class
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Class:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(userInfo?.classname || "-", valueX, y);
    
    y += 6;
    
    // Row 4: Roll No
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Roll No:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(userInfo?.roll_no || "-", valueX, y);
    
    y += 6;
    
    // Row 5: Exam
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Exam:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(currentExam.examName || "-", valueX, y);
    
    // Move y to after photo area if photo is taller
    y = Math.max(y + 10, photoY + photoHeight + 5);
    
    // ACADEMIC PERFORMANCE Section Header
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, y, contentWidth, 8);
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.rect(margin, y, contentWidth, 8, 'S');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("ACADEMIC PERFORMANCE", margin + 3, y + 5.5);
    
    y += 12;
    
    // Table Header Row
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.rect(margin, y, contentWidth, 8, 'S');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    
    const colSubject = margin + 3;
    const colMax = margin + 90;
    const colObtained = margin + 120;
    const colGrade = margin + 155;
    
    pdf.text("Subject", colSubject, y + 5.5);
    pdf.text("Max Marks", colMax, y + 5.5);
    pdf.text("Obtained", colObtained, y + 5.5);
    pdf.text("Grade", colGrade, y + 5.5);
    
    y += 8;
    
    // Subject Rows
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    currentExam.subjects.forEach((result) => {
      const marks = Number(result.marksObtained) || 0;
      const subjectGrade = marks >= 91 ? 'A+' : marks >= 81 ? 'A' : marks >= 71 ? 'B+' : marks >= 61 ? 'B' : marks >= 51 ? 'C+' : marks >= 41 ? 'C' : marks >= 33 ? 'D' : 'F';
      
      // Draw row border
      pdf.setDrawColor(180, 180, 180);
      pdf.line(margin, y + 7, margin + contentWidth, y + 7);
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(result.subject, colSubject, y + 5);
      pdf.text(Number(result.totalMarks || 0).toString(), colMax + 10, y + 5);
      
      pdf.setFont("helvetica", "bold");
      pdf.text(marks.toString(), colObtained + 10, y + 5);
      pdf.text(subjectGrade, colGrade + 5, y + 5);
      pdf.setFont("helvetica", "normal");
      
      y += 7;
    });
    
    y += 3;
    
    // Subtotal Row
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(margin, y, contentWidth, 8, 'S');
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Subtotal (Total Marks):", colSubject, y + 5.5);
    pdf.text(`${currentExam.totalObtained} / ${currentExam.totalMarks}`, pageWidth - margin - 3, y + 5.5, { align: "right" });
    
    y += 12;
    
    // TOTAL RESULT Row
    pdf.setFillColor(220, 220, 220);
    pdf.rect(margin, y, contentWidth, 10, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, y, contentWidth, 10, 'S');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("PERCENTAGE OBTAINED:", margin + 3, y + 7);
    pdf.text(`${currentExam.percentage.toFixed(2)}%`, pageWidth - margin - 3, y + 7, { align: "right" });
    
    y += 16;
    
    // Result Summary
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    
    const divisionText = currentExam.percentage >= 60 ? "FIRST" : currentExam.percentage >= 45 ? "SECOND" : currentExam.percentage >= 33 ? "THIRD" : "FAIL";
    pdf.text(`RESULT: ${divisionText} DIVISION`, margin, y);
    
    y += 7;
    pdf.text(`TOTAL MARKS: `, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${currentExam.totalObtained}`, margin + 35, y);
    
    y += 7;
    pdf.setFont("helvetica", "bold");
    pdf.text(`OVERALL GRADE: `, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${currentExam.grade}`, margin + 38, y);
    
    y += 20;
    
    // Signature Section
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    // Left signature
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, margin + 50, y);
    pdf.text("Class Teacher Signature", margin, y + 5);
    
    // Center signature
    pdf.line(pageWidth/2 - 25, y, pageWidth/2 + 25, y);
    pdf.text("Principal Signature", pageWidth/2, y + 5, { align: "center" });
    
    // Right signature  
    pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y);
    pdf.text("Parent/Guardian Signature", pageWidth - margin - 50, y + 5);
    
    // Date at bottom
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, pageHeight - 15, { align: "right" });

    pdf.save(`ReportCard_${userInfo?.student_name || userInfo?.name}_${currentExam.examName.replace(/\s+/g, '_')}.pdf`);
    toast.success("Report Card downloaded!");
  };

  // Generate PDF for current exam (Simple Version)
  const generatePDF = () => {
    if (!currentExam) {
      toast.error("Please select an exam to download");
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    const pageWidth = 210;
    let y = 20;

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("R.N.T. PUBLIC SCHOOL", pageWidth / 2, y, { align: "center" });
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Jankinagar Basantpur, Siwan (Bihar)", pageWidth / 2, y + 6, { align: "center" });
    
    // Line
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y + 15, pageWidth - margin, y + 15);
    y += 30;

    // Title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("STUDENT RESULT CARD", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Student Info
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Student Name: ${userInfo?.name || userInfo?.student_name || "-"}`, margin, y);
    y += 7;
    pdf.text(`Admission No: ${userInfo?.admission_no || "-"}`, margin, y);
    y += 7;
    pdf.text(`Class: ${userInfo?.classname || "-"}`, margin, y);
    y += 7;
    pdf.text(`Exam: ${currentExam.examName}`, margin, y);
    y += 15;

    // Table Header
    const colWidths = [70, 35, 35, 30];
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F');
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    let x = margin;
    pdf.text("Subject", x + 3, y + 7);
    x += colWidths[0];
    pdf.text("Marks", x + 3, y + 7);
    x += colWidths[1];
    pdf.text("Total", x + 3, y + 7);
    x += colWidths[2];
    pdf.text("Grade", x + 3, y + 7);
    y += 10;

    // Table Body
    pdf.setFont("helvetica", "normal");
    currentExam.subjects.forEach((subject) => {
      x = margin;
      pdf.rect(margin, y, pageWidth - margin * 2, 8, 'S');
      
      pdf.text(subject.subject, x + 3, y + 6);
      x += colWidths[0];
      pdf.text(Number(subject.marksObtained || 0).toString(), x + 3, y + 6);
      x += colWidths[1];
      pdf.text(Number(subject.totalMarks || 0).toString(), x + 3, y + 6);
      x += colWidths[2];
      pdf.text(subject.grade, x + 3, y + 6);
      y += 8;
    });

    // Total Row
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F');
    pdf.rect(margin, y, pageWidth - margin * 2, 10, 'S');
    
    pdf.setFont("helvetica", "bold");
    x = margin;
    pdf.text("TOTAL", x + 3, y + 7);
    x += colWidths[0];
    pdf.text(Number(currentExam.totalObtained || 0).toString(), x + 3, y + 7);
    x += colWidths[1];
    pdf.text(Number(currentExam.totalMarks || 0).toString(), x + 3, y + 7);
    x += colWidths[2];
    pdf.text(currentExam.grade, x + 3, y + 7);
    y += 20;

    // Summary
    pdf.setFontSize(12);
    pdf.text(`Percentage: ${currentExam.percentage.toFixed(2)}%`, margin, y);
    y += 8;
    pdf.text(`Overall Grade: ${currentExam.grade}`, margin, y);
    y += 20;

    // Footer
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pdf.internal.pageSize.height - 15);
    pdf.text("This is a computer-generated document.", pageWidth - margin - 60, pdf.internal.pageSize.height - 15);

    pdf.save(`Result_${currentExam.examName.replace(/\s+/g, '_')}.pdf`);
    toast.success("Result PDF downloaded!");
  };

  // Get available exam names from results
  const availableExams = [...new Set(results.map((r) => r.examName))];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            My Results
          </h1>
          <p className="text-muted-foreground mt-1">View your examination results</p>
        </div>
        <Button
          variant="outline"
          onClick={() => dispatch(fetchResults({ admissionNo: userInfo?.admission_no }))}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Exam Selector */}
      {availableExams.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-sm font-medium">Select Exam:</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {availableExams.map((exam) => (
                    <SelectItem key={exam} value={exam}>
                      {exam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading results...
        </div>
      )}

      {!loading && results.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No results available yet. Results will be published after examination.
          </AlertDescription>
        </Alert>
      ) : !loading && currentExam ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{currentExam.totalMarks}</div>
                <p className="text-xs text-blue-700 mt-1">Maximum Marks</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Obtained Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{currentExam.totalObtained}</div>
                <p className="text-xs text-green-700 mt-1">Out of {currentExam.totalMarks}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{currentExam.percentage.toFixed(1)}%</div>
                <p className="text-xs text-purple-700 mt-1">Overall Performance</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Overall Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`text-lg px-4 py-2 ${getGradeColor(currentExam.grade)}`}>
                  {currentExam.grade}
                </Badge>
                <p className="text-xs text-orange-700 mt-2">Final Grade</p>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {currentExam.examName} - Subject Wise Results
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={generateReportCard}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Report Card
                  </Button>
                  <Button variant="outline" size="sm" onClick={generatePDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Simple PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentExam.subjects.map((result, index) => {
                      const marksObtained = Number(result.marksObtained || 0);
                      const totalMarks = Number(result.totalMarks || 0);
                      const subjectPercentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.subject}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {marksObtained}
                          </TableCell>
                          <TableCell>{totalMarks}</TableCell>
                          <TableCell>{subjectPercentage}%</TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Performance</span>
                  <Badge className={getGradeColor(currentExam.grade)}>{currentExam.grade}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      currentExam.percentage >= 80 ? "bg-green-500" :
                      currentExam.percentage >= 60 ? "bg-blue-500" :
                      currentExam.percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${currentExam.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{currentExam.percentage.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default StudentResults;

