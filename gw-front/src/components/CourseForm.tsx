import { FunctionComponent } from "preact";

interface CourseFormProps {
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const CourseForm: FunctionComponent<CourseFormProps> = ({ name, onNameChange, onSubmit, onCancel }) => {
  return (
    <div className="new-course-form">
      <input
        type="text"
        placeholder="Course name"
        value={name}
        onChange={(e) => {
          if (e.target instanceof HTMLInputElement) {
            onNameChange(e.target.value);
          }
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && name) {
            onSubmit();
          }
        }}
        autoFocus
      />
      <button
        type="button"
        className="add-btn"
        onClick={onSubmit}
        disabled={!name}
      >
        Add
      </button>
      <button
        type="button"
        className="cancel-btn"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};

export default CourseForm;