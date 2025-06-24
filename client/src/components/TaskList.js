import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const statusColors = {
  'To Do': 'bg-gray-400',
  'Doing': 'bg-blue-400',
  'Testing': 'bg-yellow-400',
  'Completed': 'bg-green-500',
};

const statusOrder = ['To Do', 'Doing', 'Testing', 'Completed'];

const TaskList = () => {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('To Do');
  const { user } = useContext(AuthContext);

  // Helper function to format date in Indian format
  const formatIndianDateTime = (dateString) => {
    return dayjs(dateString)
      .tz('Asia/Kolkata')
      .format('DD/MM/YYYY, hh:mm A');
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(res.data);
    } catch (err) {
      setError('Failed to load tasks.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [projectId]);

  // Update UI with backend response for toggle (cycle status)
  // const handleToggle = async (taskId) => {
  //   setError('');
  //   setSuccess('');
  //   try {
  //     const res = await axios.put(`http://localhost:5000/api/tasks/${taskId}/toggle`, {}, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  //     });
  //     setTasks((prev) => prev.map(t => t._id === taskId ? res.data : t));
  //     message.success('Task status updated!');
  //   } catch (err) {
  //     message.error('Failed to toggle task.');
  //     fetchTasks();
  //   }
  // };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks`, {
        title,
        description,
        status,
        project: projectId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTitle('');
      setDescription('');
      setStatus('To Do');
      message.success('Task added!');
      fetchTasks();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to add task.');
    }
  };

  const handleDelete = async (taskId) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      message.success('Task deleted!');
      fetchTasks();
    } catch (err) {
      message.error('Failed to delete task.');
    }
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
  };

  // Update UI with backend response for edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${editId}`, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks((prev) => prev.map(t => t._id === editId ? res.data : t));
      setEditId(null);
      setEditTitle('');
      setEditDescription('');
      setEditStatus('To Do');
      message.success('Task updated!');
      fetchTasks();
    } catch (err) {
      message.error('Failed to update task.');
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[60vh] py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8" style={{width:'770px'}}>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white tracking-tight">Tasks</h2>
          {error && <div className="text-red-500 mb-4 font-medium">{error}</div>}
          {success && <div className="text-green-600 mb-4 font-medium">{success}</div>}
          {user && (
            <form onSubmit={handleAdd} className="mb-8 flex flex-col md:flex-row gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-inner">
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-300"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-300"
              >
                {statusOrder.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition">Add</button>
            </form>
          )}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <div className="text-gray-500 py-8 text-center">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-gray-400 py-12 text-center text-lg">No tasks yet. Start by adding a new task above.</div>
            ) : (
              <ul className="space-y-0">
                {tasks.map((task) => (
                  <li key={task._id} className={`group flex items-center justify-between py-6 px-2 transition bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl border-l-4 ${statusColors[task.status]}`}>
                    {editId === task._id ? (
                      <form onSubmit={handleUpdate} className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          required
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                          {statusOrder.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-lg font-semibold">Save</button>
                        <button type="button" onClick={() => setEditId(null)} className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg">Cancel</button>
                      </form>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${statusColors[task.status]} text-white`}>{task.status}</span>
                            <span className={`font-semibold text-lg ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>{task.title}</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">{task.description}</div>
                          {task.user && (user && (user.role === 'admin' || user.role === 'manager')) && (
                            <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
                              Assigned to: {task.user.name}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 dark:text-gray-400">
                            Created: {formatIndianDateTime(task.createdAt)}
                            {task.completedAt && (
                              <>
                                <br />Completed: {formatIndianDateTime(task.completedAt)}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center ml-4">
                          <select
                            value={task.status}
                            onChange={async (e) => {
                              setError('');
                              setSuccess('');
                              try {
                                const res = await axios.put(`http://localhost:5000/api/tasks/${task._id}`, {
                                  title: task.title,
                                  description: task.description,
                                  status: e.target.value,
                                }, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                });
                                setTasks((prev) => prev.map(t => t._id === task._id ? res.data : t));
                                message.success('Status updated!');
                              } catch (err) {
                                message.error('Failed to update status.');
                                fetchTasks();
                              }
                            }}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-semibold"
                          >
                            {statusOrder.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => handleEdit(task)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg font-semibold">Edit</button>
                          <button onClick={() => handleDelete(task._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold">Delete</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;