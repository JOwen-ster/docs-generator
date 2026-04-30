import { auth } from "@/auth"
import SignIn from "./components/SignInButton";
import SignOut from "./components/SignOutButton";
import Username from "./components/UserInfo";
import AppShell from "./components/AppShell"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {!session ? (
          <SignIn />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Signed in as {session.user?.name}</p>
            </div>
            <SignOut />
            <AppShell />
          </>
        )}
      </main>
    </div>
  );
}
