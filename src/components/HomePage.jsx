import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => (
  <main style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
    <h1 style={{ textAlign: "center" }}>Welcome to IndiBargain!</h1>
    <nav style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start", width: "220px" }}>
      <Link to="/memes">Memes</Link>
      <Link to="/facts">Facts</Link>
      <Link to="/recipes">Recipes</Link>
      <Link to="/FakeAPI">FakeAPI Tools</Link>
    </nav>
  </main>
);

export default HomePage;