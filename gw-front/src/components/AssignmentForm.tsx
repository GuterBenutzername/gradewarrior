import { FunctionComponent } from "preact";

interface AssignmentFormProps {
  data: {
    name: string;
    grade: number;
    weight: number;
    courseId: string | null;
  };
  onSubmit: () => void;
  onCancel: () => void;
}

const AssignmentForm: FunctionComponent<AssignmentFormProps> = ({ data, onSubmit, onCancel }) => {
  return (
    <>
      <div className="assignment-info">
        <input
          type="text"
          className="name-input"
          placeholder="New assignment name"
          value={data.name}
          onChange={(e) => {
            if (e.target instanceof HTMLInputElement) {
              onCancel();
              data.name = e.target.value;
              onSubmit();
            }
          }}
        />
        <div className="weight-container">
          <input
            type="number"
            className="weight-input"
            placeholder="Weight"
            value={data.weight}
            min="0"
            max="100"
            onChange={(e) => {
              if (e.target instanceof HTMLInputElement) {
                onCancel();
                data.weight = parseFloat(e.target.value) || 0;
                onSubmit();
              }
            }}
          />
          <span className="weight-symbol">%</span>
        </div>
      </div>
      <div className="assignment-grade">
        <input
          type="number"
          className="grade-input"
          placeholder="Grade"
          value={data.grade}
          onChange={(e) => {
            if (e.target instanceof HTMLInputElement) {
              onCancel();
              data.grade = parseFloat(e.target.value) || 0;
              onSubmit();
            }
          }}
        />
        <div className="assignment-actions">
          <button
            type="button"
            className="add-btn"
            onClick={() => { if (data.name.length > 0) { onSubmit() } }}
            disabled={!data.name}
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
      </div>
    </>
  );
};

export default AssignmentForm;