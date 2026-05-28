import { Moon, Sun } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  FolderOpen,
  Clock,
  FileSearch,
  Shield,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../providers/LanguageProvider";
import { useMobileSidebar } from "../context/MobileSidebarContext";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { useMediaQuery } from "../../shared/hooks";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarInset,
  SidebarTrigger,
} from "../components/ui/sidebar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/app" },
  { icon: MessageSquare, label: "AI Chat", to: "/app/chat" },
  { icon: Upload, label: "Upload Document", to: "/app/upload" },
  { icon: FolderOpen, label: "My Documents", to: "/app/documents" },
  { icon: Clock, label: "Chat History", to: "/app/history" },
  { icon: FileSearch, label: "Contract Analysis", to: "/app/contract-analysis" },
  { icon: Shield, label: "Tenant Rights", to: "/app/tenant-rights" },
  { icon: TrendingUp, label: "Labor Law", to: "/app/labor-law" },
];

const languageLabel = (lang: "en" | "am" | "om") => {
  if (lang === "am") return "አማ";
  if (lang === "om") return "ORM";
  return "EN";
};

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { isOpen: isSidebarOpen, closeSidebar } = useMobileSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const nextLanguage = () => {
    if (language === "en") setLanguage("am");
    else if (language === "am") setLanguage("om");
    else setLanguage("en");
  };

  const handleNavigation = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-svh w-full bg-background text-foreground">
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="px-3 py-3">
            <button
              className="w-full text-left"
              onClick={() => {
                navigate("/app");
                handleNavigation();
              }}
            >
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  EA
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    EthioLegal AI
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user?.email || "Signed in"}
                  </div>
                </div>
              </div>
            </button>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent className="px-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.to}
                      end={item.to === "/app"}
                      onClick={handleNavigation}
                      className={({ isActive }) =>
                        cn(
                          "gap-2",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                        )
                      }
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="px-2 py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/app/settings"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      cn(
                        "gap-2",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                      )
                    }
                  >
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="gap-2"
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/80 px-3 backdrop-blur md:px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <div className="text-sm font-medium">
                {user?.name || "Welcome"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={nextLanguage}
                className="text-xs"
              >
                {languageLabel(language)}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur">
            <div className="flex items-center overflow-x-auto">
              {navItems.slice(0, 4).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/app"}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-1 flex-1 px-2 py-2 min-w-fit text-xs text-muted-foreground transition-colors",
                      isActive && "text-primary",
                    )
                  }
                >
                  <item.icon className="size-5" />
                  <span className="truncate">{item.label.split(" ")[0]}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </SidebarProvider>
  );
}
