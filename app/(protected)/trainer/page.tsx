"use client";

import { useEffect, useState } from "react";
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
import { courseApi, enrollmentApi } from "@/lib/api";
import { StudentProgressResponse, TrainerCourse } from "@/lib/types";
import type {
  CourseLevel,
  CourseRequest,
  ModuleRequest,
  LessonRequest,
  QuestionRequest,
} from "@/lib/course-types";
import { AUTH_USER_KEY } from "@/lib/utils";

export default function TrainerDashboard() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("courses");
  const [trainerCourses, setTrainerCourses] = useState<TrainerCourse[]>([]);
  const [studentsProgress, setStudentsProgress] = useState<
    StudentProgressResponse[]
  >([]);

  // Fetch students progress on mount
  useEffect(() => {
    const fetchStudentsProgress = async () => {
      try {
        const authUser = localStorage.getItem(AUTH_USER_KEY);
        const trainerId = authUser ? JSON.parse(authUser).id : null;

        const response = await enrollmentApi.getStudentsProgressByTrainerId(
          trainerId
        );
        if (response.success) {
          setStudentsProgress(response.data || []);
        } else {
          console.error("Failed to fetch students progress:", response.error);
        }
      } catch (error) {
        console.error("Error fetching students progress:", error);
      }
    };
    fetchStudentsProgress();
  }, []);

  // Fetch trainer courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const authUser = localStorage.getItem(AUTH_USER_KEY);
        const trainerId = authUser ? JSON.parse(authUser).id : null;

        const response = await courseApi.getCoursesByTrainerId(trainerId);
        if (response.success) {
          setTrainerCourses(response.data || []);
        } else {
          console.error("Failed to fetch courses:", response.error);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Course state matching the backend structure
  const [courseData, setCourseData] = useState<CourseRequest>({
    title: "",
    description: "",
    categoryId: 1,
    duration: "",
    level: "BEGINNER",
    coverImage: null, // Will be set when file is selected
    modules: [],
    quiz: { questions: [] },
  });
  const [currentModule, setCurrentModule] = useState<ModuleRequest>({
    title: "",
    lessons: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuestionRequest>({
    question: "",
    answers: [
      { id: null, answer: "", correct: true },
      { id: null, answer: "", correct: false },
      { id: null, answer: "", correct: false },
      { id: null, answer: "", correct: false },
    ],
  });

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Filter students based on selected course
  const filteredStudents =
    selectedCourse === "all"
      ? studentsProgress
      : studentsProgress.filter(
          (progress) => progress.courseTitle === selectedCourse
        );

  // Course data update functions
  const updateCourseField = (
    field: keyof Omit<CourseRequest, "modules" | "quiz" | "coverImage">,
    value: string | number
  ) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  const setCoverImage = (file: File) => {
    setCourseData((prev) => ({ ...prev, coverImage: file }));
  };

  // Module management functions
  const addModule = () => {
    if (currentModule.title.trim()) {
      setCourseData((prev) => ({
        ...prev,
        modules: [...prev.modules, { ...currentModule }],
      }));
      setCurrentModule({ title: "", lessons: [] });
    }
  };

  const removeModule = (moduleIndex: number) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex),
    }));
  };

  // Lesson management functions
  const addLesson = () => {
    const newLesson: LessonRequest = {
      title: "",
      duration: "",
    };
    setCurrentModule((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
    }));
  };

  const updateLessonInCurrentModule = (
    lessonIndex: number,
    field: keyof LessonRequest,
    value: string | File
  ) => {
    setCurrentModule((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson, index) =>
        index === lessonIndex ? { ...lesson, [field]: value } : lesson
      ),
    }));
  };

  const removeLessonFromCurrentModule = (lessonIndex: number) => {
    setCurrentModule((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, index) => index !== lessonIndex),
    }));
  };

  // Quiz management functions
  const addQuizQuestion = () => {
    if (
      currentQuestion.question.trim() &&
      currentQuestion.answers.every((answer) => answer.answer.trim())
    ) {
      setCourseData((prev) => ({
        ...prev,
        quiz: {
          questions: [...(prev.quiz?.questions || []), { ...currentQuestion }],
        },
      }));

      setCurrentQuestion({
        question: "",
        answers: [
          { id: null, answer: "", correct: true },
          { id: null, answer: "", correct: false },
          { id: null, answer: "", correct: false },
          { id: null, answer: "", correct: false },
        ],
      });
    }
  };

  const removeQuizQuestion = (questionIndex: number) => {
    setCourseData((prev) => ({
      ...prev,
      quiz: {
        questions: (prev.quiz?.questions || []).filter(
          (_, index) => index !== questionIndex
        ),
      },
    }));
  };

  const updateQuestionAnswer = (answerIndex: number, value: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, index) =>
        index === answerIndex ? { ...answer, answer: value } : answer
      ),
    }));
  };

  const setCorrectAnswer = (answerIndex: number) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, index) => ({
        ...answer,
        correct: index === answerIndex,
      })),
    }));
  };

  const createCourse = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (
        !courseData.title ||
        !courseData.level ||
        !courseData.duration ||
        !courseData.coverImage
      ) {
        throw new Error("Please fill all required fields");
      }

      if (courseData.modules.length === 0) {
        throw new Error("Please add at least one module");
      }

      // Check if each module has at least one lesson
      const emptyModules = courseData.modules.filter(
        (m) => m.lessons.length === 0
      );
      if (emptyModules.length > 0) {
        throw new Error("Each module must have at least one lesson");
      }

      // Make API call with course data
      const response = await courseApi.createCourse(courseData);

      if (response.success) {
        alert("Course created successfully!");
        // Reset form
        setCourseData({
          title: "",
          description: "",
          categoryId: 1,
          duration: "",
          level: "BEGINNER",
          coverImage: null,
          modules: [],
          quiz: { questions: [] },
        });
        setCurrentModule({ title: "", lessons: [] });
        setCurrentQuestion({
          question: "",
          answers: [
            { id: null, answer: "", correct: true },
            { id: null, answer: "", correct: false },
            { id: null, answer: "", correct: false },
            { id: null, answer: "", correct: false },
          ],
        });
        setActiveTab("courses");
      } else {
        const errorMessage =
          response.error?.message || "Course creation failed";
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error("Course creation failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Course creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewCourse = () => {
    setActiveTab("create");
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
                      <CardDescription>
                        Last updated:{" "}
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{course.categoryName}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Students</p>
                      <p className="text-2xl font-bold">
                        {course.enrollmentsCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Rating</p>
                      <p className="text-2xl font-bold">
                        {course.averageRating.toFixed(1)} / 5
                      </p>
                    </div>

                    <div className="flex gap-2">
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
              <Card key={student.studentUsername + student.courseTitle}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {student.studentFullname}
                      </CardTitle>
                      <CardDescription>
                        {student.studentUsername}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Course: {student.courseTitle}</span>
                      <span>{student.completionPercentage}% Complete</span>
                    </div>
                    <Progress
                      value={student.completionPercentage}
                      className="h-2"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Quiz Average</p>
                      <p className="text-lg font-bold">
                        {student.averageScore}%
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
                      value={courseData.title}
                      onChange={(e) =>
                        updateCourseField("title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={courseData.categoryId.toString()}
                      onValueChange={(value) =>
                        updateCourseField("categoryId", parseInt(value, 10))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Web Development</SelectItem>
                        <SelectItem value="2">Data Science</SelectItem>
                        <SelectItem value="3">Marketing</SelectItem>
                        <SelectItem value="4">Design</SelectItem>
                        <SelectItem value="5">Cloud Computing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value) =>
                        updateCourseField("level", value as CourseLevel)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 8 weeks"
                      value={courseData.duration}
                      onChange={(e) =>
                        updateCourseField("duration", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter course description"
                    value={courseData.description || ""}
                    onChange={(e) =>
                      updateCourseField("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                {/* Course Cover Image */}
                <div className="space-y-2">
                  <Label htmlFor="cover-image">Course Cover Image</Label>
                  {courseData.coverImage ? (
                    <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">
                              {courseData.coverImage.name}
                            </p>
                            <p className="text-sm text-green-800">
                              {(
                                courseData.coverImage.size /
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
                          onClick={() => setCoverImage(null!)}
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
                              setCoverImage(file);
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
                {courseData.modules.map((module, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
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
                            key={lessonIndex}
                            className="flex items-center justify-between p-3 bg-muted rounded"
                          >
                            <div className="flex items-center gap-3">
                              <Video className="h-4 w-4 text-blue-600" />
                              <div>
                                <span className="text-sm font-medium">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  Video • {lesson.duration || "No duration"}
                                </p>
                              </div>
                            </div>
                            {/* Show preview button if we have a video file for this lesson */}
                            {lesson.video && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  playVideo(URL.createObjectURL(lesson.video!))
                                }
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeModule(index)}
                        className="mt-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Module
                      </Button>
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
                      {currentModule.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className="grid gap-2 md:grid-cols-4 p-3 border rounded"
                        >
                          <Input
                            placeholder="Lesson title"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLessonInCurrentModule(
                                lessonIndex,
                                "title",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Duration (e.g., 15 min)"
                            value={lesson.duration || ""}
                            onChange={(e) =>
                              updateLessonInCurrentModule(
                                lessonIndex,
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
                                  updateLessonInCurrentModule(
                                    lessonIndex,
                                    "video",
                                    file
                                  );
                                }
                              };
                              input.click();
                            }}
                            className={
                              lesson.video
                                ? "bg-green-100 border-green-200 text-green-800 hover:bg-green-200 hover:text-green-800"
                                : ""
                            }
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            {lesson.video
                              ? lesson.video.name.substring(0, 15) + "..."
                              : "Upload Video"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              removeLessonFromCurrentModule(lessonIndex)
                            }
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
                {courseData.quiz?.questions.map((question, index) => (
                  <Card
                    key={question.id || `question-${index}`}
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
                          onClick={() => removeQuizQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="font-medium">{question.question}</p>
                        <div className="grid gap-2">
                          {question.answers.map((answer, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border ${
                                answer.correct
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50"
                              }`}
                            >
                              <span className="text-sm">
                                {String.fromCharCode(65 + optIndex)}.{" "}
                                {answer.answer}
                              </span>
                              {answer.correct && (
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
                      {currentQuestion.answers.map((answer, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="text-sm font-medium w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            placeholder={`Option ${String.fromCharCode(
                              65 + index
                            )}`}
                            value={answer.answer}
                            onChange={(e) =>
                              updateQuestionAnswer(index, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <RadioGroup
                        value={currentQuestion.answers
                          .findIndex((a) => a.correct)
                          .toString()}
                        onValueChange={(value) =>
                          setCorrectAnswer(parseInt(value, 10))
                        }
                      >
                        {currentQuestion.answers.map((answer, index) => (
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
                              {answer.answer ||
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
                        !currentQuestion.answers.every((answer) =>
                          answer.answer.trim()
                        )
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
                    !courseData.title ||
                    !courseData.categoryId ||
                    courseData.modules.length === 0 ||
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
