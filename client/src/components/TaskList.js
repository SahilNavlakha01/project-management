import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { message, Spin } from 'antd';
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
  const [users, setUsers] = useState([]);
  const [assignedUser, setAssignedUser] = useState('');
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
    // Fetch all users for assignment dropdown
    axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
    // eslint-disable-next-line
  }, [projectId]);

  // Update UI with backend response for toggle (cycle status)
  // const handleToggle = async (taskId) => {
  //   setError('');
  //   setSuccess('');
  //   try {
  //     const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/toggle`, {}, {
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
        user: assignedUser || undefined,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setAssignedUser('');
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-start py-12 transition-colors duration-300">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 flex flex-col gap-8 mt-8 border border-gray-100 dark:border-gray-800">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Tasks</h1>
        <form className="flex flex-col md:flex-row gap-4 items-center w-full" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 text-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-200"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 text-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-200"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 text-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-200"
          >
            {statusOrder.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={assignedUser}
            onChange={e => setAssignedUser(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 text-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-200"
            required
          >
            <option value="">Assign To </option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-lg shadow-md transition-all duration-200"
          >
            Add
          </button>
        </form>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-300 text-xl"> <Spin size="small" /></p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-xl font-medium mt-12">No tasks yet. Start by adding a new task above.</p>
          ) : (
            <div className="w-full divide-y divide-gray-200 dark:divide-gray-800">
              {tasks.map((task) => {
                const isOwner = user && task.user && (task.user._id === user.id || task.user.id === user.id);
                const isAdmin = user && user.role === 'admin';
                return (
                  <div key={task._id} className={`group flex items-center justify-between py-4 px-2 transition bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl border-l-4 ${statusColors[task.status]}`}>
                    {editId === task._id ? (
                      (isOwner || isAdmin) ? (
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
                      )
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${statusColors[task.status]} text-white`}>{task.status}</span>
                            <span className={`font-semibold text-lg ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>{task.title}</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">{task.description}</div>
                          {/* {task.user && (user && (user.role === 'admin' || user.role === 'manager')) && ( */}
                            <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
                              Assigned to: {task.user.name}
                            </div>
                          {/* )} */}
                          <div className="text-xs text-gray-400 dark:text-gray-400">
                            Created: {formatIndianDateTime(task.createdAt)}
                            {task.completedAt && (
                              <>
                                <br />Completed: {formatIndianDateTime(task.completedAt)}
                              </>
                            )}
                          </div>
                        </div>
                        {(isOwner || isAdmin) ? (
                          <div className="flex gap-2 items-center ml-4">
                            <select
                              value={task.status}
                              onChange={async (e) => {
                                setError('');
                                setSuccess('');
                                try {
                                  const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}`, {
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
                        ) : null}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;