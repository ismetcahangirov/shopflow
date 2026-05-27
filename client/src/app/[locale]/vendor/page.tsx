// src/app/[locale]/vendor/page.tsx
// Mock Vendor Dashboard home page

'use client';

import React from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ShoppingBag, TrendingUp, DollarSign, Package, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VendorPage(): React.JSX.Element {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Mağaza Balansı', value: '₼2,410.50', change: '+15%', icon: DollarSign, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
    { label: 'Sifarişlər', value: '38', change: '+22%', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
    { label: 'Məhsul sayı', value: '14', change: '0', icon: Package, color: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
    { label: 'Ziyarətçilər', value: '1,420', change: '+32%', icon: TrendingUp, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Satıcı', href: '/vendor' }, { label: 'İdarə Paneli' }]} />
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-slate-900 dark:text-white mt-1">
          Mağaza İdarə Paneli
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {user?.storeName || 'Mağazanızın'} satışları, məhsulları və müştəri interaksiyaları haqqında ətraflı məlumat.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-450 px-2 py-0.5 rounded-lg">
                {stat.change}
              </span>
            </div>
            <div className={['p-4 rounded-2xl', stat.color].join(' ')}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Action required warnings / Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Təcili Cavab Gözləyən Sifarişlər
          </h3>
          <div className="space-y-3">
            {[
              { id: '1084', customer: 'Vüsal Məmmədov', total: '₼89.99', status: 'Kuryer Gözləyir' },
              { id: '1082', customer: 'Leyla Əliyeva', total: '₼199.99', status: 'Paketlənməkdədir' },
            ].map((ord, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-semibold gap-2 border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-3">
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">#{ord.id}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{ord.customer}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span className="text-slate-900 dark:text-white font-extrabold">{ord.total}</span>
                  <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-bold">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
            Həftəlik Satıcı Tövsiyəsi
          </h3>
          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            <p>
              Mağazanızı daha çox müştəriyə göstərmək üçün məhsul təsvirlərini tam doldurun və aydın, yüksək keyfiyyətli fotoşəkillərdən istifadə edin.
            </p>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              Bütün tövsiyələri oxu →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
