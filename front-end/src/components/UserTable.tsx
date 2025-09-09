import { useEffect, useState } from "react";
import { CircleUserRound, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { getUsers } from "../api.ts";

// Tailwind CSS ana renkleri
const TAILWIND_COLORS = [
  { base: "bg-blue-600", light: "bg-blue-100", textLight: "text-blue-100", border: "border-blue-100" },
  { base: "bg-green-600", light: "bg-green-100", textLight: "text-green-100", border: "border-green-100" },
  { base: "bg-red-600", light: "bg-red-100", textLight: "text-red-100", border: "border-red-100" },
  { base: "bg-yellow-600", light: "bg-yellow-100", textLight: "text-yellow-100", border: "border-yellow-100" },
  { base: "bg-purple-600", light: "bg-purple-100", textLight: "text-purple-100", border: "border-purple-100" },
  { base: "bg-pink-600", light: "bg-pink-100", textLight: "text-pink-100", border: "border-pink-100" },
  { base: "bg-emerald-600", light: "bg-emerald-100", textLight: "text-emerald-100", border: "border-emerald-100" },
  { base: "bg-indigo-600", light: "bg-indigo-100", textLight: "text-indigo-100", border: "border-indigo-100" },
  { base: "bg-cyan-600", light: "bg-cyan-100", textLight: "text-cyan-100", border: "border-cyan-100" },
  { base: "bg-orange-600", light: "bg-orange-100", textLight: "text-orange-100", border: "border-orange-100" },
  { base: "bg-rose-600", light: "bg-rose-100", textLight: "text-rose-100", border: "border-rose-100" },
  { base: "bg-slate-600", light: "bg-slate-100", textLight: "text-slate-100", border: "border-slate-100" },
];

// Tüm Tailwind class'larını önceden tanımla (Tailwind'in purge etmemesi için)
const ALL_AVATAR_CLASSES = [
  // Blue
  'bg-blue-600 bg-blue-100 text-blue-100 border-blue-100',
  // Green
  'bg-green-600 bg-green-100 text-green-100 border-green-100',
  // Red
  'bg-red-600 bg-red-100 text-red-100 border-red-100',
  // Yellow
  'bg-yellow-600 bg-yellow-100 text-yellow-100 border-yellow-100',
  // Purple
  'bg-purple-600 bg-purple-100 text-purple-100 border-purple-100',
  // Pink
  'bg-pink-600 bg-pink-100 text-pink-100 border-pink-100',
  // Emerald
  'bg-emerald-600 bg-emerald-100 text-emerald-100 border-emerald-100',
  // Indigo
  'bg-indigo-600 bg-indigo-100 text-indigo-100 border-indigo-100',
  // Cyan
  'bg-cyan-600 bg-cyan-100 text-cyan-100 border-cyan-100',
  // Orange
  'bg-orange-600 bg-orange-100 text-orange-100 border-orange-100',
  // Rose
  'bg-rose-600 bg-rose-100 text-rose-100 border-rose-100',
  // Slate
  'bg-slate-600 bg-slate-100 text-slate-100 border-slate-100',
];

const getRandomColor = (index) => TAILWIND_COLORS[index % TAILWIND_COLORS.length];

const UserTable = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then(data => {
        setAllUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = allUsers.slice(startIndex, endIndex);

  // Pagination fonksiyonları
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Sayfa numaralarını hesapla
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Kullanıcılar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Toplam {allUsers.length} kullanıcı • Sayfa {currentPage} / {totalPages}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {startIndex + 1}-{Math.min(endIndex, allUsers.length)} arası gösteriliyor
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user, idx) => {
              // Global index kullan (pagination için)
              const globalIndex = startIndex + idx;
              const { base, textLight, border ,light} = getRandomColor(globalIndex);
              
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span 
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 ${base} ${border}`}
                      >
                        <CircleUserRound 
                          size={20} 
                          className={`${textLight} `}
                        />
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.username}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Önceki
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <span key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-gray-400">
                      <MoreHorizontal size={16} />
                    </span>
                  ) : (
                    <button
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </span>
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sonraki
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      
      {allUsers.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <CircleUserRound size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Kullanıcı bulunamadı</p>
          <p className="text-sm">Henüz hiç kullanıcı eklenmemiş.</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;