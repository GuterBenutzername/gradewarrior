import { FunctionComponent } from "preact";
import { Course } from "../types.ts";

interface CourseHeaderProps {
  course: Course;
  isEditing: boolean;
  editName: string;
  onEditStart: () => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onDelete: () => void;
}

const CourseHeader: FunctionComponent<CourseHeaderProps> = ({ 
  course, 
  isEditing, 
  editName, 
  onEditStart, 
  onEditChange, 
  onEditSave, 
  onDelete 
}) => {
  return (
    <div className="course-header">
      {isEditing ? (
        <div className="edit-course-name">
          <input
            type="text"
            className="course-name-input"
            value={editName}
            onChange={(e) => {
              if (e.target instanceof HTMLInputElement) {
                onEditChange(e.target.value);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                onEditSave();
              }
            }}
            onBlur={() => {
              if (editName !== course.name) {
                onEditSave();
              } else {
                onEditChange(course.name);
              }
            }}
            autoFocus
          />
          <button
            type="button"
            className="save-btn"
            onClick={onEditSave}
            disabled={!editName}
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <h2>{course.name}</h2>
          <div className="course-actions">
            <button
              type="button"
              className="edit-course-btn"
              onClick={onEditStart}
              aria-label="Edit course"
            >
              Edit
            </button>
            <button
              type="button"
              className="delete-course-btn"
              onClick={onDelete}
              aria-label="Delete course"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseHeader;