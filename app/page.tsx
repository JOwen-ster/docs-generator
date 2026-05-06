import Link from "next/link";
import { auth } from "@/auth";
import AppShell from "./components/AppShell";
import Mockup from "./components/Mockup";
import SignIn from "./components/SignInButton";
import SignOut from "./components/SignOutButton";
import ThemeToggle from "./components/ThemeToggle";

export default async function Home() {
  const session = await auth();

  return (
    <div className="layout-container">
      <header className="header">
        <Link
          href="/"
          className="header-title"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          DocsGenerator
        </Link>
        <div className="user-info">
          <ThemeToggle />
          {session && (
            <>
              <span className="user-name">
                Welcome, <strong>{session.user?.name}</strong>
              </span>
              <SignOut />
            </>
          )}
        </div>
      </header>

      <main>
        {!session ? (
          <div className="welcome-container">
            <h2 className="welcome-title">Documentation on Demand</h2>
            <p className="welcome-subtitle">
              Instantly generate comprehensive, context-aware documentation and
              architectural rundowns for any GitHub repository using AI.
            </p>
            <SignIn />
            <Mockup />
          </div>
        ) : (
          <AppShell />
        )}
      </main>
    </div>
  );
}
