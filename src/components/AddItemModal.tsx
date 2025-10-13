"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newItem: { title: string; desc: string; image: string; collection_id?: number }) => void;
};

export default function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string>("");
  const [collectionId, setCollectionId] = useState<number | undefined>(undefined);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (!userId) return;

    // Fetch collections
    const { data: collectionsData } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("name");

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
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL from file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      title, 
      desc, 
      image,
      collection_id: collectionId
    });
    setTitle("");
    setDesc("");
    setImage("");
    setCollectionId(undefined);
    onClose();
  };

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        backgroundColor:"rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        minHeight: "100vh",
        width: "100%",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: "30px 50px",
          borderRadius: "12px",
          boxShadow: '0 20px 20px rgba(0, 0, 0, 0.562)',
          maxWidth: "400px",
          width: "65%",
          zIndex: 1001,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: "rgb(19, 0, 34)",marginBottom: "16px" }}>Add New Item</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Item Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="textarea"
            required
          />

          {/* Collection Selector */}
          <select
            value={collectionId || ""}
            onChange={(e) => setCollectionId(e.target.value ? Number(e.target.value) : undefined)}
            className="select"
          >
            <option value="">No Collection</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.icon} {collection.name} ({collection.itemCount || 0} items)
              </option>
            ))}
          </select>

          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="input"
          />

          {/* Preview */}
          {image && (
            <img
              src={image}
              alt="Preview"
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "6px",
                marginTop: "12px",
              }}
            />
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
            <button type="button" onClick={onClose} className="card-button">
              Cancel
            </button>
            <button type="submit" className="button">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

