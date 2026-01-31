"use client";

import { X } from "lucide-react";
import { useTransition } from "react";

interface DeleteButtonProps {
  collectionId: string;
  collectionTitle: string;
  username: string;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function DeleteButton({ 
  collectionId, 
  collectionTitle, 
  username,
  deleteAction 
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Remove "${collectionTitle}" from your archive?`)) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("collectionId", collectionId);
        formData.append("username", username);
        await deleteAction(formData);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="w-6 h-6 rounded-full bg-[#6B5E4A]/80 hover:bg-[#6B5E4A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md disabled:opacity-50"
      aria-label={`Delete ${collectionTitle}`}
    >
      <X className="w-3.5 h-3.5 text-[#EFE5CF]" strokeWidth={3} />
    </button>
  );
}