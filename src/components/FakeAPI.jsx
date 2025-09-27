import React from "react";
import { Link } from "react-router-dom";

export default function FakeAPI() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>FakeAPI Tools</h1>
      <p>Select an option below:</p>
      <nav style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <Link to="#">Generate Fake Users</Link>
        <Link to="#">Random Data</Link>
        <Link to="#">API Playground</Link>
      </nav>
    </main>
  );
}
