
import React, { useState } from "react";
import { Box } from '@mui/material';
import { independentResource } from "./fakeApiData";

const verbs = Object.keys(independentResource);

export default function FakeAPI() {
  const [selectedVerb, setSelectedVerb] = useState(verbs[0]);
  const apiData = independentResource[selectedVerb];

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
  <div style={{ flex: 6, textAlign: "left", background: "#f9f9f9", padding: "1rem", borderRadius: 8, boxShadow: "0 0 4px #ddd", minWidth: 0 }}>
          <h3>{selectedVerb} - Independent Resource</h3>
          {apiData.description && <p><strong>Description:</strong> {apiData.description}</p>}
          {apiData.request && (
            <div>
              <strong>Request Example:</strong>
              <pre>{JSON.stringify(apiData.request, null, 2)}</pre>
            </div>
          )}
          {apiData.response && (
            <div>
              <strong>Response Example:</strong>
              <pre>{JSON.stringify(apiData.response, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </Box>
  );
}
