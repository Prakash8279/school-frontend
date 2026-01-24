import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { listTeachers } from "@/store/slices/teacherSlice";
import { listStaff } from "@/store/slices/staffSlice";
import { paySalary, resetSalaryState } from "@/store/slices/salarySlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Banknote } from "lucide-react";
import jsPDF from "jspdf";
import schoolLogo from "@/assets/school-logo.png";

const PayrollPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { teachers } = useSelector((state: RootState) => state.teacher);
  const { staffList } = useSelector((state: RootState) => state.staff);
  const { loading, success, error } = useSelector((state: RootState) => state.salary);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;

  const [employeeType, setEmployeeType] = useState<"Teacher" | "Staff">("Teacher");
  const [selectedId, setSelectedId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState("");
  const [deductions, setDeductions] = useState("");
  const [deductionReason, setDeductionReason] = useState("");
  
  // Expense payment states
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Maintenance");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Load expenses from backend on mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = userInfo?.token;
        const response = await fetch('http://localhost:5000/api/expenses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Convert amount to number
          const formattedData = data.map((exp: any) => ({
            ...exp,
            amount: parseFloat(exp.amount),
            description: exp.title || exp.description,
            recordedAt: new Date(exp.created_at).toLocaleString('en-IN')
          }));
          setExpenses(formattedData);
        }
      } catch (e) {
        console.error("Error loading expenses:", e);
      }
    };
    fetchExpenses();
  }, [userInfo]);

  useEffect(() => {
    dispatch(listTeachers());
    dispatch(listStaff());
  }, [dispatch]);

  // Only admin or finance user can access payroll
  if (role !== "admin" && role !== "finance") {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Payroll manage karne ka adhikaar sirf Admin ya Payment section ke
          user ke paas hai.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (success) {
      toast.success("Salary Paid Successfully!");
      setAmount("");
      setDeductions("");
      setDeductionReason("");
      setSelectedId("");
      dispatch(resetSalaryState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetSalaryState());
    }
  }, [success, error, dispatch]);

  // Get the selected person object to autofill salary
  const selectedPerson = employeeType === "Teacher" 
    ? teachers.find(t => t._id === selectedId)
    : staffList.find(s => s._id === selectedId);

  // Autofill amount when person is selected
  useEffect(() => {
    if (selectedPerson) {
      // Use 'estimated_salary' for teachers or 'salary' for staff
      const salary = (selectedPerson as any).estimated_salary || (selectedPerson as any).salary;
      setAmount(salary || "");
    }
  }, [selectedPerson]);

  // Generate and download salary slip
  const generateSalarySlip = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 15;
      
      // Load school logo in left corner
      try {
        const img = new Image();
        img.src = schoolLogo;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')?.drawImage(img, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        pdf.addImage(logoData, 'PNG', margin, yPos - 5, 20, 20);
      } catch (e) {
        console.log("Logo load failed");
      }
      
      // School Header - Black & White, Centered
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("R.N.T. PUBLIC SCHOOL", pageWidth / 2, yPos, { align: "center" });
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Jankinagar Basantpur, Siwan (Bihar)", pageWidth / 2, yPos + 6, { align: "center" });
      pdf.text("Phone: +91-7061337068 | Email: rntpublics@gmail.com", pageWidth / 2, yPos + 11, { align: "center" });
      
      // Black line separator
      yPos += 18;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      
      // Title
      yPos += 8;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("OFFICIAL SALARY SLIP", pageWidth / 2, yPos, { align: "center" });
      
      // Bottom line
      yPos += 5;
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      
      // Slip Info
      yPos += 7;
      const slipNo = `SAL-${Date.now().toString().slice(-6)}`;
      const currentDate = new Date().toLocaleDateString('en-IN');
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Slip No: ${slipNo}`, margin, yPos);
      pdf.text(`Date: ${currentDate}`, pageWidth - margin - 35, yPos);
      
      // Employee Details
      yPos += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("EMPLOYEE DETAILS", margin, yPos);
      
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      const employeeName = (selectedPerson as any).teacher_name || (selectedPerson as any).staff_name || "N/A";
      const col1X = margin;
      const col2X = pageWidth / 2 + 5;
      
      pdf.text(`Name: ${employeeName}`, col1X, yPos);
      pdf.text(`Department: ${employeeType}`, col2X, yPos);
      
      yPos += 5;
      pdf.text(`Employee ID: ${selectedId}`, col1X, yPos);
      pdf.text(`Designation: ${employeeType}`, col2X, yPos);
      
      yPos += 5;
      pdf.text(`Month: ${month}`, col1X, yPos);
      pdf.text(`Year: ${year}`, col2X, yPos);
      
      // Salary Details
      yPos += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("SALARY DETAILS", margin, yPos);
      
      yPos += 6;
      
      // Table setup
      const tableMargin = margin;
      const col1Width = 45;
      const col2Width = 45;
      const col3Width = pageWidth - 2 * margin - col1Width - col2Width;
      
      // Table header
      pdf.setFillColor(200, 200, 200);
      pdf.rect(tableMargin, yPos - 3, col1Width, 7, 'F');
      pdf.rect(tableMargin + col1Width, yPos - 3, col2Width, 7, 'F');
      pdf.rect(tableMargin + col1Width + col2Width, yPos - 3, col3Width, 7, 'F');
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("Description", tableMargin + 2, yPos);
      pdf.text("Period", tableMargin + col1Width + 2, yPos);
      pdf.text("Amount", tableMargin + col1Width + col2Width + 2, yPos);
      
      yPos += 8;
      
      // Salary row
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const salary = Number(amount);
      pdf.text("Basic Salary", tableMargin + 2, yPos);
      pdf.text(`${month} ${year}`, tableMargin + col1Width + 2, yPos);
      pdf.text(`Rs. ${salary.toLocaleString('en-IN')}`, tableMargin + col1Width + col2Width + 2, yPos);
      
      yPos += 6;
      
      // Subtotal
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.4);
      pdf.line(tableMargin, yPos, pageWidth - margin, yPos);
      yPos += 5;
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("Subtotal (Earnings):", tableMargin + 2, yPos);
      pdf.text(`Rs. ${salary.toLocaleString('en-IN')}`, pageWidth - margin - 35, yPos);
      
      // Deductions
      yPos += 8;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("DEDUCTIONS", margin, yPos);
      
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      const deductionAmount = Number(deductions) || 0;
      
      if (deductionAmount > 0) {
        const reason = deductionReason || "Deduction";
        pdf.text(reason, tableMargin + 2, yPos);
        pdf.text(`Rs. ${deductionAmount.toLocaleString('en-IN')}`, pageWidth - margin - 35, yPos);
        yPos += 5;
      } else {
        pdf.text("None", tableMargin + 2, yPos);
        yPos += 5;
      }
      
      // Total Deductions
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("Total Deductions:", tableMargin + 2, yPos);
      pdf.text(`Rs. ${deductionAmount.toLocaleString('en-IN')}`, pageWidth - margin - 35, yPos);
      
      // Net Salary
      yPos += 8;
      pdf.setFillColor(220, 220, 220);
      pdf.rect(tableMargin, yPos - 3, pageWidth - 2 * margin, 8, 'F');
      
      const netSalary = salary - deductionAmount;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("TOTAL AMOUNT PAYABLE:", tableMargin + 2, yPos + 2);
      pdf.text(`Rs. ${netSalary.toLocaleString('en-IN')}`, pageWidth - margin - 35, yPos + 2);
      
      // Notes
      yPos += 12;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text("* Subject to applicable deductions and government policies", margin, yPos);
      
      // Signatures
      yPos += 10;
      const sigLineY = yPos + 8;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 5, sigLineY, margin + 30, sigLineY);
      pdf.line(pageWidth / 2 + 5, sigLineY, pageWidth / 2 + 30, sigLineY);
      
      yPos = sigLineY + 3;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Accountant", margin + 5, yPos);
      pdf.text("Principal/Director", pageWidth / 2 + 5, yPos);
      
      // Download
      const filename = `Salary_Slip_${employeeName.replace(/\s+/g, '_')}_${month}_${year}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating salary slip:", error);
      toast.error("Error generating salary slip");
    }
  };

  const handleExpenseSubmit = async () => {
    if (!expenseDescription || !expenseAmount || !expenseDate) {
      return toast.error("Please fill all expense fields");
    }

    // Send to backend
    try {
      const token = userInfo?.token;
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: expenseDescription,
          amount: Number(expenseAmount),
          category: expenseCategory,
          date: expenseDate,
          description: expenseDescription
        })
      });
      
      if (response.ok) {
        const newExpense = await response.json();
        // Format the expense data
        const formattedExpense = {
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          description: newExpense.title || expenseDescription,
          recordedAt: new Date().toLocaleString('en-IN')
        };
        setExpenses([formattedExpense, ...expenses]);
        toast.success(`Expense recorded: Rs. ${Number(expenseAmount).toLocaleString('en-IN')}`);
        
        // Reset form
        setExpenseDescription("");
        setExpenseAmount("");
        setExpenseCategory("Maintenance");
        setExpenseDate(new Date().toISOString().split('T')[0]);
      } else {
        toast.error("Failed to save expense");
      }
    } catch (e) {
      console.error("Error saving expense:", e);
      toast.error("Error saving expense to database");
    }
  };

  const handleSubmit = () => {
    if (!selectedId || !month || !year || !amount) return toast.error("Please fill all fields");

    dispatch(paySalary({
      employeeId: selectedId,
      employeeName: (selectedPerson as any).teacher_name || (selectedPerson as any).staff_name,
      role: employeeType,
      month,
      year,
      amount: Number(amount),
      date: "" // Filled by action
    }));

    // Generate salary slip after payment
    setTimeout(() => {
      generateSalarySlip();
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-600"/> Pay Salary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Employee Type Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={employeeType === "Teacher" ? "default" : "outline"} 
              onClick={() => { setEmployeeType("Teacher"); setSelectedId(""); }}
            >
              Pay Teacher
            </Button>
            <Button 
              variant={employeeType === "Staff" ? "default" : "outline"} 
              onClick={() => { setEmployeeType("Staff"); setSelectedId(""); }}
            >
              Pay Staff
            </Button>
          </div>

          {/* Select Person */}
          <div className="space-y-2">
            <Label>Select {employeeType}</Label>
            <Select onValueChange={setSelectedId} value={selectedId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${employeeType}...`} />
              </SelectTrigger>
              <SelectContent>
                {employeeType === "Teacher" 
                  ? teachers.map(t => <SelectItem key={t._id} value={t._id!}>{t.teacher_name}</SelectItem>)
                  : staffList.map(s => <SelectItem key={s._id} value={s._id!}>{s.staff_name} ({s.work})</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select onValueChange={setMonth} value={month}>
                <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                <SelectContent>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount (Rs.)</Label>
            <Input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="Enter Amount"
            />
          </div>

          {/* Deductions Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <Label className="font-semibold text-red-700">Deductions (Optional)</Label>
            
            <div className="space-y-2">
              <Label className="text-sm">Deduction Amount (₹)</Label>
              <Input 
                type="number" 
                value={deductions} 
                onChange={e => setDeductions(e.target.value)} 
                placeholder="Enter deduction amount (0 for none)"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Reason (Optional)</Label>
              <Input 
                type="text"
                value={deductionReason}
                onChange={e => setDeductionReason(e.target.value)}
                placeholder="e.g. Advance, Leave, Fine, etc."
              />
            </div>

            {deductions && Number(deductions) > 0 && (
              <div className="bg-white p-3 rounded border border-red-100">
                <div className="flex justify-between text-sm">
                  <span>Basic Salary:</span>
                  <span>₹ {Number(amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-red-100 pt-2 mt-2">
                  <span className="text-red-600">Deduction:</span>
                  <span className="text-red-600">- ₹ {Number(deductions).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-red-100 pt-2 mt-2">
                  <span>Net Payable:</span>
                  <span className="text-green-600">₹ {(Number(amount) - Number(deductions)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !selectedId}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />}
            Confirm Payment
          </Button>

        </CardContent>
      </Card>

      {/* School Expense Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-orange-600"/> School Expense Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label>Expense Description</Label>
            <Input 
              value={expenseDescription}
              onChange={e => setExpenseDescription(e.target.value)}
              placeholder="e.g., Maintenance work, Supplies, Renovation, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Renovation">Renovation</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date"
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount (Rs.)</Label>
            <Input 
              type="number" 
              value={expenseAmount} 
              onChange={e => setExpenseAmount(e.target.value)} 
              placeholder="Enter expense amount"
            />
          </div>

          <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleExpenseSubmit}>
            <Banknote className="mr-2 h-4 w-4" />
            Record Expense
          </Button>

          {/* Expense History */}
          {expenses.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-sm">Recent Expenses</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {expenses.map(exp => (
                  <div key={exp.id} className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{exp.description}</p>
                        <p className="text-xs text-gray-600">{exp.category} • {exp.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">Rs. {exp.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500">{exp.recordedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-orange-100 p-3 rounded font-semibold text-sm">
                Total Recorded: Rs. {expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-IN')}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollPage;