import styles from "./NewAssignmentForm.module.css";
import { useTranslation } from "preact-i18next";
import { useState } from "preact/hooks";

interface NewAssignmentFormProps {
  courseId: string;
  onAddAssignment: (
    courseId: string, 
    assignmentData: {
      name: string;
      grade: number;
      weight: number;
      isTheoretical: boolean;
    }
  ) => void;
  isTheoretical: boolean;
}

export function NewAssignmentForm({
  courseId,
  onAddAssignment,
  isTheoretical,
}: NewAssignmentFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<{
    name: string;
    grade: number;
    weight: number;
  }>({ name: "", grade: 0, weight: 0 });

  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: field === "grade" || field === "weight"
        ? parseFloat(value as string) || 0
        : value,
    });
  };

  const handleAddAssignment = () => {
    if (!formData.name) return;

    onAddAssignment(courseId, {
      ...formData,
      isTheoretical
    });

    // Reset form after adding
    setFormData({
      name: "",
      grade: 0,
      weight: 0,
    });
  };

  // Form is always the last item
  const formClass = `${styles["new-assignment-form"]} ${styles["last-item"]}`;

  return (
    <li class={formClass}>
      <input
        type="text"
        class={styles["assignment-name-input"]}
        placeholder={t("assignment.newAssignmentName")}
        value={formData.name}
        onChange={(e) =>
          handleChange(
            "name",
            (e.target as HTMLInputElement).value,
          )}
      />
      <input
        type="number"
        class={styles["assignment-grade-input"]}
        placeholder={t("assignment.grade")}
        value={formData.grade}
        onChange={(e) =>
          handleChange(
            "grade",
            (e.target as HTMLInputElement).value,
          )}
      />
      <input
        type="number"
        class={styles["assignment-weight-input"]}
        placeholder={t("assignment.weight")}
        value={formData.weight}
        onChange={(e) =>
          handleChange(
            "weight",
            (e.target as HTMLInputElement).value,
          )}
      />
      <button
        type="button"
        class={styles["add-button"]}
        onClick={handleAddAssignment}
        title={t("assignment.addAssignment")}
      >
        +
      </button>
    </li>
  );
}
