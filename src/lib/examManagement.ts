// Exam Schedule & Admit Card Management

const API_URL = 'http://localhost:5000/api';

export interface ExamSubject {
  subject: string;
  date: string;
  time: string;
  duration: string;
}

export interface ExamSchedule {
  examName: string;
  examDate: string;
  classname: string; // Class for which this exam schedule is configured
  subjects: ExamSubject[];
  allowStudentDownload: boolean; // Admin can enable/disable student access
}

export interface AdmitCardAccess {
  studentId: string;
  allowed: boolean;
  allowedDate?: string;
}

// Get Exam Schedule from API
export const getExamSchedule = async (classname?: string): Promise<ExamSchedule | null> => {
  try {
    const token = localStorage.getItem('token');
    const url = classname 
      ? `${API_URL}/exams/schedule?classname=${encodeURIComponent(classname)}`
      : `${API_URL}/exams/schedule`;
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch exam schedule');
    }
    
    const data = await response.json();
    return Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
  } catch (error) {
    console.error("Error loading exam schedule:", error);
    return null;
  }
};

// Save Exam Schedule to API
export const saveExamSchedule = async (schedule: ExamSchedule): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/exams/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(schedule)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save exam schedule');
    }
    
    return true;
  } catch (error) {
    console.error("Error saving exam schedule:", error);
    return false;
  }
};

// Get Admit Card Access Status
export const getAdmitCardAccess = async (studentId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/exams/admit-card-access`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return false;
    
    const accessList = await response.json();
    const access = accessList.find((a: AdmitCardAccess) => a.studentId === studentId);
    return access ? access.allowed : false;
  } catch (error) {
    console.error("Error loading admit card access:", error);
    return false;
  }
};

// Set Admit Card Access for Student
export const setAdmitCardAccess = (studentId: string, allowed: boolean): void => {
  try {
    const stored = localStorage.getItem(ADMIT_CARD_ACCESS_KEY);
    const access: AdmitCardAccess[] = stored ? JSON.parse(stored) : [];
    const existingIndex = access.findIndex(a => a.studentId === studentId);
    
    if (existingIndex >= 0) {
      access[existingIndex] = {
        studentId,
        allowed,
        allowedDate: allowed ? new Date().toISOString() : undefined,
      };
    } else {
      access.push({
        studentId,
        allowed,
        allowedDate: allowed ? new Date().toISOString() : undefined,
      });
    }
    
    localStorage.setItem(ADMIT_CARD_ACCESS_KEY, JSON.stringify(access));
  } catch (error) {
    console.error("Error saving admit card access:", error);
  }
};

// Allow All Students
export const allowAllStudents = (studentIds: string[]): void => {
  try {
    const access: AdmitCardAccess[] = studentIds.map(id => ({
      studentId: id,
      allowed: true,
      allowedDate: new Date().toISOString(),
    }));
    localStorage.setItem(ADMIT_CARD_ACCESS_KEY, JSON.stringify(access));
  } catch (error) {
    console.error("Error allowing all students:", error);
  }
};

// Get All Access Status from API
export const getAllAdmitCardAccess = async (): Promise<AdmitCardAccess[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/exams/access`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error loading all admit card access:", error);
    return [];
  }
};














