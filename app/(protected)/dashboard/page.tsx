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
import { DashboardEnrollment, User } from "@/lib/types";
import { enrollmentApi } from "@/lib/api";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<DashboardEnrollment[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user on client side to prevent hydration mismatch
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);

        const response = await enrollmentApi.getStudentEnrollments();

        if (response.success && response.data) {
          console.log("Enrolled courses response:", response);
          setEnrolledCourses(response.data);
        } else {
          throw new Error(
            response.error?.message || "Failed to fetch enrolled courses"
          );
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchEnrolledCourses();
    } else {
      setLoading(false);
    }
  }, []);

  // Show loading state during hydration
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chargement...</h1>
          <p className="text-muted-foreground">
            Veuillez patienter pendant le chargement de votre tableau de bord
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bienvenue, {user?.fullName}!</h1>
        <p className="text-muted-foreground">
          Poursuivez votre parcours d&apos;apprentissage
        </p>
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Mes Formations</h2>
          <Button asChild>
            <Link href="/courses">Parcourir toutes les formations</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.length === 0 && (
            <div className="col-span-3 m-20 text-center text-muted-foreground">
              Vous n&apos;êtes inscrit à aucune formation pour le moment.
            </div>
          )}
          {enrolledCourses.length > 0 &&
            enrolledCourses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{course.courseCategory}</Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {course.courseTitle}
                  </CardTitle>
                  <CardDescription>
                    Formateur: {course.trainerFullname}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression</span>
                      <span>{course.progressPercentage}%</span>
                    </div>
                    <Progress
                      value={course.progressPercentage}
                      className="h-2 [&>div]:bg-green-600"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(
                        (course.completedLessons / course.totalLessons) * 100
                      ) === course.progressPercentage
                        ? `${course.completedLessons} sur ${course.totalLessons} leçons terminées`
                        : `${course.completedLessons} sur ${course.totalLessons} leçons terminées`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link href={`/courses/${course.id}`}>Continuer</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/quiz/${course.id}`}>
                        Faire l&apos;évaluation
                      </Link>
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
