import styles from "./NewAssignmentForm.module.css";

interface NewAssignmentFormProps {
  courseId: string;
  formData?: { name: string; grade: number; weight: number };
  onNewAssignmentChange: (courseId: string, field: string, value: string | number) => void;
  onAddAssignment: (courseId: string) => void;
  isLast?: boolean;
}

export function NewAssignmentForm({
  courseId,
  formData = { name: "", grade: 0, weight: 0 },
  onNewAssignmentChange,
  onAddAssignment,
  isLast = false
}: NewAssignmentFormProps) {
  // Determine container class based on position
  const formClass = `${styles["new-assignment-form"]} ${isLast ? styles["last-item"] : ""}`;
  
  return (
    <li class={formClass}>
      <div class={styles["delete-button-spacer"]}></div>
      <input
        type="text"
        class={styles["assignment-name-input"]}
        placeholder="New assignment name"
        value={formData.name}
        onChange={(e) =>
          onNewAssignmentChange(
            courseId,
            "name",
            (e.target as HTMLInputElement).value,
          )}
      />
      <input
        type="number"
        class={styles["assignment-grade-input"]}
        placeholder="Grade"
        value={formData.grade}
        onChange={(e) =>
          onNewAssignmentChange(
            courseId,
            "grade",
            (e.target as HTMLInputElement).value,
          )}
      />
      <input
        type="number"
        class={styles["assignment-weight-input"]}
        placeholder="Weight"
        value={formData.weight}
        onChange={(e) =>
          onNewAssignmentChange(
            courseId,
            "weight",
            (e.target as HTMLInputElement).value,
          )}
      />
      <button
        type="button"
        class={styles["add-assignment-button"]}
        onClick={() => onAddAssignment(courseId)}
      >
        Add
      </button>
    </li>
  );
}
