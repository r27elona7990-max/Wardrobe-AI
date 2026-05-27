"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteClothingItem } from "@/app/actions/clothing";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to remove this piece from your vault?")) {
      return;
    }
    
    setLoading(true);
    const result = await deleteClothingItem(id);
    if (result && result.error) {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="w-10 h-10 flex items-center justify-center bg-red-500/80 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors shadow-lg disabled:opacity-50"
      title="Delete Piece"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
