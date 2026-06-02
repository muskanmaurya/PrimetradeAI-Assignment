import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Alert from '../components/Alert.jsx';

const getApiMessage = (error) => {
  return error.response?.data?.message || 'Failed to load admin overview';
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [taskQuery, setTaskQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/admin/overview');
        setOverview(response.data.overview);
      } catch (error) {
        setAlert({ type: 'error', message: getApiMessage(error) });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;

    try {
      await api.delete(`/tasks/${taskId}`);

      // remove task locally
      setOverview((prev) => {
        if (!prev) return prev;
        const tasks = prev.tasks.filter((t) => t._id !== taskId);
        // recalc counts
        const totalTasks = tasks.length;
        const tasksByStatus = tasks.reduce(
          (acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }),
          { pending: 0, 'in-progress': 0, completed: 0 }
        );

        return { ...prev, tasks, totalTasks, tasksByStatus };
      });

      setAlert({ type: 'success', message: 'Task deleted' });
    } catch (error) {
      setAlert({ type: 'error', message: getApiMessage(error) });
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>Users and Tasks Overview</h1>
          <span className="admin-badge">Admin-only RBAC area</span>
        </div>
        <div className="header-actions">
          <Link className="button button-secondary" to="/dashboard">
            Task Board
          </Link>
          <button className="button button-dark" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <Alert type={alert.type} message={alert.message} />

      {isLoading ? <p className="muted">Loading admin data...</p> : null}

      {!isLoading && overview ? (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <span>Total Users</span>
              <strong>{overview.totalUsers}</strong>
            </article>
            <article className="stat-card">
              <span>Admins</span>
              <strong>{overview.usersByRole.admin}</strong>
            </article>
            <article className="stat-card">
              <span>Standard Users</span>
              <strong>{overview.usersByRole.user}</strong>
            </article>
            <article className="stat-card">
              <span>Total Tasks</span>
              <strong>{overview.totalTasks}</strong>
            </article>
          </section>

          <section className="admin-section">
            <div className="section-heading">
              <h2>Task Status</h2>
            </div>
            <div className="status-summary">
              <span>Pending: {overview.tasksByStatus.pending}</span>
              <span>In Progress: {overview.tasksByStatus['in-progress']}</span>
              <span>Completed: {overview.tasksByStatus.completed}</span>
            </div>
          </section>

          <section className="admin-section">
            <div className="section-heading">
              <h2>Recent Users</h2>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  placeholder="Search users"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #e5ebf4' }}
                />
                <span>{overview.recentUsers.length} shown</span>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentUsers
                    .filter((u) =>
                      `${u.name} ${u.email}`.toLowerCase().includes(userQuery.trim().toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                        </td>
                        <td>{user.role}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <div className="section-heading">
              <h2>All User Tasks</h2>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  placeholder="Search tasks"
                  value={taskQuery}
                  onChange={(e) => setTaskQuery(e.target.value)}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #e5ebf4' }}
                />
                <span>{overview.tasks.length} tasks</span>
              </div>
            </div>
            <div className="task-grid">
              {overview.tasks
                .filter((t) => `${t.title} ${t.description}`.toLowerCase().includes(taskQuery.toLowerCase()))
                .map((task) => (
                  <article className="task-card" key={task._id}>
                    <div className="task-card-header">
                      <div>
                        <h3>{task.title}</h3>
                        <span className={`status status-${task.status}`}>{task.status}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="task-meta">Owner: {task.createdBy?.name || 'Unknown'}</div>
                        <div className="task-meta">{task.createdBy?.email || ''}</div>
                      </div>
                    </div>
                    <p>{task.description || 'No description added.'}</p>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => navigate(`/tasks/${task._id}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
};

export default AdminDashboard;
