import "./styles/global.css";
import { useMutation, useQuery } from "@apollo/client";
import { Course } from "./types.ts";
import { MUTATIONS, QUERIES } from "./graphql/index.ts";
import { CourseItem } from "./components/CourseItem.tsx";
import { useState } from "preact/hooks";
import { useTranslation } from "preact-i18next";

export function App() {
  const { t } = useTranslation();
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  // Queries
  const { loading, error, data, refetch } = useQuery(QUERIES.GET_COURSES);

  // Mutations
  const [createCourse] = useMutation(MUTATIONS.CREATE_COURSE, {
    onCompleted: (data) => {
      refetch();
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
    onCompleted: () => {
      refetch();
    },
  });
  const [updateAssignment] = useMutation(MUTATIONS.UPDATE_ASSIGNMENT, {
    onCompleted: () => refetch(),
  });
  const [deleteAssignment] = useMutation(MUTATIONS.DELETE_ASSIGNMENT, {
    onCompleted: () => refetch(),
  });

  // Loading and error states
  if (loading) return <p>{t("app.loading")}</p>;
  if (error) return <p>{t("app.error")}</p>;

  const handleCourseChange = (courseId: string, value: string) => {
    updateCourse({
      variables: {
        id: courseId,
        name: value,
      },
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse({
      variables: {
        id: courseId,
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

  const handleDeleteAssignment = (assignmentId: string) => {
    deleteAssignment({
      variables: {
        id: assignmentId,
      },
    });
  };

  const handleAddAssignment = (courseId: string, assignmentData: {
    name: string;
    grade: number;
    weight: number;
  }) => {
    if (!assignmentData.name) return;

    createAssignment({
      variables: {
        name: assignmentData.name,
        grade: assignmentData.grade,
        weight: assignmentData.weight,
        courseId: courseId,
      },
    });
  };

  const handleCreateCourse = (name: string) => {
    createCourse({
      variables: {
        name,
      },
    });
  };

  const handleAddCourse = () => {
    handleCreateCourse(newCourseName);
    setIsAddingCourse(false);
    setNewCourseName(t("course.newCourse"));
  };

  return (
    <div class="courses">
      {data.courses.map((course: Course) => (
        <CourseItem
          key={course.id}
          course={course}
          onCourseChange={handleCourseChange}
          onDeleteCourse={handleDeleteCourse}
          onAssignmentChange={handleAssignmentChange}
          onDeleteAssignment={handleDeleteAssignment}
          onAddAssignment={handleAddAssignment}
        />
      ))}

      {isAddingCourse
        ? (
          <div class="add-course-form">
            <input
              type="text"
              value={newCourseName}
              onChange={(e) =>
                setNewCourseName((e.target as HTMLInputElement).value)}
              placeholder={t("course.courseName")}
              autoFocus
            />
            <div class="add-course-actions">
              <button
                type="button"
                onClick={handleAddCourse}
                class="add-button"
              >
                {t("course.addCourse")}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCourse(false)}
                class="cancel-button"
              >
                {t("course.cancel")}
              </button>
            </div>
          </div>
        )
        : (
          <button
            type="button"
            class="add-course-button"
            onClick={() => setIsAddingCourse(true)}
          >
            {t("course.addCourseButton")}
          </button>
        )}
    </div>
  );
}
