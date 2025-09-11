import { useEffect, useState } from "react";
import { CircleUserRound, ChevronLeft, ChevronRight, MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import { getUsers, deleteUser } from "../api";

// User interface
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

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

const getRandomColor = (index: number) => TAILWIND_COLORS[index % TAILWIND_COLORS.length];

const UserDelete = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // İlk önce localStorage'den cache'i yükle
    const cached = localStorage.getItem('users-cache');
    if (cached) {
      try {
        const parsedUsers = JSON.parse(cached);
        setAllUsers(parsedUsers);
        setLoading(false);
        console.log('✅ Users cache\'den yüklendi');
      } catch (err) {
        console.error('❌ Cache parse hatası:', err);
        localStorage.removeItem('users-cache');
      }
    }

    // API'den güncel veriyi al
    getUsers()
      .then((data: User[]) => {
        setAllUsers(data);
        localStorage.setItem('users-cache', JSON.stringify(data));
        console.log('✅ Users API\'den güncellendi');
      })
      .catch(error => {
        console.error('❌ API hatası:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = allUsers.slice(startIndex, endIndex);

  // Checkbox işlemleri
  const toggleUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === currentUsers.length) {
      // Tümü seçili ise hepsini kaldır
      setSelectedUsers(new Set());
    } else {
      // Yoksa hepsini seç
      const allCurrentIds = new Set(currentUsers.map(user => user.id));
      setSelectedUsers(allCurrentIds);
    }
  };

  const isAllSelected = selectedUsers.size === currentUsers.length && currentUsers.length > 0;
  const isIndeterminate = selectedUsers.size > 0 && selectedUsers.size < currentUsers.length;

  // Silme işlemleri
  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) return;
    
    setDeleting(true);
    try {
      // Seçili kullanıcıları tek tek sil
      const deletePromises = Array.from(selectedUsers).map(userId => 
        deleteUser(userId)
      );
      
      await Promise.all(deletePromises);
      
      // State'i güncelle
      const updatedUsers = allUsers.filter(user => !selectedUsers.has(user.id));
      setAllUsers(updatedUsers);
      localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
      
      // Seçimleri temizle
      setSelectedUsers(new Set());
      setShowDeleteConfirm(false);
      
      // Eğer mevcut sayfa boş kaldıysa bir önceki sayfaya git
      const newTotalPages = Math.ceil(updatedUsers.length / usersPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      console.log('✅ Seçili kullanıcılar silindi');
    } catch (error) {
      console.error('❌ Silme hatası:', error);
      alert('Kullanıcılar silinirken bir hata oluştu!');
    } finally {
      setDeleting(false);
    }
  };

  // Pagination fonksiyonları
  const goToPage = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers(new Set()); // Sayfa değişince seçimleri temizle
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectedUsers(new Set());
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedUsers(new Set());
    }
  };

  // Sayfa numaralarını hesapla
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
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
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Kullanıcılar</h2>
              <p className="text-sm text-gray-500 mt-1">
                Toplam {allUsers.length} kullanıcı • Sayfa {currentPage} / {totalPages}
                {selectedUsers.size > 0 && (
                  <span className="text-blue-600 font-medium"> • {selectedUsers.size} seçili</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedUsers.size > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={16} />
                  {selectedUsers.size} Kullanıcıyı Sil
                </button>
              )}
              <div className="text-sm text-gray-500">
                {startIndex + 1}-{Math.min(endIndex, allUsers.length)} arası gösteriliyor
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı Adı
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cinsiyet
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user, idx) => {
                const globalIndex = startIndex + idx;
                const { base, textLight, border } = getRandomColor(globalIndex);
                const isSelected = selectedUsers.has(user.id);
                
                return (
                  <tr key={user.id} className={`transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span 
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 ${base} ${border}`}
                        >
                          <CircleUserRound 
                            size={20} 
                            className={textLight}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.gender === 'male' ? 'Erkek' : 'Kadın'}
                      </div>
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

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-400">
                        <MoreHorizontal size={16} />
                      </span>
                    ) : (
                      <button
                        onClick={() => goToPage(page as number)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kullanıcıları Sil</h3>
                  <p className="text-sm text-gray-500">Bu işlem geri alınamaz</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                <strong>{selectedUsers.size}</strong> kullanıcıyı silmek istediğinizden emin misiniz? 
                Bu işlem geri alınamaz.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDelete;
