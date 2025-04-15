import { CourseItem } from "./CourseItem.tsx";
import { useCourses } from "../contexts/CourseContext.tsx";

export function CourseList() {
  const {
    courses,
    handleCourseNameChange,
    handleDeleteCourse,
    handleAssignmentChange,
    handleDeleteAssignment,
    handleAddAssignment,
    handleSyncTheoreticalAssignments,
    handleApplyTheoreticalAssignments,
    handleBlur,
  } = useCourses();

  return (
    <>
      {courses.map((course) => (
        <CourseItem
          key={course.id}
          course={course}
          onCourseNameChange={handleCourseNameChange}
          onDeleteCourse={handleDeleteCourse}
          onAssignmentChange={handleAssignmentChange}
          onDeleteAssignment={handleDeleteAssignment}
          onAddAssignment={handleAddAssignment}
          onSyncTheoreticalAssignments={handleSyncTheoreticalAssignments}
          onApplyTheoreticalAssignments={handleApplyTheoreticalAssignments}
          onBlur={handleBlur}
        />
      ))}
    </>
  );
}
