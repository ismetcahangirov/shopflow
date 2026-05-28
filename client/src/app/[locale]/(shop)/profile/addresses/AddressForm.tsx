'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, User, Building, Home, Hash, Mail, Star } from 'lucide-react';

import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Address } from '@/types';
import type { CreateAddressPayload, UpdateAddressPayload } from '@/hooks/useAddresses';

const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'address_full_name_required' })
    .max(100, { message: 'address_full_name_long' }),
  phone: z
    .string()
    .min(1, { message: 'address_phone_required' })
    .max(20),
  city: z
    .string()
    .min(1, { message: 'address_city_required' })
    .max(100),
  district: z
    .string()
    .min(1, { message: 'address_district_required' })
    .max(100),
  street: z
    .string()
    .min(1, { message: 'address_street_required' })
    .max(200),
  building: z.string().max(50).optional().or(z.literal('')),
  apartment: z.string().max(50).optional().or(z.literal('')),
  zip: z.string().max(20).optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAddressPayload | UpdateAddressPayload) => void;
  isPending: boolean;
  address?: Address | null;
}

export default function AddressForm({ isOpen, onClose, onSubmit, isPending, address }: AddressFormProps) {
  const t = useTranslations('addresses');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          fullName: address.fullName,
          phone: address.phone,
          city: address.city,
          district: address.district,
          street: address.street,
          building: address.building ?? '',
          apartment: address.apartment ?? '',
          zip: address.zip ?? '',
          isDefault: address.isDefault,
        }
      : {
          fullName: '',
          phone: '',
          city: '',
          district: '',
          street: '',
          building: '',
          apartment: '',
          zip: '',
          isDefault: false,
        },
  });

  const getError = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    const translated = t(key);
    return translated !== key ? translated : key;
  };

  const handleFormSubmit = (data: AddressFormData) => {
    const payload = {
      ...data,
      building: data.building || undefined,
      apartment: data.apartment || undefined,
      zip: data.zip || undefined,
    };

    if (address) {
      onSubmit({ id: address.id, ...payload } as UpdateAddressPayload);
    } else {
      onSubmit(payload as CreateAddressPayload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isPending}
            isLoading={isPending}
          >
            {address ? t('update') : t('add')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {address ? t('edit_address') : t('add_address')}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('address_form_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label={t('full_name')}
              htmlFor="addr-fullName"
              type="text"
              autoComplete="name"
              required
              leadingIcon={<User className="h-4 w-4" />}
              placeholder="Əli Həsənov"
              error={getError(errors.fullName?.message)}
              {...register('fullName')}
            />

            <FormField
              label={t('phone')}
              htmlFor="addr-phone"
              type="tel"
              autoComplete="tel"
              required
              leadingIcon={<Phone className="h-4 w-4" />}
              placeholder="+994 50 123 45 67"
              error={getError(errors.phone?.message)}
              {...register('phone')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label={t('city')}
              htmlFor="addr-city"
              type="text"
              required
              leadingIcon={<Building className="h-4 w-4" />}
              placeholder="Bakı"
              error={getError(errors.city?.message)}
              {...register('city')}
            />

            <FormField
              label={t('district')}
              htmlFor="addr-district"
              type="text"
              required
              leadingIcon={<MapPin className="h-4 w-4" />}
              placeholder="Nəsimi"
              error={getError(errors.district?.message)}
              {...register('district')}
            />
          </div>

          <FormField
            label={t('street')}
            htmlFor="addr-street"
            type="text"
            required
            leadingIcon={<Home className="h-4 w-4" />}
            placeholder="Nizami küçəsi 10"
            error={getError(errors.street?.message)}
            {...register('street')}
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FormField
              label={t('building')}
              htmlFor="addr-building"
              type="text"
              leadingIcon={<Hash className="h-4 w-4" />}
              placeholder="5A"
              error={getError(errors.building?.message)}
              {...register('building')}
            />

            <FormField
              label={t('apartment')}
              htmlFor="addr-apartment"
              type="text"
              leadingIcon={<Hash className="h-4 w-4" />}
              placeholder="12"
              error={getError(errors.apartment?.message)}
              {...register('apartment')}
            />

            <FormField
              label={t('zip')}
              htmlFor="addr-zip"
              type="text"
              leadingIcon={<Mail className="h-4 w-4" />}
              placeholder="AZ1000"
              error={getError(errors.zip?.message)}
              {...register('zip')}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('isDefault')}
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              <Star className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
              {t('set_as_default')}
            </span>
          </label>
        </form>
      </div>
    </Modal>
  );
}
