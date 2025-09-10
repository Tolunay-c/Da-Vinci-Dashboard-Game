import { User, LayoutDashboard, Settings, Users } from "lucide-react";

const menu = {
  logo: {
    type: "image",
    src: "/logo.png",
    alt: "Logo",
    link: "/"
  },
  overview: {
    type: "section",
    title: "Overview",
    items: [
      { name: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Users Add", link: "/users-add", icon: <Users size={18} /> }
    ],
  },
  management: {
    type: "section",
    title: "Management",
    items: [
      { name: "User Detail", link: "/user-detail", icon: <User size={18} /> },
      { name: "Settings", link: "/settings", icon: <Settings size={18} /> }
    ],
  }
};

const Sidebar = () => {
  return (
    <div className="h-full p-6 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center">
        <a href={menu.logo.link} className="transition-opacity hover:opacity-80">
          <img 
            src={menu.logo.src} 
            alt={menu.logo.alt} 
            className="h-12 w-auto" 
          />
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col justify-between h-[90%]">
        {/* Overview Section */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4 px-3">
            {menu.overview.title}
          </h2>
          <ul className="space-y-1">
            {menu.overview.items.map((item) => (
              <li key={item.link}>
                <a
                  href={item.link}
                  className="flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                >
                  <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Management Section */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4 px-3">
            {menu.management.title}
          </h2>
          <ul className="space-y-1">
            {menu.management.items.map((item) => (
              <li key={item.link}>
                <a
                  href={item.link}
                  className="flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                >
                  <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

     
    </div>
  );
};

export default Sidebar;