import "./app.css";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Assignment, Course } from "./types.ts";
import { useState } from "preact/hooks";

export function App() {
  const { loading, error, data, refetch } = useQuery(gql`
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
    `);

  const [newCourseName, setNewCourseName] = useState("");
  const [showNewCourseInput, setShowNewCourseInput] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState("");

  const [newAssignmentData, setNewAssignmentData] = useState<{
    name: string;
    grade: number;
    weight: number;
    courseId: string | null;
  }>({
    name: "",
    grade: 0,
    weight: 0,
    courseId: null
  });

  const [createCourse] = useMutation(gql`
    mutation CreateCourse($name: String!) {
      createCourse(input: {name: $name}) {
        id
        name
      }
    }
  `);

  const [updateCourse] = useMutation(gql`
    mutation UpdateCourse($id: ID!, $name: String) {
      updateCourse(input: {id: $id, name: $name}) {
        id
        name
      }
    }
  `);

  const [deleteCourse] = useMutation(gql`
    mutation DeleteCourse($id: ID!) {
      deleteCourse(id: $id)
    }
  `);

  const [createAssignment] = useMutation(gql`
    mutation CreateAssignment($name: String!, $grade: Float!, $weight: Float!, $courseId: ID!) {
      createAssignment(input: {name: $name, grade: $grade, weight: $weight, courseId: $courseId}) {
        id
        name
        grade
        weight
      }
    }
  `);

  const [updateAssignment] = useMutation(gql`
    mutation UpdateAssignment($id: ID!, $grade: Float, $name: String, $weight: Float) {
      updateAssignment(input: {id: $id, grade: $grade, name: $name, weight: $weight}) {
        id
        grade
        name
        weight
      }
    }
  `);

  const [deleteAssignment] = useMutation(gql`
    mutation DeleteAssignment($id: ID!) {
      deleteAssignment(id: $id)
    }
  `);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const handleUpdateAssignment = (id: string, field: 'grade' | 'name' | 'weight', value: string | number) => {
    const variables: any = { id };
    variables[field] = typeof value === 'string' && field !== 'name' ? parseFloat(value) : value;
    updateAssignment({ variables });
  };

  const handleDeleteAssignment = async (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      await deleteAssignment({
        variables: { id },
        update: (cache) => {
          cache.evict({ id: `Assignment:${id}` });
          cache.gc();
        }
      });
      refetch();
    }
  };

  const handleCreateAssignment = async (courseId: string) => {
    if (!newAssignmentData.name || newAssignmentData.courseId !== courseId) {
      // Reset form and select this course
      setNewAssignmentData({
        name: "",
        grade: 0,
        weight: 0,
        courseId
      });
      return;
    }

    await createAssignment({
      variables: {
        name: newAssignmentData.name,
        grade: newAssignmentData.grade,
        weight: newAssignmentData.weight,
        courseId
      }
    });

    // Reset form
    setNewAssignmentData({
      name: "",
      grade: 0,
      weight: 0,
      courseId: null
    });

    refetch();
  };

  const handleCreateCourse = async () => {
    if (!newCourseName) {
      setShowNewCourseInput(true);
      return;
    }

    await createCourse({
      variables: {
        name: newCourseName
      }
    });

    // Reset form
    setNewCourseName("");
    setShowNewCourseInput(false);
    refetch();
  };

  const handleUpdateCourse = async (id: string, name: string) => {
    await updateCourse({
      variables: {
        id,
        name
      }
    });
    setEditingCourseId(null);
    refetch();
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm("Are you sure you want to delete this course and all its assignments?")) {
      await deleteCourse({
        variables: { id },
        update: (cache) => {
          cache.evict({ id: `Course:${id}` });
          cache.gc();
        }
      });
      refetch();
    }
  };

  const startEditingCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setEditingCourseName(course.name);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>GradeWarrior</h1>
        <div className="actions">
          {showNewCourseInput ? (
            <div className="new-course-form">
              <input
                type="text"
                placeholder="Course name"
                value={newCourseName}
                onChange={(e) => {
                  if (e.target instanceof HTMLInputElement) {
                    setNewCourseName(e.target.value);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCourseName) {
                    handleCreateCourse();
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="add-btn"
                onClick={handleCreateCourse}
                disabled={!newCourseName}
              >
                Add
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowNewCourseInput(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-course-btn"
              onClick={() => setShowNewCourseInput(true)}
            >
              + Add Course
            </button>
          )}
        </div>
      </header>

      {data.courses.length === 0 ? (
        <div className="empty-state">
          <p>No courses yet. Add a course to get started!</p>
        </div>
      ) : (
        data.courses.map((course: Course) => (
          <div key={course.id} className="course">
            <div className="course-header">
              {editingCourseId === course.id ? (
                <div className="edit-course-name">
                  <input
                    type="text"
                    className="course-name-input"
                    value={editingCourseName}
                    onChange={(e) => {
                      if (e.target instanceof HTMLInputElement) {
                        setEditingCourseName(e.target.value);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                        handleUpdateCourse(course.id, editingCourseName);
                      }
                    }}
                    onBlur={() => {
                      if (editingCourseName !== course.name) {
                        handleUpdateCourse(course.id, editingCourseName);
                      } else {
                        setEditingCourseId(null);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="save-btn"
                    onClick={() => handleUpdateCourse(course.id, editingCourseName)}
                    disabled={!editingCourseName}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h2>{course.name}</h2>
                  <div className="course-actions">
                    <button
                      type="button"
                      className="edit-course-btn"
                      onClick={() => startEditingCourse(course)}
                      aria-label="Edit course"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-course-btn"
                      onClick={() => handleDeleteCourse(course.id)}
                      aria-label="Delete course"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            {course.assignments.length === 0 ? (
              <div className="empty-assignments">
              </div>
            ) : (
              <ul>
                {course.assignments.map((assignment: Assignment) => (
                  <li key={assignment.id}>
                    <div className="assignment-info">
                      <input
                        type="text"
                        className="name-input"
                        value={assignment.name}
                        onBlur={(e) => {
                          if (e.target instanceof HTMLInputElement && e.target.value !== assignment.name) {
                            handleUpdateAssignment(assignment.id, 'name', e.target.value);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                            e.target.blur();
                          }
                        }}
                      />
                      <div className="weight-container">
                        <input
                          type="number"
                          className="weight-input"
                          value={assignment.weight}
                          min="0"
                          max="100"
                          onBlur={(e) => {
                            if (e.target instanceof HTMLInputElement && parseFloat(e.target.value) !== assignment.weight) {
                              handleUpdateAssignment(assignment.id, 'weight', e.target.value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                              e.target.blur();
                            }
                          }}
                        />
                        <span className="weight-symbol">%</span>
                      </div>
                    </div>
                    <div className="assignment-grade">
                      <input
                        type="number"
                        className="grade-input"
                        value={assignment.grade}
                        onBlur={(e) => {
                          if (e.target instanceof HTMLInputElement && parseFloat(e.target.value) !== assignment.grade) {
                            handleUpdateAssignment(assignment.id, 'grade', e.target.value);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                            e.target.blur();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        aria-label="Delete assignment"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}

              </ul>
            )}
            {/* New Assignment Form */}
            <li className="new-assignment-form">
              {newAssignmentData.courseId === course.id ? (
                <>
                  <div className="assignment-info">
                    <input
                      type="text"
                      className="name-input"
                      placeholder="New assignment name"
                      value={newAssignmentData.name}
                      onChange={(e) => {
                        if (e.target instanceof HTMLInputElement) {
                          setNewAssignmentData({
                            ...newAssignmentData,
                            name: e.target.value
                          });
                        }
                      }}
                    />
                    <div className="weight-container">
                      <input
                        type="number"
                        className="weight-input"
                        placeholder="Weight"
                        value={newAssignmentData.weight}
                        min="0"
                        max="100"
                        onChange={(e) => {
                          if (e.target instanceof HTMLInputElement) {
                            setNewAssignmentData({
                              ...newAssignmentData,
                              weight: parseFloat(e.target.value) || 0
                            });
                          }
                        }}
                      />
                      <span className="weight-symbol">%</span>
                    </div>
                  </div>
                  <div className="assignment-grade">
                    <input
                      type="number"
                      className="grade-input"
                      placeholder="Grade"
                      value={newAssignmentData.grade}
                      onChange={(e) => {
                        if (e.target instanceof HTMLInputElement) {
                          setNewAssignmentData({
                            ...newAssignmentData,
                            grade: parseFloat(e.target.value) || 0
                          });
                        }
                      }}
                    />
                    <div className="assignment-actions">
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => handleCreateAssignment(course.id)}
                        disabled={!newAssignmentData.name}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setNewAssignmentData({
                          name: "",
                          grade: 0,
                          weight: 0,
                          courseId: null
                        })}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="add-assignment-btn"
                  onClick={() => handleCreateAssignment(course.id)}
                >
                  + Add Assignment
                </button>
              )}
            </li>

          </div>
        ))
      )}
    </div>
  );
}