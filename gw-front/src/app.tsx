import "./styles/global.css";
import { useMutation, useQuery } from "@apollo/client";
import { Course, UpdateAssignmentInput, UpdateCourseInput } from "./types.ts";
import { MUTATIONS, QUERIES } from "./graphql/index.ts";
import { CourseItem } from "./components/CourseItem.tsx";
import { useEffect, useRef, useState } from "preact/hooks";
import { useTranslation } from "preact-i18next";

export function App() {
  const { t } = useTranslation();
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingChanges, setPendingChanges] = useState<
    Map<
      string,
      [
        string,
        string,
        UpdateCourseInput | UpdateAssignmentInput | { id: number },
      ]
    >
  >(
    new Map(),
  );
  const pendingTimeoutRef = useRef<number | null>(null);

  // Queries
  const { loading, error, data, refetch } = useQuery(QUERIES.GET_COURSES, {
    fetchPolicy: "cache-and-network",
  });

  // Mutations
  const [createCourse] = useMutation(MUTATIONS.CREATE_COURSE);
  const [updateCourse] = useMutation(MUTATIONS.UPDATE_COURSE);
  const [deleteCourse] = useMutation(MUTATIONS.DELETE_COURSE);
  const [createAssignment] = useMutation(MUTATIONS.CREATE_ASSIGNMENT);
  const [updateAssignment] = useMutation(MUTATIONS.UPDATE_ASSIGNMENT);
  const [deleteAssignment] = useMutation(MUTATIONS.DELETE_ASSIGNMENT);
  const [syncTheoreticalAssignments] = useMutation(
    MUTATIONS.SYNC_THEORETICAL_ASSIGNMENTS,
  );

  // Initialize local state from query data
  useEffect(() => {
    if (data?.courses) {
      setCourses(data.courses);
    }
  }, [data]);

  // Process pending changes
  const processPendingChanges = async () => {
    if (pendingChanges.size === 0) return;

    const changes = Array.from(pendingChanges);
    setPendingChanges(new Map());

    for (const [id, change] of changes) {
      const [type, action, payload] = change;

      try {
        if (type === "course") {
          if (action === "update") {
            await updateCourse({ variables: payload });
          } else if (action === "delete") {
            await deleteCourse({ variables: { id } });
          }
        } else if (type === "assignment") {
          if (action === "update") {
            await updateAssignment({ variables: payload });
          } else if (action === "delete") {
            await deleteAssignment({ variables: { id } });
          }
        }
      } catch (error) {
        console.error("Error processing change:", error);
        // Restore the changes to pending if they fail
        setPendingChanges((prev) => {
          const newMap = new Map(prev);
          newMap.set(id, change);
          return newMap;
        });
      }
    }

    // Refetch data after batch processing
    refetch();
  };

  // Schedule processing of pending changes
  useEffect(() => {
    if (pendingChanges.size > 0) {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }

      pendingTimeoutRef.current = setTimeout(() => {
        processPendingChanges();
        pendingTimeoutRef.current = null;
      }, 2000) as unknown as number;
    }

    return () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, [pendingChanges]);

  // Loading and error states
  if (loading && !courses.length) return <p>{t("app.loading")}</p>;
  if (error) return <p>{t("app.error")}</p>;

  const schedulePendingChange = (
    type: string,
    id: string,
    action: string,
    payload: UpdateCourseInput | UpdateAssignmentInput | { id: number },
  ) => {
    setPendingChanges((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, [type, action, payload]);
      return newMap;
    });
  };

  const handleCourseChange = (courseId: string, value: string) => {
    // Update local state immediately
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId ? { ...course, name: value } : course
      )
    );

    // Schedule the API update
    schedulePendingChange("course", courseId, "update", {
      id: courseId,
      name: value,
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    // Update local state immediately
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId)
    );

    // Schedule the API update
    schedulePendingChange("course", courseId, "delete", { id: courseId });
  };

  const handleAssignmentChange = (
    assignmentId: string,
    field: string,
    value: string | number,
  ) => {
    // Update local state immediately
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        // Check in real assignments
        const realAssignmentIndex = course.assignments.findIndex((a) =>
          a.id === assignmentId
        );
        if (realAssignmentIndex >= 0) {
          const updatedAssignments = [...course.assignments];
          updatedAssignments[realAssignmentIndex] = {
            ...updatedAssignments[realAssignmentIndex],
            [field]: field === "grade" || field === "weight"
              ? parseFloat(value as string)
              : value,
          };
          return {
            ...course,
            assignments: updatedAssignments,
          };
        }

        // Check in theoretical assignments
        const theoreticalAssignmentIndex = course.theoreticalAssignments
          .findIndex((a) => a.id === assignmentId);
        if (theoreticalAssignmentIndex >= 0) {
          const updatedTheoreticalAssignments = [
            ...course.theoreticalAssignments,
          ];
          updatedTheoreticalAssignments[theoreticalAssignmentIndex] = {
            ...updatedTheoreticalAssignments[theoreticalAssignmentIndex],
            [field]: field === "grade" || field === "weight"
              ? parseFloat(value as string)
              : value,
          };
          return {
            ...course,
            theoreticalAssignments: updatedTheoreticalAssignments,
          };
        }

        return course;
      })
    );

    // Create variables for the API call
    const variables: {
      id: string;
      name?: string;
      grade?: number;
      weight?: number;
      isTheoretical?: boolean;
    } = { id: assignmentId };

    if (field === "name") {
      variables.name = value as string;
    } else if (field === "grade" || field === "weight") {
      variables[field] = parseFloat(value as string);
    }

    // Find the assignment to get its isTheoretical value
    let isTheoretical: boolean | undefined;

    // Look in all courses for the assignment
    for (const course of courses) {
      // Check in real assignments
      const realAssignment = course.assignments.find((a) =>
        a.id === assignmentId
      );
      if (realAssignment) {
        isTheoretical = realAssignment.isTheoretical;
        break;
      }

      // Check in theoretical assignments
      const theoreticalAssignment = course.theoreticalAssignments.find((a) =>
        a.id === assignmentId
      );
      if (theoreticalAssignment) {
        isTheoretical = theoreticalAssignment.isTheoretical;
        break;
      }
    }

    // Always include isTheoretical in the update to prevent it from being set to null
    variables.isTheoretical = isTheoretical !== undefined
      ? isTheoretical
      : false;

    // Schedule the API update
    schedulePendingChange("assignment", assignmentId, "update", variables);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    // Update local state immediately
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        // Check if the assignment is in the real assignments
        const inRealAssignments = course.assignments.some((a) =>
          a.id === assignmentId
        );
        if (inRealAssignments) {
          return {
            ...course,
            assignments: course.assignments.filter((a) =>
              a.id !== assignmentId
            ),
          };
        }

        // Check if the assignment is in the theoretical assignments
        const inTheoreticalAssignments = course.theoreticalAssignments.some(
          (a) => a.id === assignmentId,
        );
        if (inTheoreticalAssignments) {
          return {
            ...course,
            theoreticalAssignments: course.theoreticalAssignments.filter((a) =>
              a.id !== assignmentId
            ),
          };
        }

        return course;
      })
    );

    // Schedule the API update
    schedulePendingChange("assignment", assignmentId, "delete", {
      id: assignmentId,
    });
  };

  const handleAddAssignment = async (courseId: string, assignmentData: {
    name: string;
    grade: number;
    weight: number;
    isTheoretical: boolean;
  }) => {
    if (!assignmentData.name) return;

    // Create the assignment on the server immediately (we need the new ID)
    try {
      const result = await createAssignment({
        variables: {
          name: assignmentData.name,
          grade: assignmentData.grade,
          weight: assignmentData.weight,
          courseId: courseId,
          isTheoretical: assignmentData.isTheoretical,
        },
      });

      // Update local state with the new assignment including its server-generated ID
      if (result.data?.createAssignment) {
        const newAssignment = result.data.createAssignment;
        setCourses((prevCourses) =>
          prevCourses.map((course) => {
            if (course.id === courseId) {
              // Check if this is a theoretical assignment
              if (newAssignment.isTheoretical) {
                return {
                  ...course,
                  theoreticalAssignments: [
                    ...course.theoreticalAssignments,
                    newAssignment,
                  ],
                };
              } else {
                return {
                  ...course,
                  assignments: [...course.assignments, newAssignment],
                };
              }
            }
            return course;
          })
        );
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  const handleSyncTheoreticalAssignments = async (courseId: string) => {
    try {
      const result = await syncTheoreticalAssignments({
        variables: { courseId },
      });

      if (result.data?.syncTheoreticalAssignments) {
        const theoreticalAssignments = result.data.syncTheoreticalAssignments;

        // Update local state with the new theoretical assignments
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === courseId
              ? {
                ...course,
                theoreticalAssignments: theoreticalAssignments,
              }
              : course
          )
        );
      }
    } catch (error) {
      console.error("Error syncing theoretical assignments:", error);
    }
  };

  const handleCreateCourse = async (name: string) => {
    try {
      const result = await createCourse({
        variables: { name },
      });

      // Update local state with the new course including its server-generated ID
      if (result.data?.createCourse) {
        const newCourse = {
          ...result.data.createCourse,
          assignments: [],
          theoreticalAssignments: [],
        };
        setCourses((prevCourses) => [...prevCourses, newCourse]);
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;

    handleCreateCourse(newCourseName);
    setIsAddingCourse(false);
    setNewCourseName("");
  };

  // Force sync with server
  const handleSyncNow = () => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    processPendingChanges();
  };

  // Add onBlur handlers to components to trigger immediate sync
  const handleBlur = () => {
    if (pendingChanges.size > 0) {
      handleSyncNow();
    }
  };

  return (
    <div class="courses" onBlur={handleBlur}>
      {courses.map((course: Course) => (
        <CourseItem
          key={course.id}
          course={course}
          onCourseChange={handleCourseChange}
          onDeleteCourse={handleDeleteCourse}
          onAssignmentChange={handleAssignmentChange}
          onDeleteAssignment={handleDeleteAssignment}
          onAddAssignment={handleAddAssignment}
          onSyncTheoreticalAssignments={handleSyncTheoreticalAssignments}
          onBlur={handleBlur}
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
              onBlur={handleBlur}
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

      {pendingChanges.size > 0 && (
        <div className="pending-changes">
          <span>{pendingChanges.size} pending changes</span>
          <button type="button" onClick={handleSyncNow} className="sync-button">
            Sync Now
          </button>
        </div>
      )}
    </div>
  );
}
