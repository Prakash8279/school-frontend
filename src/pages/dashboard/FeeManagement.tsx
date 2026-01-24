import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState, AppDispatch } from "@/store";
import { listStudents } from "@/store/slices/studentSlice";
import { getFeeHistory, payFees, FeeRecord } from "@/store/slices/feeSlice";
import { fetchFeeStructure, saveFeeStructureDB, FeeStructure } from "@/store/slices/feeStructureSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  DollarSign, 
  Users, 
  FileText, 
  Search,
  Download,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  FileWarning
} from "lucide-react";
import jsPDF from 'jspdf';
import schoolLogo from "@/assets/school-logo.png";
import {
  getAllStudentsFeeStatus,
  getTotalCollection,
  getAcademicYear,
  type StudentFeeStatus,
  type FeeType,
} from "@/lib/feeManagement";
import * as XLSX from 'xlsx';

// --- CONSTANTS ---
const SCHOOL_NAME = "R.N.T. PUBLIC SCHOOL";
const SCHOOL_TAGLINE = "Jankinagar Basantpur, Siwan (Bihar)";

// --- HELPER: Generate Unique Receipt ID ---
const generateReceiptNo = () => {
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g, ""); // 20231025
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REC-${datePart}-${randomPart}`;
};

const FeeManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { students } = useSelector((state: RootState) => state.student);
  const { history: allPayments, loading } = useSelector((state: RootState) => state.fees);
  const { structure: reduxFeeStructure, loading: structLoading, error: structError } = useSelector((state: RootState) => state.feeStructure);

  const role = userInfo?.role;

  const [activeTab, setActiveTab] = useState(location.pathname.includes("fees-report") ? "history" : "collect");
  const [localFeeStructure, setLocalFeeStructure] = useState<FeeStructure[]>([]);
  const [studentsFeeStatus, setStudentsFeeStatus] = useState<StudentFeeStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
    
  // Student History Search
  const [admissionNoSearch, setAdmissionNoSearch] = useState("");
  const [searchedStudentPayments, setSearchedStudentPayments] = useState<FeeRecord[]>([]);
  const [searchedStudentInfo, setSearchedStudentInfo] = useState<any>(null);
  const [showHistorySuggestions, setShowHistorySuggestions] = useState(false);

  // Payment Form State
  const [selectedStudent, setSelectedStudent] = useState("");
  const [paymentMonths, setPaymentMonths] = useState<string[]>([]);
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear().toString());
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online" | "Cheque" | "Bank Transfer">("Cash");
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<FeeType[]>([]);
  const [usesBus, setUsesBus] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [additionalFeeReason, setAdditionalFeeReason] = useState("");
  const [collectSearchTerm, setCollectSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Student pending fees info
  const [studentPendingInfo, setStudentPendingInfo] = useState<StudentFeeStatus | null>(null);

  const isAdmin = role === "admin" || role === "finance";

  useEffect(() => {
    if (isAdmin) {
      dispatch(listStudents());
      dispatch(getFeeHistory()); 
      dispatch(fetchFeeStructure());
    }
  }, [dispatch, isAdmin]);

  // 2. Sync Redux Structure to Local State (for editing)
  useEffect(() => {
    if (reduxFeeStructure && reduxFeeStructure.length > 0) {
      setLocalFeeStructure(reduxFeeStructure.map(item => ({ ...item })));
    }
  }, [reduxFeeStructure]);

  useEffect(() => {
      if (structError) {
          toast.error(`Error loading fee structure: ${structError}`);
      }
  }, [structError]);

// --- UPDATE LIST WHEN DATA CHANGES ---
useEffect(() => {
  if (students.length > 0 && localFeeStructure.length > 0) {
    console.log('[FEE STATUS] Calculating for', students.length, 'students');
    const statusList = getAllStudentsFeeStatus(students, allPayments, localFeeStructure);
    // Fix: Ensure totalPreviousDues is calculated correctly based on visible components
    const patchedList = statusList.map(s => {
      // Calculate total paid manually from allPayments to ensure accuracy
      // Robust matching: ID match OR (Name + Class) match if ID is missing/zero
      const studentPayments = allPayments.filter(p => {
          const isIdMatch = String(p.admissionNo) === String(s.admissionNo);
          if (isIdMatch) return true;
          if ((!p.admissionNo || p.admissionNo === "0" || p.admissionNo === 0) && 
              p.studentName?.toLowerCase() === s.studentName?.toLowerCase() && 
              p.classname === s.classname) {
              return true;
          }
          return false;
      });
      
      const realTotalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
      
      // Reconstruct Total Billed (Gross) from helper's pending + helper's paid
      // This ensures we get the total expected amount - use Number() to ensure numeric addition
      // NOTE: pendingAmount already includes both tuition AND bus fees, so don't add busFeeDues separately
      const currentPendingSum = Number(s.pendingAmount || 0) + 
        // Number(s.busFeeDues || 0) +  // REMOVED - already included in pendingAmount
        Number(s.examFeeDues || 0) + 
        Number(s.admissionFeeDues || 0) + 
        Number(s.otherFeeDues || 0) + 
        Number(s.fineDues || 0) + 
        Number(s.dressFeeDues || 0) + 
        Number(s.bookFeeDues || 0);
      const grossBilled = currentPendingSum + Number(s.totalPaid || 0);
      
      return {
        ...s,
        totalPaid: Math.round(realTotalPaid),
        previousDues: Math.round(grossBilled), // Represents Total Billed
        totalPreviousDues: Math.round(grossBilled - realTotalPaid) // Represents Net Pending
      };
    });
    setStudentsFeeStatus(patchedList);
    console.log('[FEE STATUS] Calculated statuses for', patchedList.length, 'students');
  }
}, [students, allPayments, localFeeStructure]);

// --- UPDATE SELECTED STUDENT INFO ---
useEffect(() => {
  if (selectedStudent && localFeeStructure.length > 0) {
    const student = students.find(s => s._id === selectedStudent);
    if (student) {
      const status = getAllStudentsFeeStatus([student], allPayments, localFeeStructure)[0];
      
      if (status) {
          // Calculate total paid manually from allPayments to ensure accuracy
          const studentPayments = allPayments.filter(p => {
              const isIdMatch = String(p.admissionNo) === String(student.admission_no);
              if (isIdMatch) return true;
              if ((!p.admissionNo || p.admissionNo === "0" || p.admissionNo === 0) && 
                  p.studentName?.toLowerCase() === student.student_name?.toLowerCase() && 
                  p.classname === student.classname) {
                  return true;
              }
              return false;
          });

          const realTotalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
          
          // Use Number() to ensure numeric addition, not string concatenation
          // NOTE: pendingAmount already includes both tuition AND bus fees, so don't add busFeeDues separately
          const currentPendingSum = Number(status.pendingAmount || 0) + 
            // Number(status.busFeeDues || 0) +  // REMOVED - already included in pendingAmount
            Number(status.examFeeDues || 0) + 
            Number(status.admissionFeeDues || 0) + 
            Number(status.otherFeeDues || 0) + 
            Number(status.fineDues || 0) + 
            Number(status.dressFeeDues || 0) + 
            Number(status.bookFeeDues || 0);
          const grossBilled = currentPendingSum + Number(status.totalPaid || 0);
          
          status.totalPaid = Math.round(realTotalPaid);
          status.previousDues = Math.round(grossBilled);
          status.totalPreviousDues = Math.round(grossBilled - realTotalPaid);
      }
      // Debug: Log bus-related values
      console.log('Student Bus Debug:', {
        admission_no: student.admission_no,
        usesBus_field: student.uses_bus,
        usesBus_prop: student.usesBus,
        bus_start_date: student.bus_start_date,
        bus_end_date: student.bus_end_date,
        busFeeDues_calculated: status.busFeeDues,
        pendingBusMonths: status.pendingBusMonths,
        totalPreviousDues: status.totalPreviousDues
      });
      
      setStudentPendingInfo(status);
      // Check usesBus from multiple sources - student record or bus assignment data
      setUsesBus(student.usesBus || student.uses_bus || !!student.bus_start_date || false);
    }
  } else {
    setStudentPendingInfo(null);
    setUsesBus(false);
  }
}, [selectedStudent, students, allPayments, localFeeStructure]);

// --- AUTO-UPDATE YEAR ---
useEffect(() => {
  if (paymentMonths.length > 0) {
    const lastSelectedMonth = paymentMonths[paymentMonths.length - 1];
    const now = new Date();
    const currentYear = now.getFullYear();
    const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
    const monthIndex = months.indexOf(lastSelectedMonth);
    
    // Months 0-8 (Apr-Dec) = current calendar year, Months 9-11 (Jan-Mar) = current calendar year (not next)
    // Since we're in January 2026, Jan/Feb/Mar 2026 should show year 2026, not 2027
    const yearForMonth = monthIndex < 9 ? currentYear : currentYear;
    setPaymentYear(yearForMonth.toString());
  }
}, [paymentMonths]);

// --- AUTO-CALCULATE AMOUNT ---
useEffect(() => {
  if (selectedStudent && (paymentMonths.length > 0 || selectedFeeTypes.length > 0 || additionalAmount > 0)) {
    const student = students.find(s => s._id === selectedStudent);
    if (student) {
      const feeStruct = localFeeStructure.find(f => f.classname === student.classname);
      if (feeStruct) {
        let totalAmount = 0;
        const hasMonthlyFee = selectedFeeTypes.includes("Monthly Fee");
        const oneTimeFeeTypes = selectedFeeTypes.filter(feeType => feeType !== "Monthly Fee" && feeType !== "Bus Fee");
        
        for (const month of paymentMonths) {
           if (hasMonthlyFee) {
              totalAmount += Number(feeStruct.monthlyFee) || 0;
              // If student uses bus, auto-add bus fee with monthly fee
              if (usesBus) {
                totalAmount += Number(feeStruct.busFee) || 0;
              }
           }
        }

        for (const feeType of oneTimeFeeTypes) {
          if (feeType === "Exam Fee") totalAmount += Number(feeStruct.examFee) || 0;
          else if (feeType === "Admission Fee") totalAmount += Number(feeStruct.annualFee) || 0;
          else if (feeType === "Other Fee") totalAmount += Number(feeStruct.otherFee) || 0; 
          else if (feeType === "Fine") totalAmount += Number(feeStruct.fine) || 0;
          else if (feeType === "Dress Fee") totalAmount += Number(feeStruct.dressFee) || 0;
          else if (feeType === "Book Fee") totalAmount += Number(feeStruct.bookFee) || 0;
        }

        // Apply Additional Fee and Discount
        // Formula: (Subtotal + Additional) - Discount
        totalAmount = Math.max(0, (totalAmount + (Number(additionalAmount) || 0)) - (Number(discountAmount) || 0));

        setPaymentAmount(Math.round(totalAmount).toString());
      }
    }
  } else {
    setPaymentAmount("");
  }
}, [selectedStudent, paymentMonths, selectedFeeTypes, usesBus, discountAmount, additionalAmount, students, localFeeStructure]);
  
  // Helper to resolve Admission No (handles cases where studentId might be 0 or missing)
  const resolveAdmissionNo = (payment: FeeRecord) => {
      if (payment.admissionNo && payment.admissionNo !== "0" && payment.admissionNo !== 0) {
          return payment.admissionNo;
      }
      // Fallback: Try to find student by name and class
      const match = students.find(s => s.student_name?.toLowerCase() === payment.studentName?.toLowerCase() && s.classname === payment.classname);
      return match ? match.admission_no : "N/A";
  };

  // Export Payment History to Excel
  const exportPaymentHistoryToExcel = () => {
    try {
      if (allPayments.length === 0) {
        toast.error("No payment history to export.");
        return;
      }
      const data = allPayments.map(payment => ({
        'Receipt ID': payment._id,
        'Receipt No': payment.receiptNo || '-',
        'Admission No': resolveAdmissionNo(payment),
        'Student Name': payment.studentName,
        'Class': payment.classname,
        'Month': payment.month,
        'Year': payment.year,
        'Monthly Fees': payment.monthly_fees || 0,
        'Bus Fee': payment.bus_fee || 0,
        'Admission Fees': payment.admission_fees || 0,
        'Exam Fees': payment.exam_fees || 0,
        'Dress Fees': payment.dress_fee || 0,
        'Book Fees': payment.book_fee || 0,
        'Fine': payment.fine || 0,
        'Other Fees': payment.other_fee || 0,
        'Discount': payment.discount || 0,
        'Total Amount': payment.totalAmount,
        'Payment Mode': payment.paymentMode || '-',
        'Date': new Date(payment.date).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payment History');
      XLSX.writeFile(wb, 'payment_history.xlsx');
      toast.success("Payment history exported to Excel!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export Excel sheet.");
    }
  };

  // Export Dues List
  const exportDuesListToExcel = () => {
    try {
      const dataToExport = filteredStudents.length > 0 ? filteredStudents : studentsFeeStatus;

      if (dataToExport.length === 0) {
        toast.error("No student data to export.");
        return;
      }

      const data = dataToExport.map(student => ({
        'Admission No': student.admissionNo,
        'Student Name': student.studentName,
        'Class': student.classname,
        'Total Billed': student.previousDues,
        'Total Paid': student.totalPaid,
        'Monthly Pending (includes Bus)': student.pendingAmount,
        // 'Bus Fee Dues': student.busFeeDues || 0,  // REMOVED - already included in Monthly Pending
        'Exam Dues': student.examFeeDues || 0,
        'Admission Dues': student.admissionFeeDues || 0,
        'Dress Dues': student.dressFeeDues || 0,
        'Book Dues': student.bookFeeDues || 0,
        'Fine Dues': student.fineDues || 0,
        'Other Fee Dues': student.otherFeeDues || 0,
        'Total Pending': student.totalPreviousDues,
        'Pending Months': (student.pendingMonths || []).join(", "),
        'Status': student.totalPreviousDues <= 0 ? 'Paid' : 'Pending'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dues List');
      XLSX.writeFile(wb, `student_dues_list_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Student dues list exported to Excel!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export Excel sheet.");
    }
  };

  // --- Generate Due List PDF ---
const generateDueSlipPDF = async (targetStudents: StudentFeeStatus[], isBulk = false) => {
    const pdf = new jsPDF();
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Only process students with actual dues
    const pendingStudents = targetStudents.filter(s => s.totalPreviousDues > 0);

    if (pendingStudents.length === 0) {
      toast.info("No pending dues found for the selected students.");
      return;
    }

    // Pre-load logo
    let logoData: string | null = null;
    try {
      const img = new Image();
      img.src = schoolLogo;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); });
      if (img.complete && img.naturalHeight !== 0) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        logoData = canvas.toDataURL("image/png");
      }
    } catch (e) { }

    // Loop through each student and create a page/slip
    pendingStudents.forEach((s, index) => {
      if (index > 0) pdf.addPage(); // New page for each student

      let yPos = 20;

      // --- Header ---
      if (logoData) pdf.addImage(logoData, 'PNG', margin, 15, 20, 20);
      
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(41, 58, 128); 
    pdf.text(SCHOOL_NAME, pageWidth / 2, 20, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(SCHOOL_TAGLINE, pageWidth / 2, 26, { align: "center" });
    pdf.text("Phone: +91-7061337068 | Email: rntpublics@gmail.com", pageWidth / 2, 31, { align: "center" });

      // --- Title ---
      yPos += 20;
      pdf.setFillColor(255, 230, 230); // Light Red background
      pdf.rect(margin, yPos, contentWidth, 10, 'F');
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(200, 0, 0); // Red Text
      pdf.text("FEE DUE SLIP", pageWidth / 2, yPos + 6.5, { align: "center" });

      // --- Student Details ---
      yPos += 20;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      const leftX = margin + 10;
      const rightX = pageWidth / 2 + 10;

      pdf.text(`Student Name:`, leftX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.studentName, leftX + 35, yPos);

      pdf.setFont("helvetica", "bold");
      pdf.text(`Class:`, rightX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.classname, rightX + 20, yPos);

      yPos += 8;
      pdf.setFont("helvetica", "bold");
      pdf.text(`Admission No:`, leftX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.admissionNo, leftX + 35, yPos);

      pdf.setFont("helvetica", "bold");
      pdf.text(`Roll No:`, rightX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(s.rollNo || "-", rightX + 20, yPos);

      yPos += 8;
      pdf.setFont("helvetica", "bold");
      pdf.text(`Date of Issue:`, leftX, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(new Date().toLocaleDateString(), leftX + 35, yPos);

      // --- Financial Table ---
      yPos += 15;
      
      // Header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, contentWidth, 8, 'F');
      pdf.setFont("helvetica", "bold");
      pdf.text("Description", margin + 5, yPos + 5.5);
      pdf.text("Amount (Rs)", pageWidth - margin - 5, yPos + 5.5, { align: "right" });

      yPos += 8;
      pdf.rect(margin, yPos, contentWidth, 24); // Box for content

      // Rows
      pdf.setFont("helvetica", "normal");
      
      yPos += 6;
      pdf.text("Total Previous Dues", margin + 5, yPos);
      const totalApplicable = s.totalPaid + s.totalPreviousDues;
      pdf.text(totalApplicable.toLocaleString(), pageWidth - margin - 5, yPos, { align: "right" });

      yPos += 7;
      pdf.text("Total Fees Paid", margin + 5, yPos);
      pdf.text(`(-) ${s.totalPaid.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: "right" });

      yPos += 7;
      pdf.setDrawColor(200);
      pdf.line(margin, yPos - 4.5, pageWidth - margin, yPos - 4.5); // Separator
      
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(200, 0, 0); // Red for Due
      pdf.text("NET PENDING DUES", margin + 5, yPos);
      pdf.text(s.totalPreviousDues.toLocaleString(), pageWidth - margin - 5, yPos, { align: "right" });

      // --- Footer Message ---
      yPos += 20;
      pdf.setFontSize(10);
      pdf.setTextColor(0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Dear Parent,", margin, yPos);
      
      yPos += 5;
      pdf.setFont("helvetica", "normal");
      const msg = `This is to inform you that an amount of Rs. ${s.totalPreviousDues} is outstanding against the school fees of your ward. You are requested to clear the dues within 7 days to avoid any late fines.`;
      const splitMsg = pdf.splitTextToSize(msg, contentWidth);
      pdf.text(splitMsg, margin, yPos);

      yPos += 25;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.text("This is a computer generated slip.", margin, yPos);
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Authorized Signatory", pageWidth - margin, yPos, { align: "right" });
    });

    const fileName = isBulk ? `Bulk_Due_Slips_${new Date().toISOString().split('T')[0]}.pdf` : `Due_Slip_${pendingStudents[0].studentName}.pdf`;
    pdf.save(fileName);
    toast.success(isBulk ? "Bulk Slips Generated!" : "Due Slip Generated!");
  };

  // --- SAVE FEE STRUCTURE TO DB ---
  const handleSaveFeeStructure = async () => {
    await dispatch(saveFeeStructureDB(localFeeStructure));
    toast.success("Fee structure updated in Database! ✅");
    dispatch(fetchFeeStructure()); // Refresh from DB
  };

  const handleCollectFee = async () => {
    // Allow payment if: Monthly Fee with months OR other individual fees without months
    const hasMonthlyFee = selectedFeeTypes.includes("Monthly Fee");
    // Bus Fee is auto-included when Monthly Fee is selected and student uses bus
    const hasBusFee = hasMonthlyFee && usesBus;
    const hasRecurringFee = hasMonthlyFee;
    
    if (!selectedStudent || (selectedFeeTypes.length === 0 && additionalAmount <= 0)) {
      toast.error("Please select at least one fee type or enter an additional fee");
      return;
    }

    if (hasRecurringFee && paymentMonths.length === 0) {
      toast.error("Please select at least one month for Monthly/Bus Fee");
      return;
    }

    // For one-time fees only (no monthly fees), amount is auto-calculated
    // For monthly fees, amount must be filled
    if (hasRecurringFee && !paymentAmount) {
      toast.error("Please enter the payment amount");
      return;
    }
    
    // Parse user entered amount (e.g. 3000)
    const userEnteredTotal = Number(paymentAmount);
    if (isNaN(userEnteredTotal) || userEnteredTotal < 0) {
        toast.error("Invalid payment amount");
        return;
    }

    const student = students.find(s => s._id === selectedStudent);
    if (!student) { toast.error("Student not found"); return; }

    const feeStruct = localFeeStructure.find(f => f.classname === student.classname);
    if (!feeStruct) { toast.error("Fee structure not found"); return; }

    // Duplicate Check
    const duplicates: string[] = [];
    for (const month of paymentMonths) {
       // Check specifically for the fee type being paid
       if (hasMonthlyFee) {
           const exists = allPayments.some(p => String(p.admissionNo) === String(student.admission_no) && p.month === month && String(p.year) === String(paymentYear) && p.monthly_fees > 0);
           if (exists) duplicates.push(`Monthly Fee: ${month} ${paymentYear}`);
       }
       if (hasBusFee) {
           const exists = allPayments.some(p => String(p.admissionNo) === String(student.admission_no) && p.month === month && String(p.year) === String(paymentYear) && p.bus_fee > 0);
           if (exists) duplicates.push(`Bus Fee: ${month} ${paymentYear}`);
       }
    }

    if (duplicates.length > 0) {
      toast.error(`Fees already collected for: ${duplicates.join(", ")}`);
      return;
    }

    const paymentsToProcess: FeeRecord[] = [];
    const generatedReceipts: FeeRecord[] = [];
    
    const monthlyBase = Number(feeStruct.monthlyFee) || 0;
    const busBase = Number(feeStruct.busFee) || 0;
    
    const examFeeVal = selectedFeeTypes.includes("Exam Fee") ? (Number(feeStruct.examFee) || 0) : 0;
    const admissionFeeVal = selectedFeeTypes.includes("Admission Fee") ? (Number(feeStruct.annualFee) || 0) : 0;
    const otherFeeVal = selectedFeeTypes.includes("Other Fee") ? (Number(feeStruct.otherFee) || 0) : 0;
    const fineVal = selectedFeeTypes.includes("Fine") ? (Number(feeStruct.fine) || 0) : 0;
    const dressFeeVal = selectedFeeTypes.includes("Dress Fee") ? (Number(feeStruct.dressFee) || 0) : 0;
    const bookFeeVal = selectedFeeTypes.includes("Book Fee") ? (Number(feeStruct.bookFee) || 0) : 0;
    
    let oneTimeFeesApplied = false;

    // Generate Unique Receipt ID
    const receiptId = generateReceiptNo();

    // If no months selected but have other fees, create a single record for "Miscellaneous"
    const monthsToProcess = paymentMonths.length > 0 ? paymentMonths : ["Miscellaneous"];

    for (let i = 0; i < monthsToProcess.length; i++) {
      const month = monthsToProcess[i];
      let currentNotes = paymentNotes;
      if (i === 0 && additionalAmount > 0 && additionalFeeReason) {
         currentNotes = currentNotes ? `${currentNotes} (Addl: ${additionalFeeReason})` : `(Addl: ${additionalFeeReason})`;
      }

      const record: FeeRecord = {
        admissionNo: student.admission_no, // Changed from studentId to admissionNo
        studentName: student.student_name,
        classname: student.classname,
        roll_no: student.roll_no || "N/A",
        month: month,
        year: paymentYear,
        usesBus: usesBus,
        date: new Date().toISOString(),
        paymentMode: paymentMode,
        receiptNo: receiptId,
        notes: currentNotes,

        // Monthly Fee - per month
        monthly_fees: selectedFeeTypes.includes("Monthly Fee") ? Math.round(Number(monthlyBase) || 0) : 0,
        // Bus fee - auto with Monthly Fee when usesBus (per month)
        bus_fee: selectedFeeTypes.includes("Monthly Fee") && usesBus ? Math.round(Number(busBase) || 0) : 0,
        
        // One-time fees - only apply once (first record only)
        exam_fees: !oneTimeFeesApplied ? Math.round(Number(examFeeVal) || 0) : 0,
        admission_fees: !oneTimeFeesApplied ? Math.round(Number(admissionFeeVal) || 0) : 0,
        other_fee: !oneTimeFeesApplied ? Math.round(Number(otherFeeVal) || 0) : 0,
        dress_fee: !oneTimeFeesApplied ? Math.round(Number(dressFeeVal) || 0) : 0,
        book_fee: !oneTimeFeesApplied ? Math.round(Number(bookFeeVal) || 0) : 0,
        // Fine = structure fine + additional amount (late fee/penalty entered by user)
        fine: !oneTimeFeesApplied ? Math.round((Number(fineVal) || 0) + (Number(additionalAmount) || 0)) : 0,
        // Discount - apply once
        discount: !oneTimeFeesApplied ? Math.round(Number(discountAmount) || 0) : 0,
        totalAmount: 0 
      };
      record.totalAmount = Math.max(0, (Number(record.monthly_fees) + Number(record.exam_fees) + Number(record.admission_fees) + Number(record.other_fee) + Number(record.bus_fee) + Number(record.dress_fee) + Number(record.book_fee) + Number(record.fine)) - (Number(record.discount) || 0));
      paymentsToProcess.push(record);
      oneTimeFeesApplied = true;
    }
    
    // --- PAYMENT VALIDATION ---
    // The calculated total should match what the system expects
    // No manual adjustment needed - user sees and confirms the exact breakdown
    // -------------------------------------------------------

    let successCount = 0;
    console.log('=== STARTING FEE COLLECTION ===');
    console.log('Student:', student.student_name, '(', student.admission_no, ')');
    console.log('usesBus:', usesBus);
    console.log('Payments to process:', paymentsToProcess.length);
    
    for (const payment of paymentsToProcess) {
       console.log(`Processing payment for ${payment.month} ${payment.year}:`, {
         monthly_fees: payment.monthly_fees,
         bus_fee: payment.bus_fee,
         total: payment.totalAmount
       });
       
       const resultAction = await dispatch(payFees(payment));
       if (payFees.fulfilled.match(resultAction)) {
         successCount++;
         generatedReceipts.push({ ...payment, _id: resultAction.payload._id });
         console.log(`✓ Payment saved successfully for ${payment.month}`);
       } else {
         const errorMsg = resultAction.payload || `Failed to save for ${payment.month}`;
         console.error(`✗ Payment failed for ${payment.month}:`, errorMsg);
         toast.error(typeof errorMsg === 'string' ? errorMsg : `Failed to save for ${payment.month}`);
       }
    }
    
    console.log('=== FEE COLLECTION COMPLETE ===');
    console.log('Success count:', successCount, '/', paymentsToProcess.length);
    console.log('Generated receipts count:', generatedReceipts.length);
    console.log('Generated receipts:', generatedReceipts.map(r => `${r.month} ${r.year}`));

    if (successCount > 0) {
      toast.success(`Fees collected successfully!`);
      generateCombinedFeeReceiptPDF(generatedReceipts, student, studentPendingInfo || undefined);
      setSelectedStudent("");
      setCollectSearchTerm("");
      setPaymentMonths([]);
      setPaymentAmount("");
      setSelectedFeeTypes([]);
      setUsesBus(false);
      setPaymentNotes("");
      setDiscountAmount(0);
      setAdditionalAmount(0);
      setAdditionalFeeReason("");
      setStudentPendingInfo(null);
      dispatch(getFeeHistory());
    }
  };

  // --- PDF GENERATOR (RETAINED FROM PREVIOUS STEPS) ---
  const generateCombinedFeeReceiptPDF = async (payments: any[], student: any, pendingInfo?: StudentFeeStatus) => {
    console.log('=== GENERATING PDF RECEIPT ===');
    console.log('Total payments received:', payments.length);
    console.log('Payments data:', payments.map(p => ({ month: p.month, year: p.year, monthly: p.monthly_fees, bus: p.bus_fee, total: p.totalAmount })));
    
    const pdf = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    const drawLine = (y: number) => {
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.line(margin, y, pageWidth - margin, y);
    };

    let yPos = 20;

    try {
      const img = new Image();
      img.src = schoolLogo;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
      if (img.complete && img.naturalHeight !== 0) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const logoData = canvas.toDataURL("image/png");
        pdf.addImage(logoData, 'PNG', margin, 10, 25, 25);
      }
    } catch (e) { }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(41, 58, 128); 
    pdf.text(SCHOOL_NAME, pageWidth / 2, 20, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(SCHOOL_TAGLINE, pageWidth / 2, 26, { align: "center" });
    pdf.text("Phone: +91-7061337068 | Email: rntpublics@gmail.com", pageWidth / 2, 31, { align: "center" });

    yPos = 40;
    pdf.setFillColor(41, 58, 128); 
    pdf.rect(0, yPos, pageWidth, 12, 'F');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text("OFFICIAL FEE RECEIPT", pageWidth / 2, yPos + 8, { align: "center" });

    yPos += 20;

    pdf.setFillColor(245, 245, 245);
    pdf.setDrawColor(220, 220, 220);
    pdf.rect(margin, yPos, contentWidth, 10, 'FD');
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const receiptNo = payments[0].receiptNo || "N/A";
    pdf.text(`Receipt No: ${receiptNo}`, margin + 5, yPos + 6.5);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 5, yPos + 6.5, { align: "right" });

    yPos += 18;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 58, 128);
    pdf.text("STUDENT DETAILS", margin, yPos);
    drawLine(yPos + 2);
    yPos += 8;

    const col1X = margin;
    const col2X = pageWidth / 2 + 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text("Name:", col1X, yPos);
    pdf.text("Admission No:", col2X, yPos);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(student.student_name || student.studentName || ""), col1X + 25, yPos);
    pdf.text(String(student.admission_no || student.admissionNo || "N/A"), col2X + 30, yPos);

    yPos += 8;

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80, 80, 80);
    pdf.text("Class:", col1X, yPos);
    pdf.text("Roll No:", col2X, yPos);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(student.classname || ""), col1X + 25, yPos);
    pdf.text(String(student.roll_no || student.rollNo || "N/A"), col2X + 30, yPos);

    yPos += 15;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 58, 128);
    pdf.text("PAYMENT BREAKDOWN", margin, yPos);
    yPos += 4;

    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, yPos, contentWidth, 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    
    pdf.text("Description", margin + 5, yPos + 5.5);
    pdf.text("Quantity/Period", margin + 80, yPos + 5.5);
    pdf.text("Amount", pageWidth - margin - 5, yPos + 5.5, { align: "right" });

    yPos += 9;

    let grandTotalPaid = 0;
    let totalDiscount = 0;
    let monthlyFeesBreakdown: { [key: string]: number } = {}; // Combined Monthly+Bus per month
    let busFeesBreakdown: { [key: string]: number } = {}; // Track bus separately for display
    let otherFeesTotal = 0;

    // Organize data: Group monthly fees and other fees
    payments.forEach((payment) => {
      const monthlyFeeAmt = Number(payment.monthly_fees || 0);
      const examFeeAmt = Number(payment.exam_fees || 0);
      const admissionFeeAmt = Number(payment.admission_fees || 0);
      const otherFeeAmt = Number(payment.other_fee || 0);
      const busFeeAmt = Number(payment.bus_fee || 0);
      const dressFeesAmt = Number(payment.dress_fee || 0);
      const bookFeesAmt = Number(payment.book_fee || 0);
      const fineAmt = Number(payment.fine || 0);
      const discountAmt = Number(payment.discount || 0);
      
      totalDiscount += discountAmt;

      // Track monthly fees by month - COMBINE Monthly + Bus into one line
      if (monthlyFeeAmt > 0 || busFeeAmt > 0) {
        const monthKey = `${payment.month} ${payment.year}`;
        monthlyFeesBreakdown[monthKey] = (monthlyFeesBreakdown[monthKey] || 0) + monthlyFeeAmt + busFeeAmt;
        if (busFeeAmt > 0) {
          busFeesBreakdown[monthKey] = (busFeesBreakdown[monthKey] || 0) + busFeeAmt;
        }
      }

      // Sum other fees (non-monthly) - BUS FEE EXCLUDED since it's with monthly
      otherFeesTotal += examFeeAmt + admissionFeeAmt + otherFeeAmt + dressFeesAmt + bookFeesAmt + fineAmt;
      
      const paymentTotal = monthlyFeeAmt + examFeeAmt + admissionFeeAmt + otherFeeAmt + busFeeAmt + dressFeesAmt + bookFeesAmt + fineAmt;
      grandTotalPaid += paymentTotal;
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);

    // Display Monthly Fees - if 10+ months, show in compact format
    const monthlyMonths = Object.keys(monthlyFeesBreakdown);
    const hasBusFees = Object.keys(busFeesBreakdown).length > 0;
    
    if (monthlyMonths.length > 0) {
      if (monthlyMonths.length >= 10) {
        // Compact format for 10+ months
        const label = hasBusFees ? "Monthly + Bus Fees" : "Monthly Fees";
        pdf.text(label, margin + 5, yPos + 4);
        pdf.text(`${monthlyMonths.length} Months`, margin + 80, yPos + 4);
        const monthlyTotal = Object.values(monthlyFeesBreakdown).reduce((a, b) => a + b, 0);
        pdf.text(`Rs. ${monthlyTotal}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 7;
        
        // Show month details in smaller text below
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        const monthsList = monthlyMonths.join(", ");
        const chunkSize = 70;
        for (let i = 0; i < monthsList.length; i += chunkSize) {
          pdf.text(monthsList.substring(i, i + chunkSize), margin + 5, yPos);
          yPos += 3;
        }
        yPos += 2;
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
      } else {
        // List each month individually if less than 10
        monthlyMonths.forEach((monthKey) => {
          const amt = monthlyFeesBreakdown[monthKey];
          const hasBusThisMonth = busFeesBreakdown[monthKey] && busFeesBreakdown[monthKey] > 0;
          const label = hasBusThisMonth ? "Monthly + Bus Fee" : "Monthly Fee";
          pdf.text(label, margin + 5, yPos + 4);
          pdf.text(monthKey, margin + 80, yPos + 4);
          pdf.text(`Rs. ${amt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
          yPos += 3.5;
        });
      }
    }

    // Display Other Fees
    payments.forEach((payment) => {
      const examFeeAmt = Number(payment.exam_fees || 0);
      const admissionFeeAmt = Number(payment.admission_fees || 0);
      const otherFeeAmt = Number(payment.other_fee || 0);
      const busFeeAmt = Number(payment.bus_fee || 0);
      const dressFeesAmt = Number(payment.dress_fee || 0);
      const bookFeesAmt = Number(payment.book_fee || 0);
      const fineAmt = Number(payment.fine || 0);

      // Exam Fee
      if (examFeeAmt > 0) {
        pdf.text("Exam Fee", margin + 5, yPos + 4);
        pdf.text("Once", margin + 80, yPos + 4);
        pdf.text(`Rs. ${examFeeAmt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 5;
      }

      // Admission Fee
      if (admissionFeeAmt > 0) {
        pdf.text("Admission Fee", margin + 5, yPos + 4);
        pdf.text("Once", margin + 80, yPos + 4);
        pdf.text(`Rs. ${admissionFeeAmt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 5;
      }

      // Dress Fee
      if (dressFeesAmt > 0) {
        pdf.text("Dress Fee", margin + 5, yPos + 4);
        pdf.text("Once", margin + 80, yPos + 4);
        pdf.text(`Rs. ${dressFeesAmt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 5;
      }

      // Book Fee
      if (bookFeesAmt > 0) {
        pdf.text("Book Fee", margin + 5, yPos + 4);
        pdf.text("Once", margin + 80, yPos + 4);
        pdf.text(`Rs. ${bookFeesAmt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 5;
      }

      // Other Fee
      if (otherFeeAmt > 0) {
        let label = "Other Fee";
        if (payment.notes && payment.notes.includes("(Addl:")) {
            const match = payment.notes.match(/\(Addl: (.*?)\)/);
            if (match && match[1]) {
                label = match[1]; 
            }
        }
        pdf.text(label, margin + 5, yPos + 4);
        pdf.text("Once", margin + 80, yPos + 4);
        pdf.text(`Rs. ${otherFeeAmt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 5;
      }

      // Bus Fee - SKIP if already shown with monthly fees
      // (Only show bus fee here if it's a standalone bus payment without monthly fee)
      if (busFeeAmt > 0 && payment.monthly_fees === 0) {
        pdf.text("Bus Fee", margin + 5, yPos + 4);
        const period = payment.month && payment.month !== "Miscellaneous" ? `${payment.month} ${payment.year}` : "Once";
        pdf.text(period, margin + 80, yPos + 4);
        pdf.text(`Rs. ${busFeeAmt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 5;
      }

      // Fine
      if (fineAmt > 0) {
        pdf.text("Fine", margin + 5, yPos + 4);
        pdf.text("Once", margin + 80, yPos + 4);
        pdf.text(`Rs. ${fineAmt}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
        yPos += 5;
      }
    });

    yPos += 5;
    pdf.setDrawColor(41, 58, 128);
    pdf.setLineWidth(1);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // Subtotal and Discount section
    const subtotal = grandTotalPaid;
    const finalTotal = grandTotalPaid - totalDiscount;
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subtotal (Before Discount):", margin + 5, yPos);
    pdf.text(`Rs. ${subtotal.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: "right" });
    yPos += 7;

    if (totalDiscount > 0) {
      pdf.setTextColor(200, 0, 0);
      pdf.text("Total Discount Applied:", margin + 5, yPos);
      pdf.text(`-Rs. ${totalDiscount.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: "right" });
      yPos += 7;
    }

    pdf.setDrawColor(41, 58, 128);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("TOTAL AMOUNT PAID:", margin + 5, yPos); 
    
    pdf.setFontSize(14);
    pdf.setTextColor(41, 58, 128);
    pdf.text(`Rs. ${finalTotal.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: "right" });

    if (pendingInfo) {
      yPos += 15;
      
      // Calculate Total Previous Dues (what was owed BEFORE this payment)
      // NOTE: pendingAmount already includes both tuition AND bus fees
      const totalPreviousDues = Number(pendingInfo.pendingAmount || 0) + 
        // Number(pendingInfo.busFeeDues || 0) +  // REMOVED - already included in pendingAmount
        Number(pendingInfo.examFeeDues || 0) + 
        Number(pendingInfo.admissionFeeDues || 0) + 
        Number(pendingInfo.otherFeeDues || 0) + 
        Number(pendingInfo.fineDues || 0) + 
        Number(pendingInfo.dressFeeDues || 0) + 
        Number(pendingInfo.bookFeeDues || 0);
      
      // Total Amount Paid in Current Transaction (before discount)
      const totalAmountPaidNow = grandTotalPaid;
      
      // Remaining Balance = Previous Dues - (Amount Paid - Discount already applied in paid amount)
      // Note: grandTotalPaid already has discount applied per record, so we use it directly
      const previousAdvance = Number(pendingInfo.advanceAmount || 0);
      
      // Net calculation: Previous Dues - Previous Advance - What we paid now
      let remainingBalance = totalPreviousDues - previousAdvance - totalAmountPaidNow;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(80, 80, 80);
      
      // Display: Total Previous Dues
      pdf.text(`TOTAL PREVIOUS DUES: Rs. ${totalPreviousDues.toLocaleString()}`, margin, yPos);
      yPos += 7;
      
      if (previousAdvance > 0) {
        pdf.setTextColor(0, 100, 0);
        pdf.text(`LESS ADVANCE: -Rs. ${previousAdvance.toLocaleString()}`, margin, yPos);
        yPos += 7;
      }

      // Display: Total Amount Paid (after discount)
      pdf.setTextColor(80, 80, 80);
      pdf.text(`TOTAL AMOUNT PAID: Rs. ${totalAmountPaidNow.toLocaleString()}`, margin, yPos);
      yPos += 7;
      
      // Display: Remaining Balance
      if (remainingBalance > 0) {
        pdf.setTextColor(200, 0, 0);
        pdf.setFontSize(11);
        pdf.text(`REMAINING BALANCE: Rs. ${remainingBalance.toLocaleString()}`, margin, yPos);
      } else if (remainingBalance < 0) {
        pdf.setTextColor(0, 100, 0);
        pdf.setFontSize(11);
        pdf.text(`ADVANCE BALANCE: Rs. ${Math.abs(remainingBalance).toLocaleString()}`, margin, yPos);
      } else {
        pdf.setTextColor(0, 100, 0);
        pdf.setFontSize(11);
        pdf.text("Status: ALL DUES CLEARED", margin, yPos);
      }
    }

    const footerY = pageHeight - 40;
    
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.1);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    
    pdf.text("Accountant Signature", margin, footerY + 15);
    pdf.text("Parent/Guardian Signature", pageWidth - margin, footerY + 15, { align: "right" });

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100);
    pdf.text("Thank you for the timely payment. This is a computer-generated receipt.", pageWidth / 2, pageHeight - 10, { align: "center" });

    pdf.save(`Fee_Receipt_${receiptNo}.pdf`);
    toast.success("Receipt Downloaded Successfully!");
  };

  const generateSingleFeeReceipt = async (payment: FeeRecord) => {
    const resolvedAdmNo = resolveAdmissionNo(payment);
    const studentMock = {
        student_name: String(payment.studentName || ""),
        admission_no: String(resolvedAdmNo || ""),
        classname: String(payment.classname || ""),
        roll_no: String(payment.roll_no || "N/A")
    };
    
    await generateCombinedFeeReceiptPDF([payment], studentMock, undefined);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader><CardTitle>Access Restricted</CardTitle></CardHeader>
          <CardContent><p>Only admin/finance users can access this.</p></CardContent>
        </Card>
      </div>
    );
  }

  const collection = getTotalCollection(allPayments);
  const filteredStudents = studentsFeeStatus.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "All" || s.classname === filterClass;
    const matchesStatus = filterStatus === "All" || 
      (filterStatus === "Paid" && s.totalPreviousDues <= 0) ||
      (filterStatus === "Pending" && s.totalPreviousDues > 0);
    return matchesSearch && matchesClass && matchesStatus;
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // --- FIXED SEARCH FUNCTION ---
  const handleStudentHistorySearch = (specificAdmNo?: string) => {
    const term = typeof specificAdmNo === 'string' ? specificAdmNo : admissionNoSearch;
    if (!term.trim()) return;
    
    let student = students.find(s => s.admission_no === term.trim());
    
    if (!student) {
        const matches = students.filter(s => s.student_name.toLowerCase().includes(term.trim().toLowerCase()));
        if (matches.length === 1) {
            student = matches[0];
        } else if (matches.length > 1) {
            toast.error("Multiple students found. Please select from the list.");
            return;
        }
    }

    if (!student) {
      toast.error("Student not found");
      setSearchedStudentPayments([]);
      setSearchedStudentInfo(null);
      return;
    }
    
    if (admissionNoSearch !== student.admission_no) {
        setAdmissionNoSearch(student.admission_no);
    }

    // FIX: String conversion for robust comparison
    const payments = allPayments.filter(p => {
        const isIdMatch = String(p.admissionNo) === String(student.admission_no);
        if (isIdMatch) return true;
        if ((!p.admissionNo || p.admissionNo === "0" || p.admissionNo === 0) && 
            p.studentName?.toLowerCase() === student.student_name?.toLowerCase() && 
            p.classname === student.classname) {
            return true;
        }
        return false;
    });
    
    // Sort
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setSearchedStudentPayments(payments);
    setSearchedStudentInfo({
      name: student.student_name,
      admissionNo: student.admission_no,
      classname: student.classname,
      rollNo: student.roll_no || "N/A",
    });
    
    if (payments.length > 0) {
        toast.success(`Found ${payments.length} payment records.`);
    } else {
        toast.info("Student found, but no payment history.");
    }
  };

  // Filter students for collection search safely
  const filteredCollectStudents = (students || []).filter(s => {
     const term = collectSearchTerm.toLowerCase();
     const name = (s.student_name || "").toString().toLowerCase();
     const adm = (s.admission_no || "").toString().toLowerCase();
     return name.includes(term) || adm.includes(term);
  });

  // Filter students for history search
  const filteredHistoryStudents = (students || []).filter(s => {
     const term = admissionNoSearch.toLowerCase();
     const name = (s.student_name || "").toString().toLowerCase();
     const adm = (s.admission_no || "").toString().toLowerCase();
     return name.includes(term) || adm.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-700">Total Collection</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-900">₹{collection.total.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-700">Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-900">₹{(collection.today || 0).toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-green-700">This Month</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-900">₹{collection.thisMonth.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-purple-700">This Year</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-900">₹{collection.thisYear.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-700">Students</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-900">{students.length}</div></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="collect">Collect Fee</TabsTrigger>
          <TabsTrigger value="students">Status</TabsTrigger>
          <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="student-history">Student Search</TabsTrigger>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
        </TabsList>

        {/* COLLECT TAB */}
        <TabsContent value="collect" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Collect Fee Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label>Student (Search Name/Adm No)</Label>
                   <div className="relative">
                      <Input 
                        placeholder="Search by Name or Admission No..." 
                        value={collectSearchTerm}
                        onChange={e => {
                          setCollectSearchTerm(e.target.value);
                          setShowSuggestions(true);
                          if (selectedStudent) {
                             setSelectedStudent("");
                             setStudentPendingInfo(null);
                          }
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      />
                      {showSuggestions && collectSearchTerm && !selectedStudent && (
                        <div className="absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                           {filteredCollectStudents.map(s => (
                              <div key={s._id} className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b"
                                 onMouseDown={() => {
                                    setSelectedStudent(s._id!);
                                    setCollectSearchTerm(`[${s.admission_no}] ${s.student_name}`);
                                    setShowSuggestions(false);
                                 }}
                              >
                                 <div className="font-medium">{s.student_name}</div>
                                 <div className="text-xs text-gray-500">Adm: {s.admission_no} | Class: {s.classname}</div>
                              </div>
                           ))}
                           {filteredCollectStudents.length === 0 && (
                              <div className="p-2 text-gray-500 text-sm">No students found</div>
                           )}
                        </div>
                      )}
                   </div>
                 </div>
                 <div><Label>Year</Label><Input value={paymentYear} onChange={e => setPaymentYear(e.target.value)} /></div>
              </div>

              {/* RESTORED PENDING INFO CARD */}
              {studentPendingInfo && (
                <Card className={`${studentPendingInfo.totalPreviousDues <= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-300'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg ${studentPendingInfo.totalPreviousDues <= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {studentPendingInfo.totalPreviousDues <= 0 ? '✓ All Fees Are Paid' : '⚠ Previous Dues Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentPendingInfo.totalPreviousDues <= 0 ? (
                      <div className="text-center py-4">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">All Fees Are Paid</p>
                      </div>
                    ) : (
                      <>
                        {/* Total Previous Dues - Calculate including Bus Fee */}
                        {(() => {
                          const struct = localFeeStructure.find(f => f.classname === studentPendingInfo.classname);
                          const monthlyRate = Number(struct?.monthlyFee) || 0;
                          const busRate = Number(struct?.busFee) || 0;
                          
                          // Get pending months count from array length
                          const pendingMonthsCount = studentPendingInfo.pendingMonths?.length || 0;
                          
                          // Check if Monthly Fee is being paid (bus is auto-included with monthly when usesBus)
                          const isMonthlyBeingPaid = selectedFeeTypes.includes("Monthly Fee");
                          
                          // Combined Monthly + Bus dues - subtract if being paid
                          const monthlyDues = pendingMonthsCount * monthlyRate;
                          const busDues = usesBus ? (Number(studentPendingInfo.busFeeDues) || (pendingMonthsCount * busRate)) : 0;
                          const combinedMonthlyBusDues = isMonthlyBeingPaid ? 0 : (monthlyDues + busDues);
                          
                          // One-time fees - subtract if being paid
                          const examDues = selectedFeeTypes.includes("Exam Fee") ? 0 : Number(studentPendingInfo.examFeeDues || 0);
                          const admissionDues = selectedFeeTypes.includes("Admission Fee") ? 0 : Number(studentPendingInfo.admissionFeeDues || 0);
                          const otherDues = selectedFeeTypes.includes("Other Fee") ? 0 : Number(studentPendingInfo.otherFeeDues || 0);
                          const fineDues = selectedFeeTypes.includes("Fine") ? 0 : Number(studentPendingInfo.fineDues || 0);
                          const dressDues = selectedFeeTypes.includes("Dress Fee") ? 0 : Number(studentPendingInfo.dressFeeDues || 0);
                          const bookDues = selectedFeeTypes.includes("Book Fee") ? 0 : Number(studentPendingInfo.bookFeeDues || 0);
                          
                          // Total remaining dues
                          const totalDues = combinedMonthlyBusDues + examDues + admissionDues + otherDues + fineDues + dressDues + bookDues;
                          
                          return (
                            <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-red-800">TOTAL PREVIOUS DUES:</span>
                                <span className="text-3xl font-bold text-red-600">₹{totalDues.toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-red-700 mt-2">
                                {combinedMonthlyBusDues > 0 
                                  ? (usesBus 
                                      ? `Monthly+Bus: ₹${combinedMonthlyBusDues.toLocaleString()}` 
                                      : `Monthly: ₹${monthlyDues.toLocaleString()}`)
                                  : ''}
                                {(combinedMonthlyBusDues > 0) && (examDues + admissionDues + otherDues + fineDues + dressDues + bookDues > 0) ? ' + Other fees' : ''}
                              </p>
                            </div>
                          );
                        })()}

                        {/* Advance Payment Info */}
                        {studentPendingInfo.advanceAmount > 0 && (
                          <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded mb-4 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-green-800">ADVANCE PAYMENT:</span>
                              <span className="text-3xl font-bold text-green-600">₹{studentPendingInfo.advanceAmount.toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-green-700 mt-2">Excess amount paid for future monthly fees</p>
                          </div>
                        )}

                        {/* Breakdown by Fee Type */}
                        <div>
                          <p className="font-bold text-red-900 mb-3 text-base">Breakdown of Dues:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {/* Monthly Fee + Bus Fee Combined */}
                            {(() => {
                              const struct = localFeeStructure.find(f => f.classname === studentPendingInfo.classname);
                              const monthlyRate = Number(struct?.monthlyFee) || 0;
                              const busRate = Number(struct?.busFee) || 0;
                              
                              // Get pending months count from array length
                              const pendingMonthsCount = studentPendingInfo.pendingMonths?.length || 0;
                              const monthlyDues = pendingMonthsCount * monthlyRate;
                              
                              // Bus dues calculation - included with monthly
                              const busDues = usesBus ? (Number(studentPendingInfo.busFeeDues) || (pendingMonthsCount * busRate)) : 0;
                              
                              // Combined total (Monthly + Bus)
                              const combinedDues = monthlyDues + busDues;
                              const combinedRate = monthlyRate + (usesBus ? busRate : 0);
                              
                              // Check if Monthly Fee is being paid now
                              const isMonthlyBeingPaid = selectedFeeTypes.includes("Monthly Fee");
                              
                              return (
                                <>
                                  {/* Monthly + Bus Combined - Show if NOT being paid */}
                                  {combinedDues > 0 && !isMonthlyBeingPaid && (
                                    <div className={`bg-white border-2 ${usesBus ? 'border-blue-400' : 'border-orange-300'} p-3 rounded`}>
                                      <p className="text-xs text-gray-600 font-semibold">
                                        {usesBus ? 'MONTHLY + 🚌 BUS FEE' : 'MONTHLY FEES'}
                                      </p>
                                      <p className={`text-xl font-bold ${usesBus ? 'text-blue-700' : 'text-orange-700'}`}>
                                        ₹{combinedDues.toLocaleString()}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {usesBus 
                                          ? `₹${monthlyRate} + ₹${busRate} = ₹${combinedRate}/month × ${pendingMonthsCount}`
                                          : `Rate: ₹${monthlyRate}/month × ${pendingMonthsCount}`
                                        }
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Monthly + Bus Being Paid indicator */}
                                  {combinedDues > 0 && isMonthlyBeingPaid && (
                                    <div className="bg-green-50 border-2 border-green-400 p-3 rounded">
                                      <p className="text-xs text-green-600 font-semibold">
                                        {usesBus ? 'MONTHLY + 🚌 BUS ✓' : 'MONTHLY FEES ✓'}
                                      </p>
                                      <p className="text-xl font-bold text-green-700">₹{combinedDues.toLocaleString()}</p>
                                      <p className="text-xs text-green-500 mt-1">Being paid now</p>
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            {/* Admission Fee */}
                            {Number(studentPendingInfo.admissionFeeDues || 0) > 0 && (
                              <div className="bg-white border-2 border-yellow-400 p-3 rounded">
                                <p className="text-xs text-gray-600 font-semibold">ADMISSION FEE</p>
                                <p className="text-xl font-bold text-yellow-700">₹{Number(studentPendingInfo.admissionFeeDues || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">One-time</p>
                              </div>
                            )}

                            {/* Exam Fee */}
                            {Number(studentPendingInfo.examFeeDues || 0) > 0 && (
                              <div className="bg-white border-2 border-indigo-400 p-3 rounded">
                                <p className="text-xs text-gray-600 font-semibold">EXAM FEE</p>
                                <p className="text-xl font-bold text-indigo-700">₹{Number(studentPendingInfo.examFeeDues || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">One-time</p>
                              </div>
                            )}

                            {/* Dress Fee */}
                            {Number(studentPendingInfo.dressFeeDues || 0) > 0 && (
                              <div className="bg-white border-2 border-purple-400 p-3 rounded">
                                <p className="text-xs text-gray-600 font-semibold">DRESS FEE</p>
                                <p className="text-xl font-bold text-purple-700">₹{Number(studentPendingInfo.dressFeeDues || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">One-time</p>
                              </div>
                            )}

                            {/* Book Fee */}
                            {Number(studentPendingInfo.bookFeeDues || 0) > 0 && (
                              <div className="bg-white border-2 border-teal-400 p-3 rounded">
                                <p className="text-xs text-gray-600 font-semibold">BOOK FEE</p>
                                <p className="text-xl font-bold text-teal-700">₹{Number(studentPendingInfo.bookFeeDues || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">One-time</p>
                              </div>
                            )}

                            {/* Other Fee */}
                            {Number(studentPendingInfo.otherFeeDues || 0) > 0 && (
                              <div className="bg-white border-2 border-cyan-400 p-3 rounded">
                                <p className="text-xs text-gray-600 font-semibold">OTHER FEE</p>
                                <p className="text-xl font-bold text-cyan-700">₹{Number(studentPendingInfo.otherFeeDues || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">One-time</p>
                              </div>
                            )}

                            {/* Fine */}
                            {Number(studentPendingInfo.fineDues || 0) > 0 && (
                              <div className="bg-white border-2 border-red-500 p-3 rounded">
                                <p className="text-xs text-gray-600 font-semibold">⚠️ FINE</p>
                                <p className="text-xl font-bold text-red-700">₹{Number(studentPendingInfo.fineDues || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">Penalty</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pending Months Info */}
                        {(studentPendingInfo.pendingMonths?.length || 0) > 0 && Number(studentPendingInfo.pendingAmount || 0) > 0 && (
                          <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                            <span className="font-semibold text-orange-800 text-sm">Pending Monthly Fees:</span>
                            <p className="text-orange-900 text-sm mt-1">{studentPendingInfo.pendingMonths?.join(", ")}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Fee Types */}
              <div>
                 <Label>Fee Types</Label>
                 <div className="flex gap-4 flex-wrap mt-2">
                    {["Monthly Fee", "Exam Fee", "Admission Fee", "Other Fee", "Fine", "Dress Fee", "Book Fee"].map(t => (
                       <label key={t} className={`flex items-center gap-2 border p-2 rounded cursor-pointer ${t === "Monthly Fee" && usesBus ? 'bg-blue-50 border-blue-300' : ''}`}>
                          <input type="checkbox" 
                            checked={selectedFeeTypes.includes(t as FeeType)} 
                            onChange={e => {
                               if(e.target.checked) {
                                 // If Monthly Fee selected and student uses bus, auto-add Bus Fee
                                 if (t === "Monthly Fee" && usesBus) {
                                   setSelectedFeeTypes([...selectedFeeTypes.filter(x => x !== "Bus Fee"), t as FeeType, "Bus Fee" as FeeType]);
                                 } else {
                                   setSelectedFeeTypes([...selectedFeeTypes, t as FeeType]);
                                 }
                               } else {
                                 // If Monthly Fee unchecked, also remove Bus Fee
                                 if (t === "Monthly Fee") {
                                   setSelectedFeeTypes(selectedFeeTypes.filter(x => x !== t && x !== "Bus Fee"));
                                 } else {
                                   setSelectedFeeTypes(selectedFeeTypes.filter(x => x !== t));
                                 }
                               }
                            }} 
                          />
                          {t}
                          {t === "Monthly Fee" && usesBus && <span className="text-xs text-blue-600 ml-1">(+ 🚌 Bus)</span>}
                       </label>
                    ))}
                 </div>
                 {/* Bus status indicator */}
                 {selectedStudent && (
                   <p className={`text-xs mt-1 ${usesBus ? 'text-green-600' : 'text-gray-500'}`}>
                     {usesBus ? '✓ This student uses school bus - Bus Fee included with Monthly Fee' : 'ℹ️ No bus assigned to this student'}
                   </p>
                 )}
              </div>

              {/* Month Selection */}
              <div>
                 <Label>Months</Label>
                 <div className="grid grid-cols-4 gap-2 mt-2">
                    {months.map(m => (
                       <label key={m} className="flex items-center gap-2">
                          <input type="checkbox" checked={paymentMonths.includes(m)}
                             onChange={e => {
                                if(e.target.checked) setPaymentMonths([...paymentMonths, m]);
                                else setPaymentMonths(paymentMonths.filter(x => x !== m));
                             }}
                          />
                          {m}
                       </label>
                    ))}
                 </div>
              </div>

              {/* Fee Calculation Summary */}
              {selectedStudent && selectedFeeTypes.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-lg">
                  <p className="font-bold text-blue-900 mb-3 text-sm flex items-center gap-2">
                    <span>📊</span> SELECTED FEES BREAKDOWN
                  </p>
                  <div className="space-y-2">
                    {(() => {
                      const student = students.find(s => s._id === selectedStudent);
                      const feeStruct = student ? localFeeStructure.find(f => f.classname === student.classname) : null;
                      if (!feeStruct) return <p className="text-gray-500 text-sm">Fee structure not found</p>;

                      const items: {name: string, rate: number, months?: number}[] = [];
                      let subtotal = 0;

                      if (selectedFeeTypes.includes("Monthly Fee")) {
                        const rate = Number(feeStruct.monthlyFee) || 0;
                        const amt = rate * (paymentMonths.length || 0);
                        items.push({ name: "Monthly Tuition", rate: rate, months: paymentMonths.length });
                        subtotal += amt;
                      }
                      if (selectedFeeTypes.includes("Bus Fee" as any) && usesBus) {
                        const rate = Number(feeStruct.busFee) || 0;
                        const amt = rate * (paymentMonths.length || 0);
                        items.push({ name: "🚌 Bus Fee", rate: rate, months: paymentMonths.length });
                        subtotal += amt;
                      }
                      if (selectedFeeTypes.includes("Exam Fee")) {
                        const rate = Number(feeStruct.examFee) || 0;
                        items.push({ name: "Exam Fee", rate: rate });
                        subtotal += rate;
                      }
                      if (selectedFeeTypes.includes("Admission Fee")) {
                        const rate = Number(feeStruct.annualFee) || 0;
                        items.push({ name: "Admission Fee", rate: rate });
                        subtotal += rate;
                      }
                      if (selectedFeeTypes.includes("Dress Fee")) {
                        const rate = Number(feeStruct.dressFee) || 0;
                        items.push({ name: "Dress Fee", rate: rate });
                        subtotal += rate;
                      }
                      if (selectedFeeTypes.includes("Book Fee")) {
                        const rate = Number(feeStruct.bookFee) || 0;
                        items.push({ name: "Book Fee", rate: rate });
                        subtotal += rate;
                      }
                      if (selectedFeeTypes.includes("Other Fee")) {
                        const rate = Number(feeStruct.otherFee) || 0;
                        items.push({ name: "Other Fee", rate: rate });
                        subtotal += rate;
                      }
                      if (selectedFeeTypes.includes("Fine")) {
                        const rate = Number(feeStruct.fine) || 0;
                        items.push({ name: "⚠️ Fine", rate: rate });
                        subtotal += rate;
                      }
                      if (additionalAmount > 0) {
                        items.push({ name: "➕ Additional/Late Fee", rate: Number(additionalAmount) || 0 });
                        subtotal += Number(additionalAmount) || 0;
                      }

                      const finalTotal = subtotal - (Number(discountAmount) || 0);

                      return (
                        <>
                          {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.name} {item.months ? `× ${item.months} months` : ""}</span>
                              <span className="font-medium text-gray-900">
                                {item.months ? `₹${item.rate} × ${item.months} = ₹${item.rate * item.months}` : `₹${item.rate}`}
                              </span>
                            </div>
                          ))}
                          <hr className="border-blue-200 my-2" />
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-red-600">
                              <span>Discount:</span>
                              <span>-₹{Number(discountAmount).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-base font-bold text-green-700 bg-green-50 p-2 rounded mt-2">
                            <span>TOTAL PAYABLE:</span>
                            <span>₹{Math.max(0, finalTotal).toLocaleString()}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                 <Label>Amount {selectedFeeTypes.some(f => f !== "Monthly Fee") && paymentMonths.length === 0 ? "(Auto-calculated)" : ""}</Label>
                 <Input 
                   value={paymentAmount} 
                   onChange={e => setPaymentAmount(e.target.value)}
                   readOnly={selectedFeeTypes.some(f => f !== "Monthly Fee") && paymentMonths.length === 0}
                   className={selectedFeeTypes.some(f => f !== "Monthly Fee") && paymentMonths.length === 0 ? "bg-gray-100" : ""}
                 /></div>
                 <div>
                    <Label>Payment Note (Optional)</Label>
                    <Input 
                        placeholder="e.g. Paid by Cheque, Late fee waived..." 
                        value={paymentNotes} 
                        onChange={e => setPaymentNotes(e.target.value)} 
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fine / Late Fee (₹)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={additionalAmount} 
                      onChange={e => setAdditionalAmount(Number(e.target.value))} 
                      placeholder="Amount" 
                      className="w-1/3" 
                    />
                    <Input 
                      type="text" 
                      value={additionalFeeReason} 
                      onChange={e => setAdditionalFeeReason(e.target.value)} 
                      placeholder="Reason (e.g. Late Fee, Penalty)" 
                      className="w-2/3" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Add late fee, fine or any additional charges here</p>
                </div>
                <div>
                  <Label>Discount Amount (₹)</Label>
                  <Input type="number" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} placeholder="e.g. 500" />
                  <p className="text-xs text-gray-500 mt-1">Scholarship, waiver or discount</p>
                </div>
                <div>
                  <Label>Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={e => setPaymentMode(e as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCollectFee} className="w-full">Submit Payment</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STUDENTS STATUS TAB */}
        <TabsContent value="students">
           <Card>
              <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <CardTitle>Student Fee Status</CardTitle>
                    {/* Class Filter */}
                    <Select value={filterClass} onValueChange={setFilterClass}>
                        <SelectTrigger className="w-[120px] h-8"><SelectValue placeholder="Class" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Classes</SelectItem>
                            {["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {/* Status Filter */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[120px] h-8"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Search */}
                    <Input 
                        placeholder="Search Name/Adm No" 
                        className="h-8 w-[180px]" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div className="flex gap-2">
                    {/* BULK PRINT BUTTON */}
                    <Button variant="outline" size="sm" onClick={() => generateDueSlipPDF(filteredStudents, true)}>
                        <Printer className="mr-2 h-4 w-4 text-red-600"/> Print All Slips
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportDuesListToExcel}>
                        <Download className="mr-2 h-4 w-4 text-green-600"/> Excel
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                         <TableHead>Total Billed</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Monthly Pending</TableHead>
                          <TableHead>Other Dues</TableHead>
                          <TableHead>Total Pending</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredStudents?.length === 0 ? (
                           <TableRow><TableCell colSpan={9} className="text-center">No students found.</TableCell></TableRow>
                       ) : (
                           filteredStudents?.map(s => (
                              <TableRow key={s.admissionNo}>
                                 <TableCell>
                                     <div className="font-medium">{s.studentName}</div>
                                     <div className="text-xs text-gray-500">{s.admissionNo}</div>
                                 </TableCell>
                                 <TableCell>{s.classname}</TableCell>
                                 <TableCell>₹{s.previousDues}</TableCell>
                                 <TableCell>₹{s.totalPaid}</TableCell>
                                 <TableCell className={s.pendingAmount > 0 ? "text-red-600 font-bold" : "text-green-600"}>₹{s.pendingAmount}</TableCell>
                                 <TableCell className="text-xs text-gray-600">
                                    {(() => {
                                        const dues = [];
                                        // Note: Bus fee is already included in Monthly Pending, so don't show here
                                        if (s.examFeeDues > 0) dues.push(`Exam: ₹${s.examFeeDues}`);
                                        if (s.admissionFeeDues > 0) dues.push(`Adm: ₹${s.admissionFeeDues}`);
                                        if (s.dressFeeDues > 0) dues.push(`Dress: ₹${s.dressFeeDues}`);
                                        if (s.bookFeeDues > 0) dues.push(`Book: ₹${s.bookFeeDues}`);
                                        if (s.fineDues > 0) dues.push(`Fine: ₹${s.fineDues}`);
                                        if (s.otherFeeDues > 0) dues.push(`Other: ₹${s.otherFeeDues}`);
                                        return dues.length > 0 ? dues.join(", ") : "-";
                                    })()}
                                 </TableCell>
                                 <TableCell className={s.totalPreviousDues > 0 ? "text-red-600 font-bold" : "text-green-600"}>₹{s.totalPreviousDues}</TableCell>
                                 <TableCell>
                                     <Badge variant={s.totalPreviousDues > 0 ? "destructive" : "default"} className={s.totalPreviousDues <= 0 ? "bg-green-600" : ""}>
                                         {s.totalPreviousDues > 0 ? "Pending" : "Paid"}
                                     </Badge>
                                 </TableCell>
                                 <TableCell>
                                    {/* INDIVIDUAL SLIP BUTTON */}
                                    {s.totalPreviousDues > 0 && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => generateDueSlipPDF([s], false)}
                                            title="Print Due Slip"
                                        >
                                            <FileWarning className="h-4 w-4 text-orange-500" />
                                        </Button>
                                    )}
                                 </TableCell>
                              </TableRow>
                           ))
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        {/* DEFAULTERS TAB */}
        <TabsContent value="defaulters">
           <Card>
              <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <CardTitle className="text-red-700">Fee Defaulters</CardTitle>
                    <Select value={filterClass} onValueChange={setFilterClass}>
                        <SelectTrigger className="w-[120px] h-8"><SelectValue placeholder="Class" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Classes</SelectItem>
                            {["Nursery", "LKG", "UKG", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateDueSlipPDF(studentsFeeStatus.filter(s => s.totalPreviousDues > 0 && (filterClass === "All" || s.classname === filterClass)), true)}>
                        <Printer className="mr-2 h-4 w-4 text-red-600"/> Print All Due Slips
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                 <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-center">
                       <span className="text-red-800 font-semibold">Total Pending Amount:</span>
                       <span className="text-2xl font-bold text-red-600">
                          ₹{studentsFeeStatus
                            .filter(s => s.totalPreviousDues > 0 && (filterClass === "All" || s.classname === filterClass))
                            .reduce((sum, s) => sum + s.totalPreviousDues, 0)
                            .toLocaleString()}
                       </span>
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                       {studentsFeeStatus.filter(s => s.totalPreviousDues > 0 && (filterClass === "All" || s.classname === filterClass)).length} students with pending fees
                    </div>
                 </div>
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Monthly Pending</TableHead>
                          <TableHead>Other Dues</TableHead>
                          <TableHead>Total Pending</TableHead>
                          <TableHead>Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {studentsFeeStatus
                         .filter(s => s.totalPreviousDues > 0 && (filterClass === "All" || s.classname === filterClass))
                         .sort((a, b) => b.totalPreviousDues - a.totalPreviousDues)
                         .map(s => {
                           const student = students.find(st => String(st.admission_no) === String(s.admissionNo));
                           return (
                              <TableRow key={s.admissionNo} className="bg-red-50/30">
                                 <TableCell>
                                     <div className="font-medium">{s.studentName}</div>
                                     <div className="text-xs text-gray-500">Adm: {s.admissionNo}</div>
                                 </TableCell>
                                 <TableCell>{s.classname}</TableCell>
                                 <TableCell className="text-xs">
                                    {student?.contact || student?.father_contact || '-'}
                                 </TableCell>
                                 <TableCell className="text-red-600 font-semibold">₹{s.pendingAmount}</TableCell>
                                 <TableCell className="text-xs">
                                    {(() => {
                                        const dues = [];
                                        // Note: Bus fee is already included in Monthly Pending, so don't show here
                                        if (s.examFeeDues > 0) dues.push(`Exam: ₹${s.examFeeDues}`);
                                        if (s.admissionFeeDues > 0) dues.push(`Adm: ₹${s.admissionFeeDues}`);
                                        if (s.dressFeeDues > 0) dues.push(`Dress: ₹${s.dressFeeDues}`);
                                        if (s.bookFeeDues > 0) dues.push(`Book: ₹${s.bookFeeDues}`);
                                        if (s.fineDues > 0) dues.push(`Fine: ₹${s.fineDues}`);
                                        if (s.otherFeeDues > 0) dues.push(`Other: ₹${s.otherFeeDues}`);
                                        return dues.length > 0 ? dues.join(", ") : "-";
                                    })()}
                                 </TableCell>
                                 <TableCell className="text-red-700 font-bold text-lg">₹{s.totalPreviousDues}</TableCell>
                                 <TableCell>
                                    <div className="flex gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => generateDueSlipPDF([s], false)}
                                            title="Print Due Slip"
                                        >
                                            <FileWarning className="h-4 w-4 text-orange-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                               setSelectedStudent(students.find(st => String(st.admission_no) === String(s.admissionNo))?._id || "");
                                               setCollectSearchTerm(`[${s.admissionNo}] ${s.studentName}`);
                                               setActiveTab("collect");
                                            }}
                                            title="Collect Fee"
                                        >
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                        </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           );
                         })
                       }
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
           <Card>
              <CardHeader className="flex flex-row justify-between">
                 <CardTitle>Global Payment History</CardTitle>
                 <Button variant="outline" onClick={exportPaymentHistoryToExcel}><Download className="mr-2 h-4 w-4"/> Export Excel</Button>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Adm No</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Breakdown</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                    {allPayments.map(p => {
                          return (
                            <TableRow key={p._id}>
                               <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                               <TableCell>{resolveAdmissionNo(p)}</TableCell>
                               <TableCell>{p.studentName}</TableCell>
                               <TableCell>{p.classname}</TableCell>
                               <TableCell>{p.month} {p.year}</TableCell>
                               <TableCell className="text-xs text-gray-600 max-w-[200px]">
                                  {[
                                    p.monthly_fees > 0 ? `M:₹${p.monthly_fees}` : null,
                                    p.bus_fee > 0 ? `🚌₹${p.bus_fee}` : null,
                                    p.exam_fees > 0 ? `E:₹${p.exam_fees}` : null,
                                    p.admission_fees > 0 ? `A:₹${p.admission_fees}` : null,
                                    p.dress_fee > 0 ? `D:₹${p.dress_fee}` : null,
                                    p.book_fee > 0 ? `B:₹${p.book_fee}` : null,
                                    p.fine > 0 ? `F:₹${p.fine}` : null,
                                    p.discount > 0 ? `-₹${p.discount}` : null
                                  ].filter(Boolean).join(", ") || "-"}
                               </TableCell>
                               <TableCell className="font-semibold">₹{p.totalAmount}</TableCell>
                               <TableCell>
                                  <Button size="sm" variant="ghost" onClick={() => generateSingleFeeReceipt(p)}>Receipt</Button>
                               </TableCell>
                            </TableRow>
                          );
                       })}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        {/* FEE STRUCTURE TAB */}
        <TabsContent value="structure">
           <Card>
              <CardHeader className="flex flex-row justify-between">
                 <CardTitle>Fee Structure (Database)</CardTitle>
                 {structLoading ? <Loader2 className="animate-spin" /> : <Button onClick={handleSaveFeeStructure}>Save Changes</Button>}
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Monthly Fee</TableHead><TableHead>Annual Fee</TableHead><TableHead>Exam Fee</TableHead><TableHead>Bus Fee</TableHead><TableHead>Dress Fee</TableHead><TableHead>Book Fee</TableHead><TableHead>Other Fee</TableHead><TableHead>Fine</TableHead><TableHead>Discount %</TableHead></TableRow></TableHeader>
                    <TableBody>
                       {localFeeStructure.map((f, i) => (
                          <TableRow key={f.classname}>
                             <TableCell>{f.classname}</TableCell>
                             <TableCell>
                                <Input type="number" value={f.monthlyFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], monthlyFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.annualFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], annualFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.examFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], examFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.busFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], busFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.dressFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], dressFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.bookFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], bookFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.otherFee} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], otherFee: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.fine} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], fine: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                />
                             </TableCell>
                             <TableCell>
                                <Input type="number" value={f.discount} 
                                   onChange={e => {
                                      const newStructure = [...localFeeStructure];
                                      newStructure[i] = { ...newStructure[i], discount: Number(e.target.value) };
                                      setLocalFeeStructure(newStructure);
                                   }} 
                                   step="0.01"
                                />
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </TabsContent>

        {/* STUDENT HISTORY SEARCH TAB */}
        <TabsContent value="student-history">
           <Card>
              <CardHeader><CardTitle>Search Student</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex gap-2 items-start">
                    <div className="relative flex-1">
                        <Input 
                            placeholder="Enter Name or Admission No" 
                            value={admissionNoSearch} 
                            onChange={e => {
                                setAdmissionNoSearch(e.target.value);
                                setShowHistorySuggestions(true);
                            }}
                            onFocus={() => setShowHistorySuggestions(true)}
                            onBlur={() => setTimeout(() => setShowHistorySuggestions(false), 200)}
                        />
                        {showHistorySuggestions && admissionNoSearch && (
                            <div className="absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                               {filteredHistoryStudents.map(s => (
                                  <div key={s._id} className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b"
                                     onMouseDown={() => {
                                        setAdmissionNoSearch(s.admission_no);
                                        setShowHistorySuggestions(false);
                                        handleStudentHistorySearch(s.admission_no);
                                     }}
                                  >
                                     <div className="font-medium">{s.student_name}</div>
                                     <div className="text-xs text-gray-500">Adm: {s.admission_no} | Class: {s.classname}</div>
                                  </div>
                               ))}
                               {filteredHistoryStudents.length === 0 && (
                                  <div className="p-2 text-gray-500 text-sm">No students found</div>
                               )}
                            </div>
                        )}
                    </div>
                    <Button onClick={() => handleStudentHistorySearch()}>Search</Button>
                 </div>
                 {searchedStudentInfo && (
                    <div className="mt-4">
                       <h3 className="font-bold text-lg">{searchedStudentInfo.name}</h3>
                       <p className="text-gray-500">Class: {searchedStudentInfo.classname} | Roll: {searchedStudentInfo.rollNo}</p>
                       
                       <Table className="mt-4">
                          <TableHeader>
                             <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Receipt</TableHead>
                                <TableHead>Month</TableHead>
                                <TableHead>Breakdown</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Action</TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {searchedStudentPayments?.map(p => (
                                <TableRow key={p._id}>
                                   <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                                   <TableCell>{p.receiptNo || "-"}</TableCell>
                                   <TableCell>{p.month} {p.year}</TableCell>
                                   <TableCell className="text-xs text-gray-600">
                                      {[
                                        p.monthly_fees > 0 ? `Monthly: ₹${p.monthly_fees}` : null,
                                        p.bus_fee > 0 ? `🚌Bus: ₹${p.bus_fee}` : null,
                                        p.admission_fees > 0 ? `Adm: ₹${p.admission_fees}` : null,
                                        p.exam_fees > 0 ? `Exam: ₹${p.exam_fees}` : null,
                                        p.dress_fee > 0 ? `Dress: ₹${p.dress_fee}` : null,
                                        p.book_fee > 0 ? `Book: ₹${p.book_fee}` : null,
                                        p.fine > 0 ? `Fine: ₹${p.fine}` : null,
                                        p.other_fee > 0 ? `Other: ₹${p.other_fee}` : null,
                                        p.discount > 0 ? `Disc: -₹${p.discount}` : null
                                      ].filter(Boolean).join(", ") || "-"}
                                   </TableCell>
                                   <TableCell className="font-bold">₹{p.totalAmount}</TableCell>
                                   <TableCell>
                                      <Button size="sm" variant="ghost" onClick={() => generateSingleFeeReceipt(p)} title="Print Receipt">
                                         <Printer className="h-4 w-4 text-blue-600" />
                                      </Button>
                                   </TableCell>
                                </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </div>
                 )}
              </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};
export default FeeManagement;
