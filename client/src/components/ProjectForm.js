import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { AuthContext } from '../context/AuthContext';

const ProjectForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (id) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).then(res => {
        setTitle(res.data.title);
        setDescription(res.data.description);
      });
    }
  }, [id]);

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return <div className="text-center text-red-500 mt-10">You do not have permission to access this page.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/projects/${id}`, { title, description }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        message.success('Project updated!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/projects`, { title, description }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        message.success('Project created!');
      }
      navigate('/');
    } catch (error) {
      message.error('Failed to save project.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Project' : 'Create Project'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            {id ? 'Update' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;