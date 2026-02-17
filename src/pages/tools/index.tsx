import React from "react";

import styles from "@/styles/tools.module.css";

import ColorSpan from "@/components/ColorSpan";

import useCommandHandler from "@/hooks/useCommandHandler";

import textContent from "@/lib/text-content.json";

export default function Page() {
  useCommandHandler({});

  return (
    <div className={"content-div"}>
      {textContent["tools/"].item.map((item, index) => {
        return (
          <div key={index} className={"container1"}>
            <div
              key={index}
              className={"sub-container1"}
              style={{ gap: "1rem", fontFamily: "monospace" }}
            >
              <ColorSpan str={item.title} className="header2" />
              <img className={styles["screen-shot"]} />
              <div>
                <ColorSpan str={item.description} className="p1" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
