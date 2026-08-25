import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import CheatSheet from "./CheatSheet";

export default function App() {
  // undefined = still checking for a session, null = signed out, object = signed in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');`}</style>
        <div className="bg-emerald-900 rounded-lg p-8 text-center max-w-sm w-full">
          <h1 className="text-2xl text-white tracking-wide mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>
            DRAFT CHEAT SHEET
          </h1>
          <p className="text-emerald-300 text-sm mb-6">Sign in to save your board</p>
          <button
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: "github",
                options: { redirectTo: window.location.origin },
              })
            }
            className="bg-white text-emerald-900 font-medium px-4 py-2 rounded w-full hover:bg-emerald-50"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return <CheatSheet userId={session.user.id} onSignOut={() => supabase.auth.signOut()} />;
}
