import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import Layout from "./Layout";
import { AuthContext } from "../context/AuthContext";

const statusIcons = {
  "To Do": "📝",
  Doing: "⏳",
  Testing: "🧪",
  Completed: "✅",
};

const statusLabels = ["To Do", "Doing", "Testing", "Completed"];

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const fetchProjectsAndTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProjects(res.data);

      const tasksObj = {};
      await Promise.all(
        res.data.map(async (project) => {
          try {
            const taskRes = await axios.get(
              `http://localhost:5000/api/tasks/project/${project._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            tasksObj[project._id] = taskRes.data;
          } catch {
            tasksObj[project._id] = [];
          }
        })
      );
      setTasks(tasksObj);
    } catch (err) {
      setError("Failed to load projects.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectsAndTasks();
  }, [location]);

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Project deleted successfully!");
      fetchProjectsAndTasks();
    } catch (err) {
      message.error("Failed to delete project.");
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Projects
        </h1>
        {user && (user.role === "admin" || user.role === "manager") && (
          <Link
            to="/project/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow font-semibold transition"
          >
            Create Project
          </Link>
        )}
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-gray-100 transition"
        />
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading projects...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const projectTasks = tasks[project._id] || [];
            const statusCounts = statusLabels.reduce((acc, status) => {
              acc[status] = projectTasks.filter(
                (t) => t.status === status
              ).length;
              return acc;
            }, {});
            const formatDate = (dateInput) => {
              const date = new Date(dateInput);
              const day = String(date.getDate()).padStart(2, "0");
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const year = date.getFullYear();
              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");
              return `${day}-${month}-${year} ${hours}:${minutes}`;
            };

            const lastCreated =
              projectTasks.length > 0
                ? formatDate(
                    Math.max(...projectTasks.map((t) => new Date(t.createdAt)))
                  )
                : null;

            const lastCompleted =
              projectTasks.filter((t) => t.completedAt).length > 0
                ? formatDate(
                    Math.max(
                      ...projectTasks
                        .filter((t) => t.completedAt)
                        .map((t) => new Date(t.completedAt))
                    )
                  )
                : null;
            return (
              <div
                key={project._id}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition"
              >
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {project.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-2 dark:text-white" >
                  {statusLabels.map((status) => (
                    <span
                      key={status}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium shadow-sm"
                    >
                      <span className="text-lg">{statusIcons[status]}</span>
                      <span>{status}:</span>
                      <span className="font-bold">{statusCounts[status]}</span>
                    </span>
                  ))}
                </div>
                <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  {lastCreated && <span>Last Created: {lastCreated}</span>}
                  {lastCompleted && (
                    <span> &nbsp;|&nbsp; Last Completed: {lastCompleted}</span>
                  )}
                </div>
                <div className="flex gap-4 mt-2">
                  <Link
                    to={`/project/${project._id}/tasks`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium mt-2"
                  >
                    View Tasks
                  </Link>
                  {(user && (user.role === "admin" || user.role === "manager")) && (
                    <>
                      <Link
                        to={`/project/edit/${project._id}`}
                        className="text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium mt-2"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold mt-1"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
