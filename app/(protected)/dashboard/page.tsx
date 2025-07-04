"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Removed unused imports
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/utils";

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
];

export default function Dashboard() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.name) {
      setUserName(user.name.split(" ")[0]); // Get first name
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
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
                <CardDescription>
                  Instructor: {course.instructor}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress
                    value={course.progress}
                    className="h-2 [&>div]:bg-green-600"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(
                      (course.completedLessons / course.totalLessons) * 100
                    ) === course.progress
                      ? `${course.completedLessons} of ${course.totalLessons} lessons completed`
                      : `${course.completedLessons} of ${course.totalLessons} lessons completed`}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Next Lesson:</p>
                  <p className="text-sm text-muted-foreground">
                    {course.nextLesson}
                  </p>
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
  );
}
