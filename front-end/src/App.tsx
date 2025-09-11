import { useState } from "react";
import GenderChart from "./components/genderChart";
import Sidebar from "./components/sidebar";
import UserAdd from "./components/userAdd";
import UserTable from "./components/UserTable";
import UserDetail from "./components/userDetail";
import InfoBox from "./components/infoBox";

export type MenuType = 'dashboard' | 'user-add' | 'user-detail';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuType>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // UserTable'dan user seçildiğinde
  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    setActiveMenu('user-detail');
  };

  // Menü değiştirildiğinde
  const handleMenuChange = (menu: MenuType) => {
    setActiveMenu(menu);
    if (menu !== 'user-detail') {
      setSelectedUserId(null);
    }
  };

  // Kullanıcı verisi değiştiğinde çağrılacak fonksiyon
  const handleUserDataChange = () => {
    localStorage.removeItem('users-cache');
    setDataRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Layout Container - Max Width 1400px'de responsive grid */}
      <div className="lg:grid lg:grid-cols-[280px_1fr] 2xl:grid-cols-[280px_1fr_380px] lg:min-h-screen">
        
        {/* Sidebar */}
        <div className="h-full">
          <Sidebar 
            activeMenu={activeMenu}
            onMenuChange={handleMenuChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-col 2xl:flex-row min-h-screen">
          {/* Central Content Area */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {activeMenu === 'dashboard' && (
              <div className="space-y-6">
                {/* Info Cards */}
                <div className="w-full">
                  <InfoBox key={`infobox-${dataRefreshKey}`} />
                </div>
                
                {/* User Table */}
                <div className="w-full">
                  <UserTable 
                    mode="simple"
                    onUserSelect={handleUserSelect}
                    onUserDeleted={handleUserDataChange}
                  />
                </div>

                {/* Mobile/Tablet GenderChart - 1400px altında altta göster */}
                <div className="2xl:hidden w-full">
                  <GenderChart key={`chart-mobile-${dataRefreshKey}`} />
                </div>
              </div>
            )}

            {activeMenu === 'user-add' && (
              <div className="space-y-6">
                <UserAdd 
                  onSaved={handleUserDataChange}
                  onDeleted={handleUserDataChange}
                />
                
                {/* Mobile/Tablet GenderChart */}
                <div className="2xl:hidden w-full">
                  <GenderChart key={`chart-mobile-add-${dataRefreshKey}`} />
                </div>
              </div>
            )}

            {activeMenu === 'user-detail' && (
              <div className="space-y-6">
                <UserTable 
                  mode="full"
                  onUserSelect={handleUserSelect}
                  onUserDeleted={handleUserDataChange}
                />

                {/* Mobile/Tablet User Detail - sadece seçili kullanıcı varsa göster */}
                {selectedUserId && (
                  <div className="2xl:hidden w-full">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <UserDetail 
                        userId={selectedUserId} 
                        onUserDeleted={() => {
                          setActiveMenu('dashboard');
                          handleUserDataChange();
                        }}  
                        onUserUpdated={handleUserDataChange}
                      />
                    </div>
                  </div>
                )}

                {/* GenderChart'ı tamamen kaldırdık - artık user-detail'de chart yok */}
              </div>
            )}
          </div>

         
        </div>
         {/* Right Panel - 1400px üzeri ekranlarda göster */}
          <div className="hidden 2xl:block 2xl:w-[380px] p-6 overflow-auto">
            {/* GenderChart - Desktop (1400px+) */}
            <div className="mb-6">
              <GenderChart key={`chart-desktop-${dataRefreshKey}`} />
            </div>

            {activeMenu === 'dashboard' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <h3 className="font-medium text-gray-900 mb-2">Dashboard Özet</h3>
                  <p>Kullanıcı istatistikleri ve genel sistem durumu burada görünür.</p>
                </div>
              </div>
            )}
            
            {activeMenu === 'user-add' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">İstatistikler</h3>
                  <p className="text-sm text-blue-700">
                    Kullanıcı eklendikten sonra güncel istatistikler otomatik olarak güncellenecektir.
                  </p>
                </div>
              </div>
            )}

            {activeMenu === 'user-detail' && selectedUserId && (
              <div className="mt-6">
                <UserDetail 
                  userId={selectedUserId} 
                  onUserDeleted={() => {
                    setActiveMenu('dashboard');
                    handleUserDataChange();
                  }}  
                  onUserUpdated={handleUserDataChange}
                />
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default App;
