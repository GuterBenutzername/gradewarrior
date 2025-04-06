import { FunctionComponent } from "preact";
import { Assignment } from "../types.ts";

interface AssignmentItemProps {
  assignment: Assignment;
  onUpdate: (id: string, field: 'grade' | 'name' | 'weight', value: string | number) => void;
  onDelete: (id: string) => void;
}

const AssignmentItem: FunctionComponent<AssignmentItemProps> = ({ assignment, onUpdate, onDelete }) => {
  return (
    <li>
      <div className="assignment-info">
        <input
          type="text"
          className="name-input"
          value={assignment.name}
          onBlur={(e) => {
            if (e.target instanceof HTMLInputElement && e.target.value !== assignment.name) {
              onUpdate(assignment.id, 'name', e.target.value);
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
              e.target.blur();
            }
          }}
        />
        <div className="weight-container">
          <input
            type="number"
            className="weight-input"
            value={assignment.weight}
            min="0"
            max="100"
            onBlur={(e) => {
              if (e.target instanceof HTMLInputElement && parseFloat(e.target.value) !== assignment.weight) {
                onUpdate(assignment.id, 'weight', e.target.value);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                e.target.blur();
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
          value={assignment.grade}
          onBlur={(e) => {
            if (e.target instanceof HTMLInputElement && parseFloat(e.target.value) !== assignment.grade) {
              onUpdate(assignment.id, 'grade', e.target.value);
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
              e.target.blur();
            }
          }}
        />
        <button
          type="button"
          className="delete-btn"
          onClick={() => onDelete(assignment.id)}
          aria-label="Delete assignment"
        >
          ×
        </button>
      </div>
    </li>
  );
};

export default AssignmentItem;