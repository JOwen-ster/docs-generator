"use client";

import { useEffect, useState } from "react";

interface Repo {
  name: string;
  owner: string;
  default_branch: string;
}

interface Props {
  onSelect: (repo: Repo) => void;
}

export default function RepoSelector({ onSelect }: Props) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the user's repos once on mount — the API route handles auth server-side
  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => {
        setRepos(data);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="status-msg">
        <span>Loading repositories...</span>
      </div>
    );

  return (
    <div className="select-wrapper">
      <label className="select-label">Select Repository</label>
      <select
        defaultValue=""
        onChange={(e) => {
          const repo = repos[Number(e.target.value)];
          if (repo) onSelect(repo);
        }}
        className="custom-select"
      >
        <option value="" disabled>
          Choose a repository...
        </option>
        {repos.map((repo, i) => (
          <option key={`${repo.owner}/${repo.name}`} value={i}>
            {repo.owner}/{repo.name}
          </option>
        ))}
      </select>
    </div>
  );
}
