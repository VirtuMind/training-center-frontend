"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Trash2,
  Upload,
  Save,
  Play,
  Video,
  ImageIcon,
  X,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { courseApi, uploadApi } from "@/lib/api";

const trainerCourses = [
  {
    id: 1,
    title: "React Development Fundamentals",
    category: "Web Development",
    students: 45,
    avgProgress: 68,
    avgRating: 4.8,
    lastUpdated: "2024-01-10",
  },
  {
    id: 2,
    title: "Advanced JavaScript Concepts",
    category: "Web Development",
    students: 32,
    avgProgress: 45,
    avgRating: 4.9,
    lastUpdated: "2024-01-08",
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    category: "Web Development",
    students: 28,
    avgProgress: 72,
    avgRating: 4.7,
    lastUpdated: "2024-01-05",
  },
];

const studentProgress = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    course: "React Development Fundamentals",
    progress: 85,
    quizAverage: 92,
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@example.com",
    course: "React Development Fundamentals",
    progress: 45,
    quizAverage: 78,
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    email: "mike@example.com",
    course: "Advanced JavaScript Concepts",
    progress: 92,
    quizAverage: 95,
  },
];

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "document";
  content?: string;
  videoUrl?: string;
  documentUrl?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function TrainerDashboard() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("courses");
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    level: "",
    coverImage: "",
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module>({
    id: "",
    title: "",
    lessons: [],
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>(
    {}
  );
  const totalStudents = trainerCourses.reduce(
    (sum, course) => sum + course.students,
    0
  );
  const avgRating =
    trainerCourses.reduce((sum, course) => sum + course.avgRating, 0) /
    trainerCourses.length;
  // Filter students based on selected course - Fixed filtering logic
  const filteredStudents =
    selectedCourse === "all"
      ? studentProgress
      : studentProgress.filter((student) => student.course === selectedCourse);

  const addModule = () => {
    if (currentModule.title) {
      const moduleWithId = {
        ...currentModule,
        id: Date.now().toString(),
      };
      setModules([...modules, moduleWithId]);
      setCurrentModule({ id: "", title: "", lessons: [] });
    }
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: "",
      duration: "",
      type: "video",
    };
    setCurrentModule({
      ...currentModule,
      lessons: [...currentModule.lessons, newLesson],
    });
  };

  const updateLesson = (
    lessonId: string,
    field: keyof Lesson,
    value: string
  ) => {
    setCurrentModule({
      ...currentModule,
      lessons: currentModule.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
      ),
    });
  };

  const removeLesson = (lessonId: string) => {
    setCurrentModule({
      ...currentModule,
      lessons: currentModule.lessons.filter((lesson) => lesson.id !== lessonId),
    });
  };

  const addQuizQuestion = () => {
    if (
      currentQuestion.question &&
      currentQuestion.options.every((opt) => opt.trim())
    ) {
      const questionWithId = {
        ...currentQuestion,
        id: Date.now().toString(),
      };
      setQuizQuestions([...quizQuestions, questionWithId]);
      setCurrentQuestion({
        id: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      });
    }
  };

  const removeQuizQuestion = (questionId: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== questionId));
  };

  const updateQuestionOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleFileUpload = async (
    file: File,
    type: "image" | "video" | "document",
    key: string
  ) => {
    try {
      // Store the file immediately for UI feedback
      setUploadedFiles((prev) => ({ ...prev, [key]: file }));

      const response = await uploadApi.uploadFile(file, type);
      if (response.success && response.data) {
        return response.data.url;
      }
      throw new Error(response.error || "Upload failed");
    } catch (error) {
      console.error("File upload failed:", error);
      // Return mock URL for demo
      return `/mock-uploads/${file.name}`;
    }
  };

  const removeUploadedFile = (key: string) => {
    const newFiles = { ...uploadedFiles };
    delete newFiles[key];
    setUploadedFiles(newFiles);
  };

  const createCourse = async () => {
    setLoading(true);
    try {
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        level: newCourse.level,
        duration: newCourse.duration,
        coverImage: newCourse.coverImage,
        modules,
        quizQuestions,
        instructor: "Current Trainer", // Would come from auth context
        students: 0,
        rating: 0,
      };

      const response = await courseApi.createCourse(courseData);

      if (response.success) {
        alert("Course created successfully!");
        setNewCourse({
          title: "",
          description: "",
          category: "",
          duration: "",
          level: "",
          coverImage: "",
        });
        setModules([]);
        setQuizQuestions([]);
        setUploadedFiles({});
        setActiveTab("courses");
      } else {
        throw new Error(response.error || "Course creation failed");
      }
    } catch (error) {
      console.error("Course creation failed:", error);
      alert("Course creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewCourse = () => {
    setActiveTab("create");
  };

  const handleViewCourse = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const handleEditCourse = (courseId: number) => {
    router.push(`/trainer/edit/${courseId}`);
  };

  const playVideo = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your courses and track student progress
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Student Progress</TabsTrigger>
          <TabsTrigger value="create">Create Course</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <Button onClick={handleNewCourse}>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>

          <div className="grid gap-4">
            {trainerCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </div>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {/* <div>
                      <p className="text-sm font-medium mb-1">Students</p>
                      <p className="text-2xl font-bold">{course.students}</p>
                    </div> */}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCourse(course.id)}
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCourse(course.id)}
                        className="text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 border-yellow-300"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Student Progress</h2>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {trainerCourses.map((course) => (
                  <SelectItem key={course.id} value={course.title}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>{student.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Course: {student.course}</span>
                      <span>{student.progress}% Complete</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Quiz Average</p>
                      <p className="text-lg font-bold">
                        {student.quizAverage}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No students found for the selected course.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
              <CardDescription>
                Build a comprehensive training course with modules, lessons, and
                quizzes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Course Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter course title"
                      value={newCourse.title}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newCourse.category}
                      onValueChange={(value) =>
                        setNewCourse({ ...newCourse, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-development">
                          Web Development
                        </SelectItem>
                        <SelectItem value="data-science">
                          Data Science
                        </SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="cloud-computing">
                          Cloud Computing
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select
                      value={newCourse.level}
                      onValueChange={(value) =>
                        setNewCourse({ ...newCourse, level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 8 weeks"
                      value={newCourse.duration}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, duration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter course description"
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                {/* Course Cover Image */}
                <div className="space-y-2">
                  <Label htmlFor="cover-image">Course Cover Image</Label>
                  {uploadedFiles["cover-image"] ? (
                    <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">
                              {uploadedFiles["cover-image"].name}
                            </p>
                            <p className="text-sm text-green-800">
                              {(
                                uploadedFiles["cover-image"].size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeUploadedFile("cover-image")}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 p-6 text-center rounded-lg">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a cover image for your course
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              handleFileUpload(file, "image", "cover-image");
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Modules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course Curriculum</h3>

                {/* Existing Modules */}
                {modules.map((module, index) => (
                  <Card key={module.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Module {index + 1}: {module.title}
                      </CardTitle>
                      <CardDescription>
                        {module.lessons.length} lessons
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-muted rounded"
                          >
                            <div className="flex items-center gap-3">
                              <Video className="h-4 w-4 text-blue-600" />
                              <div>
                                <span className="text-sm font-medium">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  Video • {lesson.duration}
                                </p>
                              </div>
                            </div>
                            {lesson.videoUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playVideo(lesson.videoUrl!)}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Current Module Builder */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Add New Module</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="module-title">Module Title</Label>
                      <Input
                        id="module-title"
                        placeholder="Enter module title"
                        value={currentModule.title}
                        onChange={(e) =>
                          setCurrentModule({
                            ...currentModule,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Lessons in Current Module */}
                    <div className="space-y-2">
                      <Label>Lessons</Label>
                      {currentModule.lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="grid gap-2 md:grid-cols-4 p-3 border rounded"
                        >
                          <Input
                            placeholder="Lesson title"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(lesson.id, "title", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Duration (e.g., 15 min)"
                            value={lesson.duration}
                            onChange={(e) =>
                              updateLesson(
                                lesson.id,
                                "duration",
                                e.target.value
                              )
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "video/*";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    "video",
                                    `lesson-${lesson.id}`
                                  );
                                }
                              };
                              input.click();
                            }}
                            className={
                              uploadedFiles[`lesson-${lesson.id}`]
                                ? "bg-green-100 border-green-200 text-green-800 hover:bg-green-200 hover:text-green-800"
                                : ""
                            }
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            {uploadedFiles[`lesson-${lesson.id}`]
                              ? uploadedFiles[
                                  `lesson-${lesson.id}`
                                ].name.substring(0, 15) + "..."
                              : "Upload Video"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addLesson}
                        className="w-full bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>

                    <Button
                      onClick={addModule}
                      disabled={
                        !currentModule.title ||
                        currentModule.lessons.length === 0
                      }
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Module
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quiz Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course Quiz</h3>

                {/* Existing Quiz Questions */}
                {quizQuestions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="border-l-4 border-l-orange-500"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Question {index + 1}
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeQuizQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="font-medium">{question.question}</p>
                        <div className="grid gap-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border ${
                                optIndex === question.correctAnswer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50"
                              }`}
                            >
                              <span className="text-sm">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </span>
                              {optIndex === question.correctAnswer && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  Correct
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Quiz Question */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Add Quiz Question
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter your question"
                        value={currentQuestion.question}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            question: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="text-sm font-medium w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            placeholder={`Option ${String.fromCharCode(
                              65 + index
                            )}`}
                            value={option}
                            onChange={(e) =>
                              updateQuestionOption(index, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <RadioGroup
                        value={currentQuestion.correctAnswer.toString()}
                        onValueChange={(value) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: Number.parseInt(value),
                          })
                        }
                      >
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              id={`correct-${index}`}
                            />
                            <Label
                              htmlFor={`correct-${index}`}
                              className="text-sm"
                            >
                              {String.fromCharCode(65 + index)}.{" "}
                              {option ||
                                `Option ${String.fromCharCode(65 + index)}`}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Button
                      onClick={addQuizQuestion}
                      disabled={
                        !currentQuestion.question ||
                        !currentQuestion.options.every((opt) => opt.trim())
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={createCourse}
                  disabled={
                    !newCourse.title ||
                    !newCourse.category ||
                    modules.length === 0 ||
                    loading
                  }
                >
                  {loading ? "Creating..." : "Create Course"}
                </Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Player Modal */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => setSelectedVideo(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            {selectedVideo ? (
              <video controls className="w-full h-full rounded-lg">
                <source src={selectedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="text-white">Video player placeholder</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
