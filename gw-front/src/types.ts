/**
 * Types generated from GraphQL schema
 */

// Type definitions
export interface Assignment {
  id: string;
  name: string;
  grade: number;
  weight: number;
  isTheoretical: boolean;
}

export interface Course {
  id: string;
  name: string;
  assignments: Assignment[];
  theoreticalAssignments: Assignment[];
}

export interface User {
  id: string;
  name: string;
  courses: Course[];
}

// Query input types
export interface UserQueryInput {
  id: string;
}

export interface CourseQueryInput {
  id: string;
}

export interface AssignmentQueryInput {
  id: string;
}

// Mutation input types
export interface CreateUserInput {
  name: string;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
}

export interface CreateCourseInput {
  name: string;
}

export interface UpdateCourseInput {
  id: string;
  name?: string;
}

export interface CreateAssignmentInput {
  name: string;
  grade: number;
  weight: number;
  courseId: string;
  isTheoretical?: boolean;
}

export interface UpdateAssignmentInput {
  id: string;
  name?: string;
  grade?: number;
  weight?: number;
  isTheoretical?: boolean;
}

export interface DeleteInput {
  id: string;
}

export interface AddAssignmentToCourseInput {
  courseId: string;
  assignmentId: string;
}
