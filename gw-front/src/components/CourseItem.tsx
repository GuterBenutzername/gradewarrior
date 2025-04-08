import { Course } from "../types.ts";
import { AssignmentItem } from "./AssignmentItem.tsx";
import { NewAssignmentForm } from "./NewAssignmentForm.tsx";
import { useState } from "preact/hooks";
import styles from "./CourseItem.module.css";

interface CourseItemProps {
  course: Course;
  onCourseChange: (id: string, value: string) => void;
  onDeleteCourse: (id: string) => void;
  onAssignmentChange: (id: string, field: string, value: string | number) => void;
  onDeleteAssignment: (id: string) => void;
  onAddAssignment: (courseId: string, assignmentData: { name: string; grade: number; weight: number }) => void;
}

export function CourseItem({
  course,
  onCourseChange,
  onDeleteCourse,
  onAssignmentChange,
  onDeleteAssignment,
  onAddAssignment,
}: CourseItemProps) {
  const [newAssignmentData, setNewAssignmentData] = useState<{
    name: string;
    grade: number;
    weight: number;
  }>({ name: "", grade: 0, weight: 0 });
  
  const handleNewAssignmentChange = (
    _courseId: string,
    field: string,
    value: string | number,
  ) => {
    setNewAssignmentData({
      ...newAssignmentData,
      [field]: field === "grade" || field === "weight"
        ? parseFloat(value as string) || 0
        : value,
    });
  };
  
  const handleAddAssignment = (courseId: string) => {
    if (!newAssignmentData.name) return;
    
    onAddAssignment(courseId, newAssignmentData);
    // Reset form after adding
    setNewAssignmentData({ name: "", grade: 0, weight: 0 });
  };
  return (
    <div
      key={course.id}
      class={styles["course-container"]}
      data-course-id={course.id}
    >
      <span class={styles["course-header"]}>
        <input
          type="text"
          class={styles["course-name-input"]}
          value={course.name}
          onChange={(e) =>
            onCourseChange(
              course.id,
              (e.target as HTMLInputElement).value,
            )}
        />
        <button
          onClick={() => onDeleteCourse(course.id)}
          type="button"
          class={styles["delete-course"]}
        >
          delete course
        </button>
      </span>
      <ul class={styles["assignment-list"]}>
        {course.assignments.map((assignment) => (
          <AssignmentItem
            key={assignment.id}
            assignment={assignment}
            onAssignmentChange={onAssignmentChange}
            onDeleteAssignment={onDeleteAssignment}
          />
        ))}

        {/* Add new assignment form */}
        <NewAssignmentForm
          courseId={course.id}
          formData={newAssignmentData}
          onNewAssignmentChange={handleNewAssignmentChange}
          onAddAssignment={handleAddAssignment}
        />
      </ul>
    </div>
  );
}
