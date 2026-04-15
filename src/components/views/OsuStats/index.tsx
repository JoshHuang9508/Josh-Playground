import React from "react";

import { AddConsoleLog } from "@/redux";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import useOsuStats from "@/lib/hooks/OsuStats";

import styles from "./OsuStats.module.css";

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}

function formatNumber(n: number | null): string {
  if (n === null) return "--";
  return n.toLocaleString();
}

export default function OsuStatsView() {
  const { user, loading, error } = useOsuStats();

  useCommandHandler({
    stats: () => {
      if (!user) {
        AddConsoleLog("osu! stats not available.");
        return;
      }
      AddConsoleLog(
        `@#ff77b7osu! Stats for ${user.username}@#`,
        `Global Rank: @#fff700#${formatNumber(user.globalRank)}@#`,
        `Country Rank: @#00ffaa#${formatNumber(user.countryRank)}@#`,
        `PP: @#ffa24c${formatNumber(user.pp)}@#`,
        `Accuracy: @#fff${user.accuracy.toFixed(2)}%@#`,
        `Play Count: ${formatNumber(user.playCount)}`,
        `Play Time: ${formatPlayTime(user.playTime)}`,
      );
    },
  });

  if (loading) {
    return (
      <div className={styles["osu-page"]}>
        <div className={styles["header"]}>
          <p className="page-header" style={{ color: "#ff77b7" }}>
            ~/osu
          </p>
        </div>
        <p style={{ color: "#888" }}>Loading stats...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles["osu-page"]}>
        <div className={styles["header"]}>
          <p className="page-header" style={{ color: "#ff77b7" }}>
            ~/osu
          </p>
        </div>
        <div className={styles["unavailable"]}>
          <p>Stats temporarily unavailable.</p>
          <p style={{ fontSize: "0.75rem" }}>
            osu! API proxy not configured yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["osu-page"]}>
      <div className={styles["header"]}>
        <p className="page-header" style={{ color: "#ff77b7" }}>
          ~/osu
        </p>
      </div>

      <hr className="divider" />

      <div className={styles["banner"]}>
        <img
          className={styles["osu-avatar"]}
          src={user.avatarUrl}
          alt={user.username}
        />
        <div className={styles["banner-info"]}>
          <span className={styles["osu-username"]}>{user.username}</span>
          <span className={styles["osu-details"]}>
            {user.countryCode} &bull; Joined{" "}
            {new Date(user.joinDate).getFullYear()}
          </span>
          <div className={styles["rank-row"]}>
            <div className={styles["rank-item"]}>
              <span
                className={styles["rank-value"]}
                style={{ color: "#fff700" }}
              >
                #{formatNumber(user.globalRank)}
              </span>
              <span className={styles["rank-label"]}>Global Rank</span>
            </div>
            <div className={styles["rank-item"]}>
              <span
                className={styles["rank-value"]}
                style={{ color: "#00ffaa" }}
              >
                #{formatNumber(user.countryRank)}
              </span>
              <span className={styles["rank-label"]}>Country</span>
            </div>
            <div className={styles["rank-item"]}>
              <span
                className={styles["rank-value"]}
                style={{ color: "#ffa24c" }}
              >
                {formatNumber(user.pp)}pp
              </span>
              <span className={styles["rank-label"]}>Performance</span>
            </div>
          </div>
          <div>
            <span className={styles["level-text"]}>
              Lv.{user.level} ({user.levelProgress}%)
            </span>
            <div className={styles["level-bar"]}>
              <div
                className={styles["level-fill"]}
                style={{ width: `${user.levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles["stats-grid"]}>
        <div className={styles["stat-card"]}>
          <span className={styles["stat-number"]}>
            {user.accuracy.toFixed(1)}%
          </span>
          <span className={styles["stat-label"]}>Accuracy</span>
        </div>
        <div className={styles["stat-card"]}>
          <span className={styles["stat-number"]}>
            {formatNumber(user.playCount)}
          </span>
          <span className={styles["stat-label"]}>Play Count</span>
        </div>
        <div className={styles["stat-card"]}>
          <span className={styles["stat-number"]}>
            {formatPlayTime(user.playTime)}
          </span>
          <span className={styles["stat-label"]}>Play Time</span>
        </div>
      </div>

      <hr className="divider" />

      <div className={styles["grade-card"]}>
        <span className={styles["grade-title"]}>Grade Distribution</span>
        <div className={styles["grade-bar"]}>
          <div
            style={{
              flex: user.gradeCounts.ss || 1,
              backgroundColor: "#fff700",
            }}
          />
          <div
            style={{
              flex: user.gradeCounts.s || 1,
              backgroundColor: "#ffa24c",
            }}
          />
          <div
            style={{
              flex: user.gradeCounts.a || 1,
              backgroundColor: "#00ffaa",
            }}
          />
        </div>
        <div className={styles["grade-labels"]}>
          <span className={styles["grade-label"]} style={{ color: "#fff700" }}>
            SS: {user.gradeCounts.ss}
          </span>
          <span className={styles["grade-label"]} style={{ color: "#ffa24c" }}>
            S: {user.gradeCounts.s}
          </span>
          <span className={styles["grade-label"]} style={{ color: "#00ffaa" }}>
            A: {user.gradeCounts.a}
          </span>
        </div>
      </div>
    </div>
  );
}
