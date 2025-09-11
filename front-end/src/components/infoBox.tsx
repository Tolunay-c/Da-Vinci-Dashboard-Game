import { useEffect, useState } from "react";
import { Users, Activity,  Venus, Mars } from "lucide-react";
import { getUsers } from "../api";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  maleUsers: number;
  femaleUsers: number;
  totalGrowth: number;
  activeGrowth: number;
  malePercentage: number;
  femalePercentage: number;
}

const InfoBox = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    totalGrowth: 0,
    activeGrowth: 0,
    malePercentage: 0,
    femalePercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Önce cache'den kontrol et
        const cached = localStorage.getItem('users-cache');
        let users: User[] = [];

        if (cached) {
          users = JSON.parse(cached);
        } else {
          users = await getUsers();
          localStorage.setItem('users-cache', JSON.stringify(users));
        }

        // İstatistikleri hesapla
        const totalUsers = users.length;
        const maleUsers = users.filter(user => user.gender === 'male').length;
        const femaleUsers = users.filter(user => user.gender === 'female').length;
        
        // Aktif kullanıcıları simüle et (toplam kullanıcıların %85'i)
        const activeUsers = Math.floor(totalUsers * 0.85);
        
        // Büyüme oranlarını simüle et
        const totalGrowth = 0.12; // %12 artış bu ay
        const activeGrowth = 0.08; // %8 artış bu ay

        const malePercentage = totalUsers > 0 ? maleUsers / totalUsers : 0;
        const femalePercentage = totalUsers > 0 ? femaleUsers / totalUsers : 0;

        setStats({
          totalUsers,
          activeUsers,
          maleUsers,
          femaleUsers,
          totalGrowth,
          activeGrowth,
          malePercentage,
          femalePercentage,
        });
      } catch (error) {
        console.error('❌ Stats yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const infoBoxes = [
    {
      title: "Toplam Kullanıcı",
      value: stats.totalUsers,
      icon: Users,
      iconBg: "bg-indigo-500",
      change: `+${Math.round(stats.totalGrowth * 100)}% bu ay`,
      changeColor: "text-green-500",
    },
    {
      title: "Aktif Kullanıcı",
      value: stats.activeUsers,
      icon: Activity,
      iconBg: "bg-green-500",
      change: `+${Math.round(stats.activeGrowth * 100)}% bu ay`,
      changeColor: "text-green-500",
    },
    {
      title: "Erkek Kullanıcı",
      value: stats.maleUsers,
      icon: Mars,
      iconBg: "bg-cyan-500",
      change: `${Math.round(stats.malePercentage * 100)}%`,
      changeColor: "text-cyan-500",
    },
    {
      title: "Kadın Kullanıcı",
      value: stats.femaleUsers,
      icon: Venus,
      iconBg: "bg-pink-500",
      change: `${Math.round(stats.femalePercentage * 100)}%`,
      changeColor: "text-pink-500",
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col xl:flex-row justify-between gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 p-6 border border-gray-100 shadow rounded-2xl animate-pulse">
            <div className="flex flex-row justify-between items-start mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row justify-between gap-4">
      {infoBoxes.map((box, index) => {
        const Icon = box.icon;
        return (
          <div 
            key={index}
            className="flex-1 p-6 border border-gray-100 shadow rounded-2xl bg-white hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex flex-row justify-between items-start mb-4">
              <div>
                <span className="text-gray-600 font-medium text-sm">
                  {box.title}
                </span>
              </div>
              <div className={`flex justify-center items-center p-2 rounded-2xl ${box.iconBg}`}>
                <Icon className="text-white" size={20} />
              </div>
            </div>

            {/* Value */}
            <div className="mb-2">
              <h6 className="text-3xl font-bold text-gray-900">
                {box.value.toLocaleString()}
              </h6>
            </div>

            {/* Change/Percentage */}
            <div>
              <span className={`${box.changeColor} font-medium text-sm`}>
                {box.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InfoBox;
