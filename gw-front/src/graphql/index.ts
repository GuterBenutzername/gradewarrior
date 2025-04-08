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
    mutation CreateAssignment($name: String!, $grade: Float!, $weight: Float!, $courseId: ID!) {
      createAssignment(input: {name: $name, grade: $grade, weight: $weight, courseId: $courseId}) {
        id
        name
        grade
        weight
      }
    }
  `,
  UPDATE_ASSIGNMENT: gql`
    mutation UpdateAssignment($id: ID!, $grade: Float, $name: String, $weight: Float) {
      updateAssignment(input: {id: $id, grade: $grade, name: $name, weight: $weight}) {
        id
        grade
        name
        weight
      }
    }
  `,
  DELETE_ASSIGNMENT: gql`
    mutation DeleteAssignment($id: ID!) {
      deleteAssignment(id: $id)
    }
  `,
};
