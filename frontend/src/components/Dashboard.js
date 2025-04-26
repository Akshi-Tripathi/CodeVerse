import { motion } from "framer-motion";
import { Folder, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, Cell, Pie, PieChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { getProjectsByAdmin, getProjectsByCollaborator } from "../api"; // Import the new API functions
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [createdProjects, setCreatedProjects] = useState([]);
  const [collaboratingProjects, setCollaboratingProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]); // Combined list of all projects
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        console.log("User ID (for admin and collaborator):", userId);

        // Fetch projects created by the admin
        const adminProjectsResponse = await getProjectsByAdmin(userId);
        console.log("Projects created by admin:", adminProjectsResponse);

        if (adminProjectsResponse.success) {
          setCreatedProjects(adminProjectsResponse.projects);
        }

        // Fetch projects where the user is a collaborator
        const collaboratorProjectsResponse = await getProjectsByCollaborator(userId);
        console.log("Projects where user is a collaborator:", collaboratorProjectsResponse);

        if (collaboratorProjectsResponse.success) {
          setCollaboratingProjects(collaboratorProjectsResponse.projects);
        }

        // Combine all projects for the graph
        const allProjectsData = [
          ...(adminProjectsResponse.success ? adminProjectsResponse.projects : []),
          ...(collaboratorProjectsResponse.success ? collaboratorProjectsResponse.projects : []),
        ];
        setAllProjects(allProjectsData);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format data for the bar chart
  const formatBarChartData = () => {
    return allProjects.map(project => ({
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      progress: project.progress || 0,
      timeWorked: project.timeWorked || 0,
      fullName: project.name,
    }));
  };

  // Format data for the pie chart
  const formatPieChartData = () => {
    const total = allProjects.length;
    const created = createdProjects.length;
    const collaborating = collaboratingProjects.length;

    return [
      { name: 'Created Projects', value: created, color: '#8884d8' },
      { name: 'Collaborating Projects', value: collaborating, color: '#82ca9d' },
    ];
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.fullName}</p>
          <p className="tooltip-progress">Progress: {payload[0].value}%</p>
          <p className="tooltip-time">Time: {payload[1].value} hrs</p>
        </div>
      );
    }
    return null;
  };

  // Replace the existing chart section with this new implementation
  const renderCharts = () => (
    <div className="dashboard-section charts-section">
      <div className="charts-container">
        <div className="chart-box">
          <h2>Projects Progress Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatBarChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={60} 
                stroke="#ccc"
              />
              <YAxis stroke="#ccc" />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="progress" name="Progress %" fill="#8884d8" />
              <Bar dataKey="timeWorked" name="Time (hrs)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Project Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatPieChartData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {formatPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loading-spinner"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="main-content">
        <motion.main className="content">
          <div className="dashboard-header">
            <h1>Welcome to Your Dashboard</h1>
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          {renderCharts()}
          <div className="dashboard-section">
            <h2>Projects You Created</h2>
            <div className="dashboard-cards">
              {createdProjects.map((project, index) => (
                <div className="dashboard-card" key={index}>
                  <Folder size={28} className="icon" />
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                  <p>Time Worked: {project.timeWorked || 20} hrs</p>
                  <p>Progress: {project.progress || 30}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Projects You're Collaborating On</h2>
            <div className="dashboard-cards">
              {collaboratingProjects.map((project, index) => (
                <div className="dashboard-card" key={index}>
                  <Folder size={28} className="icon" />
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                  <p>Time Worked: {project.timeWorked || 10} hrs</p>
                  <p>Progress: {project.progress || 50}%</p>
                </div>
              ))}
            </div>
          </div>

          
        </motion.main>
      </div>
    </div>
  );
}