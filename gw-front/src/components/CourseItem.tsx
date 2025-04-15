import { Course } from "../types.ts";
import { AssignmentItem } from "./AssignmentItem.tsx";
import { NewAssignmentForm } from "./NewAssignmentForm.tsx";
import { useState } from "preact/hooks";
import styles from "./CourseItem.module.css";
import { gradeCalc } from "../utils/gradeCalc.ts";
import { useTranslation } from "preact-i18next";

interface CourseItemProps {
  course: Course;
  onCourseNameChange: (id: string, newName: string) => void;
  onDeleteCourse: (id: string) => void;
  onAssignmentChange: (
    id: string,
    field: "name" | "grade" | "weight",
    value: string | number,
  ) => void;
  onDeleteAssignment: (id: string) => void;
  onAddAssignment: (
    courseId: string,
    assignmentData: {
      name: string;
      grade: number;
      weight: number;
      isTheoretical: boolean;
    },
  ) => void;
  onSyncTheoreticalAssignments: (courseId: string) => void;
  onApplyTheoreticalAssignments: (courseId: string) => void;
  onBlur?: () => void;
}

export function CourseItem({
  course,
  onCourseNameChange: onCourseChange,
  onDeleteCourse,
  onAssignmentChange,
  onDeleteAssignment,
  onAddAssignment,
  onSyncTheoreticalAssignments,
  onApplyTheoreticalAssignments,
  onBlur,
}: CourseItemProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"real" | "theoretical">("real");

  const handleSyncTheoreticalAssignments = () => {
    onSyncTheoreticalAssignments(course.id);
  };

  const handleApplyTheoreticalAssignments = () => {
    onApplyTheoreticalAssignments(course.id);
  };

  return (
    <div
      key={course.id}
      class={styles["course-container"]}
      data-course-id={course.id}
    >
      <div class={styles["course-header-container"]}>
        <div class={styles["course-title-row"]}>
          <input
            type="text"
            class={styles["course-name-input"]}
            value={course.name}
            onChange={(e) =>
              onCourseChange(
                course.id,
                (e.target as HTMLInputElement).value,
              )}
            onBlur={onBlur}
          />
          <button
            onClick={() => onDeleteCourse(course.id)}
            type="button"
            class={styles["delete-course"]}
          >
            {t("course.deleteCourse")}
          </button>
        </div>
        <div class={styles["averages-container"]}>
          <div class={styles["average-box"]}>
            <span class={styles["average-label"]}>{t("course.current")}</span>
            <span class={styles["average-value"]}>
              {gradeCalc(course.assignments).toFixed(2)}%
            </span>
          </div>
          <div class={styles["average-box"]}>
            <span class={styles["average-label"]}>{t("course.projected")}</span>
            <span class={styles["average-value"]}>
              {activeTab === "theoretical"
                ? gradeCalc(course.theoreticalAssignments).toFixed(2)
                : gradeCalc(course.assignments).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div class={styles["assignments-tab-container"]}>
        <div class={styles["tabs"]}>
          <button
            type="button"
            class={`${styles["tab-button"]} ${
              activeTab === "real" ? styles["active-tab"] : ""
            }`}
            onClick={() => setActiveTab("real")}
          >
            {t("course.realAssignments")}
          </button>
          <button
            type="button"
            class={`${styles["tab-button"]} ${
              activeTab === "theoretical" ? styles["active-tab"] : ""
            }`}
            onClick={() => setActiveTab("theoretical")}
          >
            {t("course.theoreticalAssignments")}
          </button>
              <button
                type="button"
                class={styles["sync-button"]}
                onClick={activeTab === "theoretical" ? handleSyncTheoreticalAssignments : handleApplyTheoreticalAssignments}
              >
                {activeTab == "theoretical" ? t("course.syncWithReal") : t("course.applyToReal")}
              </button>
        </div>
      </div>

      <div class={styles["assignments-container"]}>
        <div class={styles["assignments-header"]}>
          <div class={styles["assignment-name-header"]}>
            {t("course.assignmentName")}
          </div>
          <div class={styles["assignment-grade-header"]}>
            {t("course.grade")}
          </div>
          <div class={styles["assignment-weight-header"]}>
            {t("course.weight")}
          </div>
        </div>
        <ul class={styles["assignment-list"]}>
          {(activeTab === "real"
            ? course.assignments
            : course.theoreticalAssignments).map((assignment, index) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onAssignmentChange={onAssignmentChange}
                onDeleteAssignment={onDeleteAssignment}
                onBlur={onBlur}
                isFirst={index === 0}
              />
            ))}

          {/* Add new assignment form - always last */}
          <NewAssignmentForm
            courseId={course.id}
            onAddAssignment={onAddAssignment}
            isTheoretical={activeTab === "theoretical"}
          />
        </ul>
      </div>
    </div>
  );
}
