import { ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { useMutation, useQuery } from "@apollo/client";
import { Course, UpdateAssignmentInput, UpdateCourseInput } from "../types.ts";
import { MUTATIONS, QUERIES } from "../graphql/index.ts";

// Type for pending changes tracking
type PendingChange = [
  "course" | "assignment",
  "update" | "delete",
  UpdateCourseInput | UpdateAssignmentInput | { id: number },
];

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  error: { message: string } | undefined;
  pendingChanges: Map<string, PendingChange>;
  handleCourseNameChange: (courseId: string, name: string) => void;
  handleDeleteCourse: (courseId: string) => void;
  handleCreateCourse: (name: string) => Promise<Course | null>;
  handleAssignmentChange: (
    assignmentId: string,
    field: string,
    value: string | number,
  ) => void;
  handleDeleteAssignment: (assignmentId: string) => void;
  handleAddAssignment: (
    courseId: string,
    assignmentData: {
      name: string;
      grade: number;
      weight: number;
      isTheoretical: boolean;
    },
  ) => Promise<void>;
  handleSyncTheoreticalAssignments: (courseId: string) => Promise<void>;
  handleSyncNow: () => void;
  handleBlur: () => void;
}

const CourseContext = createContext<CourseContextType | null>(null);

export function CourseProvider({ children }: { children: ComponentChildren }) {
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, PendingChange>
  >(new Map());
  const pendingTimeoutRef = useRef<number | null>(null);

  // GraphQL Queries
  const { loading, error, data, refetch } = useQuery(QUERIES.GET_COURSES, {
    fetchPolicy: "cache-and-network",
  });

  // GraphQL Mutations
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

  // Pending changes management
  const schedulePendingChange = (
    type: "course" | "assignment",
    id: string,
    action: "delete" | "update",
    payload: UpdateCourseInput | UpdateAssignmentInput | { id: number },
  ) => {
    setPendingChanges((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, [type, action, payload]);
      return newMap;
    });
  };

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

  // Schedule debounced processing of pending changes
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

  // Force sync with server immediately
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

  // Course operations
  const handleCreateCourse = async (name: string): Promise<Course | null> => {
    try {
      const result = await createCourse({
        variables: { name },
      });

      if (result.data?.createCourse) {
        const newCourse = {
          ...result.data.createCourse,
          assignments: [],
          theoreticalAssignments: [],
        };
        setCourses((prevCourses) => [...prevCourses, newCourse]);
        return newCourse;
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
    return null;
  };

  const handleCourseNameChange = (courseId: string, name: string) => {
    // Update local state immediately
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId ? { ...course, name } : course
      )
    );

    // Schedule the API update
    schedulePendingChange("course", courseId, "update", {
      id: courseId,
      name,
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

  // Assignment operations
  const handleAddAssignment = async (courseId: string, assignmentData: {
    name: string;
    grade: number;
    weight: number;
    isTheoretical: boolean;
  }) => {
    if (!assignmentData.name) return;

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

      if (result.data?.createAssignment) {
        const newAssignment = result.data.createAssignment;
        setCourses((prevCourses) =>
          prevCourses.map((course) => {
            if (course.id === courseId) {
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

  const handleAssignmentChange = (
    assignmentId: string,
    field: string,
    value: string | number,
  ) => {
    // Update local state immediately
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        // Find and update in real assignments
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

        // Find and update in theoretical assignments
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

    // Find the assignment's isTheoretical value
    let isTheoretical = false;

    // Look in all courses for the assignment
    for (const course of courses) {
      const realAssignment = course.assignments.find((a) =>
        a.id === assignmentId
      );
      if (realAssignment) {
        isTheoretical = !!realAssignment.isTheoretical;
        break;
      }

      const theoreticalAssignment = course.theoreticalAssignments.find((a) =>
        a.id === assignmentId
      );
      if (theoreticalAssignment) {
        isTheoretical = !!theoreticalAssignment.isTheoretical;
        break;
      }
    }

    // Always include isTheoretical in the update
    variables.isTheoretical = isTheoretical;

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

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        pendingChanges,
        handleCourseNameChange,
        handleDeleteCourse,
        handleCreateCourse,
        handleAssignmentChange,
        handleDeleteAssignment,
        handleAddAssignment,
        handleSyncTheoreticalAssignments,
        handleSyncNow,
        handleBlur,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses(): CourseContextType {
  const context: CourseContextType = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
}
