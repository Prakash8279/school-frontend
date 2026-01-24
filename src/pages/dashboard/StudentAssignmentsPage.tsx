import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAssignmentsByClass, submitAssignment, fetchQuizzesByClass, fetchQuizForTaking, submitQuiz, clearCurrentQuiz } from "@/store/slices/assignmentSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, HelpCircle, Clock, CheckCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function StudentAssignmentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo: user } = useSelector((state: RootState) => state.auth);
  const { assignments, quizzes, currentQuiz, loading } = useSelector((state: RootState) => state.assignment);

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [quizStarted, setQuizStarted] = useState<Date | null>(null);

  // Get student's class from user data (you may need to fetch this)
  const studentClass = (user as any)?.classname || "1st";

  useEffect(() => {
    if (studentClass) {
      dispatch(fetchAssignmentsByClass(studentClass));
      dispatch(fetchQuizzesByClass(studentClass));
    }
  }, [dispatch, studentClass]);

  const handleOpenAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setSubmissionText("");
    setIsSubmitOpen(true);
  };

  const handleSubmitAssignment = async () => {
    if (!submissionText.trim()) {
      toast({ title: "Error", description: "Please write your answer", variant: "destructive" });
      return;
    }

    await dispatch(submitAssignment({
      assignment_id: selectedAssignment._id,
      student_id: user?._id,
      admission_no: (user as any)?.admission_no,
      student_name: user?.name,
      classname: studentClass,
      submission_text: submissionText
    }));

    toast({ title: "Submitted!", description: "Your assignment has been submitted" });
    setIsSubmitOpen(false);
    setSelectedAssignment(null);
    setSubmissionText("");
  };

  const handleStartQuiz = async (quiz: any) => {
    await dispatch(fetchQuizForTaking(quiz._id));
    setQuizAnswers({});
    setQuizStarted(new Date());
    setIsQuizOpen(true);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    const answersArray = Object.entries(quizAnswers).map(([qId, answer]) => ({
      question_id: parseInt(qId),
      answer
    }));

    await dispatch(submitQuiz({
      quiz_id: currentQuiz._id,
      student_id: user?._id,
      admission_no: (user as any)?.admission_no,
      student_name: user?.name,
      classname: studentClass,
      answers: answersArray,
      started_at: quizStarted?.toISOString()
    }));

    toast({ title: "Quiz Submitted!", description: "Your quiz has been submitted successfully" });
    setIsQuizOpen(false);
    dispatch(clearCurrentQuiz());
    setQuizAnswers({});
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Assignments & Quizzes</h1>
        <p className="text-muted-foreground">View and submit your assignments and quizzes</p>
      </div>

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Assignments ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Quizzes ({quizzes.length})
          </TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4 mt-4">
          {loading ? (
            <p>Loading...</p>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No assignments available for your class.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((a: any) => (
                <Card key={a._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{a.title}</CardTitle>
                      {a.due_date && (
                        isOverdue(a.due_date) ? (
                          <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>
                        ) : (
                          <Badge><Clock className="w-3 h-3 mr-1" /> Due: {a.due_date}</Badge>
                        )
                      )}
                    </div>
                    <CardDescription>{a.subject} | {a.teacher_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{a.description || "No description"}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Max Marks: {a.max_marks}</span>
                      <Button size="sm" onClick={() => handleOpenAssignment(a)}>
                        <Send className="w-4 h-4 mr-2" /> Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4 mt-4">
          {loading ? (
            <p>Loading...</p>
          ) : quizzes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No quizzes available for your class.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((q: any) => (
                <Card key={q._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{q.title}</CardTitle>
                      <Badge><Clock className="w-3 h-3 mr-1" /> {q.duration_minutes} mins</Badge>
                    </div>
                    <CardDescription>{q.subject} | {q.teacher_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{q.description || "No description"}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Marks: {q.total_marks}</span>
                      <Button size="sm" onClick={() => handleStartQuiz(q)}>
                        <HelpCircle className="w-4 h-4 mr-2" /> Start Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assignment Submit Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <p className="text-sm"><strong>Subject:</strong> {selectedAssignment?.subject}</p>
              <p className="text-sm"><strong>Teacher:</strong> {selectedAssignment?.teacher_name}</p>
              <p className="text-sm"><strong>Due Date:</strong> {selectedAssignment?.due_date || "No deadline"}</p>
              <p className="text-sm"><strong>Max Marks:</strong> {selectedAssignment?.max_marks}</p>
            </div>
            {selectedAssignment?.description && (
              <div>
                <Label>Instructions:</Label>
                <p className="text-sm p-2 bg-muted rounded">{selectedAssignment.description}</p>
              </div>
            )}
            <div>
              <Label>Your Answer *</Label>
              <Textarea 
                value={submissionText}
                onChange={e => setSubmissionText(e.target.value)}
                placeholder="Write your answer here..."
                className="min-h-[200px]"
              />
            </div>
            <Button onClick={handleSubmitAssignment} className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" /> Submit Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={isQuizOpen} onOpenChange={(open) => {
        if (!open && confirm("Are you sure you want to exit? Your progress will be lost.")) {
          setIsQuizOpen(false);
          dispatch(clearCurrentQuiz());
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentQuiz?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {currentQuiz?.subject} | Duration: {currentQuiz?.duration_minutes} mins | Total: {currentQuiz?.total_marks} marks
            </p>
          </DialogHeader>
          
          {currentQuiz?.questions && (
            <div className="space-y-6">
              {currentQuiz.questions.map((q: any, idx: number) => (
                <Card key={q.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between">
                      <span>Q{idx + 1}. {q.question}</span>
                      <Badge variant="outline">{q.marks} marks</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {q.type === "mcq" ? (
                      <RadioGroup 
                        value={quizAnswers[q.id] || ""} 
                        onValueChange={v => handleAnswerChange(q.id, v)}
                      >
                        {q.options?.map((opt: string, i: number) => (
                          <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt} id={`q${q.id}-opt${i}`} />
                            <Label htmlFor={`q${q.id}-opt${i}`}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Textarea 
                        value={quizAnswers[q.id] || ""}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[100px]"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Answered: {Object.keys(quizAnswers).length} / {currentQuiz.questions.length}
                </p>
                <Button onClick={handleSubmitQuiz} size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" /> Submit Quiz
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
