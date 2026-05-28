'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, Star, MapPin, Phone, User, BadgeCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  type CreateAddressPayload,
  type UpdateAddressPayload,
} from '@/hooks/useAddresses';
import type { Address } from '@/types';
import AddressForm from './AddressForm';

export default function AddressListClient() {
  const t = useTranslations('addresses');
  const { data: addresses, isLoading, isError, error, refetch } = useAddresses();

  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending;

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = (data: CreateAddressPayload | UpdateAddressPayload) => {
    if ('id' in data) {
      updateMutation.mutate(data, {
        onSuccess: handleCloseForm,
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: handleCloseForm,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />;
  }

  if (!addresses) {
    return <ErrorState message={t('error_loading')} onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('my_addresses')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('addresses_subtitle')}
          </p>
        </div>
        <Button onClick={handleOpenCreate} disabled={isMutating}>
          <Plus className="mr-2 h-4 w-4" />
          {t('add_address')}
        </Button>
      </div>

      {/* Mutation error */}
      {(createMutation.isError || updateMutation.isError || deleteMutation.isError || setDefaultMutation.isError) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {parseApiError(createMutation.error || updateMutation.error || deleteMutation.error || setDefaultMutation.error)}
          </span>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12 text-slate-400" />}
          title={t('no_addresses')}
          description={t('no_addresses_desc')}
          action={<Button onClick={handleOpenCreate}>{t('add_first_address')}</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => handleOpenEdit(address)}
              onDelete={() => setDeletingId(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
              isMutating={isMutating}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AddressForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        address={editingAddress}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title={t('delete_address_title')}
        message={t('delete_address_desc')}
        confirmText={t('delete')}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isMutating: boolean;
  t: (key: string) => string;
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, isMutating, t }: AddressCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-xl border p-5 transition-all',
        address.isDefault
          ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800/50 dark:bg-indigo-900/10'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
      )}
    >
      {/* Default badge */}
      {address.isDefault && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Star className="h-3 w-3 fill-current" />
          {t('default')}
        </div>
      )}

      <div className="flex flex-col gap-2 pr-20">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{address.fullName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">{address.phone}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {[address.street, address.building && `${t('building_short')} ${address.building}`, address.apartment && `${t('apartment_short')} ${address.apartment}`, address.district, address.city, address.zip]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={isMutating}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          {t('edit')}
        </Button>
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSetDefault}
            disabled={isMutating}
          >
            <Star className="mr-1.5 h-3.5 w-3.5" />
            {t('set_default')}
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={isMutating}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}
