import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api";
import "../styles/AdminForm.css";

export default function AdminForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    languages_used: [],
    tags: [],
    visibility: "Public",
    collaborators: [],
  });

  const [collaboratorInput, setCollaboratorInput] = useState(""); // Username ya Email
  const [collaborators, setCollaborators] = useState([]); //collab ka naam 
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) errors.name = "Project name is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (formData.languages_used.length === 0) errors.languages_used = "At least one language is required.";
    if (formData.tags.length === 0) errors.tags = "At least one tag is required.";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    
    const usernameInput = collaboratorInput.trim();
    if (!usernameInput) {
      console.error("Invalid username provided:", usernameInput);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/get-id?username=${encodeURIComponent(usernameInput)}`);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        if (response.ok && data.userId) {
          setFormData((prevData) => ({
            ...prevData,
            collaborators: [...prevData.collaborators, data.userId],
          }));

          setCollaborators((prevCollaborators) => [
            ...prevCollaborators,
            usernameInput,
          ]);

          setCollaboratorInput("");
          console.log("Collaborator added:", data.userId);
        } else {
          console.error("User not found:", data.message);
        }
      } catch (jsonError) {
        console.error("Received non-JSON response:", text);
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const adminId = localStorage.getItem("userId");
    if (!adminId) {
      console.error("Admin ID is missing");
      return;
    }

    const projectData = {
      ...formData,
      admin: adminId,
    };

    console.log("Sending Project Data:", projectData);

    try {
      const response = await createProject(projectData);
      if (response && response.project) {
        navigate(`/codespace/${response.project._id}`);
      } else {
        console.error("Project creation failed:", response?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="admin-form-container">
      <div className="admin-form-content">
        <h2>Create Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project"
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Languages Used:</label>
            <input
              type="text"
              placeholder="Comma separated (e.g. JavaScript, Python)"
              onBlur={(e) =>
                setFormData({
                  ...formData,
                  languages_used: e.target.value.split(",").map((lang) => lang.trim()),
                })
              }
            />
            {errors.languages_used && <span className="error">{errors.languages_used}</span>}
          </div>

          <div className="form-group">
            <label>Tags:</label>
            <input
              type="text"
              placeholder="Comma separated tags"
              onBlur={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(",").map((tag) => tag.trim()),
                })
              }
            />
            {errors.tags && <span className="error">{errors.tags}</span>}
          </div>

          <div className="form-group">
            <label>Visibility:</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              required
            >
              <option value="" disabled>Select visibility</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>

          <div className="form-group">
            <label>Add Collaborators:</label>
            <div className="collaborator-input-group">
              <input
                type="text"
                placeholder="Enter Username"
                value={collaboratorInput}
                onChange={(e) => setCollaboratorInput(e.target.value)}
              />
              <button type="button" className="add-btn" onClick={handleAddCollaborator}>
                Add Collaborator
              </button>
            </div>
            <ul className="collaborator-list">
              {collaborators.map((collaborator, index) => (
                <li key={index}>{collaborator}</li>
              ))}
            </ul>
          </div>

          <button type="submit">Create Project</button>
        </form>
      </div>
    </div>
  );
}
