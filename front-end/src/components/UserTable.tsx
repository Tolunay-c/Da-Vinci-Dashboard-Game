import { useEffect, useState } from "react";
import { CircleUserRound, ChevronLeft, ChevronRight, MoreHorizontal, Search, Edit3, Trash2, X, AlertTriangle } from "lucide-react";
import { getUsers, deleteUser, updateUser } from "../api";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

interface UserTableProps {
  mode: 'simple' | 'full'; // simple = sadece görüntüleme, full = tüm işlemler
  onUserSelect?: (userId: number) => void;
  onUserDeleted?: () => void;
}

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
];

const getRandomColor = (index: number) => TAILWIND_COLORS[index % TAILWIND_COLORS.length];

const UserTable = ({ mode, onUserSelect, onUserDeleted }: UserTableProps) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isFullMode = mode === 'full';
  const isSimpleMode = mode === 'simple';

  useEffect(() => {
    const cached = localStorage.getItem('users-cache');
    if (cached) {
      try {
        const parsedUsers = JSON.parse(cached);
        setAllUsers(parsedUsers);
        setFilteredUsers(parsedUsers);
        setLoading(false);
        console.log('✅ Users cache\'den yüklendi');
      } catch (err) {
        console.error('❌ Cache parse hatası:', err);
        localStorage.removeItem('users-cache');
      }
    }

    getUsers()
      .then((data: User[]) => {
        setAllUsers(data);
        setFilteredUsers(data);
        localStorage.setItem('users-cache', JSON.stringify(data));
        console.log('✅ Users API\'den güncellendi');
      })
      .catch(error => {
        console.error('❌ API hatası:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
    setCurrentPage(1);
  }, [searchTerm, allUsers]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Checkbox işlemleri (sadece full mode'da)
  const toggleUser = (userId: number) => {
    if (!isFullMode) return;
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (!isFullMode) return;
    if (selectedUsers.size === currentUsers.length) {
      setSelectedUsers(new Set());
    } else {
      const allCurrentIds = new Set(currentUsers.map(user => user.id));
      setSelectedUsers(allCurrentIds);
    }
  };

  const isAllSelected = selectedUsers.size === currentUsers.length && currentUsers.length > 0;
  const isIndeterminate = selectedUsers.size > 0 && selectedUsers.size < currentUsers.length;

  // Toplu silme işlemi
  const handleDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;
    
    setProcessing(true);
    try {
      const deletePromises = Array.from(selectedUsers).map(userId => 
        deleteUser(userId)
      );
      
      await Promise.all(deletePromises);
      
      const updatedUsers = allUsers.filter(user => !selectedUsers.has(user.id));
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
      
      setSelectedUsers(new Set());
      setShowDeleteConfirm(false);
      
      const newTotalPages = Math.ceil(updatedUsers.length / usersPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      alert('Kullanıcılar silinirken bir hata oluştu!');
    } finally {
      setProcessing(false);
      onUserDeleted?.();
    }
  };

  // Tek kullanıcı silme işlemi
  const handleDeleteUser = async (userId: number) => {
    if (!userId) return;
    
    setProcessing(true);
    try {
      await deleteUser(userId);
      
      const updatedUsers = allUsers.filter(user => user.id !== userId);
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
      
      setDeletingUserId(null);
      onUserDeleted?.();
    } catch (error) {
      alert('Kullanıcı silinirken bir hata oluştu!');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const result = await updateUser(updatedUser.id, updatedUser);
      const updatedUsers = allUsers.map(user => 
        user.id === updatedUser.id ? result : user
      );
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
      setEditingUser(null);
    } catch (error) {
      alert('Kullanıcı güncellenirken bir hata oluştu!');
    }
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Kullanıcılar</h2>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? (
                  <>"{searchTerm}" için {filteredUsers.length} sonuç • Toplam {allUsers.length} kullanıcı</>
                ) : (
                  <>Toplam {allUsers.length} kullanıcı</>
                )}
                {filteredUsers.length > 0 && (
                  <> • Sayfa {currentPage} / {totalPages}</>
                )}
                {isFullMode && selectedUsers.size > 0 && (
                  <span className="text-blue-600 font-medium"> • {selectedUsers.size} seçili</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isFullMode && (
                <>
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Kullanıcı ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {selectedUsers.size > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={16} />
                      {selectedUsers.size} Seçiliyi Sil
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {isFullMode && (
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
                )}
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
                {/* İşlemler column - sadece full mode'da */}
                {isFullMode && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user, idx) => {
                const globalIndex = startIndex + idx;
                const { base, textLight, border } = getRandomColor(globalIndex);
                const isSelected = selectedUsers.has(user.id);
                
                return (
                  <tr 
                    key={user.id} 
                    className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => !isFullMode && onUserSelect?.(user.id)}
                  >
                    {isFullMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
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
                    {/* İşlemler - sadece full mode'da */}
                    {isFullMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingUser(user);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingUserId(user.id);
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
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
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Önceki
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sonraki
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
        
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? (
              <>
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Arama sonucu bulunamadı</p>
                <p className="text-sm">"{searchTerm}" için sonuç bulunamadı.</p>
              </>
            ) : (
              <>
                <CircleUserRound size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Kullanıcı bulunamadı</p>
                <p className="text-sm">Henüz hiç kullanıcı eklenmemiş.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Toplu Silme Onay Modal'ı */}
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
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteUsers}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
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

      {/* Tek Kullanıcı Silme Onay Modal'ı */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kullanıcıyı Sil</h3>
                  <p className="text-sm text-gray-500">Bu işlem geri alınamaz</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingUserId(null)}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteUser(deletingUserId)}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
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

export default UserTable;
