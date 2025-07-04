"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Lock } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

const quizData = {
  title: "React Fundamentals Quiz",
  description: "Test your knowledge of React basics",
  timeLimit: 30, // minutes
  questions: [
    {
      id: 1,
      question: "What is JSX in React?",
      options: [
        "A JavaScript library",
        "A syntax extension for JavaScript",
        "A CSS framework",
        "A database query language",
      ],
      correctAnswer: 1,
      explanation:
        "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.",
    },
    {
      id: 2,
      question: "Which hook is used to manage state in functional components?",
      options: ["useEffect", "useContext", "useState", "useReducer"],
      correctAnswer: 2,
      explanation: "useState is the primary hook for managing state in functional React components.",
    },
    {
      id: 3,
      question: "What is the purpose of the useEffect hook?",
      options: ["To manage component state", "To handle side effects", "To create context", "To optimize performance"],
      correctAnswer: 1,
      explanation: "useEffect is used to handle side effects like API calls, subscriptions, and DOM manipulation.",
    },
    {
      id: 4,
      question: "How do you pass data from parent to child component?",
      options: ["Through state", "Through props", "Through context", "Through refs"],
      correctAnswer: 1,
      explanation: "Props are the primary way to pass data from parent components to child components in React.",
    },
    {
      id: 5,
      question: "What is the virtual DOM?",
      options: ["A real DOM element", "A JavaScript representation of the DOM", "A CSS framework", "A database"],
      correctAnswer: 1,
      explanation:
        "The virtual DOM is a JavaScript representation of the actual DOM that React uses for efficient updates.",
    },
  ],
}

// Mock enrollment check - in real app, this would come from your backend
const mockEnrolledCourses = [1, 3, 4] // Course IDs user is enrolled in

export default function Quiz() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.courseId as string)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  // const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit * 60) // in seconds

  useEffect(() => {
    // Check if user is enrolled in the course
    setIsEnrolled(mockEnrolledCourses.includes(courseId))
  }, [courseId])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quizData.questions.length) * 100)
  }

  // const formatTime = (seconds: number) => {
  //   const mins = Math.floor(seconds / 60)
  //   const secs = seconds % 60
  //   return `${mins}:${secs.toString().padStart(2, "0")}`
  // }

  // If user is not enrolled, show access denied
  if (!isEnrolled) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Quiz Access Restricted</CardTitle>
            <CardDescription>You must be enrolled in this course to access the quiz</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Please enroll in the course first to take the quiz and track your progress.
            </p>
            <Button onClick={() => router.push(`/courses/${courseId}`)}>View Course & Enroll</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
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
                {selectedAnswers.filter((answer, index) => answer === quizData.questions[index].correctAnswer).length}{" "}
                out of {quizData.questions.length} questions correct
              </p>
            </div>

            <div className="space-y-4">
              {quizData.questions.map((question, index) => {
                const isCorrect = selectedAnswers[index] === question.correctAnswer
                return (
                  <Card key={question.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      </div>
                      <CardDescription>{question.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Your answer:</span>{" "}
                          {question.options[selectedAnswers[index]] || "Not answered"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Correct answer:</span>{" "}
                          {question.options[question.correctAnswer]}
                        </p>
                        <p className="text-sm text-muted-foreground">{question.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>Retake Quiz</Button>
              <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = quizData.questions[currentQuestion]
  const progress = (currentQuestion / quizData.questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quizData.title}</h1>
          <p className="text-muted-foreground">{quizData.description}</p>
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
            onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={selectedAnswers[currentQuestion] === undefined}>
              {currentQuestion === quizData.questions.length - 1 ? "Finish Quiz" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
