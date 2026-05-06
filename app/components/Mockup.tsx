export default function Mockup() {
  return (
    <div className="mockup-wrapper">
      <div className="app-grid mockup-grid">
        <div
          className="panel sidebar-panel mockup-panel feature-hover"
          data-tooltip="Seamlessly browse any GitHub repository"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="select-wrapper">
            <label className="select-label">Select Repository</label>
            <div className="custom-select mockup-select">
              jjoeldaniel/stratos
            </div>
          </div>

          <div style={{ flexGrow: 1, overflowY: "auto", marginBottom: "1rem" }}>
            <div className="tree-container">
              <div
                className="tree-item tree-folder"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" readOnly />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexGrow: 1,
                  }}
                >
                  <span className="tree-icon">📁</span> src
                </div>
              </div>
              <div className="tree-children">
                <div
                  className="tree-item tree-folder"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input type="checkbox" readOnly checked />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexGrow: 1,
                    }}
                  >
                    <span className="tree-icon">📂</span> components
                  </div>
                </div>
                <div className="tree-children">
                  <div
                    className="tree-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input type="checkbox" readOnly checked />
                    <span className="tree-icon">📄</span> DriveInterface.astro
                  </div>
                </div>
                <div
                  className="tree-item tree-folder"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input type="checkbox" readOnly />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexGrow: 1,
                    }}
                  >
                    <span className="tree-icon">📁</span> layouts
                  </div>
                </div>
                <div
                  className="tree-item tree-folder"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input type="checkbox" readOnly />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexGrow: 1,
                    }}
                  >
                    <span className="tree-icon">📁</span> lib
                  </div>
                </div>
                <div
                  className="tree-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input type="checkbox" readOnly />
                  <span className="tree-icon">📄</span> middleware.ts
                </div>
              </div>
              <div
                className="tree-item"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" readOnly />
                <span className="tree-icon">📄</span> package.json
              </div>
              <div
                className="tree-item"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" readOnly />
                <span className="tree-icon">📄</span> README.md
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button type="button" className="btn-primary">
              Summarize Selected (1)
            </button>
            <button type="button" className="btn-secondary">
              Summarize with Full Context
            </button>
          </div>
        </div>

        <div
          className="panel content-panel mockup-panel feature-hover"
          data-tooltip="Instant, AI-driven architectural analysis"
        >
          <div className="rundown-container">
            <div className="rundown-header">
              <h2 className="rundown-title">DriveInterface.astro</h2>
            </div>

            <div className="rundown-content">
              <p className="rundown-summary">
                This Astro component serves as the primary file management
                interface, mimicking a cloud drive experience with file/folder
                exploration. It integrates Clerk for workspace-based
                authentication and Supabase Storage for all file system
                operations and metadata storage.
              </p>

              <h3 className="rundown-tech-title">Technical Details</h3>
              <ul className="rundown-tech-list">
                <li>
                  Uses Supabase Storage API for core CRUD operations, including
                  move, copy, and signed URL generation for previews.
                </li>
                <li>
                  Implements a complex interactive UI featuring marquee
                  selection, drag-and-drop file moving, and dynamic breadcrumb
                  navigation.
                </li>
                <li>
                  Leverages Clerk for organization-level permissions,
                  distinguishing between admin and viewer roles to restrict
                  write access.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mockup-overlay">
        <div className="mockup-badge">Interactive Preview</div>
      </div>
    </div>
  );
}
