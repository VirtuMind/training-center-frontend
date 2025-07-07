const API_BASE_URL = "http://localhost:8080/api"; // Backend api spring
// Interface for authentication

// Import course types from course-types.ts
import {
  CourseRequest,
  CourseRequestUpdate,
  CourseResponse,
  QuizResponse,
} from "./course-types";
import {
  ApiResponse,
  AuthResponse,
  DashboardEnrollment,
  Enrollment,
  NewUser,
  ReviewRequest,
  ReviewResponse,
  StudentProgressResponse,
  TrainerCourse,
  User,
} from "./types";

// Keep TrainerCourse type in api.ts since it's used for listing trainer's courses

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
  getCourses: () => apiCall<CourseResponse[]>("/courses"),
  getCourseById: (id: number) => apiCall<CourseResponse>(`/courses/${id}`),
  getCoursesByTrainerId: (trainerId: number) =>
    apiCall<TrainerCourse[]>(`/courses/trainer/${trainerId}`),
  getCourseDetailsForEditById: (courseId: number) =>
    apiCall<CourseResponse>(`/courses/trainer/details/${courseId}`),

  // Create course with embedded files
  createCourse: async (courseRequest: CourseRequest) => {
    try {
      const { getAccessToken } = await import("@/lib/utils");
      const token = getAccessToken();

      const formData = new FormData();

      // Validate that coverImage exists
      if (!courseRequest.coverImage) {
        throw new Error("Cover image is required");
      }

      // Add cover image
      formData.append("coverImage", courseRequest.coverImage);

      // Add basic course data (excluding coverImage since it's a file)
      formData.append("title", courseRequest.title);
      if (courseRequest.description) {
        formData.append("description", courseRequest.description);
      }
      formData.append("level", courseRequest.level);
      formData.append("duration", courseRequest.duration);
      formData.append("categoryId", courseRequest.categoryId.toString());

      // Add modules as JSON (excluding video files)
      const modulesData = courseRequest.modules.map((module) => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || "",
          // video is handled separately
        })),
      }));
      formData.append("modules", JSON.stringify(modulesData));

      // Add lesson videos
      courseRequest.modules.forEach((module, moduleIndex) => {
        module.lessons.forEach((lesson, lessonIndex) => {
          if (lesson.video) {
            // Use a naming convention that the backend can parse
            formData.append(
              `video_${moduleIndex}_${lessonIndex}`, // ← key Spring will see
              lesson.video,
              lesson.video.name
            );
          }
        });
      });

      // Add quiz if present
      if (courseRequest.quiz && courseRequest.quiz.questions.length > 0) {
        const quizData = {
          questions: courseRequest.quiz.questions.map((question) => ({
            id: question.id,
            question: question.question,
            answers: question.answers.map((answer) => ({
              id: answer.id,
              answer: answer.answer,
              correct: answer.correct,
            })),
          })),
        };
        formData.append("quiz", JSON.stringify(quizData));
      }

      // log the formData for debugging
      console.log("formData:", Object.fromEntries(formData.entries()));

      // Make the request
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      // Handle unauthorized
      if (response.status === 401) {
        const { removeAuthTokens } = await import("@/lib/utils");
        removeAuthTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      const responseData = await response.json();

      if (response.ok) {
        return responseData;
      } else {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message:
              responseData.message || `HTTP error! status: ${response.status}`,
            details: responseData.details,
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
  },

  // Update course with embedded files
  updateCourse: async (
    id: number,
    courseRequest: Partial<CourseRequestUpdate>
  ) => {
    try {
      const { getAccessToken } = await import("@/lib/utils");
      const token = getAccessToken();

      const formData = new FormData();

      // Add cover image if provided
      if (courseRequest.coverImage) {
        formData.append("coverImage", courseRequest.coverImage);
      }

      // Add basic course data (excluding coverImage since it's a file)
      if (courseRequest.title) {
        formData.append("title", courseRequest.title);
      }
      if (courseRequest.description) {
        formData.append("description", courseRequest.description);
      }
      if (courseRequest.level) {
        formData.append("level", courseRequest.level);
      }
      if (courseRequest.duration) {
        formData.append("duration", courseRequest.duration);
      }
      if (courseRequest.categoryId) {
        formData.append("categoryId", courseRequest.categoryId.toString());
      }
      if (courseRequest.coverImageUrl) {
        formData.append("coverImageUrl", courseRequest.coverImageUrl);
      }
      if (courseRequest.coverImage) {
        formData.append("coverImage", courseRequest.coverImage);
      }

      // Add modules as JSON (excluding video files)
      if (courseRequest.modules) {
        const modulesData = courseRequest.modules.map((module) => ({
          id: module.id,
          title: module.title,
          lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration || "",
            // video is handled separately
          })),
        }));
        formData.append("modules", JSON.stringify(modulesData));

        // Add lesson videos
        courseRequest.modules.forEach((module, moduleIndex) => {
          module.lessons.forEach((lesson, lessonIndex) => {
            if (lesson.video) {
              // Use a naming convention that the backend can parse
              formData.append(
                `video_${moduleIndex}_${lessonIndex}`, // ← key Spring will see
                lesson.video,
                lesson.video.name
              );
            }
          });
        });
      }

      // Add quiz if present
      if (courseRequest.quiz && courseRequest.quiz.questions.length > 0) {
        const quizData = {
          questions: courseRequest.quiz.questions.map((question) => ({
            id: question.id,
            question: question.question,
            answers: question.answers.map((answer) => ({
              id: answer.id,
              answer: answer.answer,
              correct: answer.correct,
            })),
          })),
        };
        formData.append("quiz", JSON.stringify(quizData));
      }

      // log the formData for debugging
      console.log(
        "updateCourse formData:",
        Object.fromEntries(formData.entries())
      );

      // Make the request
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      // Handle unauthorized
      if (response.status === 401) {
        const { removeAuthTokens } = await import("@/lib/utils");
        removeAuthTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      const responseData = await response.json();

      if (response.ok) {
        return responseData;
      } else {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message:
              responseData.message || `HTTP error! status: ${response.status}`,
            details: responseData.details,
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
  },

  deleteCourse: (id: number) =>
    apiCall<void>(`/courses/${id}`, {
      method: "DELETE",
    }),
};

// Enrollment API functions
export const enrollmentApi = {
  getStudentEnrollments: () =>
    apiCall<DashboardEnrollment[]>(`/enrollments/student`, {
      method: "GET",
    }),
  enrollUser: (courseId: number) =>
    apiCall<Enrollment>(`/enrollments/${courseId}`, {
      method: "POST",
    }),
  getStudentEnrollmentsProgress: () =>
    apiCall<DashboardEnrollment[]>(`/enrollments/progress/student`, {
      method: "GET",
    }),

  getStudentsProgressByTrainerId: (trainerId: number) =>
    apiCall<StudentProgressResponse[]>(
      `/enrollments/progress/trainer/${trainerId}`
    ),

  // Toggle lesson completion status
  toggleLessonCompletion: (lessonId: number) =>
    apiCall<{ lessonId: number; completed: boolean }>(
      `/enrollments/lessons/toggle-completion/${lessonId}`,
      {
        method: "POST",
      }
    ),
  submitReview: (reviewRequest: ReviewRequest) =>
    apiCall<ReviewResponse>(`/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewRequest),
    }),
};

// Quiz API functions
export const quizApi = {
  getQuizByCourseId: (courseId: number) =>
    apiCall<QuizResponse>(`/quiz/${courseId}`, {
      method: "GET",
    }),
  submitQuizAnswers: (courseId: number, score: number) =>
    apiCall<object>(`/quiz/submit`, {
      method: "POST",
      body: JSON.stringify({ courseId: courseId, score: score }),
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
