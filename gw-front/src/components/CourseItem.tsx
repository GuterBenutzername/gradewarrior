import { Course } from "../types.ts";
import { AssignmentItem } from "./AssignmentItem.tsx";
import { NewAssignmentForm } from "./NewAssignmentForm.tsx";
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
            <span class={styles["average-label"]}>{t("course.theoretical")}</span>
            <span class={styles["average-value"]}>
              {gradeCalc(course.theoreticalAssignments).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div class={styles["assignments-container-wrapper"]}>
        <div class={styles["assignments-side-by-side"]}>
          <div class={styles["assignments-column"]}>
            <h3 class={styles["column-title"]}>{t("course.realAssignments")}</h3>
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
                {course.assignments.map((assignment, index) => (
                  <AssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onAssignmentChange={onAssignmentChange}
                    onDeleteAssignment={onDeleteAssignment}
                    onBlur={onBlur}
                    isFirst={index === 0}
                  />
                ))}

                <NewAssignmentForm
                  courseId={course.id}
                  onAddAssignment={onAddAssignment}
                  isTheoretical={false}
                />
              </ul>
            </div>
          </div>

          <div class={styles["sync-buttons-container"]}>
            <button
              type="button"
              class={styles["sync-button"]}
              onClick={handleSyncTheoreticalAssignments}
              title={t("course.syncWithReal")}
            >
              <span class={styles["sync-icon"]}>→</span>
            </button>
            
            <button
              type="button"
              class={styles["sync-button"]}
              onClick={handleApplyTheoreticalAssignments}
              title={t("course.applyToReal")}
            >
              <span class={styles["sync-icon"]}>←</span>
            </button>
          </div>

          <div class={styles["assignments-column"]}>
            <h3 class={styles["column-title"]}>{t("course.theoreticalAssignments")}</h3>
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
                {course.theoreticalAssignments.map((assignment, index) => (
                  <AssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onAssignmentChange={onAssignmentChange}
                    onDeleteAssignment={onDeleteAssignment}
                    onBlur={onBlur}
                    isFirst={index === 0}
                  />
                ))}

                <NewAssignmentForm
                  courseId={course.id}
                  onAddAssignment={onAddAssignment}
                  isTheoretical={true}
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
