"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

export function StorefrontPreviewFrame() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className={`storefront-preview-frame is-${device}`}>
      <div aria-label="Preview size" className="preview-device-switch" role="group">
        <button
          aria-pressed={device === "desktop"}
          onClick={() => setDevice("desktop")}
          type="button"
        >
          <Monitor size={14} /> Desktop
        </button>
        <button
          aria-pressed={device === "mobile"}
          onClick={() => setDevice("mobile")}
          type="button"
        >
          <Smartphone size={14} /> Mobile
        </button>
      </div>
      <div className="preview-frame-stage">
        <iframe src="/dashboard/preview?frame=1" title={`${device} draft storefront preview`} />
      </div>
    </div>
  );
}
