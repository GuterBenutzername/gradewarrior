import "./app.css";
import { useMutation, useQuery } from "@apollo/client";
import { Assignment, Course } from "./types.ts";
import { useState } from "preact/hooks";
import { MUTATIONS, QUERIES } from "./graphql/index.ts";

export function App() {
  // State for new assignment form
  const [newAssignmentData, setNewAssignmentData] = useState<{
    courseId: string | null;
    name: string;
    grade: number;
    weight: number;
  }>({
    courseId: null,
    name: "",
    grade: 0,
    weight: 0,
  });
  
  // Queries
  const { loading, error, data, refetch } = useQuery(QUERIES.GET_COURSES);

  // Mutations
  const [_createCourse] = useMutation(MUTATIONS.CREATE_COURSE);
  const [updateCourse] = useMutation(MUTATIONS.UPDATE_COURSE, {
    onCompleted: () => refetch(),
  });
  const [_deleteCourse] = useMutation(MUTATIONS.DELETE_COURSE);
  const [createAssignment] = useMutation(MUTATIONS.CREATE_ASSIGNMENT, {
    onCompleted: () => {
      refetch();
      setNewAssignmentData({
        courseId: null,
        name: "",
        grade: 0,
        weight: 0,
      });
    },
  });
  const [updateAssignment] = useMutation(MUTATIONS.UPDATE_ASSIGNMENT, {
    onCompleted: () => refetch(),
  });
  const [_deleteAssignment] = useMutation(MUTATIONS.DELETE_ASSIGNMENT);

  // Loading and error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const handleCourseChange = (courseId: string, value: string) => {
    updateCourse({
      variables: {
        id: courseId,
        name: value,
      },
    });
  };

  const handleAssignmentChange = (
    assignmentId: string,
    field: string,
    value: string | number,
  ) => {
    const variables: {
      id: string;
      name?: string;
      grade?: number;
      weight?: number;
    } = { id: assignmentId };
    
    if (field === "name") {
      variables.name = value as string;
    } else if (field === "grade" || field === "weight") {
      variables[field] = parseFloat(value as string);
    }

    updateAssignment({ variables });
  };
  
  const handleAddAssignment = (courseId: string) => {
    if (!newAssignmentData.name) return;
    
    createAssignment({
      variables: {
        name: newAssignmentData.name,
        grade: newAssignmentData.grade,
        weight: newAssignmentData.weight,
        courseId: courseId,
      },
    });
  };
  
  const handleNewAssignmentChange = (field: string, value: string | number) => {
    setNewAssignmentData({
      ...newAssignmentData,
      [field]: field === "grade" || field === "weight" ? parseFloat(value as string) || 0 : value,
    });
  };

  return (
    <div class="courses">
      {data.courses.map((course: Course) => {
        return (
          <div key={course.id} class="course-container">
            <input
              type="text"
              class="course-name-input"
              value={course.name}
              onChange={(e) =>
                handleCourseChange(
                  course.id,
                  (e.target as HTMLInputElement).value,
                )}
            />
            <ul class="assignment-list">
              {course.assignments.map((assignment: Assignment) => {
                return (
                  <li class="assignment-container" key={assignment.id}>
                    <input
                      type="text"
                      class="assignment-name-input"
                      value={assignment.name}
                      onChange={(e) =>
                        handleAssignmentChange(
                          assignment.id,
                          "name",
                          (e.target as HTMLInputElement).value,
                        )}
                    />
                    <input
                      type="number"
                      class="assignment-grade-input"
                      value={assignment.grade}
                      onChange={(e) =>
                        handleAssignmentChange(
                          assignment.id,
                          "grade",
                          (e.target as HTMLInputElement).value,
                        )}
                    />
                    <input
                      type="number"
                      class="assignment-weight-input"
                      value={assignment.weight}
                      onChange={(e) =>
                        handleAssignmentChange(
                          assignment.id,
                          "weight",
                          (e.target as HTMLInputElement).value,
                        )}
                    />
                  </li>
                );
              })}
              
              {/* Add new assignment form */}
              <li class="new-assignment-form">
                <input
                  type="text"
                  class="assignment-name-input"
                  placeholder="New assignment name"
                  value={newAssignmentData.name}
                  onChange={(e) =>
                    handleNewAssignmentChange(
                      "name",
                      (e.target as HTMLInputElement).value,
                    )}
                />
                <input
                  type="number"
                  class="assignment-grade-input"
                  placeholder="Grade"
                  value={newAssignmentData.grade}
                  onChange={(e) =>
                    handleNewAssignmentChange(
                      "grade",
                      (e.target as HTMLInputElement).value,
                    )}
                />
                <input
                  type="number"
                  class="assignment-weight-input"
                  placeholder="Weight"
                  value={newAssignmentData.weight}
                  onChange={(e) =>
                    handleNewAssignmentChange(
                      "weight",
                      (e.target as HTMLInputElement).value,
                    )}
                />
                <button 
                  type="button"
                  class="add-assignment-button"
                  onClick={() => handleAddAssignment(course.id)}
                >
                  Add
                </button>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}
