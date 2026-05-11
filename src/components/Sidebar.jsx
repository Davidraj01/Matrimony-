import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-pink-50";

  const activeClass = "bg-pink-100 text-pink-500 font-medium";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🔥 COMMON MENU (reuse)
  const MenuLinks = () => (
    <>
      <NavLink
        to="/dashboard"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/matches"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }
      >
        Matches
      </NavLink>

      <NavLink
        to="/profile"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }
      >
        Profile
      </NavLink>

      <NavLink
        to="/received"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }
      >
        Received
      </NavLink>

      <NavLink
        to="/shortlist"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }
      >
        Shortlisted
      </NavLink>

      <NavLink
        to="/sent"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }
      >
        Sent
      </NavLink>

      <NavLink
        to="/views"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }
      >
        Views
      </NavLink>
    </>
  );

  return (
    <>
      {/* 🔥 MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow flex items-center justify-between px-4 py-3 z-50">
        <h2 className="font-bold text-pink-500">❤️ Royal Matrimony</h2>

        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* 🔥 MOBILE OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* 🔥 MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 p-4 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-pink-500">❤️Royal Matrimony</h2>

          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <MenuLinks />
        </nav>

        <div className="mt-auto space-y-3">
          <div className="bg-pink-50 p-4 rounded-xl text-center">
            <p className="text-sm">Go Premium</p>
            <button
              onClick={() => {
                navigate("/plans");
                setOpen(false);
              }}
              className="mt-2 bg-pink-500 text-white px-3 py-1 rounded"
            >
              Upgrade
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-500 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🔥 DESKTOP SIDEBAR (UNCHANGED) */}
      <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen bg-white p-4 border-r shadow-sm">
        <h2 className="text-xl font-bold text-pink-500 mb-6">
          ❤️Royal Matrimony
        </h2>

        <nav className="flex flex-col gap-2 text-sm">
          <MenuLinks />
        </nav>

        <div className="mt-auto space-y-3">
          <div className="bg-pink-50 p-4 rounded-xl text-center">
            <p className="text-sm">Go Premium</p>
            <button
              onClick={() => navigate("/plans")}
              className="mt-2 bg-pink-500 text-white px-3 py-1 rounded"
            >
              Upgrade
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-500 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
