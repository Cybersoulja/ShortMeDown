import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Search, PlusCircle, FolderClosed, User } from "lucide-react";

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export function TabBar() {
  const [location] = useLocation();
  
  const tabs: TabItem[] = [
    {
      path: "/",
      label: "Home",
      icon: <Home className="h-6 w-6" />,
    },
    {
      path: "/explore",
      label: "Explore",
      icon: <Search className="h-6 w-6" />,
    },
    {
      path: "/create",
      label: "Create",
      icon: <PlusCircle className="h-6 w-6" />,
    },
    {
      path: "/library",
      label: "Library",
      icon: <FolderClosed className="h-6 w-6" />,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: <User className="h-6 w-6" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-ios-gray-4">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={cn(
              "flex flex-col items-center py-2 px-5",
              location === tab.path ? "text-ios-blue" : "text-ios-gray-1"
            )}
          >
            {tab.icon}
            <span className="text-xs mt-1">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
