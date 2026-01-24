import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAllAssignments, createAssignment, updateAssignment, deleteAssignment, fetchAssignmentSubmissions, gradeAssignment } from "@/store/slices/assignmentSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CLASSES = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SUBJECTS = ["Hindi", "English", "Mathematics", "Science", "Social Studies", "Computer", "Drawing", "Physical Education"];

export default function AssignmentManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo: user } = useSelector((state: RootState) => state.auth);
  const { assignments, submissions, loading } = useSelector((state: RootState) => state.assignment);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [filterClass, setFilterClass] = useState<string>("");
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    classname: "",
    subject: "",
    due_date: "",
    max_marks: "100"
  });

  const [gradeForm, setGradeForm] = useState({
    marks_obtained: "",
    remarks: ""
  });

  useEffect(() => {
    const filters: any = {};
    if (user?.role === 'teacher') {
      filters.teacher_id = user._id;
    }
    if (filterClass) {
      filters.classname = filterClass;
    }
    dispatch(fetchAllAssignments(filters));
  }, [dispatch, user, filterClass]);

  const handleCreate = async () => {
    if (!form.title || !form.classname || !form.subject) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    await dispatch(createAssignment({
      ...form,
      max_marks: parseFloat(form.max_marks) || 100,
      teacher_id: user?._id,
      teacher_name: user?.name
    }));

    toast({ title: "Success", description: "Assignment created successfully" });
    setIsCreateOpen(false);
    setForm({ title: "", description: "", classname: "", subject: "", due_date: "", max_marks: "100" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      await dispatch(deleteAssignment(id));
      toast({ title: "Deleted", description: "Assignment deleted" });
    }
  };

  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    await dispatch(fetchAssignmentSubmissions(assignment._id));
    setIsViewOpen(true);
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    
    await dispatch(gradeAssignment({
      id: selectedSubmission._id,
      data: {
        marks_obtained: parseFloat(gradeForm.marks_obtained) || 0,
        remarks: gradeForm.remarks,
        graded_by: user?.name
      }
    }));

    toast({ title: "Graded", description: "Assignment graded successfully" });
    setIsGradeOpen(false);
    setGradeForm({ marks_obtained: "", remarks: "" });
    
    // Refresh submissions
    if (selectedAssignment) {
      dispatch(fetchAssignmentSubmissions(selectedAssignment._id));
    }
  };

  const openGradeDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeForm({
      marks_obtained: submission.marks_obtained?.toString() || "",
      remarks: submission.remarks || ""
    });
    setIsGradeOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assignment Management</h1>
          <p className="text-muted-foreground">Create and manage assignments for students</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Assignment description and instructions" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Class *</Label>
                  <Select value={form.classname} onValueChange={v => setForm({...form, classname: v})}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject *</Label>
                  <Select value={form.subject} onValueChange={v => setForm({...form, subject: v})}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                </div>
                <div>
                  <Label>Max Marks</Label>
                  <Input type="number" value={form.max_marks} onChange={e => setForm({...form, max_marks: e.target.value})} />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 items-center">
            <Label>Filter by Class:</Label>
            <Select value={filterClass || "all"} onValueChange={v => setFilterClass(v === "all" ? "" : v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Assignments ({assignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground">No assignments found. Create one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a: any) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.classname}</TableCell>
                    <TableCell>{a.subject}</TableCell>
                    <TableCell>{a.due_date || "-"}</TableCell>
                    <TableCell>{a.max_marks}</TableCell>
                    <TableCell>
                      {a.is_active ? (
                        <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>
                      ) : (
                        <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewSubmissions(a)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(a._id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Submissions Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions: {selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s: any) => (
                  <TableRow key={s._id}>
                    <TableCell>{s.student_name}</TableCell>
                    <TableCell>{s.classname}</TableCell>
                    <TableCell>{s.admission_no}</TableCell>
                    <TableCell>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{s.is_graded ? `${s.marks_obtained}/${selectedAssignment?.max_marks}` : "-"}</TableCell>
                    <TableCell>
                      {s.is_graded ? (
                        <Badge className="bg-green-500">Graded</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openGradeDialog(s)}>
                        {s.is_graded ? "Edit Grade" : "Grade"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student: {selectedSubmission?.student_name}</Label>
            </div>
            <div>
              <Label>Answer/Submission:</Label>
              <p className="p-2 bg-muted rounded text-sm">{selectedSubmission?.submission_text || "No text submission"}</p>
            </div>
            <div>
              <Label>Marks (out of {selectedAssignment?.max_marks})</Label>
              <Input 
                type="number" 
                value={gradeForm.marks_obtained} 
                onChange={e => setGradeForm({...gradeForm, marks_obtained: e.target.value})}
                max={selectedAssignment?.max_marks}
              />
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea 
                value={gradeForm.remarks} 
                onChange={e => setGradeForm({...gradeForm, remarks: e.target.value})}
                placeholder="Feedback for student"
              />
            </div>
            <Button onClick={handleGrade} className="w-full">Save Grade</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
