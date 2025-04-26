import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { changeProjectStatus, getProjects } from "../api";
import "../styles/Project.css";
import { Button } from "../ui/button";

// toast.configure();

export default function Project() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProjects();
        console.log("API Response:", response); 

        if (!response) throw new Error("No response received from API.");

        if (response.success && Array.isArray(response.projects)) {
          setProjects(response.projects);
        } else if (Array.isArray(response)) {
          setProjects(response);
        } else {
          throw new Error(response.message || "Invalid response format.");
        }
      } catch (err) {
        console.error(" API Error:", err.message);
        setError(err.message || "Failed to load projects.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangeStatus = async (projectId, newStatus) => {
    try {
        await changeProjectStatus(projectId, newStatus);
        setProjects((prev) =>
            prev.map((p) => (p._id === projectId ? { ...p, status: newStatus } : p))
        );
        toast.success("Project status updated successfully!");
    } catch (error) {
        if (error.message === "Only the admin can change the project status") {
            toast.error("You cannot change the status as you are not the admin of this project.");
        } else {
            console.error("Error changing project status:", error.message);
            setError(error.message || "Failed to update project status.");
            toast.error("Failed to update project status.");
        }
    }
};

  const handleViewProject = (project) => {
    if (project.visibility === "Private" && !project.isCollaborator) {
      alert("You do not have access to this project.");
      return;
    }
    navigate(`/codespace/${project._id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="project-container">
      <div className="workspace">
        <div className="project-header">
          <h1>Project Management Dashboard</h1>
          <Button onClick={() => navigate("/admin-form")} className="add-project-button">
            + New Project
          </Button>
        </div>

        <div className="project-stats">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <p>{projects.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Projects</h3>
            <p>{projects.filter(p => p.status === 'Active').length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>{projects.filter(p => p.status === 'Completed').length}</p>
          </div>
        </div>

        <div className="projects-section">
          <h2>Your Projects</h2>
          <div className="projects-grid">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-card-header">
                    <h3>{project.name}</h3>
                    <span className={`status ${project.status?.toLowerCase()}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="description">{project.description}</p>

                  <div className="project-metadata">
                    <div className="metadata-item">
                      <span className="label">Languages:</span>
                      <div className="tags">
                        {project.languages_used?.map((lang, index) => (
                          <span key={index} className="tag">{lang}</span>
                        ))}
                      </div>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Tags:</span>
                      <div className="tags">
                        {project.tags?.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Visibility:</span>
                      <span className="value">{project.visibility}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Created:</span>
                      <span className="value">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="collaborators-section">
                    <h4>Team Members</h4>
                    <div className="collaborators-list">
                      {project.collaborators?.map((collab) => (
                        <div key={collab.id} className="collaborator-item">
                          <div className="collaborator-info">
                            <span className="collaborator-name">{collab.username}</span>
                            <span className="collaborator-email">{collab.email}</span>
                          </div>
                          <span className={collab.online ? "status-online" : "status-offline"}>
                            {collab.online ? "🟢 Online" : "⭘ Offline"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="project-actions">
                    <Button
                      onClick={() => handleViewProject(project)}
                      className="view-details-button"
                    >
                      View Project
                    </Button>
                    <Button 
                      className="change-status-button"
                      onClick={() => handleChangeStatus(project._id, 
                        project.status === "Completed" ? "Active" : "Completed")}
                    >
                      Change Status
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-projects">
                <p>No projects found. Create your first project to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
