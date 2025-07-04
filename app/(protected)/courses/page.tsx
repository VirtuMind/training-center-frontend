"use client";

import { useState } from "react";
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
import { Search, Star, Clock, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

const courses = [
  {
    id: 1,
    title: "React Development Fundamentals",
    description:
      "Learn the basics of React including components, state, and props",
    category: "Web Development",
    level: "Beginner",
    duration: "8 weeks",
    students: 1250,
    rating: 4.8,
    instructor: "Sarah Johnson",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Advanced JavaScript Concepts",
    description:
      "Master closures, prototypes, async programming, and ES6+ features",
    category: "Web Development",
    level: "Advanced",
    duration: "6 weeks",
    students: 890,
    rating: 4.9,
    instructor: "John Smith",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Digital Marketing Strategy",
    description: "Comprehensive guide to modern digital marketing techniques",
    category: "Marketing",
    level: "Intermediate",
    duration: "10 weeks",
    students: 2100,
    rating: 4.7,
    instructor: "Mike Chen",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Data Science with Python",
    description:
      "Learn data analysis, visualization, and machine learning with Python",
    category: "Data Science",
    level: "Intermediate",
    duration: "12 weeks",
    students: 1560,
    rating: 4.8,
    instructor: "Dr. Emily Rodriguez",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    description:
      "Master the fundamentals of user interface and user experience design",
    category: "Design",
    level: "Beginner",
    duration: "8 weeks",
    students: 980,
    rating: 4.6,
    instructor: "Lisa Wang",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    title: "Cloud Computing with AWS",
    description:
      "Learn Amazon Web Services and cloud infrastructure management",
    category: "Cloud Computing",
    level: "Intermediate",
    duration: "10 weeks",
    students: 750,
    rating: 4.7,
    instructor: "David Kumar",
    image: "/placeholder.svg?height=200&width=300",
  },
];

const categories = [
  "All",
  "Web Development",
  "Marketing",
  "Data Science",
  "Design",
  "Cloud Computing",
];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];
// Mock enrolled courses - only show indicator for enrolled courses
const enrolledCourses = [1, 3, 4];

export default function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

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
          const isEnrolled = enrolledCourses.includes(course.id);
          return (
            <Card
              key={course.id}
              className="hover:shadow-lg transition-shadow relative"
            >
              {/* Enrollment Indicator */}
              {/* {isEnrolled && (
                <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Enrolled
                </div>
              )} */}
              <div className="aspect-video bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
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
                    999
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Instructor: {course.instructor}
                </p>

                <Button
                  variant={isEnrolled ? "secondary" : "default"}
                  className="w-full"
                  asChild
                >
                  <Link href={`/courses/${course.id}`}>
                    {isEnrolled ? "Continue Course" : "View Course"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No courses found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
