// src/app/[locale]/admin/page.tsx
// Mock Admin Dashboard home page

'use client';

import React from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Users, BarChart, Settings, ShoppingBag, ShieldCheck, Activity } from 'lucide-react';

export default function AdminPage(): React.JSX.Element {

  const stats = [
    { label: 'Ümumi İstifadəçilər', value: '1,240', change: '+12%', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
    { label: 'Ümumi Satışlar', value: '₼14,250.00', change: '+24%', icon: BarChart, color: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
    { label: 'Aktiv Satıcılar', value: '48', change: '+8%', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
    { label: 'Sifarişlər', value: '312', change: '+18%', icon: ShoppingBag, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'İdarə Paneli' }]} />
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-slate-900 dark:text-white mt-1">
          Sistem İdarə Paneli
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          ShopFlow platformasının ümumi vəziyyəti, göstəriciləri və idarəetmə vasitələri.
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

      {/* Dynamic Content Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Sistem Logları
          </h3>
          <div className="space-y-3">
            {[
              { time: '10:42', type: 'INFO', msg: 'Yeni satıcı "Ali Electronics" qeydiyyatdan keçdi.' },
              { time: '09:15', type: 'SUCCESS', msg: 'Stripe webhook ödənişi uğurla təsdiqlədi (Sifariş #1042).' },
              { time: '08:00', type: 'WARNING', msg: 'E-poçt göndərmə limitinin 80%-i istifadə olunub.' },
            ].map((log, idx) => (
              <div key={idx} className="flex gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-semibold">
                <span className="text-slate-400 font-bold">{log.time}</span>
                <span className={[
                  'px-1.5 py-0.5 rounded text-[10px] font-bold',
                  log.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                  log.type === 'WARNING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                ].join(' ')}>{log.type}</span>
                <span className="text-slate-650 dark:text-slate-400 font-medium">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-500" />
            Sürətli Ayarlar
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left rounded-xl p-3 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors text-sm font-semibold">
              Platformanı Baxım Rejiminə Al
            </button>
            <button className="w-full text-left rounded-xl p-3 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors text-sm font-semibold">
              Köməkçi Cache-i Təmizlə
            </button>
            <button className="w-full text-left rounded-xl p-3 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors text-sm font-semibold">
              Sistem Analitikasını Eksport Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
