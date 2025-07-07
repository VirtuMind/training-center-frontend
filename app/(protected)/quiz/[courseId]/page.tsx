"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { quizApi } from "@/lib/api";
import { QuizResponse } from "@/lib/course-types";

export default function Quiz() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number.parseInt(params.courseId as string);

  // State management
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);

  // Fetch quiz data on component mount
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await quizApi.getQuizByCourseId(courseId);

        if (response.success && response.data) {
          setQuizData(response.data);
          setSelectedAnswers(
            new Array(response.data.questions.length).fill(undefined)
          );
        } else {
          setError(response.error?.message || "Failed to load quiz");
        }
      } catch (err) {
        console.error("Failed to fetch quiz data:", err);
        setError(
          "Failed to load quiz. You may not be enrolled in this course or the quiz may not be available."
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchQuizData();
    }
  }, [courseId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < quizData!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz is complete, calculate score and submit
      const score = calculateScore();
      await submitQuizScore(score);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData!.questions.forEach((question, index) => {
      const selectedAnswerId = selectedAnswers[index];
      if (selectedAnswerId !== undefined) {
        const selectedAnswer = question.answers[selectedAnswerId];
        if (selectedAnswer && selectedAnswer.correct) {
          correct++;
        }
      }
    });
    return Math.round((correct / quizData!.questions.length) * 100);
  };

  const submitQuizScore = async (score: number) => {
    try {
      setSubmittingScore(true);
      await quizApi.submitQuizAnswers(courseId, score);
    } catch (err) {
      console.error("Failed to submit quiz score:", err);
      // Don't prevent showing results if submission fails
    } finally {
      setSubmittingScore(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <CardTitle className="text-2xl">Loading Quiz...</CardTitle>
            <CardDescription>
              Please wait while we fetch the quiz questions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !quizData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Quiz Access Restricted</CardTitle>
            <CardDescription>{error || "Quiz not available"}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Please enroll in the course first to take the quiz and track your
              progress.
            </p>
            <Button onClick={() => router.push(`/courses/${courseId}`)}>
              View Course & Enroll
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{score}%</div>
              <p className="text-muted-foreground">
                You got{" "}
                {
                  selectedAnswers.filter((answerIndex, questionIndex) => {
                    if (answerIndex === undefined) return false;
                    const answer =
                      quizData.questions[questionIndex].answers[answerIndex];
                    return answer && answer.correct;
                  }).length
                }{" "}
                out of {quizData.questions.length} questions correct
              </p>
              {submittingScore && (
                <p className="text-sm text-blue-600 mt-2">
                  <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                  Submitting your score...
                </p>
              )}
            </div>

            <div className="space-y-4">
              {quizData.questions.map((question, index) => {
                const selectedAnswerIndex = selectedAnswers[index];
                const selectedAnswer =
                  selectedAnswerIndex !== undefined
                    ? question.answers[selectedAnswerIndex]
                    : null;
                const correctAnswer = question.answers.find(
                  (answer) => answer.correct
                );
                const isCorrect = selectedAnswer && selectedAnswer.correct;

                return (
                  <Card
                    key={question.id}
                    className={
                      isCorrect ? "border-green-200" : "border-red-200"
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <CardTitle className="text-lg">
                          Question {index + 1}
                        </CardTitle>
                      </div>
                      <CardDescription>{question.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Your answer:</span>{" "}
                          {selectedAnswer
                            ? selectedAnswer.answer
                            : "Not answered"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Correct answer:</span>{" "}
                          {correctAnswer ? correctAnswer.answer : "Unknown"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                Retake Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = (currentQuestion / quizData.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quizData.courseTitle}</h1>
          <p className="text-muted-foreground">Course Quiz</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Question {currentQuestion + 1} of {quizData.questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1}</CardTitle>
          <CardDescription>{question.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedAnswers[currentQuestion]?.toString()}
            onValueChange={(value) =>
              handleAnswerSelect(Number.parseInt(value))
            }
          >
            {question.answers.map((answer, index) => (
              <div key={answer.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {answer.answer}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion === quizData.questions.length - 1
                ? "Finish Quiz"
                : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
