"use client";
import { useState, useEffect } from "react";
import ClientLayout from "@/components/ClientLayout";
import { supabase } from "@/supabaseClient";

interface Collection {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  itemCount?: number;
}

export default function MyCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionItems, setCollectionItems] = useState<any[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isItemViewModalOpen, setIsItemViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isItemDeleteModalOpen, setIsItemDeleteModalOpen] = useState(false);
  const [itemToDeleteFromCollection, setItemToDeleteFromCollection] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#2563eb",
    icon: "📂",
  });

  const fetchCollections = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch collections
    const { data: collectionsData, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching collections:", error);
      setLoading(false);
      return;
    }

    // Fetch item counts for each collection
    const collectionsWithCounts = await Promise.all(
      (collectionsData || []).map(async (collection) => {
        const { count } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("collection_id", collection.id);

        return { ...collection, itemCount: count || 0 };
      })
    );

    setCollections(collectionsWithCounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (!userId) return;

    const { data, error } = await supabase
      .from("collections")
      .insert([
        {
          user_id: userId,
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection");
      return;
    }

    if (data && data.length > 0) {
      setCollections((prev) => [{ ...data[0], itemCount: 0 }, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: "", description: "", color: "#2563eb", icon: "📂" });
    }
  };

  const handleDeleteCollection = async (id: number) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    const { error } = await supabase.from("collections").delete().eq("id", id);

    if (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection");
      return;
    }

    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleViewCollection = async (collection: Collection) => {
    setSelectedCollection(collection);
    
    // Fetch items in this collection
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("collection_id", collection.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching collection items:", error);
      setCollectionItems([]);
    } else {
      setCollectionItems(data || []);
    }
  };

  const handleCloseCollectionView = () => {
    setSelectedCollection(null);
    setCollectionItems([]);
  };

  return (
    <ClientLayout>
      <div className="content-wrapper collections-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 className="page-title">📂 My Collections</h1>
            <p className="page-description">
              Organize and manage all your collected items in one place.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setIsGridView(!isGridView)}
              style={{
                padding: "8px 16px",
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {isGridView ? "📋 List View" : "📱 Grid View"}
            </button>
            <button className="btn-primary desktop-only" onClick={() => setIsModalOpen(true)}>
              + New Collection
            </button>
          </div>
        </div>

          {loading ? (
            <div className="loading-state">Loading your collections...</div>
          ) : (
            <div className={isGridView ? "collections-grid" : "collections-list"}>
              {collections.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't created any collections yet.</p>
                  <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    Create Your First Collection
                  </button>
                </div>
              ) : (
                collections.map((collection) => (
                  isGridView ? (
                    // Grid View - Card layout
                    <div
                      key={collection.id}
                      className="collection-card"
                      style={{ borderLeft: `4px solid ${collection.color}` }}
                    >
                      <div
                        onClick={() => handleViewCollection(collection)}
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        <h3 style={{ color: "#000000", fontWeight: "bold" }}>
                          {collection.icon} {collection.name}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                          {collection.description || "No description"}
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                          {collection.itemCount} items
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", position: "relative", zIndex: 10 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCollection(collection);
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "all 0.2s ease",
                            boxShadow: "0 1px 3px rgba(37, 99, 235, 0.3)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(37, 99, 235, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(37, 99, 235, 0.3)";
                          }}
                        >
                          View Items
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(collection);
                            setIsDeleteModalOpen(true);
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "all 0.2s ease",
                            boxShadow: "0 1px 3px rgba(239, 68, 68, 0.3)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(239, 68, 68, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(239, 68, 68, 0.3)";
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    // List View - Row layout
                    <div
                      key={collection.id}
                      className="collection-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        background: "#ffffff",
                        transition: "all 0.2s ease",
                        cursor: "pointer"
                      }}
                      onClick={() => handleViewCollection(collection)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{
                        width: "4px",
                        height: "40px",
                        background: collection.color,
                        borderRadius: "2px",
                        marginRight: "16px",
                        flexShrink: 0
                      }}></div>

                      <div style={{ fontSize: "20px", marginRight: "12px" }}>
                        {collection.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "bold", color: "#000000" }}>
                          {collection.name}
                        </h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                          {collection.description || "No description"}
                        </p>
                      </div>

                      <div style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginRight: "16px"
                      }}>
                        {collection.itemCount} items
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCollection(collection);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(collection);
                            setIsDeleteModalOpen(true);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          )}
        </div>

        {/* Mobile Floating Action Button */}
        <button 
          className="mobile-fab mobile-only"
          onClick={() => setIsModalOpen(true)}
        style={{
          position: 'sticky',
          bottom: '10px',
          left: '330px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #3b0764 100%)',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        +
      </button>

      {/* Create Collection Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "sticky",
            bottom: '200px',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",            
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px",
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "24px" }}>Create New Collection</h2>
            <form onSubmit={handleCreateCollection}>
              <div className="form-group">
                <label htmlFor="name">Collection Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Study Materials"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="form-group">
                <label htmlFor="icon">Icon</label>
                <input
                  type="text"
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📂"
                />
              </div>
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: "100%", height: "40px", cursor: "pointer" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="submit" className="btn-primary">
                  Create Collection
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "12px 24px",
                    background: "#e5e7eb",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Collection Items Modal */}
      {selectedCollection && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseCollectionView}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px",
              borderRadius: "12px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, color: "#000000", fontWeight: "bold" }}>
                {selectedCollection.icon} {selectedCollection.name}
              </h2>
              <button
                onClick={handleCloseCollectionView}
                style={{
                  padding: "8px 16px",
                  background: "#e5e7eb",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
            
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {selectedCollection.description || "No description"}
            </p>

            <h3 style={{ marginBottom: "16px" }}>Items ({collectionItems.length})</h3>

            {collectionItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>
                <p>No items in this collection yet.</p>
                <p style={{ fontSize: "14px" }}>Add items from the home page and assign them to this collection.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {collectionItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      background: "#f9fafb",
                      position: "relative",
                    }}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        onDoubleClick={() => {
                          setSelectedItem(item);
                          setIsItemViewModalOpen(true);
                        }}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "transform 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.transform = "scale(1)";
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "#000000", fontWeight: "bold" }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                        {item.description || "No description"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setItemToDeleteFromCollection(item);
                        setIsItemDeleteModalOpen(true);
                      }}
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: "12px",
                        transform: "translateY(-50%)",
                        padding: "6px 10px",
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        boxShadow: "0 1px 3px rgba(239, 68, 68, 0.3)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-50%) translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(239, 68, 68, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(-50%)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(239, 68, 68, 0.3)";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item View Modal */}
      {isItemViewModalOpen && selectedItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setIsItemViewModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "#f3f4f6",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                fontSize: 24,
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                zIndex: 10,
              }}
              onClick={() => setIsItemViewModalOpen(false)}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = "#e5e7eb"}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = "#f3f4f6"}
            >
              ×
            </button>

            <div style={{ padding: "48px 32px 32px" }}>
              {selectedItem.image_url && (
                <div style={{
                  marginBottom: 24,
                  display: "flex",
                  justifyContent: "center"
                }}>
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 400,
                      borderRadius: 12,
                      objectFit: "contain",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </div>
              )}

              <h2 style={{
                fontSize: 28,
                fontWeight: 700,
                margin: "0 0 16px",
                color: "#111",
                textAlign: "center"
              }}>
                {selectedItem.title}
              </h2>
              <p style={{
                fontSize: 16,
                color: "#555",
                lineHeight: 1.6,
                margin: 0,
                textAlign: "center"
              }}>
                {selectedItem.description || "No description"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              position: "relative",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "32px" }}>
              <h2 style={{
                margin: "0 0 16px",
                color: "#111",
                fontSize: "20px",
                fontWeight: "600"
              }}>
                Delete Collection
              </h2>

              <p style={{
                margin: "0 0 24px",
                color: "#6b7280",
                lineHeight: 1.5
              }}>
                Are you sure you want to delete <strong>"{itemToDelete.name}"</strong>?
                This action cannot be undone.
              </p>

              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end"
              }}>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.background = "#e5e7eb"}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.background = "#f3f4f6"}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteCollection(itemToDelete.id);
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(239, 68, 68, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(-1px)";
                    (e.target as HTMLElement).style.boxShadow = "0 2px 6px rgba(239, 68, 68, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow = "0 1px 3px rgba(239, 68, 68, 0.3)";
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Delete Confirmation Modal */}
      {isItemDeleteModalOpen && itemToDeleteFromCollection && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setIsItemDeleteModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              position: "relative",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "32px" }}>
              <h2 style={{
                margin: "0 0 16px",
                color: "#111",
                fontSize: "20px",
                fontWeight: "600"
              }}>
                Delete Item
              </h2>

              <p style={{
                margin: "0 0 24px",
                color: "#6b7280",
                lineHeight: 1.5
              }}>
                Are you sure you want to delete <strong>"{itemToDeleteFromCollection.title}"</strong>?
                This will permanently remove the item from everywhere.
              </p>

              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end"
              }}>
                <button
                  onClick={() => setIsItemDeleteModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.background = "#e5e7eb"}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.background = "#f3f4f6"}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from("items")
                        .delete()
                        .eq("id", itemToDeleteFromCollection.id);

                      if (error) {
                        console.error("Error deleting item:", error);
                        alert("Failed to delete item");
                        return;
                      }

                      // Remove from local state
                      setCollectionItems(prev => prev.filter(i => i.id !== itemToDeleteFromCollection.id));

                      // Refresh collections to update item counts
                      await fetchCollections();

                      setIsItemDeleteModalOpen(false);
                      setItemToDeleteFromCollection(null);
                      alert("Item deleted successfully");
                    } catch (error) {
                      console.error("Error deleting item:", error);
                      alert("Failed to delete item");
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(239, 68, 68, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(-1px)";
                    (e.target as HTMLElement).style.boxShadow = "0 2px 6px rgba(239, 68, 68, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow = "0 1px 3px rgba(239, 68, 68, 0.3)";
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}

