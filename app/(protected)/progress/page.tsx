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
import { TrendingUp, BookOpen, Clock } from "lucide-react";

const courseProgress = [
  {
    id: 1,
    title: "React Development Fundamentals",
    category: "Web Development",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    timeSpent: 32,
    quizScores: [85, 92, 78, 88],
  },
  {
    id: 2,
    title: "Digital Marketing Strategy",
    category: "Marketing",
    progress: 44, // Fixed to match actual calculation
    totalLessons: 16,
    completedLessons: 7,
    timeSpent: 18,
    quizScores: [90, 85, 92],
  },
  {
    id: 3,
    title: "Data Science with Python",
    category: "Data Science",
    progress: 31, // Fixed to match actual calculation
    totalLessons: 32,
    completedLessons: 10,
    timeSpent: 25,
    quizScores: [88, 76, 82],
  },
];

export default function ProgressPage() {
  const totalHours = courseProgress.reduce(
    (sum, course) => sum + course.timeSpent,
    0
  );
  const averageProgress = Math.round(
    courseProgress.reduce((sum, course) => sum + course.progress, 0) /
      courseProgress.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey and course completion
        </p>
      </div>

      {/* Course Progress Details */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Course Progress</h2>
        {courseProgress.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    Progress tracking for this course
                  </CardDescription>
                </div>
                <Badge variant="secondary">{course.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>
                    {Math.round(
                      (course.completedLessons / course.totalLessons) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={Math.round(
                    (course.completedLessons / course.totalLessons) * 100
                  )}
                  className="h-2 [&>div]:bg-green-600"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {course.completedLessons} of {course.totalLessons} lessons
                  completed
                </p>
              </div>

              {/* <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-1">Time Spent</p>
                  <p className="text-2xl font-bold">{course.timeSpent}h</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Quiz Average</p>
                  <p className="text-2xl font-bold">
                    {course.quizScores.length > 0
                      ? Math.round(
                          course.quizScores.reduce((a, b) => a + b, 0) /
                            course.quizScores.length
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div> */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
