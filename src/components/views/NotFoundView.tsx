import React from "react";

import ColorSpan from "@/components/ColorSpan";

import useCommandHandler from "@/hooks/useCommandHandler";
import { t } from "@/lib/i18n";

export default function NotFoundView() {
  useCommandHandler({});

  return (
    <div className={"content-div"}>
      <div className={"container1"}>
        <div className="sub-container2" style={{ fontFamily: "monospace" }}>
          <div>
            <ColorSpan str={t("*.error")} />
          </div>
        </div>
      </div>
    </div>
  );
}
