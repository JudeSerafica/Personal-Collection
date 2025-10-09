"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AddItemModal from "../../components/AddItemModal";
import ItemCard from "../../components/ItemCard";
import ClientLayout from "../../components/ClientLayout";

export default function DashboardHome() {
  const [items, setItems] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState<string>("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchItems = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("items")
      .select("*, collections(name, icon)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setItems(data || []);

    setLoading(false);
  };

  const fetchCollections = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setCollections(data || []);
  };

  useEffect(() => {
    fetchItems();
    fetchCollections();
  }, []);

  const handleAdd = async (newItem: { title: string; desc: string; image: string; collection_id?: number }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (!userId) return;

    let image_url = "";
    if (newItem.image) {
      const file = await fetch(newItem.image).then((r) => r.blob());
      const fileName = `${Date.now()}-${newItem.title}.png`;

      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(fileName, file);

      if (uploadError) console.error(uploadError);
      else {
        image_url = supabase.storage.from("items").getPublicUrl(fileName).data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("items")
      .insert([{ 
        user_id: userId, 
        title: newItem.title, 
        description: newItem.desc, 
        image_url,
        collection_id: newItem.collection_id || null
      }])
      .select();

    if (error) {
      console.error(error);
    } else if (data && data.length > 0) {
      setItems((prev) => [data[0], ...prev]);
    }
  };

  const handleView = (id: number) => {
    const item = items.find((item) => item.id === id);
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (id: number) => {
    const item = items.find((item) => item.id === id);
    setSelectedItem(item);
    setEditTitle(item?.title || "");
    setEditDesc(item?.description || "");
    setEditImage(item?.image_url || "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    let image_url = selectedItem.image_url; // Keep existing image by default

    // Handle new image upload if provided
    if (editImage && editImage !== selectedItem.image_url) {
      // If it's a new image (data URL), upload it
      if (editImage.startsWith('data:')) {
        const file = await fetch(editImage).then((r) => r.blob());
        const fileName = `${Date.now()}-${editTitle}.png`;

        const { error: uploadError } = await supabase.storage
          .from("items")
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          alert("Failed to upload image. Please try again.");
          return;
        } else {
          image_url = supabase.storage.from("items").getPublicUrl(fileName).data.publicUrl;
        }
      } else {
        // If it's a URL, use it directly
        image_url = editImage;
      }
    } else if (!editImage) {
      // If image is cleared, set to null
      image_url = null;
    }

    const { error } = await supabase
      .from("items")
      .update({
        title: editTitle,
        description: editDesc,
        image_url
      })
      .eq("id", selectedItem.id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error(error);
      alert("Failed to update item. Please try again.");
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? {
            ...item,
            title: editTitle,
            description: editDesc,
            image_url
          } : item
        )
      );
      alert("Item updated successfully!");
    }

    setSelectedItem(null);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: number) => {
    const item = items.find((item) => item.id === id);
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleMove = async (itemId: number, collectionId: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const { error } = await supabase
      .from("items")
      .update({ collection_id: collectionId })
      .eq("id", itemId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error moving item:", error);
      alert("Failed to move item. Please try again.");
    } else {
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, collection_id: collectionId } : item
        )
      );
      alert("Item moved successfully!");
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    // Check if item is in a collection
    if (selectedItem.collection_id) {
      alert("Cannot delete items that are in a collection. Please remove from collection first.");
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      return;
    }

    // Only delete if item is NOT in any collection
    const { error } = await supabase.from("items").delete().eq("id", selectedItem.id);

    if (error) {
      console.error(error);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    }

    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };
  // 🔎 filter + search applied here
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filter === "all") {
      matchesFilter = true;
    } else if (filter.startsWith("collection-")) {
      const collectionId = parseInt(filter.split("-")[1]);
      matchesFilter = item.collection_id === collectionId;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <ClientLayout>
        <div className="dashboard-headerss-wrapper">
            <div>
              <h1 className="page-title">My Collection Items</h1>
              <p className="page-description">
                Manage and organize all your collected items.
              </p>
            </div>

          {/* 🔎 Search + Filter Controls with Add Button */}
          <div className="search-filter-bar">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Items</option>
              {collections.map((collection) => (
                <option key={collection.id} value={`collection-${collection.id}`}>
                  {collection.icon} {collection.name}
                </option>
              ))}
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="button hidden lg:block">
              + Add New Item
            </button>
          </div>
          </div>

        <div className="dashboard-scrollable-content">
          <div className="grid">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                desc={item.description}
                image={item.image_url}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMove={handleMove}
                collections={collections}
                currentCollectionId={item.collection_id}
              />
            ))}
            {filteredItems.length === 0 && <p>No items found.</p>}
          </div>
        </div>
        <button
          className="mobile-fab mobile-only lg:hidden"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            position: 'sticky',
            bottom: '10px',
            left: '330',
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

        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAdd}
        />

        {/* View Modal */}
        {isViewModalOpen && selectedItem && (
          <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
            <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>
                ×
              </button>

              <div className="view-modal-body">
                {selectedItem.image_url && (
                  <div className="view-modal-image-container">
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.title}
                      className="view-modal-image"
                    />
                  </div>
                )}

                <h2 className="view-modal-title">{selectedItem.title}</h2>
                <p className="view-modal-description">{selectedItem.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedItem && (
          <div className="modal-overlayss" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                ×
              </button>

              <h2 className="modal-title">Edit Item</h2>

              <form onSubmit={handleUpdate} className="modal-form">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="textarea"
                    style={{ width: "95%" }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">Image (optional)</label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setEditImage(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="input"
                  />
                  {editImage && (
                    <div style={{ marginTop: "8px" }}>
                      <img
                        src={editImage}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb"
                        }}
                      />
                    </div>
                  )}
                  {!editImage && selectedItem?.image_url && (
                    <div style={{ marginTop: "8px" }}>
                      <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        Current image:
                      </p>
                      <img
                        src={selectedItem.image_url}
                        alt="Current"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb"
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="button-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="button">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedItem && (
          <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>
                ×
              </button>

              <h2 className="modal-title">
                {selectedItem.collection_id ? "Cannot Delete" : "Delete Item"}
              </h2>

              <div className="delete-modal-body">
                <p className="delete-modal-text">
                  {selectedItem.collection_id
                    ? `Cannot delete "${selectedItem.title}"`
                    : `Are you sure you want to permanently delete "${selectedItem.title}"?`
                  }
                </p>
                <p className={selectedItem.collection_id ? "delete-modal-warning" : "delete-modal-warning"}>
                  {selectedItem.collection_id
                    ? "This item is in a collection and cannot be deleted from the home page. Please go to My Collections to manage it."
                    : "This action cannot be undone."
                  }
                </p>
              </div>

              <div className="modal-actions">
                {selectedItem.collection_id ? (
                  <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="button">
                    OK
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="button-secondary">
                      Cancel
                    </button>
                    <button type="button" onClick={confirmDelete} className="button-danger">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>   
        )}
    </ClientLayout>
  );
}