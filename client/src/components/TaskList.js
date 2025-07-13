// src/components/TaskList.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const statusColors = {
  'To Do': 'bg-gray-400',
  'Doing': 'bg-blue-500',
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
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('To Do');
  const { user } = useContext(AuthContext);

  const formatIndianDateTime = (dateString) => {
    return dayjs(dateString).tz('Asia/Kolkata').format('DD/MM/YYYY, hh:mm A');
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(res.data);
    } catch {
      message.error('Failed to load tasks.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleAdd = async (e) => {
    e.preventDefault();
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
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      message.success('Task deleted!');
      fetchTasks();
    } catch {
      message.error('Failed to delete task.');
    }
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
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
    } catch {
      message.error('Failed to update task.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100 dark:border-gray-800">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <form onSubmit={handleAdd} className="grid md:grid-cols-4 gap-4">
          <input
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-gray-100"
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-gray-100"
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-gray-100"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statusOrder.map(s => <option key={s}>{s}</option>)}
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-indigo-700"
          >
            Add Task
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center py-10"><Spin /></div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300 text-center py-10">No tasks available.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const isOwner = user && task.user && (task.user._id === user.id);
              const isAdmin = user && user.role === 'admin';
              return (
                <div key={task._id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
                  {editId === task._id && (isOwner || isAdmin) ? (
                    <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-4">
                      <input
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-gray-100"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                      <input
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-gray-100"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <select
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-gray-100"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        {statusOrder.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">Save</button>
                      <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs text-white font-semibold ${statusColors[task.status]}`}>{task.status}</span>
                          <h2 className="font-semibold text-xl text-gray-900 dark:text-white">{task.title}</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{task.description}</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-1">Assigned to: {task.user?.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Created: {formatIndianDateTime(task.createdAt)}</p>
                      </div>
                      {(isOwner || isAdmin) && (
                        <div className="flex gap-2">
                          <select
                            className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-lg dark:bg-gray-900 dark:text-gray-100"
                            value={task.status}
                            onChange={async (e) => {
                              try {
                                const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}`, {
                                  title: task.title,
                                  description: task.description,
                                  status: e.target.value,
                                }, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                });
                                setTasks((prev) => prev.map(t => t._id === task._id ? res.data : t));
                              } catch {
                                message.error('Failed to update status.');
                              }
                            }}
                          >
                            {statusOrder.map(s => <option key={s}>{s}</option>)}
                          </select>
                          <button onClick={() => handleEdit(task)} className="bg-blue-500 text-white px-3 py-1 rounded-lg">Edit</button>
                          <button onClick={() => handleDelete(task._id)} className="bg-red-500 text-white px-3 py-1 rounded-lg">Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
