// Course related types that match backend requirements

import { ReviewResponse } from "./types";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface CourseRequest {
  title: string;
  description?: string;
  level: CourseLevel;
  duration: string;
  categoryId: number;
  coverImage: File | null; // Cover image is part of the course object
  modules: ModuleRequest[];
  quiz?: QuizRequest;
}

export interface CourseRequestUpdate {
  title: string;
  description?: string;
  level: CourseLevel;
  duration: string;
  categoryId: number;
  coverImage?: File | null; // Cover image is part of the course object
  coverImageUrl?: string; // Optional URL for existing cover image
  modules: ModuleRequest[];
  quiz?: QuizRequest;
}

export interface ModuleRequest {
  id?: number | null; // Null for new modules, number for existing modules
  title: string;
  lessons: LessonRequest[];
}

export interface LessonRequest {
  id?: number | null; // Null for new lessons, number for existing lessons
  title: string;
  duration?: string;
  video?: File; // Video is part of the lesson object for new uploads
  videoUrl?: string; // URL for existing videos (used in edit mode)
}

export interface QuizRequest {
  questions: QuestionRequest[];
}

export interface QuestionRequest {
  id?: number | null; // Null for new questions, number for existing questions
  question: string;
  answers: AnswerRequest[];
}

export interface AnswerRequest {
  id?: number | null; // Null for new answers, number for existing answers
  answer: string;
  correct: boolean;
}

// Response types for when data comes back from the server
export interface CourseResponse {
  id: number;
  title: string;
  description?: string;
  level: CourseLevel;
  duration: string;
  categoryId: number;
  categoryName: string; // Category name
  coverImage: string;
  modules: ModuleResponse[];
  quiz?: QuizResponse;
  createdAt: string;
  updatedAt: string;
  trainer: {
    id: number;
    fullName: string;
    username: string;
  };
  enrollmentsCount: number;
  averageRating: number;
  reviews: ReviewResponse[];
  isEnrolled: boolean;
}

export interface ModuleResponse {
  id: number;
  title: string;
  lessons: LessonResponse[];
}

export interface LessonResponse {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
}

export interface QuizResponse {
  courseId: number;
  courseTitle: string;
  questions: QuestionResponse[];
}

export interface QuestionResponse {
  id: number;
  question: string;
  answers: AnswerResponse[];
}

export interface AnswerResponse {
  id: number;
  answer: string;
  correct: boolean;
}

export interface QuizSubmission {
  answers: {
    questionId: number;
    answerId: number;
  }[];
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  answers: {
    questionId: number;
    answerId: number;
    correct: boolean;
    correctAnswerId?: number;
  }[];
}
