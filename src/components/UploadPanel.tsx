"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// UploadPanel — ICP + Brand Image uploader
// Stores: aim_icp (text), aim_brand_image (base64 data URL) in localStorage
// ---------------------------------------------------------------------------

interface UploadZoneProps {
  label: string;
  subLabel: string;
  accept: string;
  icon: string;
  color: string;
  fileName: string | null;
  preview: string | null;
  onFile: (file: File) => void;
}

function UploadZone({ label, subLabel, accept, icon, color, fileName, preview, onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        flex: 1,
        minWidth: 160,
        border: `1.5px dashed ${dragging ? color : fileName ? color + "88" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 10,
        padding: "18px 14px",
        cursor: "pointer",
        background: dragging
          ? `${color}12`
          : fileName
          ? `${color}08`
          : "rgba(255,255,255,0.02)",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        textAlign: "center",
        userSelect: "none",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Preview / Icon */}
      {preview ? (
        <img
          src={preview}
          alt="Brand preview"
          style={{
            width: 56,
            height: 56,
            objectFit: "contain",
            borderRadius: 6,
            background: "rgba(255,255,255,0.05)",
          }}
        />
      ) : (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}>
          {fileName ? "✅" : icon}
        </div>
      )}

      {/* Labels */}
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: fileName ? color : "#C8CCD4",
          fontFamily: "'Space Grotesk', sans-serif",
          lineHeight: 1.3,
        }}>
          {fileName ?? label}
        </div>
        <div style={{
          fontSize: 10,
          color: "#5A5F6E",
          marginTop: 3,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {fileName ? "click to replace" : subLabel}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function UploadPanel() {
  const [icpFile, setIcpFile] = useState<string | null>(null);
  const [brandFile, setBrandFile] = useState<string | null>(null);
  const [brandPreview, setBrandPreview] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing values from localStorage on mount
  useEffect(() => {
    const icp = localStorage.getItem("aim_icp");
    const brand = localStorage.getItem("aim_brand_image");
    if (icp) setIcpFile("(previously uploaded)");
    if (brand) {
      setBrandFile("(previously uploaded)");
      setBrandPreview(brand);
    }
    // Collapse if both already loaded
    if (icp && brand) setCollapsed(true);
  }, []);

  const handleICP = useCallback((file: File) => {
    if (!file.name.endsWith(".md") && file.type !== "text/markdown") {
      alert("Please upload a .md (Markdown) file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      localStorage.setItem("aim_icp", text);
      setIcpFile(file.name);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    reader.readAsText(file);
  }, []);

  const handleBrand = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (jpg, png, gif, webp).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      localStorage.setItem("aim_brand_image", dataUrl);
      setBrandFile(file.name);
      setBrandPreview(dataUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  }, []);

  const hasAny = icpFile || brandFile;

  return (
    <div style={{
      margin: "0 0 0 0",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Header / Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📁</span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.5,
            fontFamily: "'Orbitron', monospace",
            color: hasAny ? "#7B61FF" : "#5A5F6E",
          }}>
            CONTEXT FILES
          </span>
          {saved && (
            <span style={{
              fontSize: 10,
              color: "#10B981",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
            }}>
              ✓ Saved
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: "#5A5F6E" }}>{collapsed ? "▼" : "▲"}</span>
      </button>

      {/* Body */}
      {!collapsed && (
        <div style={{ padding: "14px 16px 16px" }}>
          <p style={{
            fontSize: 11,
            color: "#6B7186",
            margin: "0 0 12px",
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.5,
          }}>
            Upload your ICP and brand assets to personalize the demo.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <UploadZone
              label="Ideal Customer (.md)"
              subLabel="drag & drop or click"
              accept=".md,text/markdown,text/plain"
              icon="👤"
              color="#2F80FF"
              fileName={icpFile}
              preview={null}
              onFile={handleICP}
            />
            <UploadZone
              label="Brand Image"
              subLabel="jpg / png / gif"
              accept="image/*"
              icon="🎨"
              color="#FF4EDB"
              fileName={brandFile}
              preview={brandPreview}
              onFile={handleBrand}
            />
          </div>
        </div>
      )}
    </div>
  );
}
