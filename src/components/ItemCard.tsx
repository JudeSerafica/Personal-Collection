"use client";

import { useState } from "react";

export default function ItemCard({
  id,
  title,
  desc,
  image,
  onView,
  onEdit,
  onDelete,
  onMove,
  collections,
  currentCollectionId,
}: {
  id: number;
  title: string;
  desc: string;
  image?: string;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onMove: (itemId: number, collectionId: number) => void;
  collections: { id: number; name: string; icon: string }[];
  currentCollectionId?: number;
}) {
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);

  return (
    <div className="card">
      {/* Delete Button - Top Right */}
      <button 
        className="card-delete-btn" 
        onClick={() => onDelete(id)}
        title="Delete item"
      >
        ×
      </button>

      {/* Image */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        {image ? (
          <img
            src={image}
            alt={title}
            onDoubleClick={() => onView(id)}
            onTouchEnd={(e) => {
              // Handle double tap on mobile
              const now = Date.now();
              const DOUBLE_TAP_DELAY = 300;
              const target = e.target as HTMLElement & { lastTap?: number };
              if (target.lastTap && (now - target.lastTap) < DOUBLE_TAP_DELAY) {
                onView(id);
              }
              target.lastTap = now;
            }}
            style={{
              width: "100%",
              maxWidth: "250px",
              height: "150px",
              objectFit: "contain",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              margin: "0 auto",
              background: "#f9fafb",
              cursor: "pointer",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1)";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: "250px",
              height: "150px",
              background: "#e5e7eb",
              borderRadius: "6px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: "12px"
            }}
          >
            No Image
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="card-title" style={{ textAlign: "center", marginBottom: "6px", color: "#000000" }}>{title}</h3>

      {/* Description */}
      <p className="card-desc" style={{ textAlign: "center", marginBottom: "12px" }}>{desc}</p>

      {/* Collection Info */}
      {currentCollectionId && (
        <div style={{
          textAlign: "center",
          marginBottom: "16px",
          fontSize: "12px",
          color: "#6b7280",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px"
        }}>
          <span>In:</span>
          {(() => {
            const collection = collections.find(c => c.id === currentCollectionId);
            return collection ? (
              <>
                <span>{collection.icon}</span>
                <span style={{ color: "#374151", fontWeight: "500" }}>{collection.name}</span>
              </>
            ) : (
              <span style={{ color: "#ef4444", fontStyle: "italic" }}>Unassigned</span>
            );
          })()}
        </div>
      )}

      {/* Actions */}
      <div className="card-actions">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMoveDropdown(!showMoveDropdown)}
              className="card-button"
              style={{ minWidth: "80px" }}
            >
              Move to:
            </button>
            {showMoveDropdown && (
              <div style={{
                position: "absolute",
                bottom: "100%",
                left: "0",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                zIndex: 1000,
                minWidth: "200px",
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      onMove(id, collection.id);
                      setShowMoveDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      borderBottom: "1px solid #f3f4f6"
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.background = "#f9fafb"}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.background = "none"}
                  >
                    {collection.icon} {collection.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onView(id)} className="card-button">View</button>
            <button onClick={() => onEdit(id)} className="card-button primary">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
