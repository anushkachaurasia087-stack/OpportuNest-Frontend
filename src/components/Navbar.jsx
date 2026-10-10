import {
  Search,
  Users,
  Sparkles,
  ClipboardList,
  ShieldCheck,
 Leaf,
  User,
  LogOut,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/config";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const links = [
    {
      name: "Discover",
      path: "/discover",
      icon: Search,
    },
    {
      name: "Find a Team",
      path: "/team",
      icon: Users,
    },
    {
      name: "AI Prep Coach",
      path: "/prep",
      icon: Sparkles,
    },
    {
      name: "Claim Checker",
      path: "/claim-checker",
      icon: ShieldCheck,
    },
   {
  name: "Green Impact",
  path: "/green-impact",
  icon: Leaf,
},
    {
      name: "Tracker",
      path: "/tracker",
      icon: ClipboardList,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  // WATCH LOGIN STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      alert("Unable to logout.");
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 p-5">

      {/* LOGO */}

      <Link
        to="/"
        className="mb-10"
      >
        <div className="text-2xl font-bold text-white">
          Opportu
          <span className="text-emerald-400">
            Nest
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Find opportunities made for you.
        </p>
      </Link>

      {/* NAVIGATION */}

      <nav className="flex flex-col gap-2">

        {links.map((link) => {
          const Icon = link.icon;

          const active =
            location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={18} />

              {link.name}
            </Link>
          );
        })}

      </nav>

      {/* BOTTOM SECTION */}

      <div className="mt-auto">

        {/* AI CARD */}

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">

          <div className="flex items-center gap-2">

            <Sparkles
              size={18}
              className="text-emerald-400"
            />

            <span className="text-sm font-semibold text-white">
              AI Powered
            </span>

          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Discover opportunities based on your
            skills, interests and goals.
          </p>

        </div>

        {/* USER / LOGOUT */}

        {user ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">

            <div className="mb-3 flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">

                {user.email
                  ? user.email
                      .charAt(0)
                      .toUpperCase()
                  : "U"}

              </div>

              <div className="min-w-0">

                <p className="text-xs text-slate-500">
                  Signed in as
                </p>

                <p className="truncate text-sm font-medium text-white">
                  {user.email}
                </p>

              </div>

            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={16} />

              Logout
            </button>

          </div>
        ) : (
          <Link
            to="/login"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <User size={16} />

            Sign In
          </Link>
        )}

      </div>

    </aside>
  );
}

export default Navbar;