import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Alert from '../components/Alert.jsx';
import TaskCard from '../components/TaskCard.jsx';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
};

const getApiMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((item) => item.message).join(', ');
  }

  if ([401, 403].includes(error.response?.status)) {
    return error.response?.data?.message || 'Unauthorized action';
  }

  return error.response?.data?.message || 'Failed to connect to server';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (error) {
      setAlert({ type: 'error', message: getApiMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setAlert({ type: '', message: '' });
    setIsCreating(true);

    try {
      const response = await api.post('/tasks', {
        title: formData.title,
        description: formData.description,
      });

      setTasks((currentTasks) => [response.data.task, ...currentTasks]);
      setFormData({ title: '', description: '' });
      setAlert({ type: 'success', message: 'Task created successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: getApiMessage(error) });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (task, nextStatus) => {
    setAlert({ type: '', message: '' });
    setBusyTaskId(task._id);

    try {
      const response = await api.put(`/tasks/${task._id}`, {
        status: nextStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === task._id ? response.data.task : currentTask
        )
      );
      setAlert({ type: 'success', message: `Task marked as ${nextStatus}` });
    } catch (error) {
      setAlert({ type: 'error', message: getApiMessage(error) });
    } finally {
      setBusyTaskId('');
    }
  };

  const handleDeleteTask = async (taskId) => {
    setAlert({ type: '', message: '' });
    setBusyTaskId(taskId);

    try {
      const response = await api.delete(`/tasks/${taskId}`);
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));
      setAlert({
        type: 'success',
        message: response.data.message || 'Task deleted successfully',
      });
    } catch (error) {
      setAlert({ type: 'error', message: getApiMessage(error) });
    } finally {
      setBusyTaskId('');
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Task Dashboard</p>
          <h1>Hello, {user.name || 'User'}</h1>
          {user.role === 'admin' ? (
            <div className="admin-actions">
              <span className="admin-badge">Admin Mode - Viewing All User Tasks</span>
              <Link className="button button-secondary" to="/admin">
                Admin Overview
              </Link>
            </div>
          ) : null}
        </div>
        <button className="button button-dark" type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <Alert type={alert.type} message={alert.message} />

      <section className="create-task-panel">
        <h2>Create Task</h2>
        <form className="task-form" onSubmit={handleCreateTask}>
          <input
            name="title"
            type="text"
            placeholder="Task title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
          />
          <button className="button button-primary" type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Add Task'}
          </button>
        </form>
      </section>

      <section className="tasks-section">
        <div className="section-heading">
          <h2>Tasks</h2>
          <span>{tasks.length} total</span>
        </div>

        {isLoading ? <p className="muted">Loading tasks...</p> : null}

        {!isLoading && tasks.length === 0 ? (
          <div className="empty-state">No tasks yet. Create your first task above.</div>
        ) : null}

        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              isBusy={busyTaskId === task._id}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
