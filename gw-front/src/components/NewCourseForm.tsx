import { NewAssignmentForm } from "./NewAssignmentForm.tsx";
import { useState } from "preact/hooks";
import styles from "./NewCourseForm.module.css";
import courseStyles from "./CourseItem.module.css";

interface NewCourseFormProps {
  onCreateCourse: (name: string) => void;
  onCreateCourseWithAssignment: (assignmentData: { name: string; grade: number; weight: number }) => void;
}

export function NewCourseForm({
  onCreateCourse,
  onCreateCourseWithAssignment,
}: NewCourseFormProps) {
  const [newFormData, setNewFormData] = useState<{
    name: string;
    grade: number;
    weight: number;
  }>({ name: "", grade: 0, weight: 0 });
  
  const [courseName, setCourseName] = useState("");
  
  const handleNewAssignmentChange = (
    _courseId: string,
    field: string,
    value: string | number,
  ) => {
    setNewFormData({
      ...newFormData,
      [field]: field === "grade" || field === "weight"
        ? parseFloat(value as string) || 0
        : value,
    });
  };
  
  const handleCreateCourseWithAssignment = () => {
    if (newFormData.name) {
      onCreateCourseWithAssignment(newFormData);
      setNewFormData({ name: "", grade: 0, weight: 0 });
    }
  };
  
  const handleAddCourse = () => {
    const nameToUse = courseName || "New Course";
    onCreateCourse(nameToUse);
    setCourseName("");
  };
  
  return (
    <div class={courseStyles["course-container"]}>
      <span class={courseStyles["course-header"]}>
        <input
          type="text"
          class={courseStyles["course-name-input"]}
          value={courseName}
          placeholder="New course name"
          onChange={(e) => setCourseName((e.target as HTMLInputElement).value)}
        />
        <button
          onClick={handleAddCourse}
          type="button"
          class={styles["add-course"]}
        >
          add course
        </button>
      </span>
      <ul class={courseStyles["assignment-list"]}>
        <NewAssignmentForm
          courseId="new"
          formData={newFormData}
          onNewAssignmentChange={handleNewAssignmentChange}
          onAddAssignment={handleCreateCourseWithAssignment}
        />
      </ul>
    </div>
  );
}
