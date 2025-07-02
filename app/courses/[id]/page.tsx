"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Play, CheckCircle, Lock, Clock, Users, Star, ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { enrollmentApi } from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const courseData = {
  id: 1,
  title: "React Development Fundamentals",
  description:
    "Master the fundamentals of React development including components, state management, and modern React patterns.",
  instructor: "Sarah Johnson",
  category: "Web Development",
  level: "Beginner",
  duration: "8 weeks",
  students: 1250,
  rating: 4.8,
  modules: [
    {
      id: 1,
      title: "Introduction to React",
      lessons: [
        { id: 1, title: "What is React?", duration: "15 min", completed: false },
        { id: 2, title: "Setting up Development Environment", duration: "20 min", completed: false },
        { id: 3, title: "Your First React Component", duration: "25 min", completed: false },
      ],
    },
    {
      id: 2,
      title: "Components and JSX",
      lessons: [
        { id: 4, title: "Understanding JSX", duration: "18 min", completed: false },
        { id: 5, title: "Component Props", duration: "22 min", completed: false },
        { id: 6, title: "Conditional Rendering", duration: "20 min", completed: false },
      ],
    },
    {
      id: 3,
      title: "State Management",
      lessons: [
        { id: 7, title: "useState Hook", duration: "25 min", completed: false },
        { id: 8, title: "useEffect Hook", duration: "30 min", completed: false },
        { id: 9, title: "State Best Practices", duration: "20 min", completed: false },
      ],
    },
    {
      id: 4,
      title: "Advanced Concepts",
      lessons: [
        { id: 10, title: "Context API", duration: "35 min", completed: false },
        { id: 11, title: "Custom Hooks", duration: "28 min", completed: false },
        { id: 12, title: "Performance Optimization", duration: "32 min", completed: false },
      ],
    },
  ],
}

// Mock enrolled courses - in real app, this would come from API
const mockEnrolledCourses = [1, 3, 4] // Course IDs user is enrolled in

export default function CourseDetail() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.id as string)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{ [key: number]: boolean }>({})
  const [canReview, setCanReview] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    checkEnrollmentStatus()
  }, [courseId])

  const checkEnrollmentStatus = async () => {
    try {
      // In real app, get current user ID from auth context
      const userId = 1 // Mock user ID
      const response = await enrollmentApi.getUserEnrollments(userId)

      if (response.success && response.data) {
        const enrolled = mockEnrolledCourses.includes(courseId)
        setIsEnrolled(enrolled)
        if (enrolled) {
          // Mock progress for enrolled courses
          const mockProgress = courseId === 1 ? 75 : courseId === 3 ? 45 : 30
          setProgress(mockProgress)
        }
      }
    } catch (error) {
      console.error("Failed to check enrollment status:", error)
      // Fallback to mock data
      setIsEnrolled(mockEnrolledCourses.includes(courseId))
      if (mockEnrolledCourses.includes(courseId)) {
        const mockProgress = courseId === 1 ? 75 : courseId === 3 ? 45 : 30
        setProgress(mockProgress)
      }
    }
  }

  const totalLessons = courseData.modules.reduce((sum, module) => sum + module.lessons.length, 0)
  const completedLessons = Math.floor((progress / 100) * totalLessons)

  const handleEnrollClick = () => {
    setShowEnrollModal(true)
  }

  const confirmEnrollment = async () => {
    setLoading(true)
    try {
      const userId = 1 // Mock user ID
      const enrollmentData = {
        userId,
        courseId,
        progress: 0,
      }

      const response = await enrollmentApi.enrollUser(enrollmentData)

      if (response.success) {
        setIsEnrolled(true)
        setProgress(0)
        setShowEnrollModal(false)
      } else {
        console.error("Enrollment failed:", response.error)
        alert("Enrollment failed. Please try again.")
      }
    } catch (error) {
      console.error("Enrollment error:", error)
      alert("Enrollment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLessonClick = (lessonId: number) => {
    if (!isEnrolled) return

    // Toggle lesson completion
    const newProgress = { ...lessonProgress }
    newProgress[lessonId] = !newProgress[lessonId]
    setLessonProgress(newProgress)

    // Update overall progress
    const completedCount = Object.values(newProgress).filter(Boolean).length
    const newProgressPercent = Math.round((completedCount / totalLessons) * 100)
    setProgress(newProgressPercent)

    // Check if user can review (50% completion)
    setCanReview(newProgressPercent >= 50)

    // Show video modal
    setSelectedVideo("https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4")
  }

  const submitReview = async () => {
    try {
      // API call would go here
      console.log("Submitting review:", newReview)
      alert("Review submitted successfully!")
      setShowReviewForm(false)
      setNewReview({ rating: 5, comment: "" })
    } catch (error) {
      console.error("Failed to submit review:", error)
      alert("Failed to submit review. Please try again.")
    }
  }

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
                  {courseData.category}
                </Badge>
                <h1 className="text-3xl font-bold">{courseData.title}</h1>
                <p className="text-muted-foreground mt-2">{courseData.description}</p>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {courseData.students.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {courseData.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {courseData.rating}
                </div>
              </div>

              {isEnrolled && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Course Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
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
                    <p className="font-medium">{courseData.instructor}</p>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                  </div>
                  <div>
                    <p className="font-medium">{courseData.level}</p>
                    <p className="text-sm text-muted-foreground">Level</p>
                  </div>
                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <>
                        <Button className="flex-1" asChild>
                          <Link href={`/quiz/${courseData.id}`}>Take Quiz</Link>
                        </Button>
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
                    <AccordionItem key={module.id} value={`module-${module.id}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center justify-between w-full mr-4">
                          <span>{module.title}</span>
                          <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                isEnrolled ? "cursor-pointer hover:bg-muted" : ""
                              }`}
                              onClick={() => isEnrolled && handleLessonClick(lesson.id)}
                            >
                              <div className="flex items-center gap-3">
                                {isEnrolled ? (
                                  lessonProgress[lesson.id] ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Play className="h-5 w-5 text-primary" />
                                  )
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p className={`font-medium ${isEnrolled ? "hover:underline" : ""}`}>{lesson.title}</p>
                                  <p className="text-sm text-muted-foreground">{lesson.duration}</p>
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
                <CardDescription>See what other students are saying</CardDescription>
              </CardHeader>
              <CardContent>
                {isEnrolled && (
                  <div className="mb-6 p-4 border rounded-lg">
                    {canReview ? (
                      !showReviewForm ? (
                        <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label>Rating</Label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                  className="p-1"
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={submitReview} disabled={!newReview.comment.trim()}>
                              Submit Review
                            </Button>
                            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Complete at least 50% of the course to leave a review</p>
                        <p className="text-sm text-muted-foreground mt-1">Current progress: {progress}%</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">Alex M.</span>
                      <span className="text-sm text-muted-foreground">2 days ago</span>
                    </div>
                    <p className="text-sm">
                      Excellent course! Sarah explains complex concepts in a very clear and understandable way. The
                      hands-on projects really helped solidify my understanding.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">Maria S.</span>
                      <span className="text-sm text-muted-foreground">1 week ago</span>
                    </div>
                    <p className="text-sm">
                      Perfect for beginners! I had no prior React experience and now I feel confident building my own
                      applications. Highly recommended!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Video Player Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Video Lesson</DialogTitle>
            </DialogHeader>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              {selectedVideo ? (
                <video controls autoPlay className="w-full h-full rounded-lg">
                  <source src={selectedVideo} type="video/mp4" />
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
                Are you sure you want to enroll in "{courseData.title}"? You'll get immediate access to all course
                materials.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnrollModal(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={confirmEnrollment} disabled={loading}>
                {loading ? "Enrolling..." : "Yes, Enroll Me"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
