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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, CheckCircle, Lock, Clock, Users, Star } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { enrollmentApi, courseApi } from "@/lib/api";
import { CourseResponse } from "@/lib/course-types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CourseDetail() {
  const params = useParams();
  const courseId = Number.parseInt(params.id as string);

  const [courseData, setCourseData] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load course data from API
  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseApi.getCourseById(courseId);

      if (response.success && response.data) {
        setCourseData(response.data);
        setIsEnrolled(response.data.isEnrolled);

        // Set initial canReview status if enrolled
        if (response.data.isEnrolled) {
          const totalLessons = response.data.modules.reduce(
            (sum, module) => sum + module.lessons.length,
            0
          );
          const completedLessons = response.data.modules.reduce(
            (sum, module) =>
              sum + module.lessons.filter((lesson) => lesson.completed).length,
            0
          );
          const progressPercent =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;
          setCanReview(progressPercent >= 50);
        }
      } else {
        setError(response.error?.message || "Failed to load course data");
      }
    } catch (error) {
      console.error("Failed to load course data:", error);
      setError("Failed to load course data");
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
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Course not found"}</p>
        </div>
      </div>
    );
  }

  // Update the calculation section around line 112
  const totalLessons = courseData.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );

  // Calculate completed lessons from course data
  const completedLessons = courseData.modules.reduce(
    (sum, module) =>
      sum + module.lessons.filter((lesson) => lesson.completed).length,
    0
  );

  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleEnrollClick = () => {
    setShowEnrollModal(true);
  };

  const confirmEnrollment = async () => {
    setEnrollLoading(true);
    try {
      const response = await enrollmentApi.enrollUser(courseId);

      if (response.success) {
        alert("Enrollment successful!");
        // refresh the page
        loadCourseData();
      } else {
        console.error("Enrollment failed:", response.error);
        alert("Enrollment failed. Please try again.");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Enrollment failed. Please try again.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleLessonClick = async (lesson: {
    id: number;
    videoUrl: string;
    completed: boolean;
  }) => {
    if (!isEnrolled) return;
    // Show video modal with the actual lesson video URL
    setSelectedVideo(lesson.videoUrl);
    try {
      const response = await enrollmentApi.toggleLessonCompletion(lesson.id);

      if (response.success && response.data) {
        // Update the course data with the new completion status
        setCourseData((prevData) => {
          if (!prevData) return prevData;

          return {
            ...prevData,
            modules: prevData.modules.map((module) => ({
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === response.data?.lessonId
                  ? { ...lesson, completed: response.data?.completed }
                  : lesson
              ),
            })),
          };
        });

        // Update progress based on new completion status
        const newCompletedLessons = courseData.modules.reduce(
          (sum, module) =>
            sum +
            module.lessons.filter((l) =>
              l.id === lesson.id ? response.data?.completed : l.completed
            ).length,
          0
        );
        const newProgressPercent = Math.round(
          (newCompletedLessons / totalLessons) * 100
        );

        // Check if user can review (50% completion)
        setCanReview(newProgressPercent >= 50);
      }
    } catch (error) {
      console.error("Failed to update lesson completion:", error);
      // You might want to show an error message to the user here
    }
  };

  const submitReview = async () => {
    try {
      const reviewData = {
        courseId: courseData.id,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      };
      const response = await enrollmentApi.submitReview(reviewData);
      if (response.success) {
        alert("Review submitted successfully!");
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: "" });
        // Optionally, reload course data to show new review
        loadCourseData();
      } else {
        alert("Failed to submit review: " + response.error?.message);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-6">
        {/*<div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div> */}

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
                  {courseData.enrollmentsCount.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {courseData.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {courseData.averageRating}
                </div>
              </div>

              {isEnrolled && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Course Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
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
                    <p className="text-sm text-muted-foreground">Level</p>
                  </div>
                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <>
                        {courseData.quiz && (
                          <Button className="flex-1" asChild>
                            <Link href={`/quiz/${courseData.id}`}>
                              Take Quiz
                            </Link>
                          </Button>
                        )}
                        {!courseData.quiz && (
                          <p className="text-sm text-muted-foreground text-center py-2 flex-1">
                            No quiz available for this course
                          </p>
                        )}
                      </>
                    ) : (
                      <Button className="flex-1" onClick={handleEnrollClick}>
                        Enroll Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <Tabs defaultValue="curriculum" className="space-y-4">
          <TabsList>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {totalLessons} lessons • {courseData.duration} total duration
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
                            {module.lessons.length} lessons
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                isEnrolled
                                  ? "cursor-pointer hover:bg-muted"
                                  : ""
                              }`}
                              onClick={() =>
                                isEnrolled && handleLessonClick(lesson)
                              }
                            >
                              <div className="flex items-center gap-3">
                                {isEnrolled ? (
                                  lesson.completed ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Play className="h-5 w-5 text-primary" />
                                  )
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p
                                    className={`font-medium ${
                                      isEnrolled ? "hover:underline" : ""
                                    }`}
                                  >
                                    {lesson.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {lesson.duration}
                                  </p>
                                </div>
                              </div>
                              {!isEnrolled && (
                                <Badge variant="outline" className="text-xs">
                                  Enroll to Access
                                </Badge>
                              )}
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
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>
                  See what other students are saying
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEnrolled && (
                  <div className="mb-6 p-4 border rounded-lg">
                    {canReview ? (
                      !showReviewForm ? (
                        <Button onClick={() => setShowReviewForm(true)}>
                          Write a Review
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label>Rating</Label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() =>
                                    setNewReview({ ...newReview, rating: star })
                                  }
                                  className="p-1"
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      star <= newReview.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Your Review</Label>
                            <Textarea
                              placeholder="Share your experience with this course..."
                              value={newReview.comment}
                              onChange={(e) =>
                                setNewReview({
                                  ...newReview,
                                  comment: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={submitReview}
                              disabled={!newReview.comment.trim()}
                            >
                              Submit Review
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowReviewForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          Complete at least 50% of the course to leave a review
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current progress: {progressPercentage}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                      No reviews yet. Be the first to review this course!
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
              <DialogTitle>Video Lesson</DialogTitle>
            </DialogHeader>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              {selectedVideo ? (
                <video controls autoPlay className="w-full h-full rounded-lg">
                  <source
                    src={`http://localhost:8080/files/${selectedVideo}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p className="text-white">Loading video...</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Enrollment Confirmation Modal */}
        <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Enrollment</DialogTitle>
              <DialogDescription>
                Are you sure you want to enroll in &quot;{courseData.title}
                &quot;? You&apos;ll get immediate access to all course
                materials.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEnrollModal(false)}
                disabled={enrollLoading}
              >
                Cancel
              </Button>
              <Button onClick={confirmEnrollment} disabled={enrollLoading}>
                {enrollLoading ? "Enrolling..." : "Yes, Enroll Me"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
