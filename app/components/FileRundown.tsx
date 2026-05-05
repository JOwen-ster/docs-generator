"use client";

// Purely presentational — no fetching here. AppShell owns the data and passes it down.

interface Rundown {
  summary: string;
  technical: string[]; // bullet points from Gemini, rendered as a <ul>
}

interface Props {
  files: string[];
  rundown: Rundown | null;
  loading: boolean;
  error: string | null;
}

export default function FileRundown({ files, rundown, loading, error }: Props) {
  const filenames = files.map((f) => f.split("/").pop()).join(", ");
  const title =
    files.length === 1
      ? filenames
      : `${files.length} files selected: ${filenames.length > 50 ? filenames.substring(0, 47) + "..." : filenames}`;

  return (
    <div className="rundown-container">
      <div className="rundown-header">
        <h2 className="rundown-title" title={filenames}>
          {title}
        </h2>
      </div>

      {loading && (
        <div className="status-msg">
          <span>Generating architectural rundown...</span>
        </div>
      )}

      {error && (
        <div className="error-msg">
          <span>⚠</span> {error}
        </div>
      )}

      {rundown && (
        <div className="rundown-content">
          <p className="rundown-summary">{rundown.summary}</p>

          <h3 className="rundown-tech-title">Technical Details</h3>
          <ul className="rundown-tech-list">
            {rundown.technical.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
