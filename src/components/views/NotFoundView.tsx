import React from "react";

import ColorSpan from "@/components/ColorSpan";

import useCommandHandler from "@/hooks/useCommandHandler";

export default function NotFoundView() {
  useCommandHandler({});

  return (
    <div className={"content-div"}>
      <div className={"container1"}>
        <div className="sub-container2" style={{ fontFamily: "monospace" }}>
          <div>
            <ColorSpan str="@#FF77B7Error:@# This page doesn't exist. Use @#00ffaa'cd'@# back to home page" />
          </div>
        </div>
      </div>
    </div>
  );
}

