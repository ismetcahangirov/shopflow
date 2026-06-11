'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Eye,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  Truck,
  DollarSign,
  MapPin,
  FileText,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  ClipboardList
} from 'lucide-react';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchBar } from '@/components/ui/search-bar';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';

import { useOrders, useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';

// Map order status to Badge variants
const STATUS_VARIANTS: Record<string, 'warning' | 'default' | 'success' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  CONFIRMED: 'default',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
};

// Map payment status to Badge variants
const PAYMENT_VARIANTS: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  UNPAID: 'destructive',
  PAID: 'success',
  REFUNDED: 'secondary',
  PARTIALLY_REFUNDED: 'warning',
};

export default function AdminOrdersPage(): React.JSX.Element {
  const t = useTranslations('admin_orders');
  const tOrders = useTranslations('orders');

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected Order Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status Change State
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusChangeSuccess, setStatusChangeSuccess] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);

  // Fetching paginated orders list
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit,
    };
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [page, search, status, paymentStatus, startDate, endDate]);

  const { data: ordersData, isLoading, isError, refetch } = useOrders(queryParams);

  // Fetch single order details when modal is open
  const { data: orderDetail, isLoading: isDetailLoading } = useOrder(selectedOrderId || '');

  // Mutator for updating status
  const updateStatusMutation = useUpdateOrderStatus();

  // Reset page on filter changes
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setPaymentStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleOpenDetails = (id: string) => {
    setSelectedOrderId(id);
    setIsDetailModalOpen(true);
    setNewStatus('');
    setTrackingNumber('');
    setStatusNote('');
    setStatusChangeSuccess(false);
    setStatusChangeError(null);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !newStatus) return;

    setStatusChangeSuccess(false);
    setStatusChangeError(null);

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrderId,
        status: newStatus,
        trackingNumber: newStatus === 'SHIPPED' ? trackingNumber.trim() : undefined,
        note: statusNote.trim() || undefined,
      });
      setStatusChangeSuccess(true);
      setNewStatus('');
      setTrackingNumber('');
      setStatusNote('');
      setTimeout(() => setStatusChangeSuccess(false), 4000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setStatusChangeError(error.response?.data?.message || error.message || t('error_occurred'));
    }
  };

  // Localized status names helper
  const getLocalizedStatus = (statusString: string) => {
    try {
      return tOrders(`status_${statusString.toLowerCase()}`);
    } catch {
      return statusString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: t('title') }]} />

        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="rounded-xl border-slate-200 dark:border-slate-800"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenilə
            </Button>
          }
        />
      </div>

      {/* Filter Options Panel */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="space-y-1.5 col-span-1 md:col-span-1">
            <Label htmlFor="search-order">{t('search_placeholder')}</Label>
            <SearchBar
              onSearch={(val) => handleFilterChange(setSearch, val)}
              placeholder={t('search_placeholder')}
              initialValue={search}
              className="max-w-none"
            />
          </div>

          {/* Status select dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="status-filter">{t('status_filter')}</Label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">{t('filter_all_status')}</option>
              <option value="PENDING">{getLocalizedStatus('PENDING')}</option>
              <option value="CONFIRMED">{getLocalizedStatus('CONFIRMED')}</option>
              <option value="PROCESSING">{getLocalizedStatus('PROCESSING')}</option>
              <option value="SHIPPED">{getLocalizedStatus('SHIPPED')}</option>
              <option value="DELIVERED">{getLocalizedStatus('DELIVERED')}</option>
              <option value="CANCELLED">{getLocalizedStatus('CANCELLED')}</option>
              <option value="REFUNDED">{getLocalizedStatus('REFUNDED')}</option>
            </select>
          </div>

          {/* Payment status select dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-filter">{t('payment_filter')}</Label>
            <select
              id="payment-filter"
              value={paymentStatus}
              onChange={(e) => handleFilterChange(setPaymentStatus, e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">{t('filter_all_payment')}</option>
              <option value="UNPAID">Ödənilməyib</option>
              <option value="PAID">Ödənilib</option>
              <option value="REFUNDED">Geri qaytarılıb</option>
              <option value="PARTIALLY_REFUNDED">Qismən geri qaytarılıb</option>
            </select>
          </div>
        </div>

        {/* Date Filters & Clear filters */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2 border-t border-slate-50 dark:border-slate-800/40">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tarix:</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                className="h-9 w-36 py-1 px-2.5 text-xs rounded-xl"
                aria-label={t('start_date')}
              />
              <span className="text-xs text-slate-400">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                className="h-9 w-36 py-1 px-2.5 text-xs rounded-xl"
                aria-label={t('end_date')}
              />
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleClearFilters}
            className="h-9 px-4 rounded-xl text-xs font-bold"
          >
            {t('clear_filters')}
          </Button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-500 dark:text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Xəta baş verdi</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Sifarişlər yüklənərkən xəta baş verdi. Yenidən cəhd edin.
            </p>
          </div>
        ) : !ordersData?.data || ordersData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400">
              <ClipboardList className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">{t('no_orders')}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-450 max-w-xs">
              Seçilmiş filtrlərə uyğun heç bir sifariş tapılmadı.
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-4">{t('order_number')}</TableHead>
                    <TableHead className="px-6 py-4">{t('customer')}</TableHead>
                    <TableHead className="px-6 py-4">{t('date')}</TableHead>
                    <TableHead className="px-6 py-4">{t('total')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('status')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('payment_status')}</TableHead>
                    <TableHead className="px-6 py-4 text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.data.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-slate-50/20 dark:hover:bg-slate-950/5">
                      <TableCell className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {order.user?.name || 'Qonaq'}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                            {order.user?.email || '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('az-AZ', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm font-bold text-indigo-650 dark:text-indigo-400">
                        {Number(order.total).toFixed(2)} AZN
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge variant={STATUS_VARIANTS[order.status] || 'default'} showDot>
                          {getLocalizedStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge variant={PAYMENT_VARIANTS[order.paymentStatus] || 'secondary'}>
                          {order.paymentStatus === 'UNPAID' ? 'Ödənilməyib' :
                           order.paymentStatus === 'PAID' ? 'Ödənilib' :
                           order.paymentStatus === 'REFUNDED' ? 'Qaytarılıb' : 'Qismən qaytarılıb'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          onClick={() => handleOpenDetails(order.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-950/20 text-slate-650 hover:text-indigo-600 dark:text-slate-400 transition-colors"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          {t('view_details')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination component */}
            {ordersData.pagination && (
              <div className="border-t border-slate-50 dark:border-slate-800/80 px-4">
                <Pagination
                  currentPage={page}
                  totalPages={ordersData.pagination.pages}
                  onPageChange={setPage}
                  totalEntries={ordersData.pagination.total}
                  pageSize={limit}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details and Status Management Modal Overlay */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`${t('details_title')} — #${orderDetail?.orderNumber || ''}`}
        size="lg"
      >
        {isDetailLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <Spinner className="h-8 w-8 text-indigo-600" />
            <p className="text-sm font-semibold text-slate-500">{tOrders('loading')}</p>
          </div>
        ) : !orderDetail ? (
          <div className="text-center p-8 text-slate-500">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <span>{tOrders('order_not_found')}</span>
          </div>
        ) : (
          <div className="space-y-6 pt-2 pb-4 overflow-y-auto max-h-[80vh] px-1">
            {/* Split layout for general stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">{t('customer')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{orderDetail.user.name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">{orderDetail.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">{t('date')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(orderDetail.createdAt).toLocaleDateString('az-AZ')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(orderDetail.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">{t('total')}</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {Number(orderDetail.total).toFixed(2)} AZN
                  </p>
                  <div className="flex gap-2.5 mt-0.5">
                    <Badge variant={STATUS_VARIANTS[orderDetail.status] || 'default'} size="sm">
                      {getLocalizedStatus(orderDetail.status)}
                    </Badge>
                    <Badge variant={PAYMENT_VARIANTS[orderDetail.paymentStatus] || 'secondary'} size="sm">
                      {orderDetail.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Split layout for Address / Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  {t('shipping_address')}
                </h4>
                <div className="bg-slate-50/50 dark:bg-slate-950/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1.5 text-sm text-slate-700 dark:text-slate-350">
                  <p className="font-bold text-slate-900 dark:text-white">{orderDetail.address.fullName}</p>
                  <p className="font-medium">{orderDetail.address.phone}</p>
                  <p>
                    {orderDetail.address.city}, {orderDetail.address.district}
                  </p>
                  <p>
                    {orderDetail.address.street}
                    {orderDetail.address.building && `, B. ${orderDetail.address.building}`}
                    {orderDetail.address.apartment && `, M. ${orderDetail.address.apartment}`}
                  </p>
                </div>
              </div>

              {/* Payment & Notes */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  {t('summary')}
                </h4>
                <div className="bg-slate-50/50 dark:bg-slate-950/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-450">{t('payment_method')}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {orderDetail.paymentMethod === 'stripe' ? 'Kart (Stripe)' : orderDetail.paymentMethod || '—'}
                    </span>
                  </div>
                  {orderDetail.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-450">{t('tracking_number')}:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {orderDetail.trackingNumber}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 flex-col gap-1">
                    <span className="text-slate-450">{t('notes')}:</span>
                    <span className="text-slate-650 dark:text-slate-400 italic">
                      {orderDetail.notes || 'Qeyd yoxdur'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                <Truck className="h-4 w-4 text-indigo-500" />
                {t('items')}
              </h4>
              <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 dark:bg-slate-950/10">
                      <TableHead className="px-4 py-2.5 text-xs">Məhsul</TableHead>
                      <TableHead className="px-4 py-2.5 text-xs text-center">Qiymət</TableHead>
                      <TableHead className="px-4 py-2.5 text-xs text-center">Say</TableHead>
                      <TableHead className="px-4 py-2.5 text-xs text-right">Cəmi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetail.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-850 shrink-0 bg-slate-50 dark:bg-slate-950">
                              {item.product?.image ? (
                                <Image
                                  src={item.product.image}
                                  alt={item.productName}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <HelpCircle className="h-5 w-5 m-2.5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {item.productName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block tracking-tight">
                                SKU: {item.productSku}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm font-medium">
                          {Number(item.price).toFixed(2)} AZN
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm font-bold">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">
                          {Number(item.total).toFixed(2)} AZN
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Price Calculations */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-80 bg-slate-50/60 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-450">{t('subtotal')}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{Number(orderDetail.subtotal).toFixed(2)} AZN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">{t('shipping')}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {Number(orderDetail.shippingCost) === 0 ? 'Pulsuz' : `${Number(orderDetail.shippingCost).toFixed(2)} AZN`}
                    </span>
                  </div>
                  {Number(orderDetail.discount) > 0 && (
                    <div className="flex justify-between text-emerald-650 dark:text-emerald-400">
                      <span>{t('discount')}:</span>
                      <span className="font-bold">−{Number(orderDetail.discount).toFixed(2)} AZN</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-base font-extrabold text-slate-900 dark:text-white">
                    <span>{t('total')}:</span>
                    <span className="text-indigo-650 dark:text-indigo-400">{Number(orderDetail.total).toFixed(2)} AZN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split layout for Status History / Status Changer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              {/* Status Timeline History */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  {t('history')}
                </h4>
                <div className="relative pl-6 space-y-5 border-l-2 border-slate-100 dark:border-slate-800/60 ml-2 pt-1">
                  {orderDetail.statusHistory.map((hist, idx) => (
                    <div key={idx} className="relative">
                      {/* Circle indicator */}
                      <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {getLocalizedStatus(hist.status)}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-550">
                            {new Date(hist.createdAt).toLocaleString('az-AZ', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {hist.note && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic leading-relaxed">
                            {hist.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Form */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  {t('update_status')}
                </h4>

                {statusChangeSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-250 bg-emerald-50 dark:border-emerald-950 dark:bg-emerald-950/15 text-xs text-emerald-800 dark:text-emerald-450 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{t('save_success')}</span>
                  </div>
                )}

                {statusChangeError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-red-250 bg-red-50 dark:border-red-950 dark:bg-red-950/15 text-xs text-red-800 dark:text-red-450 animate-in fade-in duration-200">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{statusChangeError}</span>
                  </div>
                )}

                <form onSubmit={handleStatusSubmit} className="space-y-4">
                  {/* Select status input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="update-status-select">{t('status')}</Label>
                    <select
                      id="update-status-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="">-- Status Seçin --</option>
                      <option value="CONFIRMED">{getLocalizedStatus('CONFIRMED')}</option>
                      <option value="PROCESSING">{getLocalizedStatus('PROCESSING')}</option>
                      <option value="SHIPPED">{getLocalizedStatus('SHIPPED')}</option>
                      <option value="DELIVERED">{getLocalizedStatus('DELIVERED')}</option>
                      <option value="CANCELLED">{getLocalizedStatus('CANCELLED')}</option>
                    </select>
                  </div>

                  {/* Tracking number input (SHIPPED status only) */}
                  {newStatus === 'SHIPPED' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-250">
                      <Label htmlFor="tracking-input">{t('tracking_number')}</Label>
                      <Input
                        id="tracking-input"
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Məs. AZ123456789"
                        required
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                  )}

                  {/* Note textarea input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="note-textarea">{t('note')}</Label>
                    <textarea
                      id="note-textarea"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder={t('note_placeholder')}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updateStatusMutation.isPending || !newStatus}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 h-10 transition-all duration-200"
                  >
                    {updateStatusMutation.isPending && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    {t('update_status')}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
