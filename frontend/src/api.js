export const registerUser = async (userData) => {
    try {
        const formData = new FormData();
        for (const key in userData) {
            formData.append(key, userData[key]);
        }

        const response = await fetch(`https://codeverse-iywl.onrender.com/api/auth/register`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            // Handle non-200 responses
            const errorData = await response.json();
            return { success: false, message: errorData.message || "Registration failed" };
        }

        return await response.json();
    } catch (error) {
        console.error("Network error during registration:", error);
        return { success: false, message: "Failed to connect to the server" };
    }
};

export const requestPasswordReset = async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return response.json();
};

export const resetPassword = async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
    });
    return response.json();
};

export const verifyEmail = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
            method: "GET",
        });
        
        return await response.json();
    } catch (error) {
        return { success: false, message: "Verification failed. Try again later." };
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
        }

        return data;
    } catch (error) {
        return { success: false, message: "Failed to connect to the server" };
    }
};
  
export const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); 

    if (!token) {
        throw new Error("No authentication token found!");
    }

    const response = await fetch(`${API_BASE_URL}/auth/getprofile`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
    });

    console.log("API Response:", response); 

    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }

    return response.json();
};

export const updateProfile = async (id,formData) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    const response = await fetch(`https://codeverse-iywl.onrender.com/api/auth/updateprofile/${id}`, {
        method: "PUT",
        headers: {
            //"Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: formData,
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API Error Response:", errorResponse); // Log the error response
        throw new Error("Failed to update profile");
    }

    return response.json();
};

export const deleteProfile = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    const response = await fetch(`https://codeverse-iywl.onrender.com/api/auth/deleteprofile/${userId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API Error Response:", errorResponse);
        throw new Error(errorResponse.message || "Failed to delete profile");
    }

    return response.json();
};

export const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    const response = await fetch(`${API_BASE_URL}/friends`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch friends list");
    }

    return response.json();
};


const API_URL = "https://codeverse-iywl.onrender.com/api/project";

const makeRequest = async (endpoint, method, body = null, token = null) => {
    try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        const data = await response.json();

        if (data.token && data.userId) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);  
          window.dispatchEvent(new Event("authChange")); 
        }
        return data;

    } catch (error) {
        console.log(error);
        return { success: false, message: "Failed to connect to the server" };
    }
};

export const createProject = async (projectData) => {
    const token = localStorage.getItem("token");
    console.log("Sending Project Data:", projectData);

    const response = await makeRequest("/create-project", "POST", projectData, token);
    
    console.log("Response from API:", response); 
    return response;
};

export const getProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    const response = await fetch("https://codeverse-iywl.onrender.com/api/project/get-all-project", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to fetch projects");
    }

    return response.json();
};

export const getProjectById = async (id) => {
    const token = localStorage.getItem("token");
    return makeRequest(`/get-project/${id}`, "GET", null, token);
};

export const updateProject = async (id, updatedData) => {
    const token = localStorage.getItem("token");
    return makeRequest(`/update-project/${id}`, "PUT", updatedData, token);
};

export const deleteProject = async (id) => {
    const token = localStorage.getItem("token");
    return makeRequest(`/delete-project/${id}`, "DELETE", null, token);
};

export const addCollaborator = async (projectId, collaboratorData) => {
    const token = localStorage.getItem("token");
    return makeRequest("/add-collaborator-project", "POST", { projectId, ...collaboratorData }, token);
};

export const removeCollaborator = async (projectId, collaboratorId) => {
    const token = localStorage.getItem("token");
    return makeRequest("/remove-collaborator-project", "POST", { projectId, collaboratorId }, token);
};

export const likeProject = async (projectId) => {
    const token = localStorage.getItem("token");
    return makeRequest("/like-project", "POST", { projectId }, token);
};

export const unlikeProject = async (projectId) => {
    const token = localStorage.getItem("token");
    return makeRequest("/unlike-project", "POST", { projectId }, token);
};

export const changeProjectStatus = async (projectId, newStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    const response = await fetch("https://codeverse-iywl.onrender.com/api/project/change-status-project", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId, status: newStatus }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to change project status");
    }

    return response.json();
};


export const getAllProjectFiles = async (projectId) => {
    const token = localStorage.getItem("token");
    const response = await makeRequest(`/get-project-files/${projectId}`, "GET", null, token);
    console.log("API response for all project files:", response);
    return Array.isArray(response.files) ? response.files : [];
};

const API_BASE_URL = 'https://codeverse-iywl.onrender.com/api';

const makeRequest1 = async (url, options) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error making request:', error);
        throw error;
    }
};

export const saveFileContent = async (projectId, filePath, content) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    const url = `${API_BASE_URL}/project/${projectId}/save-file`;
    console.log("Saving file to URL:", url);
    console.log("Project ID:", projectId);
    console.log("File Path:", filePath);
    console.log("Content:", content);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId, filePath, content }),
    };

    return makeRequest1(url, options);
};

export const compileCode = async (source_code, language_id, stdin = '') => {
    try {
        const response = await fetch('https://codeverse-iywl.onrender.com/api/compile/compile-the-code', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source_code, language_id, stdin }),
        });

        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('Error response from backend:', errorResponse);
            throw new Error(`Failed to compile code: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error compiling code:', error);
        throw error;
    }
};

export async function deleteFile(projectId, filename) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    console.log("Deleting file:", { projectId, filename });

    try {
        const response = await fetch(`https://codeverse-iywl.onrender.com/api/project/${projectId}/files/${filename}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend error response:", errorText);
            throw new Error('Failed to delete file');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

export async function renameFile(projectId, oldFilename, newFilename) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    console.log("Renaming file:", { projectId, oldFilename, newFilename });

    try {
        const response = await fetch(`${API_BASE_URL}/project/${projectId}/file/${oldFilename}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ newFilename }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend error response:", errorText);
            throw new Error('Failed to rename file');
        }

        return await response.json();
    } catch (error) {
        console.error('Error renaming file:', error);
        throw error;
    }
}

export const getFileContent = async (projectId, filePath) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    const url = `${API_BASE_URL}/project/${projectId}/files/content`; // Ensure the correct endpoint is used
    console.log("Fetching file content from URL:", url);
    console.log("Project ID:", projectId);
    console.log("File Path:", filePath);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ filePath }), // Send the filePath in the request body
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching file content:", errorText);
        throw new Error("Failed to fetch file content");
    }

    return response.json();
};

export const getAllCollaborators = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/project/get-all-collaborators`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch collaborators");
    }

    return response.json();
};

export const getProjectsByAdmin = async (adminId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/project/get-projects-by-admin/${adminId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch projects by admin");
    }

    return response.json();
};

export const getProjectsByCollaborator = async (userId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/project/get-projects-by-collaborator/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch projects by collaborator");
    }

    return response.json();
};

export const getChats = async (projectId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found!");
    }

    try {
        const response = await fetch(`https://codeverse-iywl.onrender.com/api/chat/get-project/${projectId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorResponse = await response.text(); // Read the response as text
            console.error("Error response:", errorResponse);
            throw new Error(`Failed to fetch chats: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching chats:", error);
        throw error;
    }
};

