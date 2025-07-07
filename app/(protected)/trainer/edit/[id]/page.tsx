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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Save,
  Upload,
  Plus,
  Trash2,
  ImageIcon,
  CheckCircle,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { courseApi } from "@/lib/api";
import type {
  CourseLevel,
  CourseRequest,
  CourseRequestUpdate,
  ModuleRequest,
  LessonRequest,
  QuestionRequest,
} from "@/lib/course-types";

export default function EditCourse() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number.parseInt(params.id as string);

  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<CourseRequestUpdate>({
    title: "",
    description: "",
    categoryId: 1,
    duration: "",
    level: "BEGINNER",
    coverImage: null,
    coverImageUrl: "", // For existing courses, we might need to handle this separately
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

  // Load course data on component mount
  const loadCourseData = async () => {
    try {
      // Get trainer's courses to find the specific course
      const courseResponse = await courseApi.getCourseDetailsForEditById(
        courseId
      );
      if (courseResponse.success && courseResponse.data) {
        const courseData = courseResponse.data;
        setCourseData({
          title: courseData.title,
          description: courseData.description || "",
          categoryId: courseData.categoryId,
          duration: courseData.duration,
          level: courseData.level,
          coverImage: null, // Will need to handle existing image separately
          coverImageUrl: courseData.coverImage || "", // Use existing image URL if available
          modules: courseData.modules.map((module) => {
            return {
              id: module.id,
              title: module.title,
              lessons: module.lessons.map((lesson) => {
                return {
                  id: lesson.id,
                  title: lesson.title,
                  duration: lesson.duration,
                  videoUrl: lesson.videoUrl, // Keep track of existing video URL
                  // video will be set when user uploads a new video
                };
              }),
            };
          }),
          quiz: courseData.quiz
            ? {
                questions: courseData.quiz.questions.map((question) => ({
                  id: question.id,
                  question: question.question,
                  answers: question.answers.map((answer) => ({
                    id: answer.id,
                    answer: answer.answer,
                    correct: answer.correct,
                  })),
                })),
              }
            : { questions: [] },
        });
      }
    } catch (error) {
      console.error("Failed to load course data:", error);
      alert("Échec du chargement des données de la formation");
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Course data update functions
  const updateCourseField = (
    field: keyof Omit<CourseRequest, "modules" | "quiz" | "coverImage">,
    value: string | number
  ) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  const setCoverImage = (file: File | null) => {
    setCourseData((prev) => ({ ...prev, coverImage: file }));
  };

  // Module management functions
  const addModule = () => {
    if (currentModule.title.trim()) {
      setCourseData((prev) => ({
        ...prev,
        modules: [...prev.modules, { ...currentModule, id: null }],
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
      id: null,
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
          questions: [
            ...(prev.quiz?.questions || []),
            {
              ...currentQuestion,
              id: null,
            },
          ],
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

  const updateCourse = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (
        !courseData.title ||
        !courseData.level ||
        !courseData.duration ||
        !courseData.categoryId
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      if (courseData.modules.length === 0) {
        throw new Error("Veuillez ajouter au moins un module");
      }

      // Check if each module has at least one lesson
      const emptyModules = courseData.modules.filter(
        (m) => m.lessons.length === 0
      );
      if (emptyModules.length > 0) {
        throw new Error("Chaque module doit avoir au moins une leçon");
      }

      const response = await courseApi.updateCourse(courseId, courseData);

      if (response.success) {
        alert("Formation mise à jour avec succès !");
        router.push("/trainer");
      } else {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : response.error?.message ||
              "La mise à jour de la formation a échoué";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Course update failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "La mise à jour de la formation a échoué. Veuillez réessayer.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier la Formation</h1>
          <p className="text-muted-foreground">
            Mettre à jour le contenu et les paramètres de votre formation
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations sur la Formation</CardTitle>
          <CardDescription>
            Mettez à jour les détails de base de votre formation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la Formation</Label>
              <Input
                id="title"
                value={courseData.title}
                onChange={(e) => updateCourseField("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={courseData.categoryId.toString()}
                onValueChange={(value) =>
                  updateCourseField("categoryId", parseInt(value, 10))
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="level">Niveau</Label>
              <Select
                value={courseData.level}
                onValueChange={(value) =>
                  updateCourseField("level", value as CourseLevel)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durée</Label>
              <Input
                id="duration"
                value={courseData.duration}
                onChange={(e) => updateCourseField("duration", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={courseData.description || ""}
              onChange={(e) => updateCourseField("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image de Couverture</Label>
            {courseData.coverImageUrl && (
              <div className="mb-3">
                <a
                  href={`http://localhost:8080/files/${courseData.coverImageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800 underline"
                >
                  Voir l&apos;image actuelle
                </a>
              </div>
            )}
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
                        {(courseData.coverImage.size / 1024 / 1024).toFixed(2)}{" "}
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
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Téléchargez une image de couverture pour votre formation
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverImage(file);
                    }
                  }}
                  style={{ display: "none" }}
                  id="cover-image-input"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("cover-image-input")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir une Image
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modules Section */}
      <Card>
        <CardHeader>
          <CardTitle>Modules de Formation</CardTitle>
          <CardDescription>
            Gérez le programme de votre formation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseData.modules.map((module, index) => (
            <Card
              key={`module-${index}-${module.id || "new"}-${
                module.title || "untitled"
              }`}
              className="border-l-4 border-l-primary"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Module {index + 1}: {module.title}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeModule(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {module.lessons.length} leçons
                </p>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">
                Ajouter un Nouveau Module
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Titre du Module</Label>
                <Input
                  id="module-title"
                  placeholder="Entrez le titre du module"
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
                <Label>Leçons</Label>
                {currentModule.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={`lesson-${lessonIndex}-${lesson.id || "new"}-${
                      lesson.title || "untitled"
                    }`}
                    className="grid gap-2 md:grid-cols-4 p-3 border rounded"
                  >
                    <Input
                      placeholder="Titre de la leçon"
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
                      placeholder="Durée (ex: 15 min)"
                      value={lesson.duration || ""}
                      onChange={(e) =>
                        updateLessonInCurrentModule(
                          lessonIndex,
                          "duration",
                          e.target.value
                        )
                      }
                    />
                    <div className="space-y-1">
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
                          lesson.video || lesson.videoUrl
                            ? "bg-green-100 border-green-200 text-green-800 hover:bg-green-200 hover:text-green-800"
                            : ""
                        }
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {lesson.video
                          ? lesson.video instanceof File
                            ? lesson.video.name.substring(0, 15) + "..."
                            : "Vidéo téléchargée"
                          : lesson.videoUrl
                          ? "Mettre à jour la vidéo"
                          : "Télécharger une vidéo"}
                      </Button>
                      {lesson.videoUrl && !lesson.video && (
                        <p className="text-xs text-muted-foreground">
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Vidéo actuelle
                          </a>
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeLessonFromCurrentModule(lessonIndex)}
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
                  Ajouter une Leçon
                </Button>
              </div>

              <Button
                onClick={addModule}
                disabled={
                  !currentModule.title || currentModule.lessons.length === 0
                }
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer le Module
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Quiz Section */}
      <Card>
        <CardHeader>
          <CardTitle>Évaluation de la Formation</CardTitle>
          <CardDescription>
            Gérez les questions d&apos;évaluation pour votre formation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseData.quiz?.questions.map((question, index) => (
            <Card
              key={`question-${
                question.id || index
              }-${question.question.substring(0, 20)}`}
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
                <p className="font-medium mb-2">{question.question}</p>
                <div className="grid gap-2">
                  {question.answers.map((answer, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded border text-sm ${
                        answer.correct
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {answer.answer}
                      {answer.correct && (
                        <span className="ml-2 text-green-600 text-xs">
                          Correcte
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Ajouter une Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  placeholder="Entrez votre question"
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
                <Label>Options de Réponse</Label>
                {currentQuestion.answers.map((answer, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-sm font-medium w-6">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={answer.answer}
                      onChange={(e) =>
                        updateQuestionAnswer(index, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Réponse Correcte</Label>
                <RadioGroup
                  value={currentQuestion.answers
                    .findIndex((a) => a.correct)
                    .toString()}
                  onValueChange={(value) =>
                    setCorrectAnswer(parseInt(value, 10))
                  }
                >
                  {currentQuestion.answers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`correct-${index}`}
                      />
                      <Label htmlFor={`correct-${index}`} className="text-sm">
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
                Ajouter la Question
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={updateCourse} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Mise à jour en cours..." : "Mettre à jour la Formation"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
