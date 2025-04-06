import "./app.css";
import { useQuery, useMutation } from "@apollo/client";
import { Assignment, Course } from "./types.ts";
import { useState } from "preact/hooks";
import { QUERIES, MUTATIONS } from "./graphql/index.ts";

// Components
import AssignmentForm from "./components/AssignmentForm.tsx";
import AssignmentItem from "./components/AssignmentItem.tsx";
import CourseForm from "./components/CourseForm.tsx";
import CourseHeader from "./components/CourseHeader.tsx";

// Initial state values
const initialAssignmentData = {
  name: "",
  grade: 0,
  weight: 0,
  courseId: null as string | null
};

export function App() {
  // Queries
  const { loading, error, data, refetch } = useQuery(QUERIES.GET_COURSES);

  // State management
  const [newCourseName, setNewCourseName] = useState("");
  const [showNewCourseInput, setShowNewCourseInput] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState("");
  const [newAssignmentData, setNewAssignmentData] = useState({...initialAssignmentData});

  // Mutations
  const [createCourse] = useMutation(MUTATIONS.CREATE_COURSE);
  const [updateCourse] = useMutation(MUTATIONS.UPDATE_COURSE);
  const [deleteCourse] = useMutation(MUTATIONS.DELETE_COURSE);
  const [createAssignment] = useMutation(MUTATIONS.CREATE_ASSIGNMENT);
  const [updateAssignment] = useMutation(MUTATIONS.UPDATE_ASSIGNMENT);
  const [deleteAssignment] = useMutation(MUTATIONS.DELETE_ASSIGNMENT);

  // Loading and error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  // Handlers for assignments
  const handleUpdateAssignment = (id: string, field: 'grade' | 'name' | 'weight', value: string | number) => {
    // deno-lint-ignore no-explicit-any
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
        ...initialAssignmentData,
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
    setNewAssignmentData({...initialAssignmentData});
    refetch();
  };

  // Handlers for courses
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
            <CourseForm
              name={newCourseName}
              onNameChange={setNewCourseName}
              onSubmit={handleCreateCourse}
              onCancel={() => setShowNewCourseInput(false)}
            />
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
            <CourseHeader
              course={course}
              isEditing={editingCourseId === course.id}
              editName={editingCourseName}
              onEditStart={() => startEditingCourse(course)}
              onEditChange={setEditingCourseName}
              onEditSave={() => handleUpdateCourse(course.id, editingCourseName)}
              onDelete={() => handleDeleteCourse(course.id)}
            />

            {course.assignments.length === 0 ? (
              <div className="empty-assignments"></div>
            ) : (
              <ul>
                {course.assignments.map((assignment: Assignment) => (
                  <AssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onUpdate={handleUpdateAssignment}
                    onDelete={handleDeleteAssignment}
                  />
                ))}
              </ul>
            )}
            
            {/* New Assignment Form */}
            <li className="new-assignment-form">
              {newAssignmentData.courseId === course.id ? (
                <AssignmentForm
                  data={newAssignmentData}
                  onSubmit={() => handleCreateAssignment(course.id)}
                  onCancel={() => setNewAssignmentData({...initialAssignmentData})}
                />
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