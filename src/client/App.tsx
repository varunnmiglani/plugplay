import React, { useEffect, useRef } from "react";
import { useOfficeWebSocket } from "./hooks/useWebSocket.js";
import { OfficeRenderer } from "./renderer/OfficeRenderer.js";
import { StatusPanel } from "./components/StatusPanel.js";

const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const WS_URL = `${wsProtocol}//${window.location.host}/ws?role=ui`;

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<OfficeRenderer | null>(null);
  const { agents, office, connected } = useOfficeWebSocket(WS_URL);

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new OfficeRenderer(canvasRef.current);
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  // Update office layout
  useEffect(() => {
    if (rendererRef.current && office) {
      rendererRef.current.setOffice(office);
    }
  }, [office]);

  // Update agent sprites
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    for (const agent of agents.values()) {
      renderer.updateAgent(agent);
    }
  }, [agents]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>
          <span style={styles.logoIcon}>▣</span> plugplay
        </h1>
        <span style={styles.subtitle}>agent activity office</span>
      </div>

      <div style={styles.main}>
        <div style={styles.canvasWrapper}>
          <canvas ref={canvasRef} style={styles.canvas} />
          {!connected && (
            <div style={styles.overlay}>
              <div style={styles.overlayText}>
                Connecting to office server...
                <br />
                <span style={styles.overlayHint}>
                  Run <code>npm run server</code> to start
                </span>
              </div>
            </div>
          )}
        </div>
        <StatusPanel agents={agents} connected={connected} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#11111b",
    color: "#cdd6f4",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "8px 16px",
    borderBottom: "1px solid #313244",
    backgroundColor: "#1e1e2e",
  },
  logo: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    fontFamily: "monospace",
    color: "#cdd6f4",
  },
  logoIcon: {
    color: "#89b4fa",
  },
  subtitle: {
    fontSize: 12,
    color: "#6c7086",
    fontFamily: "monospace",
  },
  main: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  canvasWrapper: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  canvas: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 27, 0.85)",
  },
  overlayText: {
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: 16,
    color: "#cdd6f4",
    lineHeight: 2,
  },
  overlayHint: {
    fontSize: 12,
    color: "#6c7086",
  },
};
