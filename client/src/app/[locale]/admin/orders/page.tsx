'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Eye,
  User,
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
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableFilterSelect,
} from '@/components/admin/data-table';
import { parseApiError } from '@/lib/api';

import {
  useOrders,
  useOrder,
  useUpdateOrderStatus,
  type OrderListItem,
} from '@/hooks/useOrders';

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

const PAYMENT_VARIANTS: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  UNPAID: 'destructive',
  PAID: 'success',
  REFUNDED: 'secondary',
  PARTIALLY_REFUNDED: 'warning',
};

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const UPDATE_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED'];

export default function AdminOrdersPage(): React.JSX.Element {
  const t = useTranslations('admin_orders');
  const tOrders = useTranslations('orders');
  const tc = useTranslations('common');

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Detail dialog state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Status change form state
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { page, limit };
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [page, search, status, paymentStatus, startDate, endDate]);

  const { data: ordersData, isLoading, isError, refetch } = useOrders(queryParams);
  const { data: orderDetail, isLoading: isDetailLoading } = useOrder(selectedOrderId || '');
  const updateStatusMutation = useUpdateOrderStatus();

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((val: string) => {
    setStatus(val === 'ALL' ? '' : val);
    setPage(1);
  }, []);

  const handlePaymentFilter = useCallback((val: string) => {
    setPaymentStatus(val === 'ALL' ? '' : val);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('');
    setPaymentStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  const handleOpenDetails = useCallback((id: string) => {
    setSelectedOrderId(id);
    setNewStatus('');
    setTrackingNumber('');
    setStatusNote('');
  }, []);

  const getLocalizedStatus = useCallback(
    (statusString: string) => {
      try {
        return tOrders(`status_${statusString.toLowerCase()}`);
      } catch {
        return statusString;
      }
    },
    [tOrders],
  );

  const getPaymentLabel = useCallback(
    (ps: string) => {
      switch (ps) {
        case 'UNPAID':
          return t('payment_unpaid');
        case 'PAID':
          return t('payment_paid');
        case 'REFUNDED':
          return t('payment_refunded');
        case 'PARTIALLY_REFUNDED':
          return t('payment_partially_refunded');
        default:
          return ps;
      }
    },
    [t],
  );

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !newStatus) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrderId,
        status: newStatus,
        trackingNumber: newStatus === 'SHIPPED' ? trackingNumber.trim() : undefined,
        note: statusNote.trim() || undefined,
      });
      toast.success(t('save_success'));
      setNewStatus('');
      setTrackingNumber('');
      setStatusNote('');
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const isFiltered = Boolean(search || status || paymentStatus || startDate || endDate);

  const columns = useMemo<ColumnDef<OrderListItem>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        meta: { title: t('order_number') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('order_number')} />,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-foreground">{row.original.orderNumber}</span>
        ),
      },
      {
        id: 'customer',
        accessorFn: (row) => row.user?.name ?? '',
        meta: { title: t('customer') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('customer')}
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {row.original.user?.name || 'Qonaq'}
            </span>
            <span className="max-w-[180px] truncate text-xs text-muted-foreground">
              {row.original.user?.email || '—'}
            </span>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'createdAt',
        meta: { title: t('date') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('date')} />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString('az-AZ', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        meta: { title: t('total') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('total')} />,
        cell: ({ row }) => (
          <span className="text-sm font-bold text-indigo-650 dark:text-indigo-400">
            {Number(row.original.total).toFixed(2)} AZN
          </span>
        ),
      },
      {
        accessorKey: 'status',
        meta: { title: t('status'), className: 'text-center', headerClassName: 'text-center' },
        header: () => (
          <span className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('status')}
          </span>
        ),
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANTS[row.original.status] || 'default'} showDot>
            {getLocalizedStatus(row.original.status)}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'paymentStatus',
        meta: { title: t('payment_status'), className: 'text-center', headerClassName: 'text-center' },
        header: () => (
          <span className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('payment_status')}
          </span>
        ),
        cell: ({ row }) => (
          <Badge variant={PAYMENT_VARIANTS[row.original.paymentStatus] || 'secondary'}>
            {getPaymentLabel(row.original.paymentStatus)}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: 'text-right', className: 'text-right' },
        header: () => (
          <span className="block text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('actions')}
          </span>
        ),
        cell: ({ row }) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenDetails(row.original.id)}
            className="ml-auto rounded-xl"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            {t('view_details')}
          </Button>
        ),
      },
    ],
    [t, getLocalizedStatus, getPaymentLabel, handleOpenDetails],
  );

  const orders = ordersData?.data ?? [];
  const pagination = ordersData?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: t('title') }]} />
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button variant="outline" onClick={() => refetch()} className="rounded-xl">
              <RefreshCw className="mr-2 h-4 w-4" />
              {tc('refresh')}
            </Button>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyIcon={<ClipboardList className="h-7 w-7" />}
        emptyTitle={t('no_orders')}
        emptyDescription={t('no_orders_desc')}
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('search_placeholder')}
        filters={
          <>
            <DataTableFilterSelect
              value={status || 'ALL'}
              onValueChange={handleStatusFilter}
              ariaLabel={t('status_filter')}
              placeholder={t('status_filter')}
              options={[
                { value: 'ALL', label: t('filter_all_status') },
                ...ALL_STATUSES.map((s) => ({ value: s, label: getLocalizedStatus(s) })),
              ]}
            />
            <DataTableFilterSelect
              value={paymentStatus || 'ALL'}
              onValueChange={handlePaymentFilter}
              ariaLabel={t('payment_filter')}
              placeholder={t('payment_filter')}
              options={[
                { value: 'ALL', label: t('filter_all_payment') },
                ...PAYMENT_STATUSES.map((s) => ({ value: s, label: getPaymentLabel(s) })),
              ]}
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-9 w-[140px] rounded-xl text-xs"
              aria-label={t('start_date')}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-9 w-[140px] rounded-xl text-xs"
              aria-label={t('end_date')}
            />
          </>
        }
        onResetFilters={handleClearFilters}
        isFiltered={isFiltered}
        resetLabel={t('clear_filters')}
        showViewOptions
        viewOptionsLabel={tc('columns')}
        page={page}
        pageCount={pagination?.pages ?? 1}
        total={pagination?.total}
        pageSize={limit}
        onPageChange={setPage}
      />

      {/* Order details + status management Dialog */}
      <Dialog
        open={selectedOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t('details_title')} — #{orderDetail?.orderNumber || ''}
            </DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-16">
              <Spinner className="h-8 w-8 text-indigo-600" />
              <p className="text-sm font-semibold text-muted-foreground">{tOrders('loading')}</p>
            </div>
          ) : !orderDetail ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <span>{tOrders('order_not_found')}</span>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Summary cards */}
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/40 p-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('customer')}
                    </p>
                    <p className="max-w-[180px] truncate text-sm font-bold text-foreground">
                      {orderDetail.user.name}
                    </p>
                    <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {orderDetail.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/40">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('date')}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {new Date(orderDetail.createdAt).toLocaleDateString('az-AZ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(orderDetail.createdAt).toLocaleTimeString('az-AZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('total')}
                    </p>
                    <p className="text-sm font-extrabold text-foreground">
                      {Number(orderDetail.total).toFixed(2)} AZN
                    </p>
                    <div className="mt-0.5 flex gap-2.5">
                      <Badge variant={STATUS_VARIANTS[orderDetail.status] || 'default'} size="sm">
                        {getLocalizedStatus(orderDetail.status)}
                      </Badge>
                      <Badge
                        variant={PAYMENT_VARIANTS[orderDetail.paymentStatus] || 'secondary'}
                        size="sm"
                      >
                        {getPaymentLabel(orderDetail.paymentStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address / summary */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-black uppercase text-foreground">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    {t('shipping_address')}
                  </h4>
                  <div className="space-y-1.5 rounded-2xl border border-border bg-muted/50 p-4 text-sm text-foreground">
                    <p className="font-bold text-foreground">{orderDetail.address.fullName}</p>
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
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-black uppercase text-foreground">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    {t('summary')}
                  </h4>
                  <div className="space-y-2.5 rounded-2xl border border-border bg-muted/50 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('payment_method')}:</span>
                      <span className="font-bold capitalize text-foreground">
                        {orderDetail.paymentMethod === 'stripe'
                          ? 'Kart (Stripe)'
                          : orderDetail.paymentMethod || '—'}
                      </span>
                    </div>
                    {orderDetail.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('tracking_number')}:</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {orderDetail.trackingNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 border-t border-border pt-2">
                      <span className="text-muted-foreground">{t('notes')}:</span>
                      <span className="italic text-foreground">
                        {orderDetail.notes || 'Qeyd yoxdur'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-black uppercase text-foreground">
                  <Truck className="h-4 w-4 text-indigo-500" />
                  {t('items')}
                </h4>
                <div className="overflow-hidden rounded-2xl border border-border">
                  <Table className="rounded-none border-0">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="px-4 py-2.5 text-xs">{t('col_product')}</TableHead>
                        <TableHead className="px-4 py-2.5 text-center text-xs">{t('col_price')}</TableHead>
                        <TableHead className="px-4 py-2.5 text-center text-xs">{t('col_qty')}</TableHead>
                        <TableHead className="px-4 py-2.5 text-right text-xs">{t('col_subtotal')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetail.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                {item.product?.image ? (
                                  <Image
                                    src={item.product.image}
                                    alt={item.productName}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <HelpCircle className="m-2.5 h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <span className="line-clamp-1 text-sm font-semibold text-foreground">
                                  {item.productName}
                                </span>
                                <span className="block font-mono text-[10px] tracking-tight text-muted-foreground">
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
                          <TableCell className="px-4 py-3 text-right text-sm font-bold text-foreground">
                            {Number(item.total).toFixed(2)} AZN
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="w-full space-y-2.5 rounded-2xl border border-border bg-muted/60 p-4 text-sm sm:w-80">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('subtotal')}:</span>
                      <span className="font-bold text-foreground">
                        {Number(orderDetail.subtotal).toFixed(2)} AZN
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('shipping')}:</span>
                      <span className="font-bold text-foreground">
                        {Number(orderDetail.shippingCost) === 0
                          ? 'Pulsuz'
                          : `${Number(orderDetail.shippingCost).toFixed(2)} AZN`}
                      </span>
                    </div>
                    {Number(orderDetail.discount) > 0 && (
                      <div className="flex justify-between text-emerald-650 dark:text-emerald-400">
                        <span>{t('discount')}:</span>
                        <span className="font-bold">
                          −{Number(orderDetail.discount).toFixed(2)} AZN
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-2.5 text-base font-extrabold text-foreground">
                      <span>{t('total')}:</span>
                      <span className="text-indigo-650 dark:text-indigo-400">
                        {Number(orderDetail.total).toFixed(2)} AZN
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* History / status update */}
              <div className="grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-black uppercase text-foreground">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    {t('history')}
                  </h4>
                  <div className="relative ml-2 space-y-5 border-l-2 border-border pl-6 pt-1">
                    {orderDetail.statusHistory.map((hist, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-white dark:border-border">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-card" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {getLocalizedStatus(hist.status)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(hist.createdAt).toLocaleString('az-AZ', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {hist.note && (
                            <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                              {hist.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border bg-muted/50 p-5">
                  <h4 className="flex items-center gap-2 text-sm font-black uppercase text-foreground">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    {t('update_status')}
                  </h4>

                  <form onSubmit={handleStatusSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="update-status-select">{t('status')}</Label>
                      <Select
                        value={newStatus}
                        onValueChange={(v) => setNewStatus((v as string) ?? '')}
                        items={Object.fromEntries(
                          UPDATE_STATUSES.map((s) => [s, getLocalizedStatus(s)]),
                        )}
                      >
                        <SelectTrigger
                          id="update-status-select"
                          aria-label={t('status')}
                          className="h-10 w-full rounded-xl"
                        >
                          <SelectValue placeholder={t('select_status')} />
                        </SelectTrigger>
                        <SelectContent>
                          {UPDATE_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {getLocalizedStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newStatus === 'SHIPPED' && (
                      <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5 duration-250">
                        <Label htmlFor="tracking-input">{t('tracking_number')}</Label>
                        <Input
                          id="tracking-input"
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Məs. AZ123456789"
                          required
                          className="h-10 rounded-xl text-xs"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="note-textarea">{t('note')}</Label>
                      <Textarea
                        id="note-textarea"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder={t('note_placeholder')}
                        rows={3}
                        className="resize-none text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={updateStatusMutation.isPending || !newStatus}
                      className="h-10 w-full rounded-xl text-xs"
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
