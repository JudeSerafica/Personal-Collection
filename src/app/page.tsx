"use client";

import { useEffect } from "react";
import Link from "next/link";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * HomePage component displays the main page of the application.
 * It includes a header, a paragraph, a button to login, and a section
 * with three cards showcasing the features of the app.
 */
/*******  18841868-1f7d-4116-a039-ff1ed017fdef  *******/export default function HomePage() {
  useEffect(() => {
    document.body.style.background =
      "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #3b0764 100%)";
  }, []);

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
    padding: "3rem 1rem",
  };

  const logoStyle: React.CSSProperties = {
    width: "100px",
    height: "100px",
    marginBottom: "1.5rem",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(255,255,255,0.3)",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "3rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "1rem",
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    maxWidth: "600px",
    lineHeight: "1.6",
    marginBottom: "2rem",
    color: "#e5e7eb",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    color: "#3b0764",
    padding: "0.75rem 1.75rem",
    borderRadius: "8px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "transform 0.2s ease, background-color 0.3s ease",
  };

  const sectionStyle: React.CSSProperties = {
    marginTop: "5rem",
    width: "100%",
    maxWidth: "1000px",
    textAlign: "center",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "2rem",
    color: "#fff",
  };

  const cardsContainer: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "10px",
    width: "280px",
    textAlign: "left",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  };

  const cardTitle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#3b0764",
    marginBottom: "0.5rem",
  };

  const cardText: React.CSSProperties = {
    color: "#3b0764",
    fontSize: "0.95rem",
    lineHeight: "1.4",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Personal Collection</h1>
      <p style={paragraphStyle}>
        Organize, store, and cherish your favorite items all in one place.
        Create a personal digital space for your photos, memories, collectibles,
        and creative projects — beautifully displayed and always accessible.
      </p>
      <Link href="/login" style={buttonStyle}>
        Get Started
      </Link>

      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Everything You Need to Preserve What Matters</h2>
        <div style={cardsContainer}>
          <div style={cardStyle}>
            <h3 style={cardTitle}>🖼️ Memory Gallery</h3>
            <p style={cardText}>
              Upload photos, keepsakes, or artworks and keep them neatly
              organized in your personal collection gallery.
            </p>
          </div>
          <div style={cardStyle}>
            <h3 style={cardTitle}>📂 Smart Organization</h3>
            <p style={cardText}>
              Sort and categorize your collections with tags and folders so you
              can easily find what you need anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}