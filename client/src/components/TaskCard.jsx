const statusLabels = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const TaskCard = ({ task, onToggleStatus, onDelete, isBusy }) => {
  const nextStatus = task.status === 'completed' ? 'pending' : 'completed';

  return (
    <article className="task-card">
      <div className="task-card-header">
        <div>
          <h3>{task.title}</h3>
          <span className={`status status-${task.status}`}>{statusLabels[task.status]}</span>
        </div>
      </div>

      {task.description ? <p>{task.description}</p> : <p className="muted">No description added.</p>}

      <div className="task-meta">
        <span>Created {new Date(task.createdAt).toLocaleString()}</span>
      </div>

      <div className="task-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={isBusy}
          onClick={() => onToggleStatus(task, nextStatus)}
        >
          {task.status === 'completed' ? 'Mark Pending' : 'Complete'}
        </button>
        <button
          className="button button-danger"
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(task._id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export default TaskCard;
