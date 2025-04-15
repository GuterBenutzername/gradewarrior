import { useCourses } from "../contexts/CourseContext.tsx";

export function PendingChangesBar() {
  const { pendingChanges, handleSyncNow } = useCourses();

  if (pendingChanges.size === 0) {
    return null;
  }

  return (
    <div className="pending-changes">
      <span>{pendingChanges.size} pending changes</span>
      <button type="button" onClick={handleSyncNow} className="sync-button">
        Sync Now
      </button>
    </div>
  );
}
