"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ItemForm() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Item:", { title, desc });
    router.push("/"); // redirect to dashboard
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
