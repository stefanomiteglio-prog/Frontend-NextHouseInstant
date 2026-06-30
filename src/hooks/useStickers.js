import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';

export function useStickers() {
  const { user, authenticatedFetch, API_URL } = useAdminAuth();
  
  const [stickers, setStickers] = useState([]);
  const [stickersLoading, setStickersLoading] = useState(false);
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerFile, setNewStickerFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingStickerId, setDeletingStickerId] = useState(null);

  const fetchStickers = useCallback(async () => {
    setStickersLoading(true);
    try {
      const response = await authenticatedFetch(`${API_URL}/api/stickers`);
      if (response.ok) {
        const data = await response.json();
        setStickers(data);
      }
    } catch (err) {
      console.error("Error fetching stickers:", err);
    } finally {
      setStickersLoading(false);
    }
  }, [authenticatedFetch, API_URL]);

  // Fetch stickers when user gets authenticated
  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        fetchStickers();
      });
    } else {
      Promise.resolve().then(() => {
        setStickers([]);
      });
    }
  }, [user, fetchStickers]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewStickerFile(file);
      // Auto fill name if empty
      if (!newStickerName) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewStickerName(nameWithoutExt);
      }
    }
  };

  const handleUploadSticker = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!newStickerFile || !newStickerName.trim()) {
      setUploadError("Please provide a name and select an image.");
      return;
    }

    setUploadError('');
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('name', newStickerName);
    formData.append('file', newStickerFile);

    try {
      const response = await authenticatedFetch(`${API_URL}/api/stickers`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error occurred while uploading the sticker.');
      }

      const newSticker = await response.json();
      setStickers((prev) => [newSticker, ...prev]);
      setNewStickerName('');
      setNewStickerFile(null);
      // Clear file input
      const fileInput = document.getElementById('sticker-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteSticker = async (stickerId) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/api/stickers/${stickerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStickers((prev) => prev.filter((s) => s.id !== stickerId));
      } else {
        alert("Unable to delete the sticker.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingStickerId(null);
    }
  };

  return {
    stickers,
    stickersLoading,
    newStickerName,
    setNewStickerName,
    newStickerFile,
    setNewStickerFile,
    uploadLoading,
    uploadError,
    setUploadError,
    deletingStickerId,
    setDeletingStickerId,
    handleFileChange,
    handleUploadSticker,
    handleDeleteSticker,
    fetchStickers
  };
}
