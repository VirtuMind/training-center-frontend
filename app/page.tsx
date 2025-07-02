"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

const enrolledCourses = [
  {
    id: 1,
    title: "React Development Fundamentals",
    category: "Web Development",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    nextLesson: "State Management with Redux",
    instructor: "Sarah Johnson",
  },
  {
    id: 2,
    title: "Digital Marketing Strategy",
    category: "Marketing",
    progress: 45,
    totalLessons: 16,
    completedLessons: 7,
    nextLesson: "Social Media Analytics",
    instructor: "Mike Chen",
  },
  {
    id: 3,
    title: "Data Science with Python",
    category: "Data Science",
    progress: 30,
    totalLessons: 32,
    completedLessons: 10,
    nextLesson: "Pandas Data Manipulation",
    instructor: "Dr. Emily Rodriguez",
  },
]

const stats = [
  {
    title: "Courses Enrolled",
    value: "3",
    icon: BookOpen,
    description: "Active courses",
  },
  {
    title: "Hours Completed",
    value: "47",
    icon: Clock,
    description: "This month",
  },
  {
    title: "Average Progress",
    value: "50%",
    icon: TrendingUp,
    description: "Across all courses",
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, Alex!</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">My Courses</h2>
          <Button asChild>
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{course.category}</Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>Instructor: {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((course.completedLessons / course.totalLessons) * 100) === course.progress
                      ? `${course.completedLessons} of ${course.totalLessons} lessons completed`
                      : `${course.completedLessons} of ${course.totalLessons} lessons completed`}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Next Lesson:</p>
                  <p className="text-sm text-muted-foreground">{course.nextLesson}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link href={`/courses/${course.id}`}>Continue</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/quiz/${course.id}`}>Take Quiz</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
