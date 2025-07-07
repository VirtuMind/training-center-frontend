"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, Clock, Users, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseResponse } from "@/lib/course-types";
import { courseApi } from "@/lib/api";

const categories = [
  "All",
  "Web Development",
  "Marketing",
  "Data Science",
  "Design",
  "Cloud Computing",
];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch courses from API
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await courseApi.getCourses();

        if (!response.success) {
          throw new Error(response.error?.message || "Failed to fetch courses");
        }

        setCourses(response.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course?.description &&
        course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" ||
      course.categoryName.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel =
      selectedLevel === "All" ||
      course.level.toLowerCase() === selectedLevel.toLowerCase();

    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground">
            Discover our comprehensive training programs
          </p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <CardTitle className="text-2xl">Loading Courses...</CardTitle>
            <CardDescription>
              Please wait while we fetch the available courses
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
          <h1 className="text-3xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground">
            Discover our comprehensive training programs
          </p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Error Loading Courses</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground">
          Discover our comprehensive training programs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          return (
            <Card
              key={course.id}
              className="hover:shadow-lg transition-shadow relative"
            >
              {course.coverImage ? (
                <div className="w-full h-48 overflow-hidden rounded-t-lg relative">
                  <Image
                    src={`http://localhost:8080/files/${course.coverImage}`}
                    alt={`${course.title} cover`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{course.categoryName}</Badge>
                  <Badge variant="outline">
                    {course.level.toLocaleLowerCase()}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrollmentsCount}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {course.averageRating}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Formateur: {course.trainer.fullName}
                </p>

                <Button className="w-full" asChild>
                  <Link href={`/courses/${course.id}`}>Consulter</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
          <p className="text-muted-foreground">
            {courses.length === 0
              ? "No courses are currently available."
              : "No courses found matching your search criteria."}
          </p>
          {courses.length > 0 && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedLevel("All");
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
