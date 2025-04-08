import "./app.css";
import { useMutation, useQuery } from "@apollo/client";
import { Assignment, Course } from "./types.ts";
import { useState } from "preact/hooks";
import { MUTATIONS, QUERIES } from "./graphql/index.ts";

export function App() {
  // State for new assignment form - tracking each course separately
  const [newAssignmentData, setNewAssignmentData] = useState<{
    [courseId: string]: {
      name: string;
      grade: number;
      weight: number;
    };
  }>({});

  // Queries
  const { loading, error, data, refetch } = useQuery(QUERIES.GET_COURSES);

  // Mutations
  const [createCourse] = useMutation(MUTATIONS.CREATE_COURSE, {
    onCompleted: (data) => {
      refetch();
      // Focus the new course's text field after refetch and render
      setTimeout(() => {
        const newCourseElement = document.querySelector(
          `[data-course-id="${data.createCourse.id}"]`,
        );
        if (newCourseElement) {
          const inputElement = newCourseElement.querySelector(
            ".course-name-input",
          ) as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
            inputElement.setSelectionRange(
              inputElement.value.length,
              inputElement.value.length,
            );
          }
        }
      }, 50);
      return data.createCourse;
    },
  });
  const [updateCourse] = useMutation(MUTATIONS.UPDATE_COURSE, {
    onCompleted: () => refetch(),
  });
  const [deleteCourse] = useMutation(MUTATIONS.DELETE_COURSE, {
    onCompleted: () => refetch(),
  });
  const [createAssignment] = useMutation(MUTATIONS.CREATE_ASSIGNMENT, {
    onCompleted: (data) => {
      refetch();
      // Clear only the specific course's new assignment data
      const courseId = data.createAssignment.courseId;
      setNewAssignmentData({
        ...newAssignmentData,
        [courseId]: { name: "", grade: 0, weight: 0 },
      });
    },
  });
  const [updateAssignment] = useMutation(MUTATIONS.UPDATE_ASSIGNMENT, {
    onCompleted: () => refetch(),
  });
  const [deleteAssignment] = useMutation(MUTATIONS.DELETE_ASSIGNMENT, {
    onCompleted: () => refetch(),
  });

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
    const courseData = newAssignmentData[courseId];
    if (!courseData || !courseData.name) return;

    createAssignment({
      variables: {
        name: courseData.name,
        grade: courseData.grade,
        weight: courseData.weight,
        courseId: courseId,
      },
    });
  };

  const handleNewAssignmentChange = (
    courseId: string,
    field: string,
    value: string | number,
  ) => {
    // Initialize course data if it doesn't exist
    const courseData = newAssignmentData[courseId] ||
      { name: "", grade: 0, weight: 0 };

    setNewAssignmentData({
      ...newAssignmentData,
      [courseId]: {
        ...courseData,
        [field]: field === "grade" || field === "weight"
          ? parseFloat(value as string) || 0
          : value,
      },
    });
  };

  return (
    <div class="courses">
      {data.courses.map((course: Course) => {
        return (
          <div
            key={course.id}
            class="course-container"
            data-course-id={course.id}
          >
            <span class="course-header">
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
              <button
                onClick={() => {
                  deleteCourse({
                    variables: {
                      id: course.id,
                    },
                  });
                }}
                type="button"
                class="delete-course"
              >
                delete course
              </button>
            </span>
            <ul class="assignment-list">
              {course.assignments.map((assignment: Assignment) => {
                return (
                  <li class="assignment-container" key={assignment.id}>
                    <button
                      type="button"
                      class="delete-button"
                      onClick={() => {
                        deleteAssignment({
                          variables: {
                            id: assignment.id,
                          },
                        });
                      }}
                    >
                      X
                    </button>
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
                  value={newAssignmentData[course.id]?.name || ""}
                  onChange={(e) =>
                    handleNewAssignmentChange(
                      course.id,
                      "name",
                      (e.target as HTMLInputElement).value,
                    )}
                />
                <input
                  type="number"
                  class="assignment-grade-input"
                  placeholder="Grade"
                  value={newAssignmentData[course.id]?.grade || 0}
                  onChange={(e) =>
                    handleNewAssignmentChange(
                      course.id,
                      "grade",
                      (e.target as HTMLInputElement).value,
                    )}
                />
                <input
                  type="number"
                  class="assignment-weight-input"
                  placeholder="Weight"
                  value={newAssignmentData[course.id]?.weight || 0}
                  onChange={(e) =>
                    handleNewAssignmentChange(
                      course.id,
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
      <div class="course-container">
        <input
          type="text"
          class="course-name-input"
          value=""
          placeholder="New course name"
          onChange={(e) => {
            const input = e.target as HTMLInputElement;
            const courseName = input.value || "New Course";
            input.value = ""; // Clear the input field
            createCourse({
              variables: {
                name: courseName,
              },
            });
          }}
        />
        <ul class="assignment-list">
          <li class="new-assignment-form">
            <input
              type="text"
              class="assignment-name-input"
              placeholder="New assignment name"
              value={newAssignmentData["new"]?.name || ""}
              onChange={(e) =>
                handleNewAssignmentChange(
                  "new",
                  "name",
                  (e.target as HTMLInputElement).value,
                )}
            />
            <input
              type="number"
              class="assignment-grade-input"
              placeholder="Grade"
              value={newAssignmentData["new"]?.grade || 0}
              onChange={(e) =>
                handleNewAssignmentChange(
                  "new",
                  "grade",
                  (e.target as HTMLInputElement).value,
                )}
            />
            <input
              type="number"
              class="assignment-weight-input"
              placeholder="Weight"
              value={newAssignmentData["new"]?.weight || 0}
              onChange={(e) =>
                handleNewAssignmentChange(
                  "new",
                  "weight",
                  (e.target as HTMLInputElement).value,
                )}
            />
            <button
              type="button"
              class="add-assignment-button"
              onClick={() => {
                const newAssignmentForm = newAssignmentData["new"];
                if (!newAssignmentForm || !newAssignmentForm.name) return;

                createCourse({
                  variables: {
                    name: "New Course",
                  },
                }).then((result) => {
                  const newCourseId = result.data.createCourse.id;
                  createAssignment({
                    variables: {
                      name: newAssignmentForm.name,
                      grade: newAssignmentForm.grade,
                      weight: newAssignmentForm.weight,
                      courseId: newCourseId,
                    },
                  });

                  // Clear the new assignment form
                  setNewAssignmentData({
                    ...newAssignmentData,
                    "new": { name: "", grade: 0, weight: 0 },
                  });
                });
              }}
            >
              Add
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
