const API_BASE_URL = "https://jsonplaceholder.typicode.com" // Placeholder API

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface User {
  id: number
  name: string
  email: string
  role: "Student" | "Trainer" | "Admin"
  joinDate: string
  coursesEnrolled: number
}

export interface Course {
  id: number
  title: string
  description: string
  category: string
  level: string
  duration: string
  students: number
  rating: number
  instructor: string
  modules?: Module[]
  quizQuestions?: QuizQuestion[]
  coverImage?: string
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "document"
  content?: string
  videoUrl?: string
  documentUrl?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface Enrollment {
  userId: number
  courseId: number
  enrolledAt: string
  progress: number
}

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data, success: true }
  } catch (error) {
    console.error("API call failed:", error)
    return { error: error instanceof Error ? error.message : "Unknown error", success: false }
  }
}

// User API functions
export const userApi = {
  getUsers: () => apiCall<User[]>("/users"),
  getUserById: (id: number) => apiCall<User>(`/users/${id}`),
  createUser: (userData: Omit<User, "id">) =>
    apiCall<User>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  updateUser: (id: number, userData: Partial<User>) =>
    apiCall<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  deleteUser: (id: number) =>
    apiCall<void>(`/users/${id}`, {
      method: "DELETE",
    }),
}

// Course API functions
export const courseApi = {
  getCourses: () => apiCall<Course[]>("/posts"), // Using posts as course placeholder
  getCourseById: (id: number) => apiCall<Course>(`/posts/${id}`),
  createCourse: (courseData: Omit<Course, "id">) =>
    apiCall<Course>("/posts", {
      method: "POST",
      body: JSON.stringify(courseData),
    }),
  updateCourse: (id: number, courseData: Partial<Course>) =>
    apiCall<Course>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    }),
  deleteCourse: (id: number) =>
    apiCall<void>(`/posts/${id}`, {
      method: "DELETE",
    }),
}

// Enrollment API functions
export const enrollmentApi = {
  getUserEnrollments: (userId: number) => apiCall<Enrollment[]>(`/users/${userId}/albums`),
  enrollUser: (enrollmentData: Omit<Enrollment, "enrolledAt">) =>
    apiCall<Enrollment>("/albums", {
      method: "POST",
      body: JSON.stringify({
        ...enrollmentData,
        enrolledAt: new Date().toISOString(),
      }),
    }),
  updateProgress: (userId: number, courseId: number, progress: number) =>
    apiCall<Enrollment>(`/albums/${courseId}`, {
      method: "PUT",
      body: JSON.stringify({ userId, courseId, progress }),
    }),
}

// Quiz API functions
export const quizApi = {
  getQuizByCourseId: (courseId: number) => apiCall<QuizQuestion[]>(`/posts/${courseId}/comments`),
  submitQuizAnswers: (courseId: number, answers: number[]) =>
    apiCall<{ score: number; results: any[] }>("/comments", {
      method: "POST",
      body: JSON.stringify({ courseId, answers }),
    }),
}

// File upload API function
export const uploadApi = {
  uploadFile: (file: File, type: "image" | "video" | "document") =>
    apiCall<{ url: string }>("/upload", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadType: type,
      }),
    }),
}
