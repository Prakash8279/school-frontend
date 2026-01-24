import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAllQuizzes, createQuiz, updateQuiz, deleteQuiz, fetchQuizSubmissions, gradeQuiz } from "@/store/slices/assignmentSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, CheckCircle, Clock, HelpCircle, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CLASSES = ["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SUBJECTS = ["Hindi", "English", "Mathematics", "Science", "Social Studies", "Computer", "Drawing", "Physical Education"];

interface Question {
  id: number;
  question: string;
  type: "mcq" | "text";
  options?: string[];
  correct_answer?: string;
  marks: number;
}

export default function QuizManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo: user } = useSelector((state: RootState) => state.auth);
  const { quizzes, quizSubmissions, loading } = useSelector((state: RootState) => state.assignment);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [filterClass, setFilterClass] = useState<string>("");
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    classname: "",
    subject: "",
    start_time: "",
    end_time: "",
    duration_minutes: "30",
    total_marks: "100"
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: 1,
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    correct_answer: "",
    marks: 5
  });

  useEffect(() => {
    const filters: any = {};
    if (user?.role === 'teacher') {
      filters.teacher_id = user._id;
    }
    if (filterClass) {
      filters.classname = filterClass;
    }
    dispatch(fetchAllQuizzes(filters));
  }, [dispatch, user, filterClass]);

  const addQuestion = () => {
    if (!newQuestion.question) {
      toast({ title: "Error", description: "Please enter question text", variant: "destructive" });
      return;
    }
    
    if (newQuestion.type === "mcq" && !newQuestion.correct_answer) {
      toast({ title: "Error", description: "Please select correct answer for MCQ", variant: "destructive" });
      return;
    }

    setQuestions([...questions, { ...newQuestion, id: questions.length + 1 }]);
    setNewQuestion({
      id: questions.length + 2,
      question: "",
      type: "mcq",
      options: ["", "", "", ""],
      correct_answer: "",
      marks: 5
    });
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleCreate = async () => {
    if (!form.title || !form.classname || !form.subject) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    if (questions.length === 0) {
      toast({ title: "Error", description: "Please add at least one question", variant: "destructive" });
      return;
    }

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    await dispatch(createQuiz({
      ...form,
      duration_minutes: parseInt(form.duration_minutes) || 30,
      total_marks: totalMarks,
      questions,
      teacher_id: user?._id,
      teacher_name: user?.name
    }));

    toast({ title: "Success", description: "Quiz created successfully" });
    setIsCreateOpen(false);
    setForm({ title: "", description: "", classname: "", subject: "", start_time: "", end_time: "", duration_minutes: "30", total_marks: "100" });
    setQuestions([]);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      await dispatch(deleteQuiz(id));
      toast({ title: "Deleted", description: "Quiz deleted" });
    }
  };

  const handleViewSubmissions = async (quiz: any) => {
    setSelectedQuiz(quiz);
    await dispatch(fetchQuizSubmissions(quiz._id));
    setIsViewOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quiz Management</h1>
          <p className="text-muted-foreground">Create and manage quizzes for students</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Quiz</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Quiz title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Quiz instructions" />
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                </div>
                <div>
                  <Label>Duration (mins)</Label>
                  <Input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} />
                </div>
              </div>

              {/* Questions Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Questions ({questions.length})</h3>
                
                {/* Added Questions List */}
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-muted rounded mb-2 flex justify-between items-start">
                    <div>
                      <p className="font-medium">Q{idx + 1}: {q.question}</p>
                      <p className="text-sm text-muted-foreground">Type: {q.type.toUpperCase()} | Marks: {q.marks}</p>
                      {q.type === "mcq" && <p className="text-sm text-green-600">Answer: {q.correct_answer}</p>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeQuestion(q.id)}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {/* Add New Question Form */}
                <Card className="mt-4">
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <Label>Question Type</Label>
                      <Select value={newQuestion.type} onValueChange={v => setNewQuestion({...newQuestion, type: v as "mcq" | "text", options: v === "mcq" ? ["", "", "", ""] : undefined, correct_answer: ""})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                          <SelectItem value="text">Text Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Question Text</Label>
                      <Input value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})} placeholder="Enter question" />
                    </div>
                    <div>
                      <Label>Marks</Label>
                      <Input type="number" value={newQuestion.marks} onChange={e => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 0})} />
                    </div>
                    
                    {newQuestion.type === "mcq" && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {newQuestion.options?.map((opt, i) => (
                            <div key={i}>
                              <Label>Option {i + 1}</Label>
                              <Input 
                                value={opt} 
                                onChange={e => {
                                  const newOpts = [...(newQuestion.options || [])];
                                  newOpts[i] = e.target.value;
                                  setNewQuestion({...newQuestion, options: newOpts});
                                }}
                                placeholder={`Option ${i + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <Label>Correct Answer</Label>
                          <Select value={newQuestion.correct_answer} onValueChange={v => setNewQuestion({...newQuestion, correct_answer: v})}>
                            <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                            <SelectContent>
                              {newQuestion.options?.filter(o => o).map((opt, i) => (
                                <SelectItem key={i} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    
                    <Button type="button" onClick={addQuestion} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={questions.length === 0}>
                Create Quiz ({questions.reduce((s, q) => s + q.marks, 0)} marks)
              </Button>
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

      {/* Quizzes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" /> Quizzes ({quizzes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : quizzes.length === 0 ? (
            <p className="text-muted-foreground">No quizzes found. Create one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((q: any) => (
                  <TableRow key={q._id}>
                    <TableCell className="font-medium">{q.title}</TableCell>
                    <TableCell>{q.classname}</TableCell>
                    <TableCell>{q.subject}</TableCell>
                    <TableCell>{q.questions?.length || 0}</TableCell>
                    <TableCell>{q.duration_minutes} mins</TableCell>
                    <TableCell>{q.total_marks}</TableCell>
                    <TableCell>
                      {q.is_active ? (
                        <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>
                      ) : (
                        <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewSubmissions(q)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(q._id)}>
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
            <DialogTitle>Submissions: {selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          {quizSubmissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Auto Marks</TableHead>
                  <TableHead>Manual Marks</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizSubmissions.map((s: any) => (
                  <TableRow key={s._id}>
                    <TableCell>{s.student_name}</TableCell>
                    <TableCell>{s.classname}</TableCell>
                    <TableCell>{s.admission_no}</TableCell>
                    <TableCell>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{s.auto_marks || 0}</TableCell>
                    <TableCell>{s.manual_marks || 0}</TableCell>
                    <TableCell className="font-bold">{s.total_marks || 0}/{selectedQuiz?.total_marks}</TableCell>
                    <TableCell>
                      {s.is_graded ? (
                        <Badge className="bg-green-500">Graded</Badge>
                      ) : (
                        <Badge variant="secondary">Auto-graded</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
