'use client';

import { useState, useEffect } from 'react';
import { Loader2, Eye, EyeOff, Layers, Palette } from 'lucide-react';

export default function FigmaDesignRenderer() {
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchDesign();
  }, []);

  const fetchDesign = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/figma/design');
      if (!response.ok) {
        throw new Error(`Failed to fetch design: ${response.status}`);
      }
      const data = await response.json();
      setDesign(data.design);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching design:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your Figma design...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Design</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchDesign}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!design || !design.pages || design.pages.length === 0) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">No Design Found</h3>
        <p className="text-gray-600">No pages or frames found in your Figma design.</p>
      </div>
    );
  }

  const currentPage = design.pages[selectedPage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{design.name}</h1>
          <p className="text-gray-600">
            Last modified: {new Date(design.metadata.lastModified).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Page Navigation */}
      {design.pages.length > 1 && (
        <div className="flex gap-2 border-b">
          {design.pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(index)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedPage === index
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>
      )}

      {/* Frames Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentPage.frames.map((frame) => (
          <FrameRenderer
            key={frame.id}
            frame={frame}
            showDetails={showDetails}
            onClick={() => setSelectedFrame(selectedFrame === frame.id ? null : frame.id)}
            isSelected={selectedFrame === frame.id}
          />
        ))}
      </div>

      {/* Frame Details Modal */}
      {selectedFrame && (
        <FrameDetailModal
          frame={currentPage.frames.find(f => f.id === selectedFrame)}
          onClose={() => setSelectedFrame(null)}
        />
      )}
    </div>
  );
}

function FrameRenderer({ frame, showDetails, onClick, isSelected }) {
  const backgroundColor = frame.backgroundColor ? 
    `rgb(${Math.round(frame.backgroundColor.r * 255)}, ${Math.round(frame.backgroundColor.g * 255)}, ${Math.round(frame.backgroundColor.b * 255)})` : 
    '#ffffff';

  return (
    <div 
      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Frame Preview */}
      <div 
        className="aspect-video p-4 relative"
        style={{ backgroundColor }}
      >
        <div className="text-center text-gray-600">
          <Layers className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Frame Preview</p>
          <p className="text-xs text-gray-500">
            {frame.absoluteBoundingBox?.width}×{frame.absoluteBoundingBox?.height}
          </p>
        </div>
        
        {/* Render child elements as simplified representations */}
        {frame.children && frame.children.length > 0 && (
          <div className="absolute inset-2 border border-dashed border-gray-300 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">
              {frame.children.length} element{frame.children.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Frame Info */}
      <div className="p-4 border-t">
        <h3 className="font-semibold text-lg mb-1">{frame.name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {frame.type} • {frame.children?.length || 0} elements
        </p>
        
        {showDetails && (
          <div className="space-y-2 text-xs text-gray-500">
            <div>Size: {frame.absoluteBoundingBox?.width}×{frame.absoluteBoundingBox?.height}</div>
            {frame.layoutMode && <div>Layout: {frame.layoutMode}</div>}
            {frame.itemSpacing && <div>Spacing: {frame.itemSpacing}px</div>}
            {frame.cornerRadius && <div>Radius: {frame.cornerRadius}px</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function FrameDetailModal({ frame, onClose }) {
  if (!frame) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{frame.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Type:</strong> {frame.type}
            </div>
            <div>
              <strong>Size:</strong> {frame.absoluteBoundingBox?.width}×{frame.absoluteBoundingBox?.height}
            </div>
            {frame.layoutMode && (
              <div>
                <strong>Layout:</strong> {frame.layoutMode}
              </div>
            )}
            {frame.itemSpacing && (
              <div>
                <strong>Item Spacing:</strong> {frame.itemSpacing}px
              </div>
            )}
          </div>

          {frame.children && frame.children.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Elements ({frame.children.length})</h3>
              <div className="space-y-2 max-h-60 overflow-auto">
                {frame.children.map((child, index) => (
                  <ElementPreview key={child.id || index} element={child} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ElementPreview({ element }) {
  const getElementIcon = (type) => {
    switch (type) {
      case 'TEXT': return '📝';
      case 'RECTANGLE': return '▭';
      case 'ELLIPSE': return '○';
      case 'FRAME': return '🖼️';
      case 'GROUP': return '📦';
      case 'COMPONENT': return '🧩';
      case 'INSTANCE': return '🔗';
      default: return '📄';
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 border rounded text-sm">
      <span className="text-lg">{getElementIcon(element.type)}</span>
      <div className="flex-1">
        <div className="font-medium">{element.name}</div>
        <div className="text-gray-500 text-xs">
          {element.type}
          {element.characters && ` • "${element.characters.substring(0, 30)}${element.characters.length > 30 ? '...' : ''}"`}
        </div>
      </div>
      {element.absoluteBoundingBox && (
        <div className="text-xs text-gray-400">
          {Math.round(element.absoluteBoundingBox.width)}×{Math.round(element.absoluteBoundingBox.height)}
        </div>
      )}
    </div>
  );
}
