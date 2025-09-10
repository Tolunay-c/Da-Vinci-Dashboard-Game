import { useEffect, useState } from 'react';
import { updateUser, deleteUser, getUsers } from '../api';
import { CircleUserRound, Save, Trash2, User } from 'lucide-react';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

interface Props {
  userId: number;
  onUserUpdated: (user: User) => void;
  onUserDeleted: (userId: number) => void;
}

const UserDetail = ({ userId, onUserUpdated, onUserDeleted }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    getUsers()
      .then(users => {
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
          setUser(foundUser);
          setError(null);
        } else {
          setError('Kullanıcı bulunamadı');
        }
      })
      .catch(() => setError('Kullanıcı getirilirken hata oluştu'))
      .finally(() => setFetching(false));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const { name, value } = e.target;
    setUser(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser(user.id, user);
      setUser(updatedUser);
      onUserUpdated(updatedUser);
      
      // localStorage'i de güncelle
      const cached = localStorage.getItem('users-cache');
      if (cached) {
        const users = JSON.parse(cached);
        const updatedUsers = users.map((u: User) => 
          u.id === user.id ? updatedUser : u
        );
        localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Güncelleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(`"${user.name}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    
    setLoading(true);
    setError(null);
    try {
      await deleteUser(user.id);
      onUserDeleted(user.id);
      
      // localStorage'dan da sil
      const cached = localStorage.getItem('users-cache');
      if (cached) {
        const users = JSON.parse(cached);
        const filteredUsers = users.filter((u: User) => u.id !== user.id);
        localStorage.setItem('users-cache', JSON.stringify(filteredUsers));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Silme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-red-600">{error}</p>
          <p className="text-sm">Kullanıcı bilgileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Kullanıcı Seçin</p>
          <p className="text-sm">Detaylarını görmek için soldaki listeden bir kullanıcı seçin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600">
            <CircleUserRound size={24} className="text-blue-100" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Kullanıcı Detayı</h2>
            <p className="text-sm text-gray-500">
              ID: {user.id} • {user.gender === 'male' ? '👨 Erkek' : '👩 Kadın'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ad Soyad"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@ornek.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Kullanıcı Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="kullanici.ad"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 pb-2">
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 flex items-center gap-3 justify-end">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={16} />
          {loading ? 'Siliniyor...' : 'Sil'}
        </button>
        
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {loading ? 'Güncelleniyor...' : 'Güncelle'}
        </button>
      </div>
    </div>
  );
};

export default UserDetail;
