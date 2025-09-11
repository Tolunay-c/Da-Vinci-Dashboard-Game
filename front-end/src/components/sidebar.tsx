import { LayoutDashboard, UserPlus, Users, Menu, X } from "lucide-react";
import { MenuType } from "../App";
import { useState, useEffect } from "react";

interface SidebarProps {
  activeMenu: MenuType;
  onMenuChange: (menu: MenuType) => void;
}

const Sidebar = ({ activeMenu, onMenuChange }: SidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobil menü açıkken body scroll'unu engelle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const items = [
    { id: "dashboard" as MenuType, name: "Dashboard", icon: LayoutDashboard, desc: "Ana sayfa görünümü" },
    { id: "user-add" as MenuType, name: "Kullanıcı Ekle", icon: UserPlus, desc: "Yeni kullanıcı oluştur" },
    { id: "user-detail" as MenuType, name: "Kullanıcı Yönetimi", icon: Users, desc: "Kullanıcıları düzenle/sil" },
  ];

  const handleMenuClick = (menuId: MenuType) => {
    onMenuChange(menuId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Da Vinci</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          bg-white border-r border-gray-200 flex flex-col
          transition-transform duration-300 ease-in-out h-full
          ${mobileMenuOpen 
            ? 'fixed inset-y-0 left-0 w-[280px] z-50 translate-x-0' 
            : 'fixed inset-y-0 left-0 w-[280px] z-50 -translate-x-full'
          }
          lg:relative  lg:w-[280px] lg:translate-x-0
        `}
      >
        {/* Desktop Logo */}
        <div className="hidden lg:flex p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Da Vinci</div>
              <div className="text-xs text-gray-500">Admin Dashboard</div>
            </div>
          </div>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Da Vinci</div>
                <div className="text-xs text-gray-500">Admin Dashboard</div>
              </div>
            </div>
          </div>
        </div>

        {/* MENU LIST - Bu kısım flex-1 olmalı */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left 
                    transition-all duration-200
                    ${isActive
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                    }
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer - flex-shrink-0 ile sabit tutulur */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">Version 1.0.0</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;