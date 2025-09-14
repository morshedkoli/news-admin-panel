'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  maxSize?: number; // in MB
  placeholder?: string;
  description?: string;
}

export function FileUpload({
  label,
  accept,
  currentUrl,
  onUpload,
  maxSize = 5,
  placeholder,
  description
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl || '');

  const handleFileUpload = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'newsapp_uploads'); // You'll need to set this up in Cloudinary

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const uploadedUrl = data.secure_url;
      
      setUrlInput(uploadedUrl);
      onUpload(uploadedUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpload(urlInput.trim());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleRemove = () => {
    setUrlInput('');
    onUpload('');
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={placeholder || 'Enter URL or upload file'}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim()}
        >
          {success ? <Check className="h-4 w-4" /> : 'Set'}
        </Button>
        {urlInput && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className="cursor-pointer"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max size: {maxSize}MB • {accept.replace(/\./g, '').toUpperCase()}
          </p>
        </label>
      </div>

      {/* Preview */}
      {urlInput && (
        <div className="space-y-2">
          <Label className="text-sm">Preview</Label>
          <div className="p-4 border rounded-lg bg-gray-50">
            {accept.includes('image') ? (
              <img 
                src={urlInput} 
                alt="Preview" 
                className="max-h-16 max-w-32 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-sm text-gray-600">
                File: {urlInput.split('/').pop()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Check className="h-4 w-4" />
          {label} updated successfully!
        </div>
      )}

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}