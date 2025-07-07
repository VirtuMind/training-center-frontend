"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Users, Star, Play } from "lucide-react";
import { useParams } from "next/navigation";
import { courseApi } from "@/lib/api";
import { CourseResponse } from "@/lib/course-types";

export default function TrainerCourseView() {
  const params = useParams();
  const courseId = Number.parseInt(params.id as string);

  const [courseData, setCourseData] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Load course data from API - simplified for read-only view
  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseApi.getCourseById(courseId);

      if (response.success && response.data) {
        setCourseData(response.data);
      } else {
        setError(
          response.error?.message ||
            "Échec du chargement des données de la formation"
        );
      }
    } catch (error) {
      console.error("Failed to load course data:", error);
      setError("Échec du chargement des données de la formation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Early return for loading and error states
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p>Chargement des détails de la formation...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Formation non trouvée"}</p>
        </div>
      </div>
    );
  }

  // Calculate total lessons for display purposes only
  const totalLessons =
    courseData?.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    ) || 0;

  // Handler for lesson click - shows video without marking as complete
  const handleLessonClick = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-6">
        {/* Course Header */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {courseData.categoryName}
                </Badge>
                <h1 className="text-3xl font-bold">{courseData.title}</h1>
                <p className="text-muted-foreground mt-2">
                  {courseData.description}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {courseData.enrollmentsCount.toLocaleString()} étudiants
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {courseData.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {courseData.averageRating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Détails de la Formation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{courseData.trainer.fullName}</p>
                    <p className="text-sm text-muted-foreground">Formateur</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {courseData.level.toLocaleLowerCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">Niveau</p>
                  </div>
                  {courseData.quiz ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Évaluation disponible pour cette formation
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      Aucune évaluation disponible pour cette formation
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <Tabs defaultValue="curriculum" className="space-y-4">
          <TabsList>
            <TabsTrigger value="curriculum">Programme</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Programme de la Formation</CardTitle>
                <CardDescription>
                  {totalLessons} leçons • {courseData.duration} durée totale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {courseData.modules.map((module) => (
                    <AccordionItem
                      key={module.id}
                      value={`module-${module.id}`}
                    >
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center justify-between w-full mr-4">
                          <span>{module.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {module.lessons.length} leçons
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted"
                              onClick={() => handleLessonClick(lesson.videoUrl)}
                            >
                              <div className="flex items-center gap-3">
                                <Play className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium hover:underline">
                                    {lesson.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {lesson.duration}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avis des Étudiants</CardTitle>
                <CardDescription>
                  Découvrez ce que disent les étudiants sur cette formation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseData.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          {review.studentName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                  {courseData.reviews.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun avis pour cette formation.
                    </p>
                  )}
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
              <DialogTitle>Leçon Vidéo</DialogTitle>
            </DialogHeader>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              {selectedVideo ? (
                <video controls autoPlay className="w-full h-full rounded-lg">
                  <source
                    src={`http://localhost:8080/files/${selectedVideo}`}
                    type="video/mp4"
                  />
                  Votre navigateur ne prend pas en charge la balise vidéo.
                </video>
              ) : (
                <p className="text-white">Chargement de la vidéo...</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
