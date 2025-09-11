import { useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // İlk önce localStorage'den cache'i yükle
    const cached = localStorage.getItem('users-cache');
    if (cached) {
      try {
        const parsedUsers = JSON.parse(cached);
        setUsers(parsedUsers);
        setLoading(false);
        console.log('✅ Users cache\'den yüklendi');
      } catch (err) {
        console.error('❌ Cache parse hatası:', err);
        localStorage.removeItem('users-cache'); // Bozuk cache'i temizle
      }
    }
    
    // API'den güncel veriyi al
    fetch('http://localhost:3000/users') // Backend port'una göre ayarla
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setUsers(data);
        localStorage.setItem('users-cache', JSON.stringify(data));
        setError(null);
        console.log('✅ Users API\'den güncellendi');
      })
      .catch(error => {
        console.error('❌ API hatası:', error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // CRUD işlemleri için yardımcı fonksiyonlar
  const addUser = (newUser: Omit<User, 'id'>) => {
    return fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then(res => res.json())
      .then(user => {
        const updatedUsers = [...users, user];
        setUsers(updatedUsers);
        localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
        return user;
      });
  };

  const updateUser = (id: number, userData: Partial<User>) => {
    return fetch(`http://localhost:3000/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(res => res.json())
      .then(updatedUser => {
        const updatedUsers = users.map(user => 
          user.id === id ? updatedUser : user
        );
        setUsers(updatedUsers);
        localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
        return updatedUser;
      });
  };

  const deleteUser = (id: number) => {
    return fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(() => {
        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);
        localStorage.setItem('users-cache', JSON.stringify(updatedUsers));
      });
  };

  return { 
    users, 
    loading, 
    error, 
    addUser, 
    updateUser, 
    deleteUser 
  };
}

export default useUsers;
