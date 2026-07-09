// src/app/[locale]/admin/products/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Upload, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Image as ImageIcon,
  Loader2,
  Tag,
  DollarSign,
  Layers,
  Globe,
  Star
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Pagination } from '@/components/ui/pagination';
import { parseApiError } from '@/lib/api';
import { 
  useProductsQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation,
  useAddProductImageMutation,
  useDeleteProductImageMutation 
} from '@/hooks/useProducts';
import { useCategoriesQuery } from '@/hooks/useCategories';
import type { Product, Category, ProductAttribute } from '@/types';

// Simple slugify function helper
const slugify = (text: string) => {
  const a = 'àáäâãåăæçèéëêéíïîìñóöôõøœùúüûñç·/_,:;';
  const b = 'aaaaaaaaceeeeeeiiiinooooooouuuunc------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

export default function AdminProductsPage(): React.JSX.Element {
  const t = useTranslations('admin_products');
  const tCommon = useTranslations('common');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // reset to first page on search
    }, 405);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'images' | 'attributes' | 'seo'>('basic');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Field States
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

  // Custom attributes array
  const [formAttributes, setFormAttributes] = useState<Array<{ name: string; value: string }>>([]);
  // Tags array
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // SEO Meta States
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');

  // Local images upload queue
  const [imagesQueue, setImagesQueue] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // API Queries & Mutations
  const { data: categoriesData } = useCategoriesQuery();

  // Prepare product list query params
  const productQueryParams: Record<string, unknown> = {
    page,
    limit,
    sort: 'newest',
  };
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

  // Flattened categories for select list
  const getFlattenedCategories = (cats: Category[] | undefined): Array<Category & { level: number }> => {
    if (!cats) return [];
    const flattened: Array<Category & { level: number }> = [];
    const traverse = (list: Category[], level = 0) => {
      list.forEach((item) => {
        flattened.push({ ...item, level });
        if (item.children && item.children.length > 0) {
          traverse(item.children, level + 1);
        }
      });
    };
    const roots = cats.filter((c) => c.parentId === null);
    traverse(roots);
    return flattened;
  };

  const flattenedCategories = getFlattenedCategories(categoriesData);

  // Reset form
  const handleOpenCreateModal = () => {
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
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormDescription(product.description);
    setFormShortDesc(product.shortDesc || '');
    setFormCategoryId(product.categoryId);
    setFormBrand(product.brand || '');
    setFormSku(product.sku);
    setFormBarcode(product.barcode || '');
    setFormWeight(product.weight !== null && product.weight !== undefined ? product.weight : '');
    setFormPrice(product.price);
    setFormComparePrice(product.comparePrice !== null && product.comparePrice !== undefined ? product.comparePrice : '');
    setFormCostPrice(product.costPrice !== null && product.costPrice !== undefined ? product.costPrice : '');
    setFormStock(product.stock);
    setFormLowStockAlert(product.lowStockAlert || 5);
    setFormIsActive(product.isActive);
    setFormIsFeatured(product.isFeatured);
    
    // Map attributes
    const attrs = product.attributes?.map(a => ({ name: a.name, value: a.value })) || [];
    setFormAttributes(attrs);
    
    setFormTags(product.tags || []);
    setTagInput('');
    setFormMetaTitle(product.metaTitle || '');
    setFormMetaDesc(product.metaDesc || '');
    setImagesQueue([]);
    setIsUploadingImages(false);
    setActiveTab('basic');
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  // Slugify from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!editingProduct) {
      setFormSlug(slugify(val));
    }
  };

  // Attribute Handlers
  const handleAddAttribute = () => {
    setFormAttributes([...formAttributes, { name: '', value: '' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const updated = [...formAttributes];
    updated.splice(index, 1);
    setFormAttributes(updated);
  };

  const handleAttributeChange = (index: number, key: 'name' | 'value', value: string) => {
    const updated = [...formAttributes];
    updated[index][key] = value;
    setFormAttributes(updated);
  };

  // Tags Handlers
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

  const handleRemoveTag = (tag: string) => {
    setFormTags(formTags.filter(t => t !== tag));
  };

  // Image upload selector
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const array = Array.from(files);
    setImagesQueue([...imagesQueue, ...array]);
  };

  const handleRemoveFromQueue = (index: number) => {
    setImagesQueue(imagesQueue.filter((_, i) => i !== index));
  };

  // Submit form handler
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
      attributes: formAttributes.filter(a => a.name.trim() && a.value.trim()) as ProductAttribute[],
      metaTitle: formMetaTitle.trim() || null,
      metaDesc: formMetaDesc.trim() || null,
    };

    try {
      let savedProduct: Product;
      if (editingProduct) {
        savedProduct = await updateMutation.mutateAsync({
          id: editingProduct.id,
          payload,
        });
      } else {
        savedProduct = await createMutation.mutateAsync(payload);
      }

      // Handle queued images uploads sequentially
      if (imagesQueue.length > 0) {
        setIsUploadingImages(true);
        for (const file of imagesQueue) {
          await addImageMutation.mutateAsync({
            productId: savedProduct.id,
            file,
          });
        }
      }

      setIsFormModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Save product failed:', err);
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Delete product handler
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setIsConfirmOpen(false);
      setDeletingId(null);
      refetch();
    } catch (err) {
      console.error('Delete product failed:', err);
    }
  };

  // Delete Image on edit mode
  const handleDeleteProductImage = async (imageId: string) => {
    if (!editingProduct) return;
    try {
      await deleteImageMutation.mutateAsync({
        productId: editingProduct.id,
        imageId,
      });
      // Update local state for editingProduct images
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.images.filter(img => img.id !== imageId),
      });
    } catch (err) {
      console.error('Delete image failed:', err);
    }
  };

  const products = productsData?.data?.products || [];
  const pagination = productsData?.pagination;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Məhsullar' }]} />
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button
              onClick={handleOpenCreateModal}
              className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('add_product')}
            </Button>
          }
        />
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 bg-card dark:bg-card p-4 rounded-2xl border border-border dark:border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          <Input
            placeholder={tCommon('search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-muted/50 focus:bg-card dark:bg-background/50 dark:focus:bg-background rounded-xl"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background/50 dark:text-foreground"
          >
            <option value="">{tCommon('categories')}: Hamısı</option>
            {flattenedCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {'  '.repeat(cat.level) + (cat.level > 0 ? '└─ ' : '') + cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setPage(1);
            }}
            className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background/50 dark:text-foreground"
          >
            <option value="all">{t('status')}: Hamısı</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div>
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as 'all' | 'instock' | 'outofstock');
              setPage(1);
            }}
            className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background/50 dark:text-foreground"
          >
            <option value="all">{t('stock')}: Hamısı</option>
            <option value="instock">{tCommon('free_shipping_congrats') ? 'Stokda var' : 'In stock'}</option>
            <option value="outofstock">{tCommon('free_shipping_congrats') ? 'Stokda yoxdur' : 'Out of stock'}</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card dark:bg-card border border-border dark:border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <Spinner className="h-8 w-8 text-indigo-650" />
            <p className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground">{tCommon('loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-500 dark:text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-foreground dark:text-foreground">{tCommon('error_occurred')}</h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground max-w-sm">{parseApiError(error)}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-muted dark:bg-background rounded-2xl text-muted-foreground">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-foreground dark:text-foreground">{tCommon('no_data')}</h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground max-w-xs">
              Platformada heç bir məhsul tapılmadı.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-border/60 bg-muted/50 dark:bg-background/20 text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Şəkil</th>
                  <th className="px-6 py-4">{t('product_name')}</th>
                  <th className="px-6 py-4">{t('sku')}</th>
                  <th className="px-6 py-4">{t('price')}</th>
                  <th className="px-6 py-4">{t('stock')}</th>
                  <th className="px-6 py-4">{t('category')}</th>
                  <th className="px-6 py-4 text-center">{t('status')}</th>
                  <th className="px-6 py-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border/40">
                {products.map((p) => {
                  const mainImage = p.images?.find(img => img.isMain) || p.images?.[0];
                  return (
                    <tr key={p.id} className="group hover:bg-muted/30 dark:hover:bg-background/5 transition-colors">
                      {/* Image */}
                      <td className="px-6 py-4">
                        {mainImage ? (
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border dark:border-border">
                            <Image
                              src={mainImage.url}
                              alt={mainImage.alt || p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-muted dark:bg-background flex items-center justify-center text-muted-foreground dark:text-muted-foreground border border-border dark:border-border">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </td>

                      {/* Name & Featured Badge */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground dark:text-foreground line-clamp-1">{p.name}</span>
                          {p.brand && <span className="text-xs text-muted-foreground">{p.brand}</span>}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground dark:text-muted-foreground">
                        {p.sku}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-sm font-bold text-foreground dark:text-foreground">
                        ₼{p.price}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold ${p.stock <= (p.lowStockAlert || 5) ? 'text-amber-500' : 'text-foreground dark:text-muted-foreground'}`}>
                            {p.stock}
                          </span>
                          {p.stock === 0 ? (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">{t('inactive')}</Badge>
                          ) : p.stock <= (p.lowStockAlert || 5) ? (
                            <Badge variant="warning" className="text-[10px] py-0 px-1.5">Az qalıb</Badge>
                          ) : null}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground">
                        {p.category?.name || '-'}
                      </td>

                      {/* Statuses */}
                      <td className="px-6 py-4 text-center">
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
                            <Badge variant="warning" className="inline-flex items-center gap-0.5 text-[9px] py-0">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              {t('featured')}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 h-auto text-muted-foreground hover:text-indigo-650 dark:text-muted-foreground dark:hover:text-indigo-400 bg-muted hover:bg-indigo-50 dark:bg-background dark:hover:bg-indigo-950/20 rounded-lg transition-colors duration-200"
                            title={tCommon('edit')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenDeleteConfirm(p.id)}
                            className="p-2 h-auto text-muted-foreground hover:text-red-650 dark:text-muted-foreground dark:hover:text-red-400 bg-muted hover:bg-red-50 dark:bg-background dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200"
                            title={tCommon('delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-border dark:border-border">
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={(p) => setPage(p)}
              showInfo
              totalEntries={pagination.total}
              pageSize={limit}
            />
          </div>
        )}
      </div>

      {/* CRUD Product Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? t('edit_product') : t('add_product')}
        size="lg"
      >
        <div className="flex flex-col space-y-4 pt-2 max-h-[78vh] overflow-y-auto pr-1">
          {/* Tabs bar */}
          <div className="flex border-b border-border dark:border-border/80 shrink-0">
            {([
              { id: 'basic', label: t('tab_basic'), icon: Layers },
              { id: 'pricing', label: t('tab_pricing'), icon: DollarSign },
              { id: 'images', label: t('tab_images'), icon: ImageIcon },
              { id: 'attributes', label: t('tab_attributes'), icon: Tag },
              { id: 'seo', label: t('tab_seo'), icon: Globe }
            ] as const).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold transition-colors select-none',
                  activeTab === tab.id
                    ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white'
                ].join(' ')}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            
            {/* Tab 1: Basic Information */}
            {activeTab === 'basic' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodName">Məhsul adı *</Label>
                    <Input
                      id="prodName"
                      value={formName}
                      onChange={handleNameChange}
                      placeholder="Məs. iPhone 15 Pro 256GB"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodSlug">Slug (URL Yolu)</Label>
                    <Input
                      id="prodSlug"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="iphone-15-pro-256gb"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodSku">SKU (Stok Kodu) *</Label>
                    <Input
                      id="prodSku"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="Məs. IPH15PRO-256"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodBarcode">Barkod</Label>
                    <Input
                      id="prodBarcode"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                      placeholder="Məs. 190199000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodCategory">Kateqoriya *</Label>
                    <select
                      id="prodCategory"
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                    >
                      <option value="">-- Kateqoriya Seçin --</option>
                      {flattenedCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {'  '.repeat(cat.level) + (cat.level > 0 ? '└─ ' : '') + cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodBrand">Brend</Label>
                    <Input
                      id="prodBrand"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="Məs. Apple"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodWeight">Çəki (kq)</Label>
                    <Input
                      id="prodWeight"
                      type="number"
                      step="0.01"
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder="Məs. 0.18"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prodShortDesc">Qısa Təsvir (Siyahı üçün)</Label>
                  <textarea
                    id="prodShortDesc"
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    placeholder="Məhsul haqqında qısa məlumat..."
                    rows={2}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background dark:text-foreground resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prodDesc">Ətraflı Təsvir *</Label>
                  <textarea
                    id="prodDesc"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Məhsul haqqında ətraflı məlumat..."
                    rows={5}
                    required
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prodIsActive"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-border text-indigo-650 focus:ring-indigo-500 dark:border-border dark:bg-background"
                    />
                    <Label htmlFor="prodIsActive" className="cursor-pointer select-none">Aktiv (Müştəriyə göstərilsin)</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prodIsFeatured"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-border text-indigo-650 focus:ring-indigo-500 dark:border-border dark:bg-background"
                    />
                    <Label htmlFor="prodIsFeatured" className="cursor-pointer select-none">Seçilmiş məhsul (Önə çıxan)</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Pricing and Stock */}
            {activeTab === 'pricing' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodPrice">Qiymət (AZN) *</Label>
                    <Input
                      id="prodPrice"
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodComparePrice">Köhnə qiymət (AZN)</Label>
                    <Input
                      id="prodComparePrice"
                      type="number"
                      step="0.01"
                      value={formComparePrice}
                      onChange={(e) => setFormComparePrice(e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodCostPrice">Maya Dəyəri (AZN)</Label>
                    <Input
                      id="prodCostPrice"
                      type="number"
                      step="0.01"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prodStock">Stok Miqdarı *</Label>
                    <Input
                      id="prodStock"
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prodLowStock">Kritik Stok Həddi</Label>
                    <Input
                      id="prodLowStock"
                      type="number"
                      value={formLowStockAlert}
                      onChange={(e) => setFormLowStockAlert(Number(e.target.value))}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Images */}
            {activeTab === 'images' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Upload Zone */}
                <div>
                  <label className="relative flex flex-col items-center justify-center border-2 border-border border-dashed rounded-2xl bg-muted/50 hover:bg-muted hover:border-indigo-400 dark:border-border dark:bg-background/50 dark:hover:bg-background dark:hover:border-indigo-900 cursor-pointer p-6 transition-all duration-200">
                    <Upload className="h-8 w-8 text-muted-foreground dark:text-muted-foreground mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-foreground dark:text-muted-foreground">Resim Yükle</p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">JPEG, PNG veya WEBP. Max. 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Upload queue list */}
                {imagesQueue.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Yüklənəcək Şəkillər ({imagesQueue.length})</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {imagesQueue.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border dark:border-border bg-muted dark:bg-background p-1 flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground dark:text-muted-foreground max-w-[85px] truncate font-semibold">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromQueue(i)}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/75 rounded-full text-white hover:bg-black/90 transition-colors shadow"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Already uploaded images (Edit mode) */}
                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="space-y-2 border-t border-border dark:border-border pt-4">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mövcud Şəkillər ({editingProduct.images.length})</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {editingProduct.images.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-border dark:border-border shadow-sm group">
                          <Image
                            src={img.url}
                            alt={img.alt || ''}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                          {img.isMain && (
                            <Badge variant="warning" className="absolute top-1.5 left-1.5 text-[8px] py-0 px-1 border-none font-bold uppercase">Əsas</Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteProductImage(img.id)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-650 rounded-full text-white hover:bg-red-700 transition-colors shadow"
                            title="Şəkli sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Attributes and Tags */}
            {activeTab === 'attributes' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Attributes Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border dark:border-border pb-2">
                    <h5 className="text-sm font-bold text-foreground dark:text-muted-foreground">{t('attributes_title')}</h5>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddAttribute}
                      className="px-2.5 py-1.5 h-auto text-xs font-bold bg-muted hover:bg-indigo-50 border border-border text-muted-foreground hover:text-indigo-650"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      {t('add_attribute')}
                    </Button>
                  </div>

                  {formAttributes.length === 0 ? (
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground italic">Heç bir xüsusiyyət əlavə edilməyib (məs. Rəng, Yaddaş, Ekran və s.).</p>
                  ) : (
                    <div className="space-y-3">
                      {formAttributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-3 animate-in slide-in-from-top-1 duration-150">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input
                              placeholder={t('attribute_name_placeholder')}
                              value={attr.name}
                              onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                              className="rounded-xl py-2 px-3 text-xs"
                            />
                            <Input
                              placeholder={t('attribute_value_placeholder')}
                              value={attr.value}
                              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                              className="rounded-xl py-2 px-3 text-xs"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleRemoveAttribute(index)}
                            className="p-2 h-auto text-muted-foreground hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent rounded-lg shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div className="space-y-2 border-t border-border dark:border-border pt-4">
                  <Label htmlFor="tagInput">{t('tags')}</Label>
                  <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted/50 dark:bg-background/20 border border-border dark:border-border rounded-xl min-h-[46px]">
                    {formTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-muted hover:bg-muted text-foreground dark:bg-muted dark:text-muted-foreground rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm">
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground hover:text-muted-foreground focus:outline-none"
                        >
                          <XCircle className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </span>
                    ))}
                    {formTags.length === 0 && (
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground italic p-1">Heç bir teq əlavə edilməyib.</span>
                    )}
                  </div>
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={t('tag_placeholder')}
                  />
                </div>
              </div>
            )}

            {/* Tab 5: SEO Meta Tags */}
            {activeTab === 'seo' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label htmlFor="prodMetaTitle">Meta Başlıq (Meta Title)</Label>
                  <Input
                    id="prodMetaTitle"
                    value={formMetaTitle}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    placeholder="Məs. Apple iPhone 15 Pro ucuz qiymətə alın | ShopFlow"
                    maxLength={160}
                  />
                  <p className="text-[10px] text-muted-foreground font-bold select-none">{formMetaTitle.length}/160</p>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="prodMetaDesc">Meta Təsvir (Meta Description)</Label>
                  <textarea
                    id="prodMetaDesc"
                    value={formMetaDesc}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    placeholder="Axtarış motorlarında görünən qısa reklam mətni..."
                    rows={3}
                    maxLength={320}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground font-bold select-none">{formMetaDesc.length}/320</p>
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border dark:border-border/80 shrink-0">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-xl font-bold"
              >
                Ləğv Et
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || 
                  updateMutation.isPending || 
                  addImageMutation.isPending ||
                  isUploadingImages ||
                  !formName.trim() ||
                  !formSku.trim() ||
                  formPrice === '' ||
                  formStock === ''
                }
                className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/10 transition-all duration-200"
              >
                {(createMutation.isPending || updateMutation.isPending || isUploadingImages) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUploadingImages 
                  ? 'Şəkillər yüklənir...' 
                  : editingProduct 
                    ? 'Dəyişiklikləri Saxla' 
                    : 'Məhsulu Yarat'
                }
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_product')}
        message={t('delete_confirm')}
        confirmText="Bəli, Sil"
        cancelText="Ləğv Et"
        variant="destructive"
      />
    </div>
  );
}
