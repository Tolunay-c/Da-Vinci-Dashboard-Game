import React, { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { getUsers } from '../api';
import { PieChart, BarChart3 } from 'lucide-react';
import 'chart.js/auto';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

interface GenderStats {
  male: number;
  female: number;
  total: number;
}

const GenderChart = () => {
  const [genderStats, setGenderStats] = useState<GenderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'doughnut' | 'bar'>('pie');

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then((users: User[]) => {
        const maleCount = users.filter(user => user.gender === 'male').length;
        const femaleCount = users.filter(user => user.gender === 'female').length;
        
        setGenderStats({
          male: maleCount,
          female: femaleCount,
          total: users.length
        });
        setError(null);
      })
      .catch(() => {
        setError('Cinsiyet verileri yüklenirken hata oluştu');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-red-600">{error}</p>
          <p className="text-sm">Grafik verileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  if (!genderStats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Veri Bulunamadı</p>
          <p className="text-sm">Henüz cinsiyet verileri mevcut değil</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: ['👨 Erkek', '👩 Kadın'],
    datasets: [
      {
        label: 'Kullanıcı Sayısı',
        data: [genderStats.male, genderStats.female],
        backgroundColor: [
          '#3B82F6', // Blue for male
          '#EC4899', // Pink for female
        ],
        borderColor: [
          '#1D4ED8',
          '#BE185D',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#2563EB',
          '#DB2777',
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Kullanıcıların Cinsiyet Dağılımı',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = genderStats.male + genderStats.female;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} kişi (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    ...options,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const malePercentage = ((genderStats.male / genderStats.total) * 100).toFixed(1);
  const femalePercentage = ((genderStats.female / genderStats.total) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-600">
              <PieChart size={20} className="text-purple-100" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cinsiyet İstatistikleri</h2>
              <p className="text-sm text-gray-500">Toplam {genderStats.total} kullanıcı</p>
            </div>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-xs rounded ${
                chartType === 'pie'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pie
            </button>
            <button
              onClick={() => setChartType('doughnut')}
              className={`px-3 py-1 text-xs rounded ${
                chartType === 'doughnut'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Donut
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs rounded ${
                chartType === 'bar'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-200">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{genderStats.male}</div>
          <div className="text-sm text-gray-600">👨 Erkek ({malePercentage}%)</div>
        </div>
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">{genderStats.female}</div>
          <div className="text-sm text-gray-600">👩 Kadın ({femalePercentage}%)</div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-80">
          <Chart 
            type={chartType} 
            data={data} 
            options={chartType === 'bar' ? barOptions : options} 
          />
        </div>
      </div>
    </div>
  );
};

export default GenderChart;
