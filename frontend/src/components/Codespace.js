import { autocompletion } from "@codemirror/autocomplete";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { xml } from "@codemirror/lang-xml";
// import { java } from "@codemirror/lang-java";
import { lintGutter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaFileAlt, FaMoon, FaPlay, FaSave, FaSun, FaTrash } from 'react-icons/fa';
import { useParams } from "react-router-dom";
import { compileCode, deleteFile, fetchProfile, getAllProjectFiles, getFileContent, renameFile, saveFileContent } from "../api";
import { useAuth } from "../context/AuthContext";
import '../styles/Codespace.css';
import Chat from './Chat';
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to the backend

function CodeEditor({ language = "JavaScript" }) {
  const { projectId } = useParams();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  const [output, setOutput] = useState("");
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileUsername, setProfileUsername] = useState(null);

  const languageExtensions = {
    JavaScript: javascript(),
    Python: python(),
    C: cpp(),
    Java: cpp(),
    XML: xml(),
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetchProfile();
        if (response.success) {
          setProfileUsername(response.user.username);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        console.log("Fetching files for project:", projectId);
        const projectFiles = await getAllProjectFiles(projectId);
        console.log("Fetched files:", projectFiles);
        setFiles(Array.isArray(projectFiles) ? projectFiles : []);
        if (projectFiles.length > 0) {
          setCurrentFile(projectFiles[0].filepath);
        }
      } catch (error) {
        console.error("Error fetching project files:", error);
        setError(error.message || "Failed to load project files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [projectId]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorViewRef.current) {
        editorViewRef.current.destroy();
    }

    const startState = EditorState.create({
        doc: currentFile
            ? files.find(file => file.filepath === currentFile)?.content || "// Start coding..."
            : "// Start coding...",
        extensions: [
            keymap.of([...defaultKeymap, indentWithTab]),
            autocompletion(),
            lintGutter(), // Remove this if you don't want linting gutter
            EditorView.lineWrapping,
            EditorState.tabSize.of(2),
            languageExtensions[language] || javascript(),
            theme === "dark" ? oneDark : [],
            EditorView.theme({
                ".cm-gutters": {
                    display: "none", 
                },
            }),
        ],
    });

    editorViewRef.current = new EditorView({
        state: startState,
        parent: editorRef.current,
    });

    return () => {
        editorViewRef.current?.destroy();
    };
}, [language, theme, currentFile, files]);

useEffect(() => {
    if (currentFile && editorViewRef.current) {
        const file = files.find(file => file.filepath === currentFile);
        if (file) {
            const state = EditorState.create({
                doc: file.content || "// Start coding...",
                extensions: [
                    keymap.of([...defaultKeymap, indentWithTab]),
                    autocompletion(),
                    lintGutter(),
                    languageExtensions[language] || javascript(),
                    theme === "dark" ? oneDark : [],
                    EditorView.theme({
                        ".cm-gutters": {
                            display: "none", // Ensure the gutter is hidden
                        },
                    }),
                ],
            });
            editorViewRef.current.setState(state);
        }
    }
}, [currentFile, files, language, theme]);

  useEffect(() => {
    // Join the project room
    socket.emit("joinRoom", projectId);
    console.log('Joined room:', projectId);

    // Listen for file updates
    socket.on("fileUpdate", ({ filePath, content }) => {
      console.log('File updated:', filePath, content);
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.filepath === filePath ? { ...file, content } : file
        )
      );
      if (currentFile === filePath) {
        const state = EditorState.create({
          doc: content,
          extensions: [
            keymap.of([...defaultKeymap, indentWithTab]),
            autocompletion(),
            lintGutter(),
            languageExtensions[language] || javascript(),
          ],
        });
        editorViewRef.current.setState(state);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, currentFile, language]);

  const handleFileChange = (content) => {
    if (currentFile) {
      console.log('Emitting fileChange:', { projectId, filePath: currentFile, content });
      socket.emit("fileChange", { projectId, filePath: currentFile, content });
    }
  };

  const handleCompileCode = async () => {
    await handleSaveFile();
    const code = editorViewRef.current.state.doc.toString();

    const languageMap = {
        JavaScript: 63, // Node.js
        Python: 71,     // Python 3
        C: 50,          // C (GCC 9.2.0)
        Java: 62,       // Java (OpenJDK 13.0.1)
        XML: null       
    };

    const languageId = languageMap[language];
    if (!languageId) {
        setOutput("Language not supported for execution.");
        return;
    }

    try {
        const response = await compileCode(code, languageId);
        if (response.stdout) {
            setOutput(response.stdout);
        } else if (response.stderr) {
            setOutput(`Error: ${response.stderr}`);
        } else if (response.compile_output) {
            setOutput(`Compilation Error: ${response.compile_output}`);
        } else {
            setOutput("Unknown error occurred.");
        }
    } catch (error) {
        console.error("Error executing code:", error);
        setOutput("Failed to execute code. Please try again.");
    }
  };

  const handleAddFile = async (fileName) => {
    if (!fileName) return;
    const filePath = `${fileName}`; // Only the file name is sent, as the backend handles the project folder structure
    const newFile = { filename: fileName, filepath: filePath, content: "" };

    try {
        const response = await saveFileContent(projectId, filePath, "");
        if (!response.success) {
          console.log("New file saved successfully");
          const updatedFiles = await getAllProjectFiles(projectId);
          setFiles(Array.isArray(updatedFiles) ? updatedFiles : []);
          setCurrentFile(filePath);
        } else {
            console.error("Failed to save new file:", response.message);
            setError(response.message || "Failed to save new file.");
             
        }
    } catch (error) {
        console.error("Error saving new file:", error);
        setError(error.message || "Failed to save new file.");
    }
  };

  const handleSaveFile = async () => {
    if (currentFile) {
      const content = editorViewRef.current.state.doc.toString();
      setFiles(files.map(file => file.filepath === currentFile ? { ...file, content } : file));
      try {
        const response = await saveFileContent(projectId, currentFile, content);
        if (response.success) {
          console.log('File saved successfully');
          const updatedFiles = await getAllProjectFiles(projectId);
          setFiles(Array.isArray(updatedFiles) ? updatedFiles : []);
        } else {
          console.error('Failed to save file:', response.message);
        }
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }
  };

  const handleDeleteFile = async (file) => {
    const filename = file.split('/').pop(); // Extract filename from path
    console.log("Deleting file:", filename);

    try {
        await deleteFile(projectId, filename); // Ensure correct filename is sent
        const newFiles = files.filter(f => f.filepath !== file);
        setFiles(newFiles);
        setCurrentFile(newFiles.length > 0 ? newFiles[0].filepath : null);
    } catch (error) {
        console.error("Error deleting file:", error);
        setError(error.message || "Failed to delete file.");
    }
  };

  const handleRenameFile = async (oldFile, newFile) => {
    const oldFilename = oldFile.split('/').pop(); // Extract filename from path
    const newFilename = newFile.split('/').pop();
    const newFilePath = oldFile.replace(oldFilename, newFilename);

    console.log("Old Filename:", oldFilename);
    console.log("New Filename:", newFilename);
    console.log("New File Path:", newFilePath);

    try {
        await renameFile(projectId, oldFilename, newFilename); // Ensure correct filenames are sent
        const newFiles = files.map(file => file.filepath === oldFile ? { ...file, filename: newFilename, filepath: newFilePath } : file);
        setFiles(newFiles);
        setCurrentFile(newFilePath);
    } catch (error) {
        console.error("Error renaming file:", error);
        setError(error.message || "Failed to rename file.");
    }
  };

  const handleFileClick = async (filePath) => {
    try {
      console.log("Clicked file:", filePath);
      const fileContent = await getFileContent(projectId, filePath);
      console.log("Fetched file content:", fileContent);
      const updatedFiles = files.map(file => file.filepath === filePath ? { ...file, content: fileContent.content } : file
      );
      setFiles(updatedFiles);
      setCurrentFile(filePath);
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="codespace-container">
      
      <div className="codespace-layout">
        <div className="file-explorer">
          <h3>Explorer</h3>
          <button className="toolbar-btn" onClick={() => handleAddFile(prompt("Enter file name"))}>
            <FaFileAlt /> New File
          </button>
          <div className="file-list">
            {files.map(file => (
              <div
                key={file.filepath}
                className={`file-item ${currentFile === file.filepath ? 'active' : ''}`}
                onClick={() => handleFileClick(file.filepath)}
              >
                <span>{file.filename}</span>
                <div className="file-actions">
                  <FaEdit onClick={(e) => {
                    e.stopPropagation();
                    handleRenameFile(file.filepath, prompt("Enter new file name", file.filename));
                  } } />
                  <FaTrash onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.filepath);
                  } } />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="code-editor">
          <div className="editor-toolbar">
            <button className="toolbar-btn" onClick={handleSaveFile}>
              <FaSave /> Save
            </button>
            <button className="toolbar-btn" onClick={handleCompileCode}>
              <FaPlay /> Run
            </button>
          </div>
          <div ref={editorRef} className={`editor-wrapper ${theme}-theme`} />
        </div>
        <div className="output-panel">
          <h3>Output</h3>
          <pre>{output}</pre>
        </div>
      </div>
      <Chat projectId={projectId} username={profileUsername || user?.username} />
    </div>
  );
};

export default CodeEditor;
