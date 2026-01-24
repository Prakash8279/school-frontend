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
import { FileText, Award, TrendingUp, AlertCircle, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";

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
      const totalObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
      const totalMarks = subjects.reduce((sum, s) => sum + s.totalMarks, 0);
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

  // Generate PDF for current exam
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
      pdf.text(subject.marksObtained.toString(), x + 3, y + 6);
      x += colWidths[1];
      pdf.text(subject.totalMarks.toString(), x + 3, y + 6);
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
    pdf.text(currentExam.totalObtained.toString(), x + 3, y + 7);
    x += colWidths[1];
    pdf.text(currentExam.totalMarks.toString(), x + 3, y + 7);
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
                <Button variant="outline" size="sm" onClick={generatePDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
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
                      const subjectPercentage = Math.round((result.marksObtained / result.totalMarks) * 100);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.subject}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {result.marksObtained}
                          </TableCell>
                          <TableCell>{result.totalMarks}</TableCell>
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

