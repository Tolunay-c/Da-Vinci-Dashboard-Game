import { useEffect, useMemo, useState } from "react";
import { addUser, updateUser, deleteUser, getUsers } from "../api";
import { CircleUserRound, Save, Trash2, Plus } from "lucide-react";

// User type
interface User {
  id?: number;
  name: string;
  username: string;
  email: string;
  gender?: 'male' | 'female';
}

// Props tipi
interface Props {
  userId?: number | null;
  onSaved?: (user: User) => void;
  onDeleted?: (id: number) => void;
}

const initialUser: User = {
  name: "",
  username: "",
  email: "",
  gender: undefined,
};

const UserAdd = ({ userId, onSaved, onDeleted }: Props) => {
  const isEdit = useMemo(() => !!userId, [userId]);
  const [user, setUser] = useState<User>(initialUser);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Tüm kullanıcıları getir (validation için)
  const fetchUsersList = () => {
    getUsers()
      .then(setAllUsers)
      .catch(() => {
        setError("Kullanıcılar yüklenirken hata oluştu");
      });
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  // userId varsa kullanıcıyı getir
  useEffect(() => {
    if (!userId) {
      setUser(initialUser);
      return;
    }
    setFetching(true);
    getUsers()
      .then(users => {
        const found = users.find(u => u.id === userId);
        if (found) {
          setUser(found);
          setError(null);
        } else {
          setError("Kullanıcı bulunamadı");
        }
      })
      .catch(() => setError("Kullanıcı getirilemedi"))
      .finally(() => setFetching(false));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ 
      ...prev, 
      [name]: name === 'gender' ? (value === '' ? undefined : value as 'male' | 'female') : value 
    }));
  };

  // Form validasyonu - gender zorunlu değil
  const isFormValid =
    user.name.trim() &&
    user.username.trim() &&
    user.email.trim();

  // Validation: username, email unique olmalı
  const isUniqueUser = (userToCheck: User) => {
    return !allUsers.some(u =>
      (
        isEdit
          ? u.id !== userId
          : true
      ) && (u.username === userToCheck.username || u.email === userToCheck.email)
    );
  };

  const handleSave = async () => {
    if (!isFormValid) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (!isUniqueUser(user)) {
      setError("Kullanıcı adı veya email zaten kullanılıyor");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let saved: User;
      const userData = {
        name: user.name.trim(),
        username: user.username.trim(),
        email: user.email.trim(),
        ...(user.gender && { gender: user.gender })
      };

      if (isEdit && userId) {
        saved = await updateUser(userId, userData);
      } else {
        saved = await addUser(userData);
        // ✅ YENİ KULLANICI EKLENDİĞİNDE LİSTEYİ GÜNCELLE
        setAllUsers(prev => [...prev, saved]);
      }

      // Cache'i güncelle
      const updatedUsers = isEdit 
        ? allUsers.map(u => u.id === userId ? saved : u)
        : [...allUsers, saved];
      
      localStorage.setItem('users-cache', JSON.stringify(updatedUsers));

      onSaved?.(saved);

      // Başarılı kayıt sonrası formu temizle (yeni kayıt modunda)
      if (!isEdit) {
        setUser(initialUser);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Kaydetme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !userId) return;

    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteUser(userId);
      
      // Cache'i güncelle
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
      
      onDeleted?.(userId);
      
      // ✅ SİLME SONRASI LİSTEYİ YENİLE
      fetchUsersList();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Silme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex  flex-col lg:flex-row items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600">
            <CircleUserRound size={20} className="text-blue-100" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? `ID: ${userId}` : "Formu doldurarak yeni kullanıcı ekleyin"}
            </p>
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Kullanıcı Adı <span className="text-red-500">*</span>
            </label>
            <input
              name="username"
              value={user.username}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="kullanici.ad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={user.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="mail@ornek.com"
              required
            />
          </div>

          {/* Gender Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Cinsiyet
            </label>
            <select
              name="gender"
              value={user.gender || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Seçiniz</option>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="px-6 pb-2">
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        </div>
      )}

      <div className="p-6 border-t border-gray-200 flex items-center gap-3 justify-end">
        {!isEdit && (
          <button
            onClick={() => setUser(initialUser)}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Temizle
          </button>
        )}

        {isEdit ? (
          <>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={16} /> Sil
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !isFormValid}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={16} /> {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading || !isFormValid}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Plus size={16} /> {loading ? "Ekleniyor..." : "Ekle"}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserAdd;
