import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchResults, bulkAddResults, ExamResult } from "@/store/slices/resultSlice";
import { listStudents } from "@/store/slices/studentSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Save, RefreshCw, Upload, Settings, BarChart3, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from 'xlsx';

// Types
interface Subject {
  name: string;
  code: string;
}

interface GradingConfig {
  first: { min: number; max: number };
  second: { min: number; max: number };
  third: { min: number; max: number };
  fail: { min: number; max: number };
}

interface StudentResultEntry {
  studentId: string;
  studentName: string;
  rollNo: string;
  admissionNo: string;
  fatherName: string;
  image?: string;
  subjects: { [subjectName: string]: number };
  totalMarks: number;
  percentage: number;
  overallGrade: string;
}

// Form Schema
const resultFormSchema = z.object({
  classname: z.string().min(1, "Please select a class"),
  academicYear: z.string().min(1, "Please enter academic year"),
  examType: z.string().min(1, "Please select exam type"),
});

const ResultsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { students: allStudents } = useSelector((state: RootState) => state.student);
  const { results: apiResults, loading } = useSelector((state: RootState) => state.results);
  const role = userInfo?.role;

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentEntries, setStudentEntries] = useState<StudentResultEntry[]>([]);
  const [showGradingDialog, setShowGradingDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("results");
  const [subjectClass, setSubjectClass] = useState<string>("");
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [newSubjectCode, setNewSubjectCode] = useState<string>("");
  const [gradingConfig, setGradingConfig] = useState<GradingConfig>({
    first: { min: 90, max: 100 },
    second: { min: 75, max: 89 },
    third: { min: 50, max: 74 },
    fail: { min: 0, max: 49 }
  });

  const form = useForm<z.infer<typeof resultFormSchema>>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      classname: "",
      academicYear: new Date().getFullYear().toString(),
      examType: "",
    },
  });

  const classes = ["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];
  const examTypes = ["Mid Term", "Final Term", "Unit Test 1", "Unit Test 2", "Unit Test 3", "Pre-Board", "Board Exam"];

  // Fetch subjects from API for selected class
  const fetchSubjectsForClass = async (classname: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subjects?class=${encodeURIComponent(classname)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const subjectsList: Subject[] = data.map((s: any) => ({
          name: s.subject_name,
          code: s.subject_code
        }));
        setSubjects(subjectsList);
        console.log(`Loaded ${subjectsList.length} subjects for ${classname}:`, subjectsList);
      } else {
        console.error('Failed to fetch subjects');
        toast.error('Failed to load subjects for this class');
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Error loading subjects');
      setSubjects([]);
    }
  };

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= gradingConfig.first.min) return "First";
    if (percentage >= gradingConfig.second.min) return "Second";
    if (percentage >= gradingConfig.third.min) return "Third";
    return "Fail";
  };

  // Fetch students when component mounts
  useEffect(() => {
    dispatch(listStudents());
  }, [dispatch]);

  // Load data when class and exam are selected
  useEffect(() => {
    if (selectedClass && selectedExam) {
      // Fetch subjects for selected class from API
      fetchSubjectsForClass(selectedClass);
      
      // Fetch existing results from API
      dispatch(fetchResults({ classname: selectedClass, examName: selectedExam }));
    }
  }, [selectedClass, selectedExam, dispatch]);

  // Initialize student entries when students or results or subjects change
  useEffect(() => {
    if (selectedClass && allStudents.length > 0 && subjects.length > 0) {
      const classStudents = allStudents.filter((s: any) => s.classname === selectedClass);
      
      const entries: StudentResultEntry[] = classStudents.map((student: any) => {
        // Check if there are existing results for this student
        const studentResults = apiResults.filter(
          (r) => r.admissionNo === student.admission_no && r.examName === selectedExam
        );
        
        // Build subjects marks from existing results
        const subjectMarks: { [key: string]: number } = {};
        subjects.forEach((sub) => {
          const existingResult = studentResults.find((r) => r.subject === sub.name);
          subjectMarks[sub.name] = existingResult ? Number(existingResult.marksObtained) || 0 : 0;
        });

        // Calculate totals
        const marks = Object.values(subjectMarks).map(m => Number(m) || 0);
        const totalMarks = marks.reduce((sum, m) => sum + m, 0);
        const percentage = marks.length > 0 ? (totalMarks / (marks.length * 100)) * 100 : 0;

        return {
          studentId: student._id,
          studentName: student.student_name,
          rollNo: student.roll_no || "",
          admissionNo: student.admission_no,
          fatherName: student.father_name || "-",
          image: student.image || "",
          subjects: subjectMarks,
          totalMarks,
          percentage,
          overallGrade: calculateGrade(percentage),
        };
      });

      setStudentEntries(entries);
    }
  }, [selectedClass, allStudents, apiResults, selectedExam, subjects]);

  // Update marks for a student
  const updateMarks = (admissionNo: string, subjectName: string, marks: number) => {
    setStudentEntries((prev) =>
      prev.map((entry) => {
        if (entry.admissionNo === admissionNo) {
          const updatedSubjects = { ...entry.subjects, [subjectName]: Number(marks) || 0 };
          const marksArray = Object.values(updatedSubjects).map(m => Number(m) || 0);
          const totalMarks = marksArray.reduce((sum, m) => sum + m, 0);
          const percentage = marksArray.length > 0 ? (totalMarks / (marksArray.length * 100)) * 100 : 0;
          
          return {
            ...entry,
            subjects: updatedSubjects,
            totalMarks,
            percentage,
            overallGrade: calculateGrade(percentage),
          };
        }
        return entry;
      })
    );
  };

  // Save all results to API
  const saveAllResults = async () => {
    if (!selectedClass || !selectedExam) {
      toast.error("Please select class and exam type");
      return;
    }

    const academicYear = form.getValues("academicYear");
    const resultsToSave: ExamResult[] = [];

    studentEntries.forEach((entry) => {
      subjects.forEach((subject) => {
        const marks = entry.subjects[subject.name] || 0;
        resultsToSave.push({
          studentName: entry.studentName,
          studentId: entry.studentId,
          admissionNo: entry.admissionNo,
          classname: selectedClass,
          examName: selectedExam,
          subject: subject.name,
          marksObtained: marks,
          totalMarks: 100,
          grade: calculateGrade(marks),
          academicYear,
        });
      });
    });

    try {
      await dispatch(bulkAddResults(resultsToSave)).unwrap();
      toast.success("All results saved successfully!");
    } catch (error: any) {
      toast.error(error || "Failed to save results");
    }
  };

  // Excel Import Function
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Expected format: Admission No, Student Name, Subject1, Subject2, ...
        if (jsonData.length === 0) {
          toast.error("Excel file is empty");
          return;
        }

        // Update student entries with Excel data
        const updatedEntries = [...studentEntries];
        jsonData.forEach((row) => {
          const admissionNo = row['Admission No'] || row['admission_no'];
          const entryIndex = updatedEntries.findIndex(e => e.admissionNo === admissionNo);
          
          if (entryIndex >= 0) {
            subjects.forEach((subject) => {
              const marks = Number(row[subject.name]) || 0;
              updatedEntries[entryIndex].subjects[subject.name] = marks;
            });

            // Recalculate totals
            const marksArray = Object.values(updatedEntries[entryIndex].subjects).map(m => Number(m) || 0);
            updatedEntries[entryIndex].totalMarks = marksArray.reduce((sum: number, m: number) => sum + m, 0);
            updatedEntries[entryIndex].percentage = (updatedEntries[entryIndex].totalMarks / (marksArray.length * 100)) * 100;
            updatedEntries[entryIndex].overallGrade = calculateGrade(updatedEntries[entryIndex].percentage);
          }
        });

        setStudentEntries(updatedEntries);
        toast.success(`Imported marks for ${jsonData.length} students from Excel`);
      } catch (error) {
        console.error('Excel import error:', error);
        toast.error("Failed to import Excel file");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Excel Template
  const downloadExcelTemplate = () => {
    const templateData = studentEntries.map(entry => {
      const row: any = {
        'Admission No': entry.admissionNo,
        'Student Name': entry.studentName,
        'Roll No': entry.rollNo
      };
      subjects.forEach(subject => {
        row[subject.name] = 0;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, `${selectedClass}_${selectedExam}_Template.xlsx`);
    toast.success("Template downloaded");
  };

  // Get Analytics
  const getAnalytics = () => {
    if (studentEntries.length === 0) return null;

    const totalStudents = studentEntries.length;
    const passStudents = studentEntries.filter(e => e.percentage >= gradingConfig.third.min).length;
    const failStudents = totalStudents - passStudents;
    const passPercentage = ((passStudents / totalStudents) * 100).toFixed(2);

    const toppers = [...studentEntries]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    const gradeDistribution = {
      first: studentEntries.filter(e => e.percentage >= gradingConfig.first.min).length,
      second: studentEntries.filter(e => e.percentage >= gradingConfig.second.min && e.percentage < gradingConfig.first.min).length,
      third: studentEntries.filter(e => e.percentage >= gradingConfig.third.min && e.percentage < gradingConfig.second.min).length,
      fail: failStudents
    };

    const averagePercentage = (studentEntries.reduce((sum, e) => sum + e.percentage, 0) / totalStudents).toFixed(2);

    return {
      totalStudents,
      passStudents,
      failStudents,
      passPercentage,
      averagePercentage,
      toppers,
      gradeDistribution
    };
  };

  // Subject Management Functions
  const addSubject = async () => {
    if (!subjectClass || !newSubjectName || !newSubjectCode) {
      toast.error("Please fill all subject fields");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class: subjectClass,
          subject_name: newSubjectName,
          subject_code: newSubjectCode
        })
      });

      if (response.ok) {
        toast.success("Subject added successfully");
        setNewSubjectName("");
        setNewSubjectCode("");
        loadSubjectsForManagement(subjectClass);
      } else {
        const errorData = await response.json();
        console.error("Add subject error:", errorData);
        toast.error(errorData.message || "Failed to add subject");
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Error adding subject");
    }
  };

  const deleteSubject = async (subjectId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Subject deleted successfully");
        if (subjectClass) {
          fetchSubjectsForClass(subjectClass);
        }
      } else {
        toast.error("Failed to delete subject");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Error deleting subject");
    }
  };

  const loadSubjectsForManagement = async (classname: string) => {
    setSubjectClass(classname);
    await fetchSubjectsForClass(classname);
  };

  // School Constants (same as Fee Receipt)
  const SCHOOL_NAME = "R.N.T. PUBLIC SCHOOL";
  const SCHOOL_TAGLINE = "Jankinagar Basantpur, Siwan (Bihar)";
  const SCHOOL_CONTACT = "Phone: +91-7061337068 | Email: rntpublics@gmail.com";

  // Generate Individual Report Card PDF (Black & White with Border and Student Photo)
  const generateReportCard = async (entry: StudentResultEntry) => {
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
    
    // Load school logo from assets
    let logoLoaded = false;
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = '/src/assets/school-logo.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(logoImg, 0, 0);
      const logoBase64 = canvas.toDataURL('image/png');
      pdf.addImage(logoBase64, 'PNG', margin, 14, 22, 22);
      logoLoaded = true;
    } catch (e) {
      console.log('Logo not loaded', e);
    }
    
    // Load student photo (will be used later in student details section)
    let studentPhotoData: string | null = null;
    if (entry.image) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/image/base64?path=${encodeURIComponent(entry.image)}`,
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
    
    // Header - School Name (Black text)
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text(SCHOOL_NAME, pageWidth / 2, y + 6, { align: "center" });
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80, 80, 80);
    pdf.text(SCHOOL_CONTACT, pageWidth / 2, y + 13, { align: "center" });
    
    y = 38;
    
    // Horizontal line separator
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    
    y += 8;
    
    // Title - PROGRESS REPORT CARD (plain text, no box)
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
      // Draw border around photo
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
    
    // Student Info Grid (left side, leaving space for photo on right)
    pdf.setFontSize(10);
    const labelX = margin;
    const valueX = margin + 35;
    const detailsWidth = photoX - margin - 5; // Leave gap before photo
    
    // Row 1: Name
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Name:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(entry.studentName, valueX, y);
    
    y += 6;
    
    // Row 2: Admission No
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Admission No:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(entry.admissionNo, valueX, y);
    
    y += 6;
    
    // Row 3: Class
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Class:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(selectedClass, valueX, y);
    
    y += 6;
    
    // Row 4: Roll No
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Roll No:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(entry.rollNo || '-', valueX, y);
    
    y += 6;
    
    // Row 5: Father's Name
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Father's Name:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(entry.fatherName || '-', valueX, y);
    
    y += 6;
    
    // Row 6: Exam
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Exam:", labelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(selectedExam || '-', valueX, y);
    
    // Move y to after photo area if photo is taller
    y = Math.max(y + 10, photoY + photoHeight + 5);
    
    // ACADEMIC PERFORMANCE Section Header (Black & White)
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
    
    // Table Header Row (Black & White style)
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
    
    // Subject Rows (Black & White)
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    subjects.forEach((subject, index) => {
      const marks = Number(entry.subjects[subject.name]) || 0;
      const subjectGrade = marks >= 91 ? 'A+' : marks >= 81 ? 'A' : marks >= 71 ? 'B+' : marks >= 61 ? 'B' : marks >= 51 ? 'C+' : marks >= 41 ? 'C' : marks >= 33 ? 'D' : 'F';
      
      // Draw row border
      pdf.setDrawColor(180, 180, 180);
      pdf.line(margin, y + 7, margin + contentWidth, y + 7);
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(subject.name, colSubject, y + 5);
      pdf.text("100", colMax + 10, y + 5);
      
      // All marks in black
      pdf.setFont("helvetica", "bold");
      pdf.text(marks.toString(), colObtained + 10, y + 5);
      pdf.text(subjectGrade, colGrade + 5, y + 5);
      pdf.setFont("helvetica", "normal");
      
      y += 7;
    });
    
    y += 3;
    
    // Subtotal Row (Gray background - Black & White)
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(margin, y, contentWidth, 8, 'S');
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Subtotal (Total Marks):", colSubject, y + 5.5);
    pdf.text(`${entry.totalMarks} / ${subjects.length * 100}`, pageWidth - margin - 3, y + 5.5, { align: "right" });
    
    y += 12;
    
    // TOTAL RESULT Row (Black border, gray fill)
    pdf.setFillColor(220, 220, 220);
    pdf.rect(margin, y, contentWidth, 10, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, y, contentWidth, 10, 'S');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("PERCENTAGE OBTAINED:", margin + 3, y + 7);
    pdf.text(`${entry.percentage.toFixed(2)}%`, pageWidth - margin - 3, y + 7, { align: "right" });
    
    y += 16;
    
    // Result Summary (Black & White)
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    
    pdf.text(`RESULT: ${entry.overallGrade.toUpperCase()} DIVISION`, margin, y);
    
    y += 7;
    pdf.text(`TOTAL MARKS: `, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${entry.totalMarks}`, margin + 35, y);
    
    y += 20;
    
    // Signature Section (Black & White)
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    // Left signature
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, margin + 50, y);
    pdf.text("Class Teacher Signature", margin, y + 5);
    
    // Right signature  
    pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y);
    pdf.text("Parent/Guardian Signature", pageWidth - margin - 50, y + 5);
    
    // Date at bottom right corner
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, pageHeight - 15, { align: "right" });
    
    pdf.save(`ReportCard_${entry.studentName.replace(/\s+/g, '_')}_${selectedClass}_${selectedExam}.pdf`);
    toast.success(`Report card downloaded for ${entry.studentName}`);
  };

  // Generate PDF
  const generateResultsPDF = async () => {
    if (!selectedClass || studentEntries.length === 0) {
      toast.error("No results to generate PDF");
      return;
    }

    const pdf = new jsPDF('l', 'mm', 'a4');
    const margin = 15;
    const pageWidth = 297;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("R.N.T. PUBLIC SCHOOL", pageWidth / 2, y + 8, { align: "center" });

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Jankinagar Basantpur, Siwan (Bihar)", pageWidth / 2, y + 14, { align: "center" });

    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y + 25, pageWidth - margin, y + 25);
    y += 35;

    // Title
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`RESULT SHEET - CLASS ${selectedClass.toUpperCase()}`, pageWidth / 2, y, { align: "center" });

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const acYear = form.getValues("academicYear");
    pdf.text(`Academic Year: ${acYear}  |  Exam: ${selectedExam}`, pageWidth / 2, y + 6, { align: "center" });
    y += 15;

    // Table Header
    const rollWidth = 15;
    const nameWidth = 50;
    const statsWidth = 20;
    const remainingWidth = contentWidth - rollWidth - nameWidth - statsWidth * 3;
    const subjectWidth = remainingWidth / subjects.length;
    const headerHeight = 10;

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, y, contentWidth, headerHeight, 'F');
    pdf.rect(margin, y, contentWidth, headerHeight, 'S');

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    let x = margin;
    pdf.text("Roll", x + 2, y + 6);
    x += rollWidth;
    pdf.text("Student Name", x + 2, y + 6);
    x += nameWidth;

    subjects.forEach((sub) => {
      pdf.text(sub.code.substring(0, 6), x + 2, y + 6);
      x += subjectWidth;
    });

    pdf.text("Total", x + 2, y + 6);
    x += statsWidth;
    pdf.text("%", x + 2, y + 6);
    x += statsWidth;
    pdf.text("Grade", x + 2, y + 6);

    y += headerHeight;

    // Table Body
    pdf.setFont("helvetica", "normal");
    const rowHeight = 8;

    studentEntries.forEach((entry) => {
      if (y > 180) {
        pdf.addPage();
        y = 20;
      }

      x = margin;
      pdf.rect(margin, y, contentWidth, rowHeight, 'S');

      pdf.text(entry.rollNo || entry.admissionNo || "-", x + 2, y + 5.5);
      x += rollWidth;

      pdf.text(entry.studentName.substring(0, 25), x + 2, y + 5.5);
      x += nameWidth;

      subjects.forEach((subject) => {
        const val = entry.subjects[subject.name]?.toString() || "-";
        pdf.text(val, x + 2, y + 5.5);
        x += subjectWidth;
      });

      pdf.text(entry.totalMarks.toString(), x + 2, y + 5.5);
      x += statsWidth;

      pdf.text(entry.percentage.toFixed(1), x + 2, y + 5.5);
      x += statsWidth;

      pdf.text(entry.overallGrade || "-", x + 2, y + 5.5);

      y += rowHeight;
    });

    // Footer
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.text("Generated by School Management System", margin, pageHeight - 10);
    pdf.text(new Date().toLocaleDateString(), pageWidth - margin - 20, pageHeight - 10);

    pdf.save(`Results_${selectedClass}_${selectedExam}.pdf`);
    toast.success("Results PDF downloaded!");
  };

  // Access control
  if (role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Results management is restricted to Admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Results Management System</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage student results, subjects, and generate comprehensive reports
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Results Entry</TabsTrigger>
              <TabsTrigger value="subjects">Subject Management</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6 mt-6">
              <Form {...form}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="classname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Class</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedClass(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <FormControl>
                        <Input placeholder="2024-2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="examType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedExam(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {examTypes.map((exam) => (
                            <SelectItem key={exam} value={exam}>
                              {exam}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          {selectedClass && selectedExam && (
            <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
              <h3 className="text-xl font-semibold">
                Enter Results - Class {selectedClass} ({selectedExam})
              </h3>
              <div className="flex gap-2 flex-wrap">
                <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Grading Config
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Grading Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">First Division</label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              value={gradingConfig.first.min}
                              onChange={(e) => setGradingConfig({...gradingConfig, first: {...gradingConfig.first, min: parseInt(e.target.value)}})}
                              placeholder="Min"
                            />
                            <Input
                              type="number"
                              value={gradingConfig.first.max}
                              onChange={(e) => setGradingConfig({...gradingConfig, first: {...gradingConfig.first, max: parseInt(e.target.value)}})}
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Second Division</label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              value={gradingConfig.second.min}
                              onChange={(e) => setGradingConfig({...gradingConfig, second: {...gradingConfig.second, min: parseInt(e.target.value)}})}
                              placeholder="Min"
                            />
                            <Input
                              type="number"
                              value={gradingConfig.second.max}
                              onChange={(e) => setGradingConfig({...gradingConfig, second: {...gradingConfig.second, max: parseInt(e.target.value)}})}
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Third Division</label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              value={gradingConfig.third.min}
                              onChange={(e) => setGradingConfig({...gradingConfig, third: {...gradingConfig.third, min: parseInt(e.target.value)}})}
                              placeholder="Min"
                            />
                            <Input
                              type="number"
                              value={gradingConfig.third.max}
                              onChange={(e) => setGradingConfig({...gradingConfig, third: {...gradingConfig.third, max: parseInt(e.target.value)}})}
                              placeholder="Max"
                            />
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => {
                        // Recalculate all grades
                        const updated = studentEntries.map(e => ({
                          ...e,
                          overallGrade: calculateGrade(e.percentage)
                        }));
                        setStudentEntries(updated);
                        setShowGradingDialog(false);
                        toast.success("Grading configuration updated");
                      }}>
                        Apply Configuration
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" onClick={() => setShowAnalytics(!showAnalytics)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showAnalytics ? "Hide" : "Show"} Analytics
                </Button>

                <Button variant="outline" size="sm" onClick={downloadExcelTemplate}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Template
                </Button>

                <label htmlFor="excel-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Excel
                    </span>
                  </Button>
                </label>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelImport}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(fetchResults({ classname: selectedClass, examName: selectedExam }))}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button onClick={saveAllResults} disabled={loading} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save All
                </Button>
                <Button
                  onClick={generateResultsPDF}
                  disabled={studentEntries.length === 0}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Analytics Section */}
            {showAnalytics && getAnalytics() && (
              <div className="mb-6 p-4 bg-muted rounded-lg space-y-4">
                <h3 className="font-semibold text-lg">Class Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-background p-3 rounded border">
                    <div className="text-sm text-muted-foreground">Total Students</div>
                    <div className="text-2xl font-bold">{getAnalytics()?.totalStudents}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="text-sm text-green-700">Pass</div>
                    <div className="text-2xl font-bold text-green-700">{getAnalytics()?.passStudents}</div>
                    <div className="text-xs text-green-600">{getAnalytics()?.passPercentage}%</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <div className="text-sm text-red-700">Fail</div>
                    <div className="text-2xl font-bold text-red-700">{getAnalytics()?.failStudents}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-sm text-blue-700">Average %</div>
                    <div className="text-2xl font-bold text-blue-700">{getAnalytics()?.averagePercentage}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded border">
                    <h4 className="font-semibold mb-2">Grade Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">First Division:</span>
                        <span className="font-semibold">{getAnalytics()?.gradeDistribution.first}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Second Division:</span>
                        <span className="font-semibold">{getAnalytics()?.gradeDistribution.second}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Third Division:</span>
                        <span className="font-semibold">{getAnalytics()?.gradeDistribution.third}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-red-600">Fail:</span>
                        <span className="font-semibold text-red-600">{getAnalytics()?.gradeDistribution.fail}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background p-4 rounded border">
                    <h4 className="font-semibold mb-2">Top 5 Students</h4>
                    <div className="space-y-2">
                      {getAnalytics()?.toppers.map((student, index) => (
                        <div key={student.admissionNo} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium">{student.studentName}</span>
                          </div>
                          <span className="text-sm font-semibold">{student.percentage.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading...
              </div>
            ) : studentEntries.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No students found in class {selectedClass}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left w-16">Roll</th>
                      <th className="border p-2 text-left w-48">Student Name</th>
                      {subjects.map((s) => (
                        <th key={s.name} className="border p-2 text-center">
                          {s.code}
                        </th>
                      ))}
                      <th className="border p-2 text-center w-16">Total</th>
                      <th className="border p-2 text-center w-16">%</th>
                      <th className="border p-2 text-center w-20">Grade</th>
                      <th className="border p-2 text-center w-24">Report Card</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentEntries.map((entry) => (
                      <tr key={entry.admissionNo} className="hover:bg-gray-50">
                        <td className="border p-2">{entry.rollNo || "-"}</td>
                        <td className="border p-2 font-medium">{entry.studentName}</td>
                        {subjects.map((subject) => (
                          <td key={subject.name} className="border p-2 text-center">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              className="h-7 w-14 mx-auto text-center p-1"
                              value={entry.subjects[subject.name] || ""}
                              onChange={(e) =>
                                updateMarks(
                                  entry.admissionNo,
                                  subject.name,
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </td>
                        ))}
                        <td className="border p-2 text-center font-bold">
                          {entry.totalMarks}
                        </td>
                        <td className="border p-2 text-center">
                          {entry.percentage.toFixed(1)}%
                        </td>
                        <td className="border p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              entry.overallGrade === "First"
                                ? "bg-green-100 text-green-800"
                                : entry.overallGrade === "Second"
                                ? "bg-blue-100 text-blue-800"
                                : entry.overallGrade === "Third"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {entry.overallGrade}
                          </span>
                        </td>
                        <td className="border p-2 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateReportCard(entry)}
                            className="h-7 px-2"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          )}
            </TabsContent>

            {/* Subject Management Tab */}
            <TabsContent value="subjects" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Select Class</label>
                    <Select value={subjectClass} onValueChange={loadSubjectsForManagement}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {subjectClass && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Add New Subject for {subjectClass}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Subject Name</label>
                            <Input
                              value={newSubjectName}
                              onChange={(e) => setNewSubjectName(e.target.value)}
                              placeholder="e.g., Mathematics"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Subject Code</label>
                            <Input
                              value={newSubjectCode}
                              onChange={(e) => setNewSubjectCode(e.target.value)}
                              placeholder="e.g., MATH"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button onClick={addSubject} className="w-full">
                              <Save className="w-4 h-4 mr-2" />
                              Add Subject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Current Subjects for {subjectClass}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {subjects.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No subjects found for this class. Add subjects above.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {subjects.map((subject: any, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold">{subject.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Code: {subject.code}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Delete ${subject.name}?`)) {
                                      deleteSubject(subject.id);
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsManagement;

