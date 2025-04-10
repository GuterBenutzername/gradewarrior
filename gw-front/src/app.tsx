import "./styles/global.css";
import { useMutation, useQuery } from "@apollo/client";
import { Course, Assignment } from "./types.ts";
import { MUTATIONS, QUERIES } from "./graphql/index.ts";
import { CourseItem } from "./components/CourseItem.tsx";
import { useState, useEffect, useRef } from "preact/hooks";
import { useTranslation } from "preact-i18next";

export function App() {
  const { t } = useTranslation();
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(new Map());
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
        setPendingChanges(prev => {
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

  const schedulePendingChange = (type: string, id: string, action: string, payload: any) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(id, [type, action, payload]);
      return newMap;
    });
  };

  const handleCourseChange = (courseId: string, value: string) => {
    // Update local state immediately
    setCourses(prevCourses => 
      prevCourses.map(course => 
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
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    
    // Schedule the API update
    schedulePendingChange("course", courseId, "delete", { id: courseId });
  };

  const handleAssignmentChange = (
    assignmentId: string,
    field: string,
    value: string | number,
  ) => {
    // Update local state immediately
    setCourses(prevCourses => 
      prevCourses.map(course => ({
        ...course,
        assignments: course.assignments.map(assignment => 
          assignment.id === assignmentId 
            ? { 
                ...assignment, 
                [field]: field === "grade" || field === "weight" 
                  ? parseFloat(value as string) 
                  : value 
              } 
            : assignment
        )
      }))
    );
    
    // Create variables for the API call
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
    
    // Schedule the API update
    schedulePendingChange("assignment", assignmentId, "update", variables);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    // Update local state immediately
    setCourses(prevCourses => 
      prevCourses.map(course => ({
        ...course,
        assignments: course.assignments.filter(assignment => assignment.id !== assignmentId)
      }))
    );
    
    // Schedule the API update
    schedulePendingChange("assignment", assignmentId, "delete", { id: assignmentId });
  };

  const handleAddAssignment = async (courseId: string, assignmentData: {
    name: string;
    grade: number;
    weight: number;
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
        },
      });
      
      // Update local state with the new assignment including its server-generated ID
      if (result.data?.createAssignment) {
        const newAssignment = result.data.createAssignment;
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId 
              ? { 
                  ...course, 
                  assignments: [...course.assignments, newAssignment] 
                } 
              : course
          )
        );
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
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
        };
        setCourses(prevCourses => [...prevCourses, newCourse]);
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
          <button onClick={handleSyncNow} className="sync-button">
            Sync Now
          </button>
        </div>
      )}
    </div>
  );
}