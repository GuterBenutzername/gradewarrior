import { Assignment } from "../types.ts";
import styles from "./AssignmentItem.module.css";

interface AssignmentItemProps {
  assignment: Assignment;
  onAssignmentChange: (id: string, field: string, value: string | number) => void;
  onDeleteAssignment: (id: string) => void;
}

export function AssignmentItem({ assignment, onAssignmentChange, onDeleteAssignment }: AssignmentItemProps) {
  return (
    <li class={styles["assignment-container"]} key={assignment.id}>
      <button
        type="button"
        class={styles["delete-button"]}
        onClick={() => onDeleteAssignment(assignment.id)}
      >
        X
      </button>
      <input
        type="text"
        class={styles["assignment-name-input"]}
        value={assignment.name}
        onChange={(e) =>
          onAssignmentChange(
            assignment.id,
            "name",
            (e.target as HTMLInputElement).value,
          )}
      />

      <input
        type="number"
        class={styles["assignment-grade-input"]}
        value={assignment.grade}
        onChange={(e) =>
          onAssignmentChange(
            assignment.id,
            "grade",
            (e.target as HTMLInputElement).value,
          )}
      />
      <input
        type="number"
        class={styles["assignment-weight-input"]}
        value={assignment.weight}
        onChange={(e) =>
          onAssignmentChange(
            assignment.id,
            "weight",
            (e.target as HTMLInputElement).value,
          )}
      />
    </li>
  );
}
