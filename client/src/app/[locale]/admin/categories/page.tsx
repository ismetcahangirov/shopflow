// src/app/[locale]/admin/categories/page.tsx
// Category CRUD management migrated to the shared DataTable + shadcn Dialog/
// Select/Switch + Sonner toasts. Preserves the hierarchical tree indentation,
// image upload, SEO meta section and parent-cycle protection.

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  FolderOpen,
  CheckCircle,
  XCircle,
  Folder,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DataTable,
  DataTableFilterSelect,
} from '@/components/admin/data-table';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { parseApiError } from '@/lib/api';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} from '@/hooks/useCategories';
import type { Category } from '@/types';

const slugify = (text: string) => {
  const a = 'àáäâãåăæçèéëêéíïîìñóöôõøœùúüûñç·/_,:;';
  const b = 'aaaaaaaaceeeeeeiiiinooooooouuuunc------';
  const p = new RegExp(a.split('').join('|'), 'g');
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, (c) => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

type FlatCategory = Category & { level: number };

export default function AdminCategoriesPage(): React.JSX.Element {
  const t = useTranslations('admin_categories');
  const tc = useTranslations('common');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSeoSettings, setShowSeoSettings] = useState(false);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formImage, setFormImage] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const { data: categories, isLoading, error } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const uploadMutation = useUploadCategoryImageMutation();

  const handleOpenCreateModal = useCallback(() => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormParentId('');
    setFormImage('');
    setFormMetaTitle('');
    setFormMetaDesc('');
    setFormIsActive(true);
    setShowSeoSettings(false);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormParentId(cat.parentId || '');
    setFormImage(cat.image || '');
    setFormMetaTitle(cat.metaTitle || '');
    setFormMetaDesc(cat.metaDesc || '');
    setFormIsActive(cat.isActive !== false);
    setShowSeoSettings(!!(cat.metaTitle || cat.metaDesc));
    setIsFormModalOpen(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!editingCategory) setFormSlug(slugify(val));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMutation.mutateAsync(file);
      setFormImage(url);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const payload = {
      name: formName,
      slug: formSlug.trim() || slugify(formName),
      description: formDescription.trim() || null,
      parentId: formParentId.trim() || null,
      image: formImage.trim() || null,
      metaTitle: formMetaTitle.trim() || null,
      metaDesc: formMetaDesc.trim() || null,
      isActive: formIsActive,
    };
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, payload });
        toast.success(t('update_success'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('create_success'));
      }
      setIsFormModalOpen(false);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('delete_success'));
      setDeletingId(null);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  }, [deletingId, deleteMutation, t]);

  const flattenedCategories = useMemo<FlatCategory[]>(() => {
    if (!categories) return [];
    const flattened: FlatCategory[] = [];
    const traverse = (list: Category[], level = 0) => {
      list.forEach((item) => {
        flattened.push({ ...item, level });
        if (item.children && item.children.length > 0) traverse(item.children, level + 1);
      });
    };
    traverse(categories.filter((c) => c.parentId === null || c.parentId === undefined));
    return flattened;
  }, [categories]);

  const parentCandidates = useMemo<FlatCategory[]>(() => {
    if (!categories) return [];
    if (!editingCategory) return flattenedCategories;
    const excludedIds = new Set<string>([editingCategory.id]);
    const markChildren = (cat: Category) => {
      cat.children?.forEach((c) => {
        excludedIds.add(c.id);
        markChildren(c);
      });
    };
    const findAndMark = (list: Category[]) => {
      for (const item of list) {
        if (item.id === editingCategory.id) {
          markChildren(item);
          break;
        }
        if (item.children) findAndMark(item.children);
      }
    };
    findAndMark(categories);
    return flattenedCategories.filter((c) => !excludedIds.has(c.id));
  }, [categories, editingCategory, flattenedCategories]);

  const filteredFlattened = useMemo(
    () =>
      flattenedCategories.filter((cat) => {
        const matchesSearch =
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && cat.isActive !== false) ||
          (statusFilter === 'inactive' && cat.isActive === false);
        return matchesSearch && matchesStatus;
      }),
    [flattenedCategories, searchTerm, statusFilter],
  );

  const columns = useMemo<ColumnDef<FlatCategory>[]>(
    () => [
      {
        id: 'image',
        enableSorting: false,
        enableHiding: false,
        meta: { title: t('image') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('image')}
          </span>
        ),
        cell: ({ row }) =>
          row.original.image ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border">
              <Image
                src={row.original.image}
                alt={row.original.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Folder className="h-5 w-5" />
            </div>
          ),
      },
      {
        accessorKey: 'name',
        enableSorting: false,
        meta: { title: t('name') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('name')}
          </span>
        ),
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center">
              {cat.level > 0 && (
                <span
                  className="mr-2 select-none font-medium text-muted-foreground"
                  style={{ paddingLeft: `${(cat.level - 1) * 1.5}rem` }}
                >
                  └─
                </span>
              )}
              <span
                className={[
                  'tracking-tight text-foreground',
                  cat.level === 0 ? 'text-base font-bold' : 'text-sm font-medium',
                ].join(' ')}
              >
                {cat.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'slug',
        enableSorting: false,
        meta: { title: t('slug') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('slug')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground">{row.original.slug}</span>
        ),
      },
      {
        accessorKey: 'isActive',
        enableSorting: false,
        meta: { title: t('status'), className: 'text-center', headerClassName: 'text-center' },
        header: () => (
          <span className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('status')}
          </span>
        ),
        cell: ({ row }) =>
          row.original.isActive !== false ? (
            <Badge variant="success" className="inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {t('active')}
            </Badge>
          ) : (
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {t('inactive')}
            </Badge>
          ),
      },
      {
        id: 'products',
        enableSorting: false,
        meta: { title: t('products'), className: 'text-center', headerClassName: 'text-center' },
        header: () => (
          <span className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('products')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-bold text-foreground">
            {row.original._count?.products ?? 0}
          </span>
        ),
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
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('actions')}
                    className="ml-auto"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleOpenEditModal(cat)}>
                  <Edit2 className="h-4 w-4" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeletingId(cat.id)}>
                  <Trash2 className="h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, handleOpenEditModal],
  );

  const isFormPending =
    createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: t('title') }]} />
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button onClick={handleOpenCreateModal} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              {t('new_category')}
            </Button>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredFlattened}
        isLoading={isLoading}
        isError={!!error}
        emptyIcon={<FolderOpen className="h-7 w-7" />}
        emptyTitle={t('no_categories')}
        emptyDescription={t('no_categories_desc')}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('search_placeholder')}
        filters={
          <DataTableFilterSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}
            ariaLabel={t('status_filter')}
            placeholder={t('status_filter')}
            options={[
              { value: 'all', label: t('all') },
              { value: 'active', label: t('active') },
              { value: 'inactive', label: t('inactive') },
            ]}
          />
        }
      />

      {/* Create / Edit Dialog */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? t('edit_title') : t('create_title')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoryName">{t('form_name')}</Label>
              <Input
                id="categoryName"
                value={formName}
                onChange={handleNameChange}
                placeholder={t('form_name_placeholder')}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categorySlug">{t('form_slug')}</Label>
              <Input
                id="categorySlug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="geyim-telefonlar"
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryParent">{t('form_parent')}</Label>
              <Select
                value={formParentId || 'none'}
                onValueChange={(v) => setFormParentId(v === 'none' ? '' : ((v as string) ?? ''))}
                items={{
                  none: t('no_parent'),
                  ...Object.fromEntries(parentCandidates.map((c) => [c.id, c.name])),
                }}
              >
                <SelectTrigger id="categoryParent" className="w-full rounded-xl">
                  <SelectValue placeholder={t('no_parent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('no_parent')}</SelectItem>
                  {parentCandidates.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.level > 0 ? `${'  '.repeat(cat.level)}└─ ` : ''}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryDescription">{t('form_description')}</Label>
              <Textarea
                id="categoryDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t('form_description_placeholder')}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>{t('form_image')}</Label>
              <div className="flex items-center gap-4">
                {formImage ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border shadow-sm">
                    <Image src={formImage} alt="Preview" fill sizes="80px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="absolute right-1 top-1 rounded-full bg-black/75 p-1 text-white transition-colors hover:bg-black/90"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">
                      {t('no_image')}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <label className="relative flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-all duration-200 hover:border-indigo-400 hover:bg-muted">
                    <div className="flex flex-col items-center justify-center py-3">
                      {uploadMutation.isPending ? (
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      ) : (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      )}
                      <p className="mt-1.5 text-xs font-bold text-muted-foreground">
                        {uploadMutation.isPending ? t('uploading') : t('upload_image')}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadMutation.isPending}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SEO section */}
            <div className="overflow-hidden rounded-xl border border-border bg-muted/50">
              <button
                type="button"
                onClick={() => setShowSeoSettings(!showSeoSettings)}
                className="flex w-full items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted focus:outline-none"
              >
                <span>{t('seo_settings')}</span>
                <ChevronDown
                  className={['h-4 w-4 transition-transform duration-250', showSeoSettings ? 'rotate-180' : ''].join(' ')}
                />
              </button>
              {showSeoSettings && (
                <div className="animate-in fade-in space-y-4 border-t border-border p-4 duration-200">
                  <div className="space-y-1.5">
                    <Label htmlFor="metaTitle">{t('meta_title')}</Label>
                    <Input
                      id="metaTitle"
                      value={formMetaTitle}
                      onChange={(e) => setFormMetaTitle(e.target.value)}
                      placeholder={t('meta_title_placeholder')}
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="metaDesc">{t('meta_desc')}</Label>
                    <Textarea
                      id="metaDesc"
                      value={formMetaDesc}
                      onChange={(e) => setFormMetaDesc(e.target.value)}
                      placeholder={t('meta_desc_placeholder')}
                      rows={2}
                      className="resize-none text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="formIsActive"
                checked={formIsActive}
                onCheckedChange={(checked) => setFormIsActive(checked)}
              />
              <Label htmlFor="formIsActive" className="cursor-pointer select-none">
                {t('form_is_active')}
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    {tc('cancel')}
                  </Button>
                }
              />
              <Button type="submit" disabled={isFormPending || !formName.trim()}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCategory ? t('save_changes') : t('create_btn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title={t('delete_title')}
        description={t('delete_confirm')}
        confirmLabel={t('delete')}
        cancelLabel={tc('cancel')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
