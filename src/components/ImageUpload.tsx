import { useRef, useState } from 'react';
import { uploadImage } from '../lib/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

const ImageUpload = ({ value, onChange }: Props) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('File is too large. Max size is 8MB.');
      return;
    }
    setError('');
    setUploading(true);
    setImgError(false);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch {
      setError('Upload failed. Please try again or paste a URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div className="image-upload-root">
      {/* URL input */}
      <div className="form-group">
        <label className="form-label">Image URL</label>
        <input
          className="form-input"
          type="text"
          placeholder="https://... or upload below"
          value={value}
          onChange={(e) => { onChange(e.target.value); setImgError(false); }}
        />
      </div>

      {/* Drop zone */}
      <div
        className={`image-drop-zone ${dragging ? 'drop-dragging' : ''} ${uploading ? 'drop-uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="drop-state">
            <div className="drop-spinner" />
            <p className="drop-text">Uploading…</p>
          </div>
        ) : value && !imgError ? (
          <div className="drop-preview-wrap">
            <img
              src={value}
              alt="Preview"
              className="drop-preview-img"
              onError={() => setImgError(true)}
            />
            <div className="drop-preview-overlay">
              <span>📷 Change image</span>
            </div>
          </div>
        ) : (
          <div className="drop-state">
            <div className="drop-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="drop-text">
              <strong>Drag & drop</strong> an image here
            </p>
            <p className="drop-subtext">or click to browse · JPG, PNG, WebP · max 8MB</p>
          </div>
        )}
      </div>

      {error && <p className="drop-error">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default ImageUpload;
