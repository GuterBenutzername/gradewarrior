import styles from "./NewAssignmentForm.module.css";
import { useTranslation } from "preact-i18next";

interface NewAssignmentFormProps {
  courseId: string;
  formData?: { name: string; grade: number; weight: number };
  onNewAssignmentChange: (
    courseId: string,
    field: string,
    value: string | number,
  ) => void;
  onAddAssignment: (courseId: string) => void;
  onBlur?: () => void;
  isLast?: boolean;
}

export function NewAssignmentForm({
  courseId,
  formData = { name: "", grade: 0, weight: 0 },
  onNewAssignmentChange,
  onAddAssignment,
  onBlur,
  isLast = false,
}: NewAssignmentFormProps) {
  const { t } = useTranslation();
  // Determine container class based on position
  const formClass = `${styles["new-assignment-form"]} ${
    isLast ? styles["last-item"] : ""
  }`;

  return (
    <li class={formClass}>
      <input
        type="text"
        class={styles["assignment-name-input"]}
        placeholder={t("assignment.newAssignmentName")}
        value={formData.name}
        onChange={(e) =>
          onNewAssignmentChange(
            courseId,
            "name",
            (e.target as HTMLInputElement).value,
          )}
        onBlur={onBlur}
      />
      <input
        type="number"
        class={styles["assignment-grade-input"]}
        placeholder={t("assignment.grade")}
        value={formData.grade}
        onChange={(e) =>
          onNewAssignmentChange(
            courseId,
            "grade",
            (e.target as HTMLInputElement).value,
          )}
        onBlur={onBlur}
      />
      <input
        type="number"
        class={styles["assignment-weight-input"]}
        placeholder={t("assignment.weight")}
        value={formData.weight}
        onChange={(e) =>
          onNewAssignmentChange(
            courseId,
            "weight",
            (e.target as HTMLInputElement).value,
          )}
        onBlur={onBlur}
      />
      <button
        type="button"
        class={styles["add-button"]}
        onClick={() => onAddAssignment(courseId)}
        title={t("assignment.addAssignment")}
      >
        +
      </button>
    </li>
  );
}