"use client";
import { useState, useEffect } from "react";

type ItemFormProps = {
  initialTitle?: string;
  initialDesc?: string;
  onSubmit: (title: string, desc: string) => void;
};

export default function ItemForm({
  initialTitle = "",
  initialDesc = "",
  onSubmit,
}: ItemFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);

  useEffect(() => {
    setTitle(initialTitle);
    setDesc(initialDesc);
  }, [initialTitle, initialDesc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, desc);
    setTitle("");
    setDesc("");
  };

  return (
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
      <button type="submit" className="button">
        Save Item
      </button>
    </form>
  );
}
