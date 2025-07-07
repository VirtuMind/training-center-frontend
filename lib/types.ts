export interface AuthResponse {
  accessToken: string;
  user: User; // Use the same User interface
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  timestamp: string;
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  role: "STUDENT" | "TRAINER" | "ADMIN";
  createdAt: string;
}

export interface NewUser {
  fullname: string;
  username: string;
  role: "STUDENT" | "TRAINER" | "ADMIN";
  password: string; // Password is required for new users
}

export interface TrainerCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  coverImg: string;
  categoryName: string;
  updatedAt: string;
  averageRating: number;
  enrollmentsCount: number;
}

export interface DashboardEnrollment {
  id: number;
  studentId: number;
  studentFullname: string;
  courseId: number;
  courseTitle: string;
  courseCategory: string;
  enrolledAt: string;
  trainerFullname: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  enrolledAt: string;
}

export interface ReviewRequest {
  courseId: number;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StudentProgressResponse {
  studentFullname: string;
  studentUsername: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  averageScore: number;
}
