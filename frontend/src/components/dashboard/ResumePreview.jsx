import React, { useEffect, useState } from 'react';
import { FaSearchPlus, FaSearchMinus, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Very lightweight resume preview that simply embeds the PDF in an <iframe>.
 * This avoids pulling in heavy PDF-rendering libraries while still letting the
 * user visually confirm the upload. If you later need page navigation / zoom,
 * swap this implementation for react-pdf or pdf.js.
 */
const ResumePreview = ({ file }) => {
  const [url, setUrl] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!file) return;

    // Prefer a pre-computed URL to avoid regenerating unnecessarily.
    if (file.url) {
      setUrl(file.url);
      return () => {};
    }

    const objectUrl = URL.createObjectURL(file instanceof File ? file : file.file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleOpenTab = () => {
    if (url) window.open(url, '_blank');
  };

  if (!url) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg text-sm text-gray-500">
        No preview available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border flex flex-col h-[640px] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-100 border-b px-4 py-2 text-gray-700 text-sm">
        <span className="truncate pr-2" title={file?.name || 'Resume'}>{file?.name || 'Resume Preview'}</span>
        <div className="flex items-center gap-3">
          <button onClick={handleZoomOut} className="p-1 hover:text-indigo-600" title="Zoom Out">
            <FaSearchMinus />
          </button>
          <span className="w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1 hover:text-indigo-600" title="Zoom In">
            <FaSearchPlus />
          </button>
          <button onClick={handleOpenTab} className="p-1 hover:text-indigo-600" title="Open in new tab">
            <FaExternalLinkAlt />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <iframe
          title="Resume Preview"
          src={url}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100/zoom}%`, height: `${100/zoom}%` }}
          className="border-0 w-full" />
      </div>
    </div>
  );
};

export default ResumePreview;
