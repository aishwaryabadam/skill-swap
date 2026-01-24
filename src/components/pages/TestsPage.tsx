import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit, CheckCircle, Clock, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { UserProfiles, Sessions } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Test {
  _id: string;
  testTitle?: string;
  sessionId?: string;
  tutorId?: string;
  questions?: string;
  learnerSubmissions?: string;
  score?: number;
  submissionDate?: Date | string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

interface LearnerSubmission {
  answers: number[];
  submittedAt: Date | string;
}

interface TestSubmissionMode {
  testId: string;
  questions: Question[];
  answers: number[];
}

interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: number[];
  submittedAt: Date | string;
}

export default function TestsPage() {
  const { member } = useMember();
  const [tests, setTests] = useState<Test[]>([]);
  const [sessions, setSessions] = useState<Sessions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [tutorProfiles, setTutorProfiles] = useState<Record<string, UserProfiles>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [formData, setFormData] = useState({
    testTitle: '',
    sessionId: ''
  });
  const [submissionMode, setSubmissionMode] = useState<TestSubmissionMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    loadTests();
  }, [member]);

  const loadTests = async () => {
    if (!member?._id) return;

    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<Test>('tests', {}, { limit: 1000 });
      const sessionsResult = await BaseCrudService.getAll<Sessions>('sessions', {}, { limit: 1000 });

      // Filter tests where user is tutor or learner
      const userTests = result.items.filter(test => 
        test.tutorId === member._id || test.learnerSubmissions
      );

      setTests(userTests);
      setSessions(sessionsResult.items.filter(s => s.hostId === member._id || s.participantId === member._id));

      // Load tutor profiles
      const profiles: Record<string, UserProfiles> = {};
      for (const test of userTests) {
        if (test.tutorId && !profiles[test.tutorId]) {
          try {
            const profile = await BaseCrudService.getById<UserProfiles>('userprofiles', test.tutorId);
            profiles[test.tutorId] = profile;
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        }
      }
      setTutorProfiles(profiles);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (test?: Test) => {
    if (test) {
      setIsEditMode(true);
      setSelectedTest(test);
      setFormData({
        testTitle: test.testTitle || '',
        sessionId: test.sessionId || ''
      });
      try {
        setQuestions(JSON.parse(test.questions || '[]'));
      } catch {
        setQuestions([{ id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      }
    } else {
      setIsEditMode(false);
      setSelectedTest(null);
      setFormData({
        testTitle: '',
        sessionId: ''
      });
      setQuestions([{ id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    }
    setIsDialogOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const handleSaveTest = async () => {
    if (!member?._id || !formData.testTitle || !formData.sessionId || questions.length === 0) {
      alert('Please fill in all required fields and add at least one question');
      return;
    }

    // Validate questions
    const allValid = questions.every(q => q.question && q.options.every(opt => opt));
    if (!allValid) {
      alert('Please fill in all questions and options');
      return;
    }

    try {
      setIsSaving(true);

      if (isEditMode && selectedTest) {
        await BaseCrudService.update<Test>('tests', {
          _id: selectedTest._id,
          testTitle: formData.testTitle,
          sessionId: formData.sessionId,
          questions: JSON.stringify(questions)
        });
      } else {
        await BaseCrudService.create('tests', {
          _id: crypto.randomUUID(),
          testTitle: formData.testTitle,
          sessionId: formData.sessionId,
          tutorId: member._id,
          questions: JSON.stringify(questions),
          learnerSubmissions: '',
          score: 0
        });
      }

      await loadTests();
      setIsDialogOpen(false);
      alert(isEditMode ? 'Test updated successfully!' : 'Test created successfully!');
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Failed to save test. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await BaseCrudService.delete('tests', testId);
      await loadTests();
      alert('Test deleted successfully!');
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test. Please try again.');
    }
  };

  const handleStartTest = (test: Test) => {
    try {
      const parsedQuestions = JSON.parse(test.questions || '[]');
      setSubmissionMode({
        testId: test._id,
        questions: parsedQuestions,
        answers: new Array(parsedQuestions.length).fill(-1)
      });
    } catch (error) {
      console.error('Error parsing test:', error);
      alert('Failed to load test. Please try again.');
    }
  };

  const handleSubmitTest = async () => {
    if (!submissionMode || !member?._id) return;

    try {
      setIsSubmitting(true);
      
      // Calculate score
      let correctCount = 0;
      submissionMode.questions.forEach((q, idx) => {
        if (submissionMode.answers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });
      const score = Math.round((correctCount / submissionMode.questions.length) * 100);

      // Find the test to get tutor ID
      const test = tests.find(t => t._id === submissionMode.testId);
      if (!test) return;

      // Update test with submission
      await BaseCrudService.update<Test>('tests', {
        _id: submissionMode.testId,
        learnerSubmissions: JSON.stringify({
          learnerId: member._id,
          answers: submissionMode.answers,
          submittedAt: new Date()
        }),
        score: score,
        submissionDate: new Date()
      });

      // Show result
      setTestResult({
        testId: submissionMode.testId,
        score: score,
        totalQuestions: submissionMode.questions.length,
        correctAnswers: correctCount,
        answers: submissionMode.answers,
        submittedAt: new Date()
      });

      await loadTests();
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  // If showing test result
  if (testResult) {
    const test = tests.find(t => t._id === testResult.testId);
    const tutor = test?.tutorId ? tutorProfiles[test.tutorId] : null;
    const resultQuestions = testResult.answers.map((answer, idx) => {
      const question = testResult.answers.length > 0 ? JSON.parse(test?.questions || '[]')[idx] : null;
      return {
        question,
        userAnswer: answer,
        isCorrect: answer === question?.correctAnswer
      };
    });

    return (
      <div className="min-h-screen bg-background">
        <Header />

        {/* Result Header */}
        <section className="w-full bg-gradient-to-r from-primary to-primary/90 py-12">
          <div className="max-w-[100rem] mx-auto px-8 md:px-16">
            <h1 className="font-heading text-4xl md:text-5xl uppercase text-primary-foreground">
              Test Results
            </h1>
          </div>
        </section>

        {/* Result Content */}
        <section className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-secondary p-12 rounded-2xl border-2 border-primary/20 mb-12"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-6">
                <div className="text-center">
                  <p className="font-heading text-5xl text-primary font-bold">{testResult.score}%</p>
                  <p className="font-paragraph text-sm text-secondary-foreground mt-2">Your Score</p>
                </div>
              </div>
              <h2 className="font-heading text-3xl uppercase text-foreground mb-4">
                {test?.testTitle}
              </h2>
              {tutor && (
                <p className="font-paragraph text-lg text-secondary-foreground">
                  Created by <strong>{tutor.fullName}</strong>
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-background p-6 rounded-lg border-2 border-neutralborder text-center">
                <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">Total Questions</p>
                <p className="font-heading text-4xl text-primary">{testResult.totalQuestions}</p>
              </div>
              <div className="bg-background p-6 rounded-lg border-2 border-primary/30 text-center">
                <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">Correct Answers</p>
                <p className="font-heading text-4xl text-primary">{testResult.correctAnswers}</p>
              </div>
              <div className="bg-background p-6 rounded-lg border-2 border-destructive/30 text-center">
                <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">Incorrect Answers</p>
                <p className="font-heading text-4xl text-destructive">{testResult.totalQuestions - testResult.correctAnswers}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setTestResult(null);
                  setSubmissionMode(null);
                }}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-paragraph"
              >
                Back to Tests
              </Button>
            </div>
          </motion.div>

          {/* Detailed Results */}
          <div>
            <h3 className="font-heading text-2xl uppercase text-foreground mb-6">Detailed Results</h3>
            <div className="space-y-4">
              {resultQuestions.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`p-6 rounded-lg border-2 ${
                    result.isCorrect 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'bg-destructive/5 border-destructive/30'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      result.isCorrect 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-destructive text-destructiveforeground'
                    }`}>
                      {result.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-heading text-lg uppercase text-foreground mb-2">
                        Question {idx + 1}
                      </h4>
                      <p className="font-paragraph text-base text-secondary-foreground mb-4">
                        {result.question?.question}
                      </p>
                      <div className="space-y-2">
                        {result.question?.options.map((option, optIdx) => {
                          const isUserAnswer = result.userAnswer === optIdx;
                          const isCorrectAnswer = result.question?.correctAnswer === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded border-2 ${
                                isCorrectAnswer
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : isUserAnswer
                                  ? 'bg-destructive/10 border-destructive text-destructive'
                                  : 'bg-background border-neutralborder text-secondary-foreground'
                              }`}
                            >
                              <p className="font-paragraph text-sm">
                                <strong>{String.fromCharCode(65 + optIdx)}:</strong> {option}
                                {isCorrectAnswer && ' ✓ (Correct)'}
                                {isUserAnswer && !isCorrectAnswer && ' ✗ (Your answer)'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // If in submission mode, show test submission interface
  if (submissionMode) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        {/* Test Header */}
        <section className="w-full bg-primary py-8">
          <div className="max-w-[100rem] mx-auto px-8 md:px-16">
            <h1 className="font-heading text-3xl md:text-4xl uppercase text-primary-foreground">
              Take Test
            </h1>
          </div>
        </section>

        {/* Test Content */}
        <section className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-12">
          <div className="space-y-8">
            {submissionMode.questions.map((q, qIndex) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: qIndex * 0.1 }}
                className="bg-secondary p-8 rounded-sm border-2 border-neutralborder"
              >
                <h3 className="font-heading text-lg uppercase text-foreground mb-6">
                  Question {qIndex + 1}: {q.question}
                </h3>
                <div className="space-y-3">
                  {q.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center gap-3 p-4 bg-background rounded-sm cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary">
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={submissionMode.answers[qIndex] === optIndex}
                        onChange={() => {
                          const newAnswers = [...submissionMode.answers];
                          newAnswers[qIndex] = optIndex;
                          setSubmissionMode({ ...submissionMode, answers: newAnswers });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-paragraph text-base text-secondary-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Submit Button */}
            <div className="flex gap-4 pt-8">
              <Button
                onClick={() => setSubmissionMode(null)}
                variant="outline"
                className="flex-1 border-2 border-foreground text-foreground hover:bg-secondary h-12 font-paragraph"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting || submissionMode.answers.includes(-1)}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-paragraph"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </Button>
            </div>

            {submissionMode.answers.includes(-1) && (
              <Alert className="border-2 border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive font-paragraph">
                  Please answer all questions before submitting.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  const createdTests = tests.filter(t => t.tutorId === member?._id);
  const submittedTests = tests.filter(t => t.tutorId !== member?._id && t.learnerSubmissions);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-primary py-16">
        <div className="max-w-[100rem] mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-heading text-4xl md:text-5xl uppercase text-primary-foreground mb-4">
                Session Tests
              </h1>
              <p className="font-paragraph text-lg text-primary-foreground">
                Create and manage MCQ tests for your sessions
              </p>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-background text-foreground hover:bg-secondary h-12 px-8 font-paragraph"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Test
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-secondary p-12 rounded-sm"
          >
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
            <h2 className="font-heading text-3xl uppercase text-foreground mb-4">
              No Tests Yet
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground mb-8">
              Create a test to evaluate learners after your sessions.
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-paragraph"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Test
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Created Tests */}
            {createdTests.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <Clock className="w-8 h-8 text-primary" />
                  <h2 className="font-heading text-3xl uppercase text-foreground">
                    Tests You Created
                  </h2>
                  <span className="ml-auto bg-primary text-primary-foreground px-4 py-2 rounded-full font-heading text-sm">
                    {createdTests.length}
                  </span>
                </div>
                <div className="grid gap-6">
                  {createdTests.map((test, index) => (
                    <motion.div
                      key={test._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-secondary p-8 rounded-sm border-2 border-neutralborder"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-heading text-2xl uppercase text-foreground mb-2">
                            {test.testTitle}
                          </h3>
                          <p className="font-paragraph text-sm text-secondary-foreground">
                            {test._createdDate ? format(new Date(test._createdDate), 'MMM dd, yyyy') : 'Recently'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOpenDialog(test)}
                            variant="outline"
                            className="border-2 border-foreground text-foreground hover:bg-secondary h-10 px-4 font-paragraph"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteTest(test._id)}
                            variant="outline"
                            className="border-2 border-destructive text-destructive hover:bg-destructive/10 h-10 px-4 font-paragraph"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-sm">
                        <p className="font-paragraph text-sm text-secondary-foreground">
                          <strong>Questions:</strong> {questions.length}
                        </p>
                        <p className="font-paragraph text-sm text-secondary-foreground mt-2">
                          <strong>Session:</strong> {test.sessionId}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Tests */}
            {submittedTests.length > 0 && (
              <div className="pt-8 border-t-2 border-neutralborder">
                <div className="flex items-center gap-3 mb-8">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <h2 className="font-heading text-3xl uppercase text-foreground">
                    Tests Available to Take
                  </h2>
                  <span className="ml-auto bg-primary text-primary-foreground px-4 py-2 rounded-full font-heading text-sm">
                    {submittedTests.length}
                  </span>
                </div>
                <div className="grid gap-6">
                  {submittedTests.map((test, index) => {
                    const tutor = tutorProfiles[test.tutorId || ''];
                    const isAlreadySubmitted = test.learnerSubmissions && test.learnerSubmissions.length > 0;
                    return (
                      <motion.div
                        key={test._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-secondary p-8 rounded-sm border-2 border-neutralborder"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {tutor?.profilePicture && (
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10">
                                <Image
                                  src={tutor.profilePicture}
                                  alt={tutor.fullName || 'Tutor'}
                                  className="w-full h-full object-cover"
                                  width={64}
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="font-heading text-xl uppercase text-foreground mb-2">
                                {test.testTitle}
                              </h3>
                              <p className="font-paragraph text-sm text-secondary-foreground">
                                By {tutor?.fullName || 'Unknown Tutor'}
                              </p>
                            </div>\
                          </div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-sm mb-4">
                          {isAlreadySubmitted ? (
                            <>
                              <p className="font-paragraph text-sm text-secondary-foreground">
                                <strong>Your Score:</strong> {test.score || 0}%
                              </p>
                              <p className="font-paragraph text-sm text-secondary-foreground mt-2">
                                <strong>Submitted:</strong> {test.submissionDate ? format(new Date(test.submissionDate), 'MMM dd, yyyy HH:mm') : 'Not submitted'}
                              </p>
                            </>
                          ) : (
                            <p className="font-paragraph text-sm text-secondary-foreground">
                              <strong>Status:</strong> Not yet submitted
                            </p>
                          )}
                        </div>
                        {!isAlreadySubmitted && (
                          <Button
                            onClick={() => handleStartTest(test)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-paragraph"
                          >
                            Take Test
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Test Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl uppercase">
              {isEditMode ? 'Edit Test' : 'Create New Test'}
            </DialogTitle>
            <DialogDescription className="font-paragraph text-base">
              {isEditMode ? 'Update your test details' : 'Create a new MCQ test for your session'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Test Title */}
            <div>
              <Label htmlFor="testTitle" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Test Title
              </Label>
              <Input
                id="testTitle"
                value={formData.testTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, testTitle: e.target.value }))}
                placeholder="e.g., Python Basics Quiz"
                className="font-paragraph h-11"
              />
            </div>

            {/* Session Selection */}
            <div>
              <Label htmlFor="sessionId" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Select Session
              </Label>
              <select
                id="sessionId"
                value={formData.sessionId}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionId: e.target.value }))}
                className="w-full font-paragraph h-11 px-3 border border-neutralborder rounded-sm"
              >
                <option value="">Choose a session...</option>
                {sessions.map(session => (
                  <option key={session._id} value={session._id}>
                    Session - {session._createdDate ? format(new Date(session._createdDate), 'MMM dd, yyyy') : 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="font-heading text-sm uppercase text-foreground">
                  Questions
                </Label>
                <Button
                  onClick={handleAddQuestion}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary/10 h-9 px-4 font-paragraph text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="bg-primary/5 p-6 rounded-sm border-2 border-primary/20">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-heading text-sm uppercase text-foreground">
                        Question {qIndex + 1}
                      </h4>
                      {questions.length > 1 && (
                        <Button
                          onClick={() => handleRemoveQuestion(q.id)}
                          variant="outline"
                          className="border-2 border-destructive text-destructive hover:bg-destructive/10 h-8 px-3 font-paragraph text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <Label className="font-paragraph text-xs uppercase text-secondary-foreground mb-2 block">
                        Question Text
                      </Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                        placeholder="Enter your question..."
                        className="font-paragraph min-h-16"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-4">
                      <Label className="font-paragraph text-xs uppercase text-secondary-foreground">
                        Options
                      </Label>
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === optIndex}
                            onChange={() => handleQuestionChange(q.id, 'correctAnswer', optIndex)}
                            className="w-4 h-4"
                          />
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 font-paragraph h-10"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-2 border-foreground text-foreground hover:bg-secondary h-11 font-paragraph"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTest}
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-paragraph"
              >
                {isSaving ? 'Saving...' : isEditMode ? 'Update Test' : 'Create Test'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
