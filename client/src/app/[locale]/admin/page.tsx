'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ShoppingBag, DollarSign, Package, TrendingUp, ArrowRight } from 'lucide-react';

import { useDashboard } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminPage(): React.JSX.Element {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />;
  }

  const statCards = [
    { label: 'Ümumi Gəlir', value: `${data.summary.totalRevenue.toFixed(2)} AZN`, sub: `Avg: ${data.summary.avgOrderValue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Sifarişlər', value: data.summary.totalOrders.toString(), sub: `son 30 gün`, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Müştərilər', value: data.summary.totalCustomers.toString(), sub: 'CUSTOMER', icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Məhsullar', value: data.summary.totalProducts.toString(), sub: 'aktiv', icon: Package, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground dark:text-foreground">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
              </div>
              <div className={`rounded-xl p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Revenue Chart */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-card p-5 dark:border-border dark:bg-card">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground dark:text-foreground">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Gəlir Qrafiki (son 30 gün)
          </h2>
          <div className="flex items-end gap-1" style={{ height: 120 }}>
            {data.revenueChart.map((d, i) => {
              const max = Math.max(...data.revenueChart.map((r) => r.revenue), 1);
              return (
                <div key={i} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t bg-indigo-500 transition-all hover:bg-indigo-600"
                    style={{ height: `${(d.revenue / max) * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 dark:border-border dark:bg-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-foreground">Sifariş Statusları</h2>
          <div className="flex flex-col gap-2">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[status] ?? 'bg-muted')}>
                  {status}
                </span>
                <span className="font-semibold text-foreground dark:text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-xl border border-border bg-card p-5 dark:border-border dark:bg-card">
        <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-foreground">Ən Çox Satılan Məhsullar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Məhsul</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Satış</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Gəlir</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p) => (
                <tr key={p.id} className="border-b border-border dark:border-border">
                  <td className="px-3 py-2 font-medium text-foreground dark:text-foreground">{p.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.salesCount}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.revenue.toFixed(2)} AZN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card p-5 dark:border-border dark:bg-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground dark:text-foreground">Son Sifarişlər</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Hamısı <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Müştəri</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Məbləğ</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border dark:border-border">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{o.orderNumber}</td>
                  <td className="px-3 py-2 text-muted-foreground">{o.user.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{o.total.toFixed(2)} AZN</td>
                  <td className="px-3 py-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[o.status] ?? 'bg-muted')}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
