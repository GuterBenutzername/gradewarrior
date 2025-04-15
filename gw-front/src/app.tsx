import "./styles/global.css";
import { useTranslation } from "preact-i18next";
import { CourseProvider, useCourses } from "./contexts/CourseContext.tsx";
import { CourseList } from "./components/CourseList.tsx";
import { AddCourseForm } from "./components/AddCourseForm.tsx";
import { PendingChangesBar } from "./components/PendingChangesBar.tsx";

function AppContent() {
  const { t } = useTranslation();
  const { loading, error, handleBlur } = useCourses();

  // Loading and error states
  if (loading) return <p>{t("app.loading")}</p>;
  if (error) return <p>{t("app.error")}</p>;

  return (
    <div class="courses" onBlur={handleBlur}>
      <CourseList />
      <AddCourseForm />
      <PendingChangesBar />
    </div>
  );
}

export function App() {
  return (
    <CourseProvider>
      <AppContent />
    </CourseProvider>
  );
}
