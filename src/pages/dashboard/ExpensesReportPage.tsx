import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getSalaryHistory } from "@/store/slices/salarySlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingDown, Download } from "lucide-react";
import * as XLSX from 'xlsx';

const ExpensesReportPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading } = useSelector((state: RootState) => state.salary);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const role = userInfo?.role;

  const [filterRole, setFilterRole] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolExpenses, setSchoolExpenses] = useState<any[]>([]);

  useEffect(() => {
    dispatch(getSalaryHistory());
    
    // Fetch school expenses
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
          const formattedData = data.map((exp: any) => ({
            ...exp,
            amount: parseFloat(exp.amount),
            description: exp.title || exp.description
          }));
          setSchoolExpenses(formattedData);
        }
      } catch (e) {
        console.error("Error loading expenses:", e);
      }
    };
    fetchExpenses();
  }, [dispatch, userInfo]);

  // Only admin or finance user can see expenses report
  if (role !== "admin" && role !== "finance") {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Salary / expenses report dekhne ka adhikaar sirf Admin ya Payment
          section ke user ke paas hai.
        </p>
      </div>
    );
  }

  // Filter Data
  const filteredSalaries = history.filter((record) => {
    const matchesRole = filterRole === "All" || record.role === filterRole;
    const matchesMonth = filterMonth === "All" || record.month === filterMonth;
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesMonth && matchesSearch;
  }).map(record => ({
    ...record,
    amount: parseFloat(record.amount) || 0
  }));

  const filteredSchoolExpenses = schoolExpenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const expMonth = expDate.toLocaleString('en-US', { month: 'long' });
    const matchesMonth = filterMonth === "All" || expMonth === filterMonth;
    const matchesSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesSearch;
  });

  // Calculate Total
  const totalSalaries = filteredSalaries.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalSchoolExpenses = filteredSchoolExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalExpenses = totalSalaries + totalSchoolExpenses;

  // Export to Excel
  const handleExportExcel = () => {
    const salaryData = filteredSalaries.map(record => ({
      'Date': record.date ? new Date(record.date).toLocaleDateString() : 'N/A',
      'Type': 'Salary',
      'Employee/Description': record.employeeName,
      'Role': record.role,
      'Month/Year': `${record.month} ${record.year}`,
      'Category': '-',
      'Amount': parseFloat(record.amount) || 0
    }));

    const expenseData = filteredSchoolExpenses.map(exp => ({
      'Date': new Date(exp.date).toLocaleDateString(),
      'Type': 'School Expense',
      'Employee/Description': exp.description,
      'Role': '-',
      'Month/Year': '-',
      'Category': exp.category,
      'Amount': parseFloat(exp.amount) || 0
    }));

    const allData = [...salaryData, ...expenseData];
    
    // Add total row
    allData.push({
      'Date': '',
      'Type': 'TOTAL',
      'Employee/Description': '',
      'Role': '',
      'Month/Year': '',
      'Category': '',
      'Amount': parseFloat(totalExpenses.toFixed(2))
    });

    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses Report');
    XLSX.writeFile(wb, `Expenses_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Expenses (Payroll + School) Report</h1>
        <Button variant="outline" onClick={handleExportExcel}>
          <Download className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Salary Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">Rs. {totalSalaries.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">School Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">Rs. {totalSchoolExpenses.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">Rs. {totalExpenses.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search employee name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="Teacher">Teachers</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Months</SelectItem>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500"/> Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee/Description</TableHead>
                  <TableHead>Role/Category</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalaries.length === 0 && filteredSchoolExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {/* Salary Records */}
                    {filteredSalaries.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.date ? new Date(record.date).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            Salary
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${record.role === 'Teacher' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {record.role}
                          </span>
                        </TableCell>
                        <TableCell>{record.month} {record.year}</TableCell>
                        <TableCell className="text-right font-bold text-gray-700">
                          Rs. {record.amount.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* School Expense Records */}
                    {filteredSchoolExpenses.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(exp.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                            School Expense
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{exp.description || exp.title}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            {exp.category}
                          </span>
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right font-bold text-gray-700">
                          Rs. {exp.amount.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesReportPage;
