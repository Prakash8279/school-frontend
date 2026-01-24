import { FeeRecord } from "../store/slices/feeSlice";

// --- INTERFACES ---

export interface FeeStructure {
  classname: string;
  admissionFee?: number;
  monthlyFee: number;
  annualFee: number;
  examFee: number;
  otherFee: number;
  fine: number;
  busFee: number;
  dressFee: number;
  bookFee: number;
  discount: number;
}

export type FeeType = "Monthly Fee" | "Exam Fee" | "Other Fee" | "Admission Fee" | "Readmission Fee" | "Fine" | "Bus Fee" | "Dress Fee" | "Book Fee" | "Late Fee";

export interface StudentFeeStatus {
  studentId: string;
  studentName: string;
  admissionNo: string;
  classname: string;
  rollNo: string;
  monthlyFee: number;
  totalDue: number;
  previousDues: number;
  totalPaid: number;
  pendingMonths: string[];
  pendingBusMonths: string[];  // Bus pending months (separate from tuition)
  pendingAmount: number;
  lastPaymentDate?: string;
  // Individual fee dues breakdown
  examFeeDues: number;
  admissionFeeDues: number;
  otherFeeDues: number;
  fineDues: number;
  busFeeDues: number;
  dressFeeDues: number;
  bookFeeDues: number;
  // Previous Dues Summary (All pending fees combined)
  totalPreviousDues: number;
  advanceAmount: number;
  // New fields for enhanced tracking
  monthsPaidList?: string[];
  busPaidMonths?: string[];
  usesBus?: boolean;
}

// --- HELPER FUNCTIONS ---

// Normalize class names to standard format (One, Two, Three, etc.)
// Handles case variations and numeric formats
export const normalizeClassName = (classname: string): string => {
  const normalized = (classname || "").trim().toLowerCase();
  
  // Map all variations to standard format (matching fee_structure table)
  const classMap: Record<string, string> = {
    'one': 'One',
    '1': 'One',
    '1st': 'One',
    'two': 'Two',
    '2': 'Two',
    '2nd': 'Two',
    'three': 'Three',
    '3': 'Three',
    '3rd': 'Three',
    'four': 'Four',
    '4': 'Four',
    '4th': 'Four',
    'five': 'Five',
    '5': 'Five',
    '5th': 'Five',
    'six': 'Six',
    '6': 'Six',
    '6th': 'Six',
    'seven': 'Seven',
    '7': 'Seven',
    '7th': 'Seven',
    'eight': 'Eight',
    '8': 'Eight',
    '8th': 'Eight',
    'nursery': 'Nursery',
    'lkg': 'LKG',
    'ukg': 'UKG',
  };
  
  return classMap[normalized] || classname; // Return mapped value or original if not found
};

// Logic to determine Academic Year (Starts in April)
export const getAcademicYear = () => {
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0 = Jan
  const currentYear = now.getFullYear();
  return currentMonthIdx >= 3 ? currentYear : currentYear - 1;
};

// Get academic month index (April = 0, March = 11)
export const getAcademicMonthIndex = (month: string): number => {
  const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
  return months.indexOf(month);
};

// Get current academic month index
export const getCurrentAcademicMonthIndex = (): number => {
  const now = new Date();
  const jsMonth = now.getMonth(); // 0=Jan, 3=Apr
  // Convert JS month to academic month index
  // Apr=0, May=1, ... Dec=8, Jan=9, Feb=10, Mar=11
  return jsMonth >= 3 ? jsMonth - 3 : jsMonth + 9;
};

/**
 * Calculates the fee status for a single student based on the provided Fee Structure list.
 */
export const getStudentFeeStatus = (
  studentId: string, 
  studentName: string, 
  admissionNo: string, 
  classname: string, 
  rollNo: string, 
  allPayments: FeeRecord[], 
  feeStructureList: FeeStructure[],
  admissionDate?: string,
  usesBus: boolean = false,
  busStartDate?: string,
  busEndDate?: string
): StudentFeeStatus => {
  
  // Normalize the student's class name to match fee_structure format
  // e.g., "ONE" -> "One", "NURSERY" -> "Nursery"
  const normalizedStudentClass = normalizeClassName(classname);
  
  // Find fee structure for this specific class
  const feeStructure = feeStructureList.find(s => {
    const normalizedFeeClass = normalizeClassName(s.classname);
    const isMatch = normalizedFeeClass.toLowerCase() === normalizedStudentClass.toLowerCase();
    // Debug logging
    if (classname && classname.toLowerCase().includes('three') || classname.toLowerCase().includes('four')) {
      console.log(`[FEE DEBUG] Student class: "${classname}" -> normalized: "${normalizedStudentClass}", Fee class: "${s.classname}" -> normalized: "${normalizedFeeClass}", Match: ${isMatch}`);
    }
    return isMatch;
  });
  
  if (!feeStructure && classname) {
    console.warn(`[FEE WARNING] No fee structure found for class: "${classname}" (normalized: "${normalizedStudentClass}")`);
    console.log('[FEE DEBUG] Available fee structures:', feeStructureList.map(f => f.classname));
  }
  
  // Filter payments for this student - check both admissionNo and studentId
  const studentPayments = allPayments.filter(p => {
    const matchesAdmissionNo = String(p.admissionNo) === String(admissionNo);
    const matchesStudentId = p.studentId && String(p.studentId) === String(admissionNo);
    return matchesAdmissionNo || matchesStudentId;
  });
  
  // Default values if structure missing
  if (!feeStructure) {
    return {
      studentId, studentName, admissionNo, classname, rollNo,
      monthlyFee: 0, totalDue: 0, previousDues: 0, totalPaid: 0, pendingMonths: [], pendingBusMonths: [], pendingAmount: 0,
      examFeeDues: 0, admissionFeeDues: 0, otherFeeDues: 0, fineDues: 0, busFeeDues: 0, dressFeeDues: 0, bookFeeDues: 0,
      totalPreviousDues: 0, advanceAmount: 0, usesBus
    };
  }

  // --- 1. Determine Months Passed ---
  const academicYearStart = getAcademicYear();
  const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
  
  const now = new Date();
  // Calculate current academic month index (Apr=0 to Mar=11)
  const currentAcademicMonth = getCurrentAcademicMonthIndex();
  
  // Calculate total months to check from admission to now
  let startMonthIndex = 0;
  let startYear = academicYearStart;
  let totalMonthsToCalculate = currentAcademicMonth + 1;
  
  if (admissionDate) {
    const admDate = new Date(admissionDate);
    if (!isNaN(admDate.getTime())) {
      const admMonth = admDate.getMonth();
      const admYear = admDate.getFullYear();
      const admSessionYear = admMonth >= 3 ? admYear : admYear - 1;

      if (admSessionYear < academicYearStart) {
        // Admission was in a previous academic year
        startMonthIndex = admMonth >= 3 ? admMonth - 3 : admMonth + 9;
        startYear = admSessionYear;
        
        // Calculate total months from admission to now across multiple years
        const yearsDiff = academicYearStart - admSessionYear;
        totalMonthsToCalculate = (yearsDiff * 12) + currentAcademicMonth + 1 - startMonthIndex;
      } else if (admSessionYear === academicYearStart) {
        // Admission in current academic year
        startMonthIndex = admMonth >= 3 ? admMonth - 3 : admMonth + 9;
        startYear = admSessionYear;
        totalMonthsToCalculate = currentAcademicMonth + 1 - startMonthIndex;
      } else {
        // Future admission
        totalMonthsToCalculate = 0;
      }
    }
  }

  // --- 2. Calculate Dues ---
  const tuitionFee = Number(feeStructure.monthlyFee) || 0;
  const busFee = Number(feeStructure.busFee) || 0;

  // Get paid months to avoid double counting
  const paidMonthsSet = new Set<string>();
  const busPaidMonthsSet = new Set<string>();
  
  studentPayments.forEach(p => {
    if (p.monthly_fees > 0 && p.month !== 'Miscellaneous') {
      paidMonthsSet.add(`${p.month}-${p.year}`);
    }
    if ((p.bus_fee || 0) > 0 && p.month !== 'Miscellaneous') {
      busPaidMonthsSet.add(`${p.month}-${p.year}`);
    }
  });

  // Calculate expected months and dues
  let totalTuitionDues = 0;
  let totalBusDues = 0;
  const pendingMonthsList: string[] = [];
  const pendingBusMonthsList: string[] = [];

  for (let i = 0; i < totalMonthsToCalculate; i++) {
    const monthIndex = (startMonthIndex + i) % 12;
    const monthName = months[monthIndex];
    const yearsFromStart = Math.floor((startMonthIndex + i) / 12);
    // Calculate actual calendar year: Jan/Feb/Mar (indices 9,10,11) are in next year
    const monthYear = startYear + yearsFromStart + (monthIndex >= 9 ? 1 : 0);
    const monthKey = `${monthName}-${monthYear}`;
    
    // Check if tuition not paid
    if (!paidMonthsSet.has(monthKey)) {
      totalTuitionDues += tuitionFee;
      pendingMonthsList.push(`${monthName} ${monthYear}`);
    }
    
    // Check bus fee - use proper date-based calculation
    let shouldChargeBus = false;
    
    // Convert academic month to actual date for comparison
    const jsMonthIndex = monthIndex < 9 ? monthIndex + 3 : monthIndex - 9;
    const monthDate = new Date(monthYear, jsMonthIndex, 1);
    
    if (busStartDate) {
      const busStart = new Date(busStartDate);
      // Normalize to first day of month for comparison
      busStart.setDate(1);
      busStart.setHours(0, 0, 0, 0);
      monthDate.setDate(1);
      monthDate.setHours(0, 0, 0, 0);
      
      // Bus is active if month >= busStartDate
      if (monthDate >= busStart) {
        shouldChargeBus = true;
        
        // Check if bus has been removed
        if (busEndDate) {
          const busEnd = new Date(busEndDate);
          busEnd.setDate(1);
          busEnd.setHours(0, 0, 0, 0);
          
          // Bus is NOT active if month > busEndDate
          if (monthDate > busEnd) {
            shouldChargeBus = false;
          }
        }
      }
    } else if (usesBus) {
      // Legacy support: if no busStartDate but usesBus flag is true, charge for all months
      shouldChargeBus = true;
    }
    
    if (shouldChargeBus && !busPaidMonthsSet.has(monthKey)) {
      totalBusDues += busFee;
      pendingBusMonthsList.push(monthName);
    }
  }

  const monthlyPending = totalTuitionDues + totalBusDues;

  // --- 3. Calculate Paid ---
  const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const monthlyPaid = studentPayments.reduce((sum, p) => sum + (Number(p.monthly_fees) || 0), 0);
  const busPaid = studentPayments.reduce((sum, p) => sum + (Number(p.bus_fee) || 0), 0);

  // --- 4. Calculate Individual Fee Dues (One-time fees not yet paid) ---
  const examFeePaid = studentPayments.reduce((sum, p) => sum + (Number(p.exam_fees) || 0), 0);
  const admissionFeePaid = studentPayments.reduce((sum, p) => sum + (Number(p.admission_fees) || 0), 0);
  const otherFeePaid = studentPayments.reduce((sum, p) => sum + (Number(p.other_fee) || 0), 0);
  const finePaid = studentPayments.reduce((sum, p) => sum + (Number(p.fine) || 0), 0);
  const dressFeePaid = studentPayments.reduce((sum, p) => sum + (Number(p.dress_fee) || 0), 0);
  const bookFeePaid = studentPayments.reduce((sum, p) => sum + (Number(p.book_fee) || 0), 0);

  // Dues = Structure fee - Paid amount
  const examFeeDues = Math.max(0, Number(feeStructure.examFee || 0) - examFeePaid);
  const admissionFeeDues = Math.max(0, Number(feeStructure.annualFee || 0) - admissionFeePaid);
  const otherFeeDues = Math.max(0, Number(feeStructure.otherFee || 0) - otherFeePaid);
  const fineDues = Math.max(0, Number(feeStructure.fine || 0) - finePaid); // Fine from structure
  const busFeeDues = totalBusDues; // Calculated monthly based on bus usage
  const dressFeeDues = Math.max(0, Number(feeStructure.dressFee || 0) - dressFeePaid);
  const bookFeeDues = Math.max(0, Number(feeStructure.bookFee || 0) - bookFeePaid);

  // --- 5. Total Previous Dues (includes all fee types) ---
  const totalPreviousDues = totalTuitionDues + totalBusDues + examFeeDues + admissionFeeDues + otherFeeDues + fineDues + dressFeeDues + bookFeeDues;
  
  // Check for advance payment - include bus fees in calculation
  let expectedBusFees = 0;
  if (busStartDate || usesBus) {
    // Calculate expected bus fees based on months where bus should be charged
    for (let i = 0; i < totalMonthsToCalculate; i++) {
      const monthIndex = (startMonthIndex + i) % 12;
      const monthName = months[monthIndex];
      const yearsFromStart = Math.floor((startMonthIndex + i) / 12);
      // Calculate actual calendar year: Jan/Feb/Mar (indices 9,10,11) are in next year
      const monthYear = startYear + yearsFromStart + (monthIndex >= 9 ? 1 : 0);
      const jsMonthIndex = monthIndex < 9 ? monthIndex + 3 : monthIndex - 9;
      const monthDate = new Date(monthYear, jsMonthIndex, 1);
      
      let shouldCount = false;
      if (busStartDate) {
        const busStart = new Date(busStartDate);
        busStart.setDate(1);
        busStart.setHours(0, 0, 0, 0);
        monthDate.setDate(1);
        monthDate.setHours(0, 0, 0, 0);
        
        if (monthDate >= busStart) {
          shouldCount = true;
          if (busEndDate) {
            const busEnd = new Date(busEndDate);
            busEnd.setDate(1);
            busEnd.setHours(0, 0, 0, 0);
            if (monthDate > busEnd) shouldCount = false;
          }
        }
      } else if (usesBus) {
        shouldCount = true;
      }
      
      if (shouldCount) expectedBusFees += busFee;
    }
  }
  
  const expectedTotal = totalMonthsToCalculate * tuitionFee + expectedBusFees + examFeeDues + admissionFeeDues + otherFeeDues + dressFeeDues + bookFeeDues;
  // Only show advance amount if there are NO pending dues (all fees are paid)
  const advanceAmount = totalPreviousDues > 0 ? 0 : Math.max(0, totalPaid - expectedTotal);

  // Determine current monthly rate for display
  let currentMonthlyRate = tuitionFee;
  if (usesBus || busStartDate) {
    currentMonthlyRate += busFee;
  }

  // Format pending months for display - show all months with years
  const pendingMonthsDisplay = pendingMonthsList.length > 0 
    ? pendingMonthsList
    : [];

  // Debug logging for bus fee calculation
  if (busStartDate || busEndDate || usesBus) {
    console.log(`[FEE CALC] ${studentName}:`, {
      busStartDate,
      busEndDate,
      usesBus,
      totalBusDues,
      busPaid,
      pendingBusMonths: pendingBusMonthsList.length,
      expectedBusFees,
      busRate: busFee,
      note: 'Bus fee is included in pendingAmount (Monthly + Bus combined)'
    });
  }

  return {
    studentId, 
    studentName, 
    admissionNo, 
    classname, 
    rollNo,
    monthlyFee: Math.round(Number(currentMonthlyRate) || 0),
    totalDue: Math.round(Number(totalPreviousDues) || 0),
    previousDues: Math.round(Number(totalTuitionDues + totalBusDues) || 0),
    totalPaid: Math.round(Number(totalPaid) || 0),
    pendingMonths: pendingMonthsDisplay,
    pendingBusMonths: pendingBusMonthsList,  // Separate bus pending months
    pendingAmount: Math.round(Number(monthlyPending) || 0),
    lastPaymentDate: studentPayments.length > 0 ? studentPayments[0].date : undefined,
    examFeeDues: Math.round(Number(examFeeDues) || 0),
    admissionFeeDues: Math.round(Number(admissionFeeDues) || 0),
    otherFeeDues: Math.round(Number(otherFeeDues) || 0),
    fineDues: Math.round(Number(fineDues) || 0),
    busFeeDues: Math.round(Number(busFeeDues) || 0),
    dressFeeDues: Math.round(Number(dressFeeDues) || 0),
    bookFeeDues: Math.round(Number(bookFeeDues) || 0),
    totalPreviousDues: Math.round(Number(totalPreviousDues) || 0),
    advanceAmount: Math.round(Number(advanceAmount) || 0),
    monthsPaidList: Array.from(paidMonthsSet),
    busPaidMonths: Array.from(busPaidMonthsSet),
    usesBus
  };
};

/**
 * Calculates status for an array of students.
 */
export const getAllStudentsFeeStatus = (
  students: Array<any>, 
  allPayments: FeeRecord[],
  feeStructureList: FeeStructure[]
): StudentFeeStatus[] => {
  return students.map(student => {
    const busStartDate = student.bus_start_date || student.busStartDate;
    // usesBus is true if: explicit flag set OR bus_start_date exists
    const usesBus = student.usesBus || student.uses_bus || !!busStartDate;
    
    return getStudentFeeStatus(
      student._id,
      student.student_name,
      student.admission_no,
      student.classname,
      student.roll_no || "N/A",
      allPayments,
      feeStructureList,
      student.admission_date || student.admissionDate || student.joining_date || student.created_at || student.createdAt,
      usesBus,
      busStartDate,
      student.bus_end_date || student.busEndDate
    );
  });
};

// --- STATISTICS ---
export const getTotalCollection = (allPayments: FeeRecord[]): { total: number; thisMonth: number; thisYear: number; today: number } => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0];

  const total = allPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  
  const thisMonth = allPayments
    .filter(p => {
      if (!p.date) return false;
      const date = new Date(p.date);
      if (isNaN(date.getTime())) return false;
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    
  const thisYear = allPayments
    .filter(p => {
      if (!p.date) return false;
      const date = new Date(p.date);
      if (isNaN(date.getTime())) return false;
      return date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

  const today = allPayments
    .filter(p => {
      if (!p.date) return false;
      const date = new Date(p.date);
      if (isNaN(date.getTime())) return false;
      const dateStr = date.toISOString().split('T')[0];
      return dateStr === todayStr;
    })
    .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

  return { total, thisMonth, thisYear, today };
};

// --- HELPER: Calculate Late Fee ---
export const calculateLateFee = (
  dueDate: Date, 
  paymentDate: Date, 
  amount: number,
  config: { 
    feeType: 'fixed' | 'percentage' | 'per_day';
    fixedAmount?: number;
    percentage?: number;
    perDayAmount?: number;
    gracePeriodDays?: number;
    maxLateFee?: number;
  }
): number => {
  if (paymentDate <= dueDate) return 0;
  
  const daysLate = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const gracePeriod = config.gracePeriodDays || 0;
  
  if (daysLate <= gracePeriod) return 0;
  
  const effectiveDaysLate = daysLate - gracePeriod;
  
  switch (config.feeType) {
    case 'fixed':
      return config.fixedAmount || 0;
    case 'percentage':
      return Math.round((amount * (config.percentage || 0)) / 100);
    case 'per_day':
      const maxFee = config.maxLateFee || (amount * 0.5);
      return Math.min(effectiveDaysLate * (config.perDayAmount || 0), maxFee);
    default:
      return 0;
  }
};

// --- HELPER: Get Pending Months List ---
export const getPendingMonthsList = (
  admissionDate: string | undefined,
  paidMonths: Set<string>,
  academicYear: number
): string[] => {
  const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
  const pending: string[] = [];
  
  const currentAcademicMonth = getCurrentAcademicMonthIndex();
  
  let startMonthIndex = 0;
  if (admissionDate) {
    const admDate = new Date(admissionDate);
    if (!isNaN(admDate.getTime())) {
      const admMonth = admDate.getMonth();
      const admYear = admDate.getFullYear();
      const admSessionYear = admMonth >= 3 ? admYear : admYear - 1;

      if (admSessionYear === academicYear) {
        startMonthIndex = admMonth >= 3 ? admMonth - 3 : admMonth + 9;
      }
    }
  }
  
  for (let i = startMonthIndex; i <= currentAcademicMonth; i++) {
    const monthName = months[i];
    const monthYear = i < 9 ? academicYear : academicYear + 1;
    const monthKey = `${monthName}-${monthYear}`;
    
    if (!paidMonths.has(monthKey)) {
      pending.push(monthName);
    }
  }
  
  return pending;
};