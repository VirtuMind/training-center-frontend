"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save, Upload, Plus, Trash2, ImageIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { courseApi } from "@/lib/api"

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "document"
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export default function EditCourse() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState({
    title: "React Development Fundamentals",
    description:
      "Master the fundamentals of React development including components, state management, and modern React patterns.",
    category: "web-development",
    duration: "8 weeks",
    level: "beginner",
    coverImage: "",
  })
  const [modules, setModules] = useState<Module[]>([
    {
      id: "1",
      title: "Introduction to React",
      lessons: [
        { id: "1", title: "What is React?", duration: "15 min", type: "video" },
        { id: "2", title: "Setting up Development Environment", duration: "20 min", type: "video" },
      ],
    },
  ])
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: "1",
      question: "What is JSX in React?",
      options: [
        "A JavaScript library",
        "A syntax extension for JavaScript",
        "A CSS framework",
        "A database query language",
      ],
      correctAnswer: 1,
    },
  ])
  const [currentModule, setCurrentModule] = useState<Module>({
    id: "",
    title: "",
    lessons: [],
  })
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  })

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      const response = await courseApi.getCourseById(courseId)
      if (response.success && response.data) {
        // In a real app, you'd populate the form with the actual course data
        console.log("Loaded course data:", response.data)
      }
    } catch (error) {
      console.error("Failed to load course data:", error)
    }
  }

  const updateCourse = async () => {
    setLoading(true)
    try {
      const courseData = {
        ...course,
        modules,
        quizQuestions,
      }

      const response = await courseApi.updateCourse(courseId, courseData)

      if (response.success) {
        alert("Course updated successfully!")
        router.push("/trainer")
      } else {
        throw new Error(response.error || "Course update failed")
      }
    } catch (error) {
      console.error("Course update failed:", error)
      alert("Course update failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const addModule = () => {
    if (currentModule.title) {
      const moduleWithId = {
        ...currentModule,
        id: Date.now().toString(),
      }
      setModules([...modules, moduleWithId])
      setCurrentModule({ id: "", title: "", lessons: [] })
    }
  }

  const removeModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId))
  }

  const addQuizQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every((opt) => opt.trim())) {
      const questionWithId = {
        ...currentQuestion,
        id: Date.now().toString(),
      }
      setQuizQuestions([...quizQuestions, questionWithId])
      setCurrentQuestion({
        id: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      })
    }
  }

  const removeQuizQuestion = (questionId: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== questionId))
  }

  const updateQuestionOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion({ ...currentQuestion, options: newOptions })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">Update your course content and settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Update the basic details of your course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={course.category} onValueChange={(value) => setCourse({ ...course, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={course.level} onValueChange={(value) => setCourse({ ...course, level: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={course.duration}
                onChange={(e) => setCourse({ ...course, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Course Cover Image</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Update course cover image</p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Choose New Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Section */}
      <Card>
        <CardHeader>
          <CardTitle>Course Modules</CardTitle>
          <CardDescription>Manage your course curriculum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module, index) => (
            <Card key={module.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Module {index + 1}: {module.title}
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => removeModule(module.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{module.lessons.length} lessons</p>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Add New Module</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Module title"
                value={currentModule.title}
                onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
              />
              <Button onClick={addModule} disabled={!currentModule.title}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Quiz Section */}
      <Card>
        <CardHeader>
          <CardTitle>Course Quiz</CardTitle>
          <CardDescription>Manage quiz questions for your course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizQuestions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Question {index + 1}</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => removeQuizQuestion(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2">{question.question}</p>
                <div className="grid gap-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded border text-sm ${
                        optIndex === question.correctAnswer ? "bg-green-50 border-green-200" : "bg-gray-50"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Add Quiz Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  placeholder="Enter your question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Answer Options</Label>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => updateQuestionOption(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <RadioGroup
                  value={currentQuestion.correctAnswer.toString()}
                  onValueChange={(value) =>
                    setCurrentQuestion({ ...currentQuestion, correctAnswer: Number.parseInt(value) })
                  }
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`correct-${index}`} />
                      <Label htmlFor={`correct-${index}`} className="text-sm">
                        {String.fromCharCode(65 + index)}. {option || `Option ${String.fromCharCode(65 + index)}`}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={addQuizQuestion}
                disabled={!currentQuestion.question || !currentQuestion.options.every((opt) => opt.trim())}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={updateCourse} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Updating..." : "Update Course"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
