// src/components/UserDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { addUser, updateUser, deleteUser } from "../api.ts";
import axios from "axios";
import { CircleUserRound, Save, Trash2, Plus } from "lucide-react";

// Basitleştirilmiş User type - sadece gerekli alanlar
type User = {
  id?: number;
  name: string;
  username: string;
  email: string;
};

type Props = {
  userId?: number | null;
  onSaved?: (user: User) => void;
  onDeleted?: (id: number) => void;
};

const initialUser: User = {
  name: "",
  username: "",
  email: "",
};

const UserDetail = ({ userId, onSaved, onDeleted }: Props) => {
  const isEdit = useMemo(() => !!userId, [userId]);
  const [user, setUser] = useState<User>(initialUser);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // userId varsa kullanıcıyı getir
  useEffect(() => {
    if (!userId) {
      setUser(initialUser);
      return;
    }
    setFetching(true);
    axios
      .get<User>(`http://localhost:3000/users/${userId}`)
      .then((res) => setUser(res.data))
      .catch(() => setError("Kullanıcı getirilemedi"))
      .finally(() => setFetching(false));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Form validasyonu
  const isFormValid = user.name.trim() && user.username.trim() && user.email.trim();

  const handleSave = async () => {
    if (!isFormValid) {
      setError("Lütfen tüm alanları doldurun");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let saved: User;
      if (isEdit && userId) {
        saved = await updateUser(userId, {
          name: user.name.trim(),
          username: user.username.trim(),
          email: user.email.trim(),
        });
      } else {
        saved = await addUser({
          name: user.name.trim(),
          username: user.username.trim(),
          email: user.email.trim(),
        });
      }
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
      onDeleted?.(userId);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Silme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
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

export default UserDetail;
