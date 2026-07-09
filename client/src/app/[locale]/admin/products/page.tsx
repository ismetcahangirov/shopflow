// src/app/[locale]/admin/products/page.tsx
// Product CRUD management migrated to the shared DataTable + shadcn Dialog with
// Tabs (basic/pricing/images/attributes/seo), Select/Switch inputs and Sonner
// toasts. Preserves debounced search, filters, image upload queue, attribute/
// tag editors and low-stock warnings.

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Image as ImageIcon,
  Loader2,
  Tag,
  DollarSign,
  Layers,
  Globe,
  Star,
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
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DataTableColumnHeader,
  DataTableFilterSelect,
} from '@/components/admin/data-table';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { parseApiError } from '@/lib/api';
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductImageMutation,
  useDeleteProductImageMutation,
} from '@/hooks/useProducts';
import { useCategoriesQuery } from '@/hooks/useCategories';
import type { Product, Category, ProductAttribute } from '@/types';

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

export default function AdminProductsPage(): React.JSX.Element {
  const t = useTranslations('admin_products');
  const tCommon = useTranslations('common');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 405);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Dialog state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'images' | 'attributes' | 'seo'>('basic');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formWeight, setFormWeight] = useState<number | ''>('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formComparePrice, setFormComparePrice] = useState<number | ''>('');
  const [formCostPrice, setFormCostPrice] = useState<number | ''>('');
  const [formStock, setFormStock] = useState<number | ''>('');
  const [formLowStockAlert, setFormLowStockAlert] = useState<number>(5);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formAttributes, setFormAttributes] = useState<Array<{ name: string; value: string }>>([]);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [imagesQueue, setImagesQueue] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const { data: categoriesData } = useCategoriesQuery();

  const productQueryParams: Record<string, unknown> = { page, limit, sort: 'newest' };
  if (debouncedSearch) productQueryParams.search = debouncedSearch;
  if (categoryFilter) productQueryParams.categoryId = categoryFilter;
  if (statusFilter !== 'all') productQueryParams.isActive = statusFilter === 'active' ? 'true' : 'false';
  if (stockFilter !== 'all') productQueryParams.inStock = stockFilter === 'instock' ? 'true' : 'false';

  const { data: productsData, isLoading, error, refetch } = useProductsQuery(productQueryParams);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const addImageMutation = useAddProductImageMutation();
  const deleteImageMutation = useDeleteProductImageMutation();

  const flattenedCategories = useMemo<FlatCategory[]>(() => {
    if (!categoriesData) return [];
    const flattened: FlatCategory[] = [];
    const traverse = (list: Category[], level = 0) => {
      list.forEach((item) => {
        flattened.push({ ...item, level });
        if (item.children && item.children.length > 0) traverse(item.children, level + 1);
      });
    };
    traverse(categoriesData.filter((c) => c.parentId === null || c.parentId === undefined));
    return flattened;
  }, [categoriesData]);

  const handleOpenCreateModal = useCallback(() => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormShortDesc('');
    setFormCategoryId('');
    setFormBrand('');
    setFormSku('');
    setFormBarcode('');
    setFormWeight('');
    setFormPrice('');
    setFormComparePrice('');
    setFormCostPrice('');
    setFormStock('');
    setFormLowStockAlert(5);
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormAttributes([]);
    setFormTags([]);
    setTagInput('');
    setFormMetaTitle('');
    setFormMetaDesc('');
    setImagesQueue([]);
    setIsUploadingImages(false);
    setActiveTab('basic');
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormDescription(product.description);
    setFormShortDesc(product.shortDesc || '');
    setFormCategoryId(product.categoryId);
    setFormBrand(product.brand || '');
    setFormSku(product.sku);
    setFormBarcode(product.barcode || '');
    setFormWeight(product.weight ?? '');
    setFormPrice(product.price);
    setFormComparePrice(product.comparePrice ?? '');
    setFormCostPrice(product.costPrice ?? '');
    setFormStock(product.stock);
    setFormLowStockAlert(product.lowStockAlert || 5);
    setFormIsActive(product.isActive);
    setFormIsFeatured(product.isFeatured);
    setFormAttributes(product.attributes?.map((a) => ({ name: a.name, value: a.value })) || []);
    setFormTags(product.tags || []);
    setTagInput('');
    setFormMetaTitle(product.metaTitle || '');
    setFormMetaDesc(product.metaDesc || '');
    setImagesQueue([]);
    setIsUploadingImages(false);
    setActiveTab('basic');
    setIsFormModalOpen(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!editingProduct) setFormSlug(slugify(val));
  };

  const handleAddAttribute = () => setFormAttributes((prev) => [...prev, { name: '', value: '' }]);
  const handleRemoveAttribute = (index: number) =>
    setFormAttributes((prev) => prev.filter((_, i) => i !== index));
  const handleAttributeChange = (index: number, key: 'name' | 'value', value: string) =>
    setFormAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, [key]: value } : a)));

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formTags.includes(tag)) {
        setFormTags([...formTags, tag]);
        setTagInput('');
      }
    }
  };
  const handleRemoveTag = (tag: string) => setFormTags(formTags.filter((tg) => tg !== tag));

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImagesQueue((prev) => [...prev, ...Array.from(files)]);
  };
  const handleRemoveFromQueue = (index: number) =>
    setImagesQueue((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim() || !formCategoryId || formPrice === '' || formStock === '') {
      setActiveTab('basic');
      return;
    }
    const payload: Partial<Product> = {
      name: formName,
      slug: formSlug.trim() || slugify(formName),
      description: formDescription,
      shortDesc: formShortDesc.trim() || null,
      sku: formSku,
      barcode: formBarcode.trim() || null,
      categoryId: formCategoryId,
      brand: formBrand.trim() || null,
      weight: formWeight !== '' ? Number(formWeight) : null,
      price: Number(formPrice),
      comparePrice: formComparePrice !== '' ? Number(formComparePrice) : null,
      costPrice: formCostPrice !== '' ? Number(formCostPrice) : null,
      stock: Number(formStock),
      lowStockAlert: Number(formLowStockAlert),
      isActive: formIsActive,
      isFeatured: formIsFeatured,
      tags: formTags,
      attributes: formAttributes.filter((a) => a.name.trim() && a.value.trim()) as ProductAttribute[],
      metaTitle: formMetaTitle.trim() || null,
      metaDesc: formMetaDesc.trim() || null,
    };

    try {
      let savedProduct: Product;
      if (editingProduct) {
        savedProduct = await updateMutation.mutateAsync({ id: editingProduct.id, payload });
      } else {
        savedProduct = await createMutation.mutateAsync(payload);
      }
      if (imagesQueue.length > 0) {
        setIsUploadingImages(true);
        for (const file of imagesQueue) {
          await addImageMutation.mutateAsync({ productId: savedProduct.id, file });
        }
      }
      toast.success(t('save_success'));
      setIsFormModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('delete_success'));
      setDeletingId(null);
      refetch();
    } catch (err) {
      toast.error(parseApiError(err));
    }
  }, [deletingId, deleteMutation, refetch, t]);

  const handleDeleteProductImage = async (imageId: string) => {
    if (!editingProduct) return;
    try {
      await deleteImageMutation.mutateAsync({ productId: editingProduct.id, imageId });
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.images.filter((img) => img.id !== imageId),
      });
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<Product>[]>(
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
        cell: ({ row }) => {
          const p = row.original;
          const mainImage = p.images?.find((img) => img.isMain) || p.images?.[0];
          return mainImage ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-border">
              <Image
                src={mainImage.url}
                alt={mainImage.alt || p.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        meta: { title: t('product_name') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('product_name')} />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="line-clamp-1 text-sm font-semibold text-foreground">{row.original.name}</span>
            {row.original.brand && (
              <span className="text-xs text-muted-foreground">{row.original.brand}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'sku',
        meta: { title: t('sku') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('sku')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground">{row.original.sku}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'price',
        meta: { title: t('price') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('price')} />,
        cell: ({ row }) => (
          <span className="text-sm font-bold text-foreground">₼{row.original.price}</span>
        ),
      },
      {
        accessorKey: 'stock',
        meta: { title: t('stock') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('stock')} />,
        cell: ({ row }) => {
          const p = row.original;
          const isLow = p.stock <= (p.lowStockAlert || 5);
          return (
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold ${isLow ? 'text-amber-500' : 'text-foreground'}`}>
                {p.stock}
              </span>
              {p.stock === 0 ? (
                <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                  {t('inactive')}
                </Badge>
              ) : isLow ? (
                <Badge variant="warning" className="px-1.5 py-0 text-[10px]">
                  {t('low_stock')}
                </Badge>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'category',
        accessorFn: (row) => row.category?.name ?? '',
        meta: { title: t('category') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('category')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.category?.name || '-'}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'isActive',
        meta: { title: t('status'), className: 'text-center', headerClassName: 'text-center' },
        header: () => (
          <span className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('status')}
          </span>
        ),
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex flex-col items-center gap-1">
              {p.isActive ? (
                <Badge variant="success" className="inline-flex items-center gap-0.5">
                  <CheckCircle className="h-3 w-3" />
                  {t('active')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="inline-flex items-center gap-0.5">
                  <XCircle className="h-3 w-3" />
                  {t('inactive')}
                </Badge>
              )}
              {p.isFeatured && (
                <Badge variant="warning" className="inline-flex items-center gap-0.5 py-0 text-[9px]">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {t('featured')}
                </Badge>
              )}
            </div>
          );
        },
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
        cell: ({ row }) => {
          const p = row.original;
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
                <DropdownMenuItem onClick={() => handleOpenEditModal(p)}>
                  <Edit2 className="h-4 w-4" />
                  {tCommon('edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeletingId(p.id)}>
                  <Trash2 className="h-4 w-4" />
                  {tCommon('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, tCommon, handleOpenEditModal],
  );

  const products = productsData?.data?.products || [];
  const pagination = productsData?.pagination;

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: `${tCommon('categories')}: ${t('filter_all')}` },
      ...flattenedCategories.map((cat) => ({
        value: cat.id,
        label: `${cat.level > 0 ? '└─ ' : ''}${cat.name}`,
      })),
    ],
    [flattenedCategories, t, tCommon],
  );

  const isFormPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    addImageMutation.isPending ||
    isUploadingImages;

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
              {t('add_product')}
            </Button>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        isError={!!error}
        onRetry={() => refetch()}
        errorTitle={tCommon('error_occurred')}
        errorDescription={error ? parseApiError(error) : undefined}
        emptyIcon={<FolderOpen className="h-7 w-7" />}
        emptyTitle={t('no_products')}
        emptyDescription={t('no_products_desc')}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={tCommon('search_placeholder')}
        filters={
          <>
            <DataTableFilterSelect
              value={categoryFilter || 'all'}
              onValueChange={(v) => {
                setCategoryFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
              ariaLabel={t('category')}
              placeholder={tCommon('categories')}
              className="min-w-[170px]"
              options={categoryOptions}
            />
            <DataTableFilterSelect
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as 'all' | 'active' | 'inactive');
                setPage(1);
              }}
              ariaLabel={t('status')}
              placeholder={t('status')}
              options={[
                { value: 'all', label: t('filter_all') },
                { value: 'active', label: t('active') },
                { value: 'inactive', label: t('inactive') },
              ]}
            />
            <DataTableFilterSelect
              value={stockFilter}
              onValueChange={(v) => {
                setStockFilter(v as 'all' | 'instock' | 'outofstock');
                setPage(1);
              }}
              ariaLabel={t('stock')}
              placeholder={t('stock')}
              options={[
                { value: 'all', label: t('filter_all') },
                { value: 'instock', label: t('in_stock') },
                { value: 'outofstock', label: t('out_of_stock') },
              ]}
            />
          </>
        }
        showViewOptions
        viewOptionsLabel={tCommon('columns')}
        page={page}
        pageCount={pagination?.pages ?? 1}
        total={pagination?.total}
        pageSize={limit}
        onPageChange={setPage}
      />

      {/* Product CRUD Dialog */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? t('edit_product') : t('add_product')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            >
              <TabsList className="flex w-full flex-wrap">
                <TabsTrigger value="basic">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('tab_basic')}</span>
                </TabsTrigger>
                <TabsTrigger value="pricing">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('tab_pricing')}</span>
                </TabsTrigger>
                <TabsTrigger value="images">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('tab_images')}</span>
                </TabsTrigger>
                <TabsTrigger value="attributes">
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('tab_attributes')}</span>
                </TabsTrigger>
                <TabsTrigger value="seo">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('tab_seo')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab: Basic */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodName">{t('product_name')} *</Label>
                    <Input id="prodName" value={formName} onChange={handleNameChange} placeholder="Məs. iPhone 15 Pro 256GB" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodSlug">Slug</Label>
                    <Input id="prodSlug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="iphone-15-pro-256gb" className="font-mono text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodSku">{t('sku')} *</Label>
                    <Input id="prodSku" value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="Məs. IPH15PRO-256" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodBarcode">{t('barcode')}</Label>
                    <Input id="prodBarcode" value={formBarcode} onChange={(e) => setFormBarcode(e.target.value)} placeholder="Məs. 190199000000" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodCategory">{t('category')} *</Label>
                    <Select
                      value={formCategoryId}
                      onValueChange={(v) => setFormCategoryId((v as string) ?? '')}
                      items={Object.fromEntries(flattenedCategories.map((c) => [c.id, c.name]))}
                    >
                      <SelectTrigger id="prodCategory" className="w-full rounded-xl">
                        <SelectValue placeholder={t('select_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {flattenedCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.level > 0 ? `${'  '.repeat(cat.level)}└─ ` : ''}
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodBrand">{t('brand')}</Label>
                    <Input id="prodBrand" value={formBrand} onChange={(e) => setFormBrand(e.target.value)} placeholder="Məs. Apple" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodWeight">{t('weight')}</Label>
                    <Input id="prodWeight" type="number" step="0.01" value={formWeight} onChange={(e) => setFormWeight(e.target.value !== '' ? Number(e.target.value) : '')} placeholder="Məs. 0.18" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prodShortDesc">Qısa Təsvir</Label>
                  <Textarea id="prodShortDesc" value={formShortDesc} onChange={(e) => setFormShortDesc(e.target.value)} placeholder="Məhsul haqqında qısa məlumat..." rows={2} className="resize-none" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prodDesc">Ətraflı Təsvir *</Label>
                  <Textarea id="prodDesc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Məhsul haqqında ətraflı məlumat..." rows={5} required />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch id="prodIsActive" checked={formIsActive} onCheckedChange={setFormIsActive} />
                    <Label htmlFor="prodIsActive" className="cursor-pointer select-none">{t('active')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="prodIsFeatured" checked={formIsFeatured} onCheckedChange={setFormIsFeatured} />
                    <Label htmlFor="prodIsFeatured" className="cursor-pointer select-none">{t('featured')}</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Pricing */}
              <TabsContent value="pricing" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodPrice">{t('price')} *</Label>
                    <Input id="prodPrice" type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value !== '' ? Number(e.target.value) : '')} placeholder="0.00" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodComparePrice">{t('compare_price')}</Label>
                    <Input id="prodComparePrice" type="number" step="0.01" value={formComparePrice} onChange={(e) => setFormComparePrice(e.target.value !== '' ? Number(e.target.value) : '')} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodCostPrice">{t('cost_price')}</Label>
                    <Input id="prodCostPrice" type="number" step="0.01" value={formCostPrice} onChange={(e) => setFormCostPrice(e.target.value !== '' ? Number(e.target.value) : '')} placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodStock">{t('stock')} *</Label>
                    <Input id="prodStock" type="number" value={formStock} onChange={(e) => setFormStock(e.target.value !== '' ? Number(e.target.value) : '')} placeholder="0" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodLowStock">{t('low_stock_alert')}</Label>
                    <Input id="prodLowStock" type="number" value={formLowStockAlert} onChange={(e) => setFormLowStockAlert(Number(e.target.value))} placeholder="5" />
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Images */}
              <TabsContent value="images" className="space-y-4 pt-4">
                <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 p-6 transition-all duration-200 hover:border-indigo-400 hover:bg-muted">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground">{t('upload_image')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('upload_image_hint')}</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageFileChange} className="hidden" />
                </label>

                {imagesQueue.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('queued_images')} ({imagesQueue.length})
                    </h5>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {imagesQueue.map((file, i) => (
                        <div key={i} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted p-1">
                          <span className="max-w-[85px] truncate text-[10px] font-semibold text-muted-foreground">{file.name}</span>
                          <button type="button" onClick={() => handleRemoveFromQueue(i)} className="absolute right-1.5 top-1.5 rounded-full bg-black/75 p-1 text-white shadow transition-colors hover:bg-black/90">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('existing_images')} ({editingProduct.images.length})
                    </h5>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                      {editingProduct.images.map((img) => (
                        <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border shadow-sm">
                          <Image src={img.url} alt={img.alt || ''} fill sizes="120px" className="object-cover" />
                          {img.isMain && (
                            <Badge variant="warning" className="absolute left-1.5 top-1.5 border-none px-1 py-0 text-[8px] font-bold uppercase">
                              {t('main_image')}
                            </Badge>
                          )}
                          <button type="button" onClick={() => handleDeleteProductImage(img.id)} className="absolute right-1.5 top-1.5 rounded-full bg-red-650 p-1 text-white shadow transition-colors hover:bg-red-700" title={tCommon('delete')}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab: Attributes */}
              <TabsContent value="attributes" className="space-y-5 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h5 className="text-sm font-bold text-foreground">{t('attributes_title')}</h5>
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddAttribute} className="rounded-lg">
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      {t('add_attribute')}
                    </Button>
                  </div>
                  {formAttributes.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">{t('no_attributes')}</p>
                  ) : (
                    <div className="space-y-3">
                      {formAttributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="grid flex-1 grid-cols-2 gap-3">
                            <Input placeholder={t('attribute_name_placeholder')} value={attr.name} onChange={(e) => handleAttributeChange(index, 'name', e.target.value)} className="text-xs" />
                            <Input placeholder={t('attribute_value_placeholder')} value={attr.value} onChange={(e) => handleAttributeChange(index, 'value', e.target.value)} className="text-xs" />
                          </div>
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveAttribute(index)} className="shrink-0 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <Label htmlFor="tagInput">{t('tags')}</Label>
                  <div className="mb-2 flex min-h-[46px] flex-wrap gap-2 rounded-xl border border-border bg-muted/50 p-2">
                    {formTags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                        <span>#{tag}</span>
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-muted-foreground hover:text-foreground focus:outline-none">
                          <XCircle className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </span>
                    ))}
                    {formTags.length === 0 && (
                      <span className="p-1 text-xs italic text-muted-foreground">{t('no_tags')}</span>
                    )}
                  </div>
                  <Input id="tagInput" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder={t('tag_placeholder')} />
                </div>
              </TabsContent>

              {/* Tab: SEO */}
              <TabsContent value="seo" className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prodMetaTitle">{t('meta_title')}</Label>
                  <Input id="prodMetaTitle" value={formMetaTitle} onChange={(e) => setFormMetaTitle(e.target.value)} placeholder="Məs. Apple iPhone 15 Pro | ShopFlow" maxLength={160} />
                  <p className="select-none text-[10px] font-bold text-muted-foreground">{formMetaTitle.length}/160</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prodMetaDesc">{t('meta_desc')}</Label>
                  <Textarea id="prodMetaDesc" value={formMetaDesc} onChange={(e) => setFormMetaDesc(e.target.value)} placeholder="Axtarış motorlarında görünən qısa mətn..." rows={3} maxLength={320} />
                  <p className="select-none text-[10px] font-bold text-muted-foreground">{formMetaDesc.length}/320</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isFormPending || !formName.trim() || !formSku.trim() || formPrice === '' || formStock === ''}
              >
                {(createMutation.isPending || updateMutation.isPending || isUploadingImages) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUploadingImages
                  ? t('uploading_images')
                  : editingProduct
                    ? t('save_changes')
                    : t('create_btn')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title={t('delete_product')}
        description={t('delete_confirm')}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
