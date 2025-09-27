
import React, { useState } from "react";
import { Box } from '@mui/material';
import { independentResource } from "./fakeApiData";

const verbs = Object.keys(independentResource);

export default function FakeAPI() {
  const [selectedVerb, setSelectedVerb] = useState(verbs[0]);
  const [itemId, setItemId] = useState("");
  const apiData = independentResource[selectedVerb];

  // Simulate GET by ID
  let simulatedResponse = apiData.response;
  if (selectedVerb === "GET" && itemId) {
    if (Array.isArray(apiData.response)) {
      simulatedResponse = apiData.response.find(item => String(item.id) === String(itemId)) || { error: "Item not found" };
    }
  }

  return (
  <Box sx={{ padding: '2rem', width: '100%', border: '1px solid red', display: 'flex', flexDirection: 'column' }}>
    <h1 style={{ textAlign: "center", width: "100%" }}>FakeAPI Tools
    </h1>
      <p style={{ textAlign: "center", width: "100%" }}>
        This FakeAPI tool lets you test your frontend or backend code with realistic JSON data.
        You can simulate GET, POST, PUT, and DELETE requests to see example request and response formats.<br/>
        Use these endpoints to quickly prototype, debug, or demo your app without needing a real backend.
        Each verb shows how to send data and what you can expect in return, making API development and testing easier.<br/>
      </p>
    <div style={{ display: "flex", flexDirection: "row", width: "100%", margin: "0 auto", alignItems: "flex-start", minHeight: "350px" }}>
        <div style={{ flex: 4, background: "#f5f5f5", borderRadius: 8, padding: "1rem", boxShadow: "0 0 4px #ddd" }}>
          <h3 style={{ textAlign: "left", marginBottom: "1rem" }}>HTTP Verbs</h3>
          {verbs.map((verb) => (
            <button
              key={verb}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem 0.8rem",
                fontWeight: selectedVerb === verb ? "bold" : "normal",
                color: '#fff',
                background:
                  verb === 'GET' ? (selectedVerb === verb ? '#1976d2' : '#2196f3') :
                  verb === 'POST' ? (selectedVerb === verb ? '#388e3c' : '#4caf50') :
                  verb === 'PUT' ? (selectedVerb === verb ? '#ffa000' : '#ffb300') :
                  verb === 'DELETE' ? (selectedVerb === verb ? '#d32f2f' : '#e53935') :
                  selectedVerb === verb ? '#757575' : '#bdbdbd',
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                transition: 'background 0.2s',
              }}
              onClick={() => setSelectedVerb(verb)}
            >
              {verb}
            </button>
          ))}
        </div>
    <div style={{ flex: 6, textAlign: "left", background: "#f9f9f9", padding: "1rem", borderRadius: 8, boxShadow: "0 0 4px #ddd", minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 6, boxShadow: '0 0 2px #ccc', padding: '1rem', marginBottom: '0.5rem' }}>
        <h3 style={{ marginTop: 0 }}>{selectedVerb} - Independent Resource</h3>
        {apiData.description && <p><strong>Description:</strong> {apiData.description}</p>}
        <div style={{ marginTop: '0.5rem' }}>
          <strong>Simulated API URL:</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
            <code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
              {selectedVerb === 'GET' && itemId ? `${window.location.origin}/FakeAPI/GET/${itemId}` : `${window.location.origin}/FakeAPI/${selectedVerb}`}
            </code>
            <button
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => navigator.clipboard.writeText(selectedVerb === 'GET' && itemId ? `${window.location.origin}/FakeAPI/GET/${itemId}` : `${window.location.origin}/FakeAPI/${selectedVerb}`)}
            >Copy URL</button>
          </div>
        </div>
        {selectedVerb === 'GET' && (
          <div style={{ marginTop: '0.7rem' }}>
            <label htmlFor="itemIdInput"><strong>Simulate GET by ID:</strong></label>
            <input
              id="itemIdInput"
              type="number"
              value={itemId}
              onChange={e => setItemId(e.target.value)}
              placeholder="Enter item id (e.g. 1)"
              style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: 4, border: '1px solid #ccc', width: '80px' }}
            />
          </div>
        )}
      </div>
      <div style={{ background: '#f5f5f5', borderRadius: 6, boxShadow: '0 0 2px #eee', padding: '1rem', marginBottom: '0.5rem', position: 'relative' }}>
        {apiData.request && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Request Example:</strong>
            <pre style={{ background: '#e3f2fd', borderRadius: 4, padding: '0.5rem', margin: 0 }}>{JSON.stringify(apiData.request, null, 2)}</pre>
            <button
              style={{ position: 'absolute', top: 10, right: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => navigator.clipboard.writeText(JSON.stringify(apiData.request, null, 2))}
            >Copy</button>
          </div>
        )}
        {apiData.response && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <strong>Response Example:</strong>
              <pre style={{ background: '#e8f5e9', borderRadius: 4, padding: '0.5rem', margin: 0, maxHeight: '220px', overflowY: 'auto' }}>{JSON.stringify(simulatedResponse, null, 2)}</pre>
            </div>
            <button
              style={{ alignSelf: 'start', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.9rem', marginTop: '1.5rem' }}
              onClick={() => navigator.clipboard.writeText(JSON.stringify(simulatedResponse, null, 2))}
            >Copy</button>
          </div>
        )}
      </div>
    </div>
      </div>
    </Box>
  );
}
