import { CourseItem } from "./CourseItem.tsx";
import { useCourses } from "../contexts/CourseContext.tsx";

export function CourseList() {
  const {
    courses,
    handleCourseChange,
    handleDeleteCourse,
    handleAssignmentChange,
    handleDeleteAssignment,
    handleAddAssignment,
    handleSyncTheoreticalAssignments,
    handleBlur,
  } = useCourses();

  return (
    <>
      {courses.map((course) => (
        <CourseItem
          key={course.id}
          course={course}
          onCourseChange={handleCourseChange}
          onDeleteCourse={handleDeleteCourse}
          onAssignmentChange={handleAssignmentChange}
          onDeleteAssignment={handleDeleteAssignment}
          onAddAssignment={handleAddAssignment}
          onSyncTheoreticalAssignments={handleSyncTheoreticalAssignments}
          onBlur={handleBlur}
        />
      ))}
    </>
  );
}
