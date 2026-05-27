"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Type,
  Image as ImageIcon,
  Trash2,
  Upload,
  Copy,
  Move,
} from "lucide-react";

export interface Element {
  id: string;
  type: "text" | "image" | "couple-names" | "date" | "venue" | "rsvp-button" | "registry-link";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  content?: string;
  registryUrl?: string;
  imageUrl?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  styles?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: string;
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
  };
}

export interface Page {
  id: string;
  name: string;
  elements: Element[];
  background?: {
    type: "color" | "gradient" | "image";
    value: string;
    gradient?: { from: string; to: string; direction: string };
  };
}

interface PageEditorProps {
  pages: Page[];
  currentPageIndex: number;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  onPagesChange: (pages: Page[]) => void;
  onPageChange: (index: number) => void;
}

export default function PageEditor({
  pages,
  currentPageIndex,
  brideName,
  groomName,
  weddingDate,
  weddingTime,
  venue,
  onPagesChange,
  onPageChange,
}: PageEditorProps) {
  const { toast } = useToast();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0, mouseX: 0, mouseY: 0 });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [tempText, setTempText] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentPage = pages[currentPageIndex];

  // Add new page
  const addPage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: `Page ${pages.length + 1}`,
      elements: [],
      background: { type: "color", value: "#fdf4ff" },
    };
    onPagesChange([...pages, newPage]);
    onPageChange(pages.length);
  };

  // Delete page
  const deletePage = (index: number) => {
    if (pages.length === 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one page",
        variant: "destructive",
      });
      return;
    }
    const newPages = pages.filter((_, i) => i !== index);
    onPagesChange(newPages);
    if (currentPageIndex >= newPages.length) {
      onPageChange(newPages.length - 1);
    }
  };

  // Duplicate page
  const duplicatePage = (index: number) => {
    const pageToDuplicate = pages[index];
    const newPage: Page = {
      ...pageToDuplicate,
      id: `page-${Date.now()}`,
      name: `${pageToDuplicate.name} (Copy)`,
      elements: pageToDuplicate.elements.map((el) => ({
        ...el,
        id: `element-${Date.now()}-${Math.random()}`,
      })),
    };
    const newPages = [...pages];
    newPages.splice(index + 1, 0, newPage);
    onPagesChange(newPages);
    onPageChange(index + 1);
  };

  // Add element to current page
  const addElement = (type: Element["type"]) => {
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === "image" ? 300 : type === "rsvp-button" || type === "registry-link" ? 200 : 400,
      height: type === "image" ? 300 : type === "rsvp-button" || type === "registry-link" ? 50 : 80,
      content: type === "text" ? "Double click to edit" : type === "rsvp-button" ? "RSVP Now" : type === "registry-link" ? "View Registry" : undefined,
      registryUrl: type === "registry-link" ? "https://example.com/registry" : undefined,
      styles: {
        fontSize: type === "rsvp-button" || type === "registry-link" ? 18 : 16,
        fontFamily: "Inter",
        color: type === "rsvp-button" || type === "registry-link" ? "#ffffff" : "#1f2937",
        backgroundColor: type === "rsvp-button" ? "#9333ea" : type === "registry-link" ? "#ec4899" : undefined,
        fontWeight: type === "rsvp-button" || type === "registry-link" ? "600" : undefined,
        textAlign: "center",
        backgroundColor: type === "image" ? undefined : "transparent",
        padding: "10px",
      },
    };

    const newPages = [...pages];
    newPages[currentPageIndex].elements.push(newElement);
    onPagesChange(newPages);
    setSelectedElement(newElement.id);
  };

  // Update element
  const updateElement = (elementId: string, updates: Partial<Element>) => {
    const newPages = [...pages];
    const elementIndex = newPages[currentPageIndex].elements.findIndex(
      (el) => el.id === elementId
    );
    if (elementIndex !== -1) {
      newPages[currentPageIndex].elements[elementIndex] = {
        ...newPages[currentPageIndex].elements[elementIndex],
        ...updates,
      };
      onPagesChange(newPages);
    }
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    const newPages = [...pages];
    newPages[currentPageIndex].elements = newPages[
      currentPageIndex
    ].elements.filter((el) => el.id !== elementId);
    onPagesChange(newPages);
    setSelectedElement(null);
  };

  // Layering functions
  const bringToFront = (elementId: string) => {
    const newPages = [...pages];
    const elements = newPages[currentPageIndex].elements;
    const maxZ = Math.max(...elements.map(el => el.zIndex || 0), 0);
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      elements[elementIndex].zIndex = maxZ + 1;
      onPagesChange(newPages);
    }
  };

  const sendToBack = (elementId: string) => {
    const newPages = [...pages];
    const elements = newPages[currentPageIndex].elements;
    const minZ = Math.min(...elements.map(el => el.zIndex || 0), 0);
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      elements[elementIndex].zIndex = minZ - 1;
      onPagesChange(newPages);
    }
  };

  const bringForward = (elementId: string) => {
    const newPages = [...pages];
    const elements = newPages[currentPageIndex].elements;
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      const currentZ = elements[elementIndex].zIndex || 0;
      elements[elementIndex].zIndex = currentZ + 1;
      onPagesChange(newPages);
    }
  };

  const sendBackward = (elementId: string) => {
    const newPages = [...pages];
    const elements = newPages[currentPageIndex].elements;
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      const currentZ = elements[elementIndex].zIndex || 0;
      elements[elementIndex].zIndex = currentZ - 1;
      onPagesChange(newPages);
    }
  };

  // Handle element drag start
  const handleMouseDown = (
    e: React.MouseEvent,
    element: Element
  ) => {
    e.stopPropagation();
    e.preventDefault();

    setSelectedElement(element.id);
    setIsDragging(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    setDragOffset({
      x: relativeX - element.x,
      y: relativeY - element.y,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, element: Element, handle: string) => {
    e.stopPropagation();
    e.preventDefault();

    setSelectedElement(element.id);
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      width: element.width,
      height: element.height || element.width,
      x: element.x,
      y: element.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  // Handle element drag or resize
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    // Handle resizing
    if (isResizing && selectedElement && resizeHandle) {
      const deltaX = e.clientX - resizeStart.mouseX;
      const deltaY = e.clientY - resizeStart.mouseY;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.x;
      let newY = resizeStart.y;

      switch (resizeHandle) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(50, resizeStart.height + deltaY);
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(50, resizeStart.height + deltaY);
          newX = resizeStart.x + (resizeStart.width - newWidth);
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(50, resizeStart.height - deltaY);
          newY = resizeStart.y + (resizeStart.height - newHeight);
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(50, resizeStart.height - deltaY);
          newX = resizeStart.x + (resizeStart.width - newWidth);
          newY = resizeStart.y + (resizeStart.height - newHeight);
          break;
      }

      updateElement(selectedElement, {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        x: Math.round(newX),
        y: Math.round(newY),
      });
      return;
    }

    // Handle dragging
    if (isDragging && selectedElement) {
      // Calculate new position with snap-to-grid (10px grid)
      let x = relativeX - dragOffset.x;
      let y = relativeY - dragOffset.y;

      // Snap to 10px grid
      x = Math.round(x / 10) * 10;
      y = Math.round(y / 10) * 10;

      // Keep within bounds
      x = Math.max(0, Math.min(x, rect.width - 50));
      y = Math.max(0, Math.min(y, rect.height - 50));

      updateElement(selectedElement, { x, y });
    }
  };

  // Handle element drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Handle click to edit text
  const handleClickToEdit = (element: Element) => {
    if (element.type !== "text" && element.type !== "rsvp-button" && element.type !== "registry-link") return;
    setEditingText(element.id);
    setTempText(element.content || "");
  };

  // Save text edit
  const saveTextEdit = () => {
    if (editingText) {
      updateElement(editingText, { content: tempText });
      setEditingText(null);
      setTempText("");
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Delete selected element
    if (e.key === "Delete" && selectedElement && !editingText) {
      deleteElement(selectedElement);
    }
    // Escape to cancel text edit
    if (e.key === "Escape" && editingText) {
      setEditingText(null);
      setTempText("");
    }
    // Enter to save text edit
    if (e.key === "Enter" && editingText && !e.shiftKey) {
      saveTextEdit();
    }
  };

  // Add keyboard listener
  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, editingText, tempText]);

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        addElement("image");
        const newElementId = `element-${Date.now()}`;
        setTimeout(() => {
          updateElement(newElementId, { imageUrl: data.url });
        }, 100);
        toast({
          title: "Success!",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Update background
  const updateBackground = (updates: Partial<Page["background"]>) => {
    const newPages = [...pages];
    newPages[currentPageIndex].background = {
      ...newPages[currentPageIndex].background!,
      ...updates,
    };
    onPagesChange(newPages);
  };

  // Render element content based on type
  const renderElementContent = (element: Element) => {
    switch (element.type) {
      case "couple-names":
        return `${brideName} & ${groomName}`;
      case "date":
        return new Date(weddingDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "venue":
        return venue;
      case "rsvp-button":
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: element.styles?.backgroundColor || "#9333ea",
              color: element.styles?.color || "#ffffff",
              padding: element.styles?.padding || "10px",
              borderRadius: element.styles?.borderRadius || "8px",
            }}
          >
            <span style={{ fontSize: element.styles?.fontSize || 18, fontWeight: element.styles?.fontWeight || "600", fontFamily: element.styles?.fontFamily || "Inter" }}>
              {element.content || "RSVP Now"}
            </span>
          </div>
        );
      case "registry-link":
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: element.styles?.backgroundColor || "#ec4899",
              color: element.styles?.color || "#ffffff",
              padding: element.styles?.padding || "10px",
              borderRadius: element.styles?.borderRadius || "8px",
            }}
          >
            <span style={{ fontSize: element.styles?.fontSize || 18, fontWeight: element.styles?.fontWeight || "600", fontFamily: element.styles?.fontFamily || "Inter" }}>
              {element.content || "View Registry"}
            </span>
          </div>
        );
      case "image":
        return element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Card image"
            className="w-full h-full"
            style={{
              objectFit: element.objectFit || "cover",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="w-12 h-12" />
          </div>
        );
      case "text":
      default:
        return element.content || "Text";
    }
  };

  const selectedEl = currentPage?.elements.find(
    (el) => el.id === selectedElement
  );

  return (
    <div className="grid grid-cols-[250px_1fr_300px] gap-4 h-[calc(100vh-200px)]">
      {/* Left Panel - Pages & Elements */}
      <div className="bg-white rounded-lg p-4 overflow-y-auto border">
        <div className="space-y-4">
          {/* Pages */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">Pages</h3>
              <Button size="sm" variant="outline" onClick={addPage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                    index === currentPageIndex
                      ? "bg-purple-100 border border-purple-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => onPageChange(index)}
                >
                  <span className="text-sm">{page.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicatePage(index);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {pages.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(index);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Elements */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement("text")}
                className="flex flex-col h-auto py-3"
              >
                <Type className="w-5 h-5 mb-1" />
                <span className="text-xs">Text</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement("couple-names")}
                className="flex flex-col h-auto py-3"
              >
                <Type className="w-5 h-5 mb-1" />
                <span className="text-xs">Names</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement("date")}
                className="flex flex-col h-auto py-3"
              >
                <Type className="w-5 h-5 mb-1" />
                <span className="text-xs">Date</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement("venue")}
                className="flex flex-col h-auto py-3"
              >
                <Type className="w-5 h-5 mb-1" />
                <span className="text-xs">Venue</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement("rsvp-button")}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-xl mb-1">📝</span>
                <span className="text-xs">RSVP Button</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement("registry-link")}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-xl mb-1">🎁</span>
                <span className="text-xs">Registry Link</span>
              </Button>
              <label className="col-span-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full flex flex-col h-auto py-3"
                  disabled={uploadingImage}
                  asChild
                >
                  <span>
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </span>
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Canvas */}
      <div className="bg-white rounded-lg p-4 flex flex-col overflow-hidden border">
        <div className="flex-1 overflow-auto">
          <div
            ref={canvasRef}
            className="relative mx-auto"
            style={{
              width: "600px",
              height: "800px",
              background:
                currentPage?.background?.type === "gradient"
                  ? `linear-gradient(${currentPage.background.gradient?.direction || "to bottom"}, ${currentPage.background.gradient?.from || "#fff"}, ${currentPage.background.gradient?.to || "#fff"})`
                  : currentPage?.background?.type === "image"
                  ? `url(${currentPage?.background?.value}) center/cover`
                  : currentPage?.background?.value || "#fdf4ff",
              cursor: isDragging ? "grabbing" : "default",
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedElement(null)}
          >
            {currentPage?.elements.map((element) => (
              <div
                key={element.id}
                className={`absolute transition-all ${
                  selectedElement === element.id
                    ? "ring-4 ring-purple-500 shadow-lg z-50"
                    : "hover:ring-2 hover:ring-purple-300"
                } ${isDragging && selectedElement === element.id ? "cursor-grabbing" : "cursor-move"}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: element.height ? `${element.height}px` : "auto",
                  zIndex: element.zIndex || 0,
                  ...element.styles,
                  userSelect: "none",
                  overflow: element.type !== "image" ? "visible" : "hidden",
                }}
                onMouseDown={(e) => handleMouseDown(e, element)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (element.type === "text" && selectedElement === element.id) {
                    handleClickToEdit(element);
                  }
                }}
              >
                {editingText === element.id ? (
                  <textarea
                    autoFocus
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    onBlur={saveTextEdit}
                    className="w-full h-full p-2 border-2 border-purple-500 rounded resize-none"
                    style={{
                      fontSize: `${element.styles?.fontSize || 16}px`,
                      fontFamily: element.styles?.fontFamily,
                      color: element.styles?.color,
                      textAlign: element.styles?.textAlign as any,
                      fontWeight: element.styles?.fontWeight,
                    }}
                  />
                ) : (
                  renderElementContent(element)
                )}

                {/* Resize Handles for All Elements */}
                {selectedElement === element.id && !editingText && (
                  <>
                    {/* Corner handles */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-nw-resize hover:bg-purple-500 hover:scale-125 transition-all z-10"
                    />
                    <div
                      onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-ne-resize hover:bg-purple-500 hover:scale-125 transition-all z-10"
                    />
                    <div
                      onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-sw-resize hover:bg-purple-500 hover:scale-125 transition-all z-10"
                    />
                    <div
                      onMouseDown={(e) => handleResizeStart(e, element, 'se')}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-se-resize hover:bg-purple-500 hover:scale-125 transition-all z-10"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="bg-white rounded-lg p-4 overflow-y-auto border">
        {selectedEl ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Element Properties</h3>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteElement(selectedEl.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Layering Controls */}
            <div className="space-y-2">
              <Label>Layer Order</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bringToFront(selectedEl.id)}
                  className="text-xs"
                >
                  ⬆️ To Front
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendToBack(selectedEl.id)}
                  className="text-xs"
                >
                  ⬇️ To Back
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bringForward(selectedEl.id)}
                  className="text-xs"
                >
                  ↑ Forward
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendBackward(selectedEl.id)}
                  className="text-xs"
                >
                  ↓ Backward
                </Button>
              </div>
              <p className="text-xs text-gray-500">Control which elements appear on top</p>
            </div>

            {/* Position & Size */}
            <div className="space-y-2">
              <Label>Position & Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={selectedEl.x}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        x: parseInt(e.target.value),
                      })
                    }
                    size="sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={selectedEl.y}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        y: parseInt(e.target.value),
                      })
                    }
                    size="sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={selectedEl.width}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        width: parseInt(e.target.value),
                      })
                    }
                    size="sm"
                  />
                </div>
                {selectedEl.type === "image" && (
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={selectedEl.height}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          height: parseInt(e.target.value),
                        })
                      }
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Text Styling */}
            {selectedEl.type !== "image" && (
              <>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={selectedEl.styles?.fontSize || 16}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        styles: {
                          ...selectedEl.styles,
                          fontSize: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <select
                    value={selectedEl.styles?.fontFamily || "Inter"}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        styles: {
                          ...selectedEl.styles,
                          fontFamily: e.target.value,
                        },
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border text-sm"
                  >
                    <optgroup label="Sans Serif">
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Ubuntu">Ubuntu</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                    </optgroup>
                    <optgroup label="Serif">
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Lora">Lora</option>
                      <option value="PT Serif">PT Serif</option>
                      <option value="Crimson Text">Crimson Text</option>
                      <option value="Cormorant">Cormorant</option>
                      <option value="Libre Baskerville">Libre Baskerville</option>
                      <option value="Georgia">Georgia</option>
                      <option value="EB Garamond">EB Garamond</option>
                    </optgroup>
                    <optgroup label="Script & Handwriting">
                      <option value="Great Vibes">Great Vibes</option>
                      <option value="Dancing Script">Dancing Script</option>
                      <option value="Pacifico">Pacifico</option>
                      <option value="Satisfy">Satisfy</option>
                      <option value="Cookie">Cookie</option>
                      <option value="Alex Brush">Alex Brush</option>
                      <option value="Allura">Allura</option>
                      <option value="Sacramento">Sacramento</option>
                      <option value="Tangerine">Tangerine</option>
                      <option value="Kaushan Script">Kaushan Script</option>
                      <option value="Amatic SC">Amatic SC</option>
                      <option value="Shadows Into Light">Shadows Into Light</option>
                      <option value="Indie Flower">Indie Flower</option>
                      <option value="Caveat">Caveat</option>
                      <option value="Permanent Marker">Permanent Marker</option>
                      <option value="Yellowtail">Yellowtail</option>
                      <option value="Kalam">Kalam</option>
                      <option value="Homemade Apple">Homemade Apple</option>
                      <option value="La Belle Aurore">La Belle Aurore</option>
                      <option value="Mrs Saint Delafield">Mrs Saint Delafield</option>
                      <option value="Pinyon Script">Pinyon Script</option>
                      <option value="Redressed">Redressed</option>
                      <option value="Ruthie">Ruthie</option>
                      <option value="Bilbo">Bilbo</option>
                      <option value="Clicker Script">Clicker Script</option>
                    </optgroup>
                    <optgroup label="Display & Decorative">
                      <option value="Cinzel">Cinzel</option>
                      <option value="Bebas Neue">Bebas Neue</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Righteous">Righteous</option>
                      <option value="Fjalla One">Fjalla One</option>
                      <option value="Anton">Anton</option>
                      <option value="Archivo Black">Archivo Black</option>
                      <option value="Bangers">Bangers</option>
                    </optgroup>
                    <optgroup label="Traditional & Indian">
                      <option value="Hind">Hind</option>
                      <option value="Prata">Prata</option>
                      <option value="Gentium Book Basic">Gentium Book Basic</option>
                      <option value="Karma">Karma</option>
                      <option value="Teko">Teko</option>
                      <option value="Mukta">Mukta</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <select
                    value={selectedEl.styles?.fontWeight || "normal"}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        styles: {
                          ...selectedEl.styles,
                          fontWeight: e.target.value,
                        },
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border"
                  >
                    <option value="300">Light</option>
                    <option value="normal">Normal</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi Bold</option>
                    <option value="bold">Bold</option>
                    <option value="800">Extra Bold</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedEl.styles?.color || "#000000"}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          styles: {
                            ...selectedEl.styles,
                            color: e.target.value,
                          },
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={selectedEl.styles?.color || "#000000"}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          styles: {
                            ...selectedEl.styles,
                            color: e.target.value,
                          },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Align</Label>
                  <select
                    value={selectedEl.styles?.textAlign || "center"}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        styles: {
                          ...selectedEl.styles,
                          textAlign: e.target.value,
                        },
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                {/* Background Color - for RSVP button and Registry Link */}
                {(selectedEl.type === "rsvp-button" || selectedEl.type === "registry-link") && (
                  <>
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedEl.styles?.backgroundColor || (selectedEl.type === "rsvp-button" ? "#9333ea" : "#ec4899")}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              styles: {
                                ...selectedEl.styles,
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={selectedEl.styles?.backgroundColor || (selectedEl.type === "rsvp-button" ? "#9333ea" : "#ec4899")}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              styles: {
                                ...selectedEl.styles,
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Padding (px)</Label>
                      <Input
                        type="number"
                        value={parseInt(selectedEl.styles?.padding || "10")}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            styles: {
                              ...selectedEl.styles,
                              padding: `${e.target.value}px`,
                            },
                          })
                        }
                        min="0"
                        max="50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Border Radius (px)</Label>
                      <Input
                        type="number"
                        value={parseInt(selectedEl.styles?.borderRadius || "8")}
                        onChange={(e) =>
                          updateElement(selectedEl.id, {
                            styles: {
                              ...selectedEl.styles,
                              borderRadius: `${e.target.value}px`,
                            },
                          })
                        }
                        min="0"
                        max="50"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Image URL and Fit */}
            {selectedEl.type === "image" && (
              <>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    type="text"
                    value={selectedEl.imageUrl || ""}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image Fit</Label>
                  <select
                    value={selectedEl.objectFit || "cover"}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        objectFit: e.target.value as "cover" | "contain" | "fill" | "none",
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border"
                  >
                    <option value="cover">Cover (zoom to fill)</option>
                    <option value="contain">Contain (fit entire image)</option>
                    <option value="fill">Fill (stretch to fit)</option>
                    <option value="none">None (original size)</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    How the image should fit in the frame
                  </p>
                </div>
              </>
            )}

            {/* Registry URL */}
            {selectedEl.type === "registry-link" && (
              <div className="space-y-2">
                <Label>Registry URL</Label>
                <Input
                  type="url"
                  value={selectedEl.registryUrl || ""}
                  onChange={(e) =>
                    updateElement(selectedEl.id, {
                      registryUrl: e.target.value,
                    })
                  }
                  placeholder="https://registry.example.com/your-registry"
                />
                <p className="text-xs text-gray-500">
                  Link to your gift registry (Amazon, Target, Zola, etc.)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold">Page Background</h3>

            <div className="space-y-2">
              <Label>Background Type</Label>
              <select
                value={currentPage?.background?.type || "color"}
                onChange={(e) =>
                  updateBackground({
                    type: e.target.value as "color" | "gradient" | "image",
                  })
                }
                className="w-full h-10 px-3 rounded-md border"
              >
                <option value="color">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>

            {currentPage?.background?.type === "color" && (
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentPage?.background?.value || "#fdf4ff"}
                    onChange={(e) =>
                      updateBackground({ value: e.target.value })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={currentPage?.background?.value || "#fdf4ff"}
                    onChange={(e) =>
                      updateBackground({ value: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {currentPage?.background?.type === "gradient" && (
              <>
                <div className="space-y-2">
                  <Label>From Color</Label>
                  <Input
                    type="color"
                    value={currentPage?.background?.gradient?.from || "#9333ea"}
                    onChange={(e) =>
                      updateBackground({
                        gradient: {
                          ...currentPage?.background?.gradient!,
                          from: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Color</Label>
                  <Input
                    type="color"
                    value={currentPage?.background?.gradient?.to || "#ec4899"}
                    onChange={(e) =>
                      updateBackground({
                        gradient: {
                          ...currentPage?.background?.gradient!,
                          to: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <select
                    value={
                      currentPage?.background?.gradient?.direction ||
                      "to bottom"
                    }
                    onChange={(e) =>
                      updateBackground({
                        gradient: {
                          ...currentPage?.background?.gradient!,
                          direction: e.target.value,
                        },
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border"
                  >
                    <option value="to bottom">Top to Bottom</option>
                    <option value="to right">Left to Right</option>
                    <option value="to bottom right">Diagonal</option>
                    <option value="135deg">Diagonal (Reverse)</option>
                  </select>
                </div>
              </>
            )}

            {currentPage?.background?.type === "image" && (
              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input
                  type="text"
                  value={currentPage?.background?.value || ""}
                  onChange={(e) =>
                    updateBackground({ value: e.target.value })
                  }
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500">
                  Or upload an image using the Upload Image button
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
