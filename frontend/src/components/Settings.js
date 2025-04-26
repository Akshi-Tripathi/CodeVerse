import React, { useState, useEffect } from "react";
import { Switch, Tooltip } from "@mui/material";
import { FaCode, FaPalette, FaCog, FaLock, FaUsers, FaKeyboard } from "react-icons/fa";
import "../styles/Settings.css";
import { themes } from '../config/themes';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: "dark",
    fontSize: "14",
    tabSize: "2",
    autoSave: true,
    liveCollaboration: true,
    autoComplete: true,
    lineNumbers: true,
    bracketMatching: true,
    syntaxHighlighting: true,
    chatNotifications: true,
    keyboardShortcuts: true,
    twoFactorAuth: false
  });

  const [saveStatus, setSaveStatus] = useState("");

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    showSaveStatus();
  };

  const showSaveStatus = () => {
    setSaveStatus("Settings saved successfully!");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    const root = document.documentElement;
    
    // Apply all theme colors to CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Store theme preference in localStorage
    localStorage.setItem('preferred-theme', themeName);
    updateSetting("theme", themeName);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred-theme') || 'dark';
    applyTheme(savedTheme);
  }, []);

  return (
    <div className="settings-container">
      <h2>CoderzHub Settings</h2>
      {saveStatus && <div className="save-status">{saveStatus}</div>}

      <div className="settings-grid">
        
        <div className="settings-card">
          <div className="card-header">
            <FaPalette className="card-icon" />
            <h3>Theme Settings</h3>
          </div>
          <div className="setting-option">
            <label>Select Theme</label>
            <select 
              value={settings.theme} 
              onChange={(e) => applyTheme(e.target.value)}
              className="theme-select"
            >
              {Object.entries(themes).map(([key, theme]) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </select>
          </div>
        </div>


        <div className="settings-card">
          <div className="card-header">
            <FaCode />
            <h3>Editor Behavior</h3>
          </div>
          <div className="setting-option">
            <Tooltip title="Automatically save your work">
              <span>Auto Save</span>
            </Tooltip>
            <Switch 
              checked={settings.autoSave}
              onChange={(e) => updateSetting("autoSave", e.target.checked)}
            />
          </div>
          <div className="setting-option">
            <Tooltip title="Show line numbers in editor">
              <span>Line Numbers</span>
            </Tooltip>
            <Switch 
              checked={settings.lineNumbers}
              onChange={(e) => updateSetting("lineNumbers", e.target.checked)}
            />
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <FaUsers />
            <h3>Collaboration</h3>
          </div>
          <div className="setting-option">
            <Tooltip title="Enable real-time collaboration">
              <span>Live Collaboration</span>
            </Tooltip>
            <Switch 
              checked={settings.liveCollaboration}
              onChange={(e) => updateSetting("liveCollaboration", e.target.checked)}
            />
          </div>
          <div className="setting-option">
            <Tooltip title="Enable chat notifications">
              <span>Chat Notifications</span>
            </Tooltip>
            <Switch 
              checked={settings.chatNotifications}
              onChange={(e) => updateSetting("chatNotifications", e.target.checked)}
            />
          </div>
        </div>
        <div className="settings-card">
          <div className="card-header">
            <FaLock />
            <h3>Security</h3>
          </div>
          <div className="setting-option">
            <Tooltip title="Enable two-factor authentication">
              <span>Two-Factor Authentication</span>
            </Tooltip>
            <Switch 
              checked={settings.twoFactorAuth}
              onChange={(e) => updateSetting("twoFactorAuth", e.target.checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
