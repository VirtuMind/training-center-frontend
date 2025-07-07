"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";
import { enrollmentApi } from "@/lib/api";
import { DashboardEnrollment } from "@/lib/types";

export default function ProgressPage() {
  const [enrollments, setEnrollments] = useState<DashboardEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await enrollmentApi.getStudentEnrollmentsProgress();

        if (response.success && response.data) {
          setEnrollments(response.data);
        } else {
          setError(response.error?.message || "Failed to load progress data");
        }
      } catch (err) {
        console.error("Failed to fetch progress data:", err);
        setError("Failed to load progress data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and course completion
          </p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <CardTitle className="text-2xl">Loading Progress...</CardTitle>
            <CardDescription>
              Please wait while we fetch your learning progress
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and course completion
          </p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Error Loading Progress</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // No enrollments state
  if (enrollments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and course completion
          </p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Courses Enrolled</CardTitle>
            <CardDescription>
              You haven&apos;t enrolled in any courses yet. Start learning
              today!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {enrollment.courseTitle}
                  </CardTitle>
                  <CardDescription>
                    Progress tracking for this course
                  </CardDescription>
                </div>
                <Badge variant="secondary">{enrollment.courseCategory}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{enrollment.progressPercentage}%</span>
                </div>
                <Progress
                  value={enrollment.progressPercentage}
                  className="h-2 [&>div]:bg-green-600"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {enrollment.completedLessons} of {enrollment.totalLessons}{" "}
                  lessons completed
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-1">Trainer</p>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.trainerFullname}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Enrolled Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
