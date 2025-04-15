import { useState } from "preact/hooks";
import { useTranslation } from "preact-i18next";
import { useCourses } from "../contexts/CourseContext.tsx";

export function AddCourseForm() {
  const { t } = useTranslation();
  const { handleCreateCourse, handleBlur } = useCourses();
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;

    handleCreateCourse(newCourseName);
    setIsAddingCourse(false);
    setNewCourseName("");
  };

  if (isAddingCourse) {
    return (
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
    );
  }

  return (
    <button
      type="button"
      class="add-course-button"
      onClick={() => setIsAddingCourse(true)}
    >
      {t("course.addCourseButton")}
    </button>
  );
}
