import { Course } from "../types.ts";
import { AssignmentItem } from "./AssignmentItem.tsx";
import { NewAssignmentForm } from "./NewAssignmentForm.tsx";
import { useState } from "preact/hooks";
import styles from "./CourseItem.module.css";
import { gradeCalc } from "../utils/gradeCalc.ts";
import { useTranslation } from "preact-i18next";

interface CourseItemProps {
  course: Course;
  onCourseChange: (id: string, value: string) => void;
  onDeleteCourse: (id: string) => void;
  onAssignmentChange: (
    id: string,
    field: string,
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
  onBlur?: () => void;
}

export function CourseItem({
  course,
  onCourseChange,
  onDeleteCourse,
  onAssignmentChange,
  onDeleteAssignment,
  onAddAssignment,
  onSyncTheoreticalAssignments,
  onBlur,
}: CourseItemProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"real" | "theoretical">("real");
  const [newAssignmentData, setNewAssignmentData] = useState<{
    name: string;
    grade: number;
    weight: number;
    isTheoretical: boolean;
  }>({ name: "", grade: 0, weight: 0, isTheoretical: false });

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

    // Set isTheoretical based on current active tab
    const assignmentData = {
      ...newAssignmentData,
      isTheoretical: activeTab === "theoretical",
    };

    onAddAssignment(courseId, assignmentData);
    // Reset form after adding
    setNewAssignmentData({
      name: "",
      grade: 0,
      weight: 0,
      isTheoretical: false,
    });
  };

  const handleSyncTheoreticalAssignments = () => {
    onSyncTheoreticalAssignments(course.id);
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
          {activeTab === "theoretical" && (
            <button
              type="button"
              class={styles["sync-button"]}
              onClick={handleSyncTheoreticalAssignments}
            >
              {t("course.syncWithReal")}
            </button>
          )}
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

          {/* Add new assignment form */}
          <NewAssignmentForm
            courseId={course.id}
            formData={newAssignmentData}
            onNewAssignmentChange={handleNewAssignmentChange}
            onAddAssignment={handleAddAssignment}
            isLast
          />
        </ul>
      </div>
    </div>
  );
}
