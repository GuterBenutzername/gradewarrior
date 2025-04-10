import { gql } from "@apollo/client";

export const QUERIES = {
  GET_COURSES: gql`
    query GetCourses {
      courses {
        name
        id
        assignments {
          name
          grade
          weight
          id
          isTheoretical
        }
        theoreticalAssignments {
          name
          grade
          weight
          id
          isTheoretical
        }
      }
    }
  `,
};

export const MUTATIONS = {
  CREATE_COURSE: gql`
    mutation CreateCourse($name: String!) {
      createCourse(input: {name: $name}) {
        id
        name
      }
    }
  `,
  UPDATE_COURSE: gql`
    mutation UpdateCourse($id: ID!, $name: String) {
      updateCourse(input: {id: $id, name: $name}) {
        id
        name
      }
    }
  `,
  DELETE_COURSE: gql`
    mutation DeleteCourse($id: ID!) {
      deleteCourse(id: $id)
    }
  `,
  CREATE_ASSIGNMENT: gql`
    mutation CreateAssignment($name: String!, $grade: Float!, $weight: Float!, $courseId: ID!, $isTheoretical: Boolean) {
      createAssignment(input: {name: $name, grade: $grade, weight: $weight, courseId: $courseId, isTheoretical: $isTheoretical}) {
        id
        name
        grade
        weight
        isTheoretical
      }
    }
  `,
  UPDATE_ASSIGNMENT: gql`
    mutation UpdateAssignment($id: ID!, $grade: Float, $name: String, $weight: Float, $isTheoretical: Boolean) {
      updateAssignment(input: {id: $id, grade: $grade, name: $name, weight: $weight, isTheoretical: $isTheoretical}) {
        id
        grade
        name
        weight
        isTheoretical
      }
    }
  `,
  DELETE_ASSIGNMENT: gql`
    mutation DeleteAssignment($id: ID!) {
      deleteAssignment(id: $id)
    }
  `,
  SYNC_THEORETICAL_ASSIGNMENTS: gql`
    mutation SyncTheoreticalAssignments($courseId: ID!) {
      syncTheoreticalAssignments(courseId: $courseId) {
        id
        name
        grade
        weight
        isTheoretical
      }
    }
  `,
};
