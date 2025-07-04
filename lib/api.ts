const API_BASE_URL = "http://localhost:8080/api"; // Backend api spring
// Interface for authentication
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
  fullname: string;
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

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  instructor: string;
  modules?: Module[];
  quizQuestions?: QuizQuestion[];
  coverImage?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "document";
  content?: string;
  videoUrl?: string;
  documentUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Enrollment {
  userId: number;
  courseId: number;
  enrolledAt: string;
  progress: number;
}

// Generic API call function - simple authentication with redirect on 401
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const { getAccessToken } = await import("@/lib/utils");
    const token = getAccessToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    // Handle unauthorized (401) - token expired or invalid
    if (response.status === 401) {
      const { removeAuthTokens } = await import("@/lib/utils");
      removeAuthTokens();

      // Redirect to login page if we're in a browser environment
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    const responseData = await response.json();

    if (response.ok) {
      return responseData;
    } else {
      // If backend returned an error response in our format
      if (responseData.error) {
        return responseData;
      }

      // Otherwise, create our own error response
      return {
        success: false,
        error: {
          code: response.status.toString(),
          message:
            responseData.message || `HTTP error! status: ${response.status}`,
        },
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("API call failed:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// User API functions
export const userApi = {
  getUsers: () => apiCall<User[]>("/users"),
  getUserById: (id: number) => apiCall<User>(`/users/${id}`),
  createUser: (newUser: NewUser) =>
    apiCall<User>("/users", {
      method: "POST",
      body: JSON.stringify(newUser),
    }),
  updateUser: (id: number, userData: Partial<NewUser>) =>
    apiCall<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  deleteUser: (id: number) =>
    apiCall<void>(`/users/${id}`, {
      method: "DELETE",
    }),
};

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
};

// Enrollment API functions
export const enrollmentApi = {
  getUserEnrollments: (userId: number) =>
    apiCall<Enrollment[]>(`/users/${userId}/albums`),
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
};

// Quiz API functions
export const quizApi = {
  getQuizByCourseId: (courseId: number) =>
    apiCall<QuizQuestion[]>(`/posts/${courseId}/comments`),
  submitQuizAnswers: (courseId: number, answers: number[]) =>
    apiCall<{ score: number; results: unknown[] }>("/comments", {
      method: "POST",
      body: JSON.stringify({ courseId, answers }),
    }),
};

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
};

// Auth API functions
export const authApi = {
  login: (email: string, password: string) =>
    apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: async () => {
    // No server communication, just clear token and redirect
    const { removeAuthTokens } = await import("@/lib/utils");
    removeAuthTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return;
  },
  getCurrentUser: () =>
    apiCall<{ user: User }>("/auth/me", {
      method: "GET",
    }),
};
