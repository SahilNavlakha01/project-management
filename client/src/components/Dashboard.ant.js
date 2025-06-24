import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { message, Row, Col, Card, Button, Input, Modal, Typography, Tag, Space, Spin, Empty } from "antd";
import Layout from "./Layout";
import { AuthContext } from "../context/AuthContext";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FaTasks, FaEdit, FaTrash, FaCheckCircle, FaClipboardList, FaHourglassHalf, FaFlask } from 'react-icons/fa';

const { Title, Paragraph } = Typography;
const statusColors = {
  "To Do": "default",
  Doing: "processing",
  Testing: "warning",
  Completed: "success",
};
const statusIcons = {
  "To Do": <FaClipboardList style={{ color: '#888' }} />,
  Doing: <FaHourglassHalf style={{ color: '#f59e42' }} />,
  Testing: <FaFlask style={{ color: '#1677ff' }} />,
  Completed: <FaCheckCircle style={{ color: '#52c41a' }} />,
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

  const showDeleteConfirm = (projectId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this project?',
      icon: <ExclamationCircleOutlined />,
      content: 'This will also delete all associated tasks.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleDeleteProject(projectId),
    });
  };

  const handleDeleteProject = async (projectId) => {
    message.loading({ content: 'Deleting project...', key: 'deleteProject' });
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      setTasks((prev) => {
        const newTasks = { ...prev };
        delete newTasks[projectId];
        return newTasks;
      });
      message.success({ content: 'Project deleted successfully!', key: 'deleteProject' });
    } catch (err) {
      message.error({ content: 'Failed to delete project.', key: 'deleteProject' });
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Row justify="space-between" align="middle" style={{ marginBottom: 32, flexWrap: 'wrap' }} gutter={[16, 16]}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Projects</Title>
        </Col>
        <Col>
          {user && (user.role === "admin" || user.role === "manager") && (
            <Link to="/project/new">
              <Button type="primary" size="large">Create Project</Button>
            </Link>
          )}
        </Col>
      </Row>
      <Row style={{ marginBottom: 24 }} gutter={[16, 16]}>
        <Col span={24}>
          <Input.Search
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            size="large"
            style={{ maxWidth: 400 }}
          />
        </Col>
      </Row>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 48 }}><Spin size="large" /></div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: '#ff4d4f' }}>{error}</div>
      ) : filteredProjects.length === 0 ? (
        <Empty description="No projects found" style={{ marginTop: 48 }} />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredProjects.map((project) => {
            const projectTasks = tasks[project._id] || [];
            const statusCounts = statusLabels.reduce((acc, status) => {
              acc[status] = projectTasks.filter((t) => t.status === status).length;
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
                ? formatDate(Math.max(...projectTasks.map((t) => new Date(t.createdAt))))
                : null;
            const lastCompleted =
              projectTasks.filter((t) => t.completedAt).length > 0
                ? formatDate(Math.max(...projectTasks.filter((t) => t.completedAt).map((t) => new Date(t.completedAt))))
                : null;
            return (
              <Col xs={24} sm={24} md={12} lg={8} xl={6} key={project._id}>
                <Card
                  title={<span style={{ color: '#1677ff', fontWeight: 700, fontSize: 20 }}><FaTasks style={{ marginRight: 8, verticalAlign: 'middle' }} />{project.title}</span>}
                  extra={
                    <Space>
                      <Link to={`/project/${project._id}/tasks`}>
                        <Button icon={<FaTasks />} type="link">View Tasks</Button>
                      </Link>
                      {(user && (user.role === "admin" || user.role === "manager")) && (
                        <>
                          <Link to={`/project/edit/${project._id}`}>
                            <Button icon={<FaEdit />} type="link">Edit</Button>
                          </Link>
                          <Button icon={<FaTrash />} danger type="link" onClick={() => showDeleteConfirm(project._id)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </Space>
                  }
                  style={{ borderRadius: 16, minHeight: 320, background: '#fff', boxShadow: '0 2px 12px #e6e6e6' }}
                  bodyStyle={{ padding: 20 }}
                  hoverable
                >
                  <Paragraph ellipsis={{ rows: 2 }}>{project.description}</Paragraph>
                  <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
                    {statusLabels.map((status) => (
                      <Col key={status} span={12}>
                        <Tag color={statusColors[status]} icon={statusIcons[status]} style={{ fontSize: 16, padding: '4px 12px', marginBottom: 4, background: '#f5f7fa', border: 'none' }}>
                          {status}: <b>{statusCounts[status]}</b>
                        </Tag>
                      </Col>
                    ))}
                  </Row>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {lastCreated && <span>Last Created: {lastCreated}</span>}
                    {lastCompleted && (
                      <span> &nbsp;|&nbsp; Last Completed: {lastCompleted}</span>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Layout>
  );
};

export default Dashboard;
