import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Bell, Settings, LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/lib/api";

const navItems = [
  { label: "Feed", icon: Home, path: "/feed" },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationsApi.getUnreadCount()
        .then(data => {
          const count = typeof data === 'number' ? data : (data?.count || 0);
          setUnreadCount(count);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]); // Refresh on route change

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/auth");
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 bg-card border-b shadow-card">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">RP</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">Route Posts</span>
        </Link>

        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <item.icon size={18} />
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-card">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-muted rounded-full p-1 pr-3 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photo || ""} />
              <AvatarFallback className="gradient-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground hidden md:block">{user?.name || "User"}</span>
            <Menu size={16} className="text-muted-foreground" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 w-48 bg-card rounded-xl shadow-card-hover border z-50 py-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={16} />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <div className="border-t my-1" />
                <button
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
