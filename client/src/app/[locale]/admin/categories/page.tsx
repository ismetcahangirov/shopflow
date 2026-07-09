// src/app/[locale]/admin/categories/page.tsx
// High-fidelity premium Category CRUD management panel with image uploads, tree structures, and dynamic search filters

'use client';

import React, { useState } from 'react';
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
  Folder,
  Image as ImageIcon,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { 
  useCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation 
} from '@/hooks/useCategories';
import type { Category } from '@/types';

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

export default function AdminCategoriesPage(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Accordion for SEO settings in modal
  const [showSeoSettings, setShowSeoSettings] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formImage, setFormImage] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Queries & Mutations
  const { data: categories, isLoading, error } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const uploadMutation = useUploadCategoryImageMutation();

  // Reset form when modal opens/closes
  const handleOpenCreateModal = () => {
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
  };

  const handleOpenEditModal = (cat: Category) => {
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
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  // Auto-slugify when typing name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(slugify(val));
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadMutation.mutateAsync(file);
      setFormImage(url);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  // Submit Handler
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
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsFormModalOpen(false);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setIsConfirmOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Flatten tree to sorted list for tabular UI, adding indent levels
  const getFlattenedCategories = (): Array<Category & { level: number }> => {
    if (!categories) return [];
    
    const flattened: Array<Category & { level: number }> = [];
    
    const traverse = (list: Category[], level = 0) => {
      list.forEach((item) => {
        flattened.push({ ...item, level });
        if (item.children && item.children.length > 0) {
          traverse(item.children, level + 1);
        }
      });
    };

    // Filter root level categories
    const roots = categories.filter((c) => c.parentId === null);
    traverse(roots);
    return flattened;
  };

  // Get active lists of categories that are valid parent candidates (avoiding cyclical relationship)
  const getParentCandidates = () => {
    if (!categories) return [];
    
    // We only flat list active categories
    const allFlat = getFlattenedCategories();
    
    if (!editingCategory) return allFlat;
    
    // If editing, exclude current category and all its children to prevent cyclical hierarchies
    const excludedIds = new Set<string>([editingCategory.id]);
    
    const markChildren = (cat: Category) => {
      if (cat.children) {
        cat.children.forEach((c) => {
          excludedIds.add(c.id);
          markChildren(c);
        });
      }
    };
    
    // Find editingCategory in full nested list to traverse its children
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
    return allFlat.filter((c) => !excludedIds.has(c.id));
  };

  // Filter categories based on search term & active status
  const filteredFlattened = getFlattenedCategories().filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && cat.isActive !== false) ||
      (statusFilter === 'inactive' && cat.isActive === false);
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumbs Navigation */}
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Kateqoriyalar' }]} />
        
        <PageHeader
          title="Kateqoriyaların İdarə Edilməsi"
          description="Platformadakı iyerarxik kateqoriyalar, alt kateqoriyalar, şəkillər və SEO tənzimləmələri."
          actions={
            <Button
              onClick={handleOpenCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kateqoriya
            </Button>
          }
        />
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card dark:bg-card p-4 rounded-2xl border border-border dark:border-border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          <Input
            placeholder="Kateqoriya axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-muted/50 focus:bg-card dark:bg-background/50 dark:focus:bg-background rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">Status:</span>
          <div className="inline-flex rounded-xl bg-muted p-1 dark:bg-background border border-border dark:border-border">
            {(['all', 'active', 'inactive'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-250 capitalize',
                  statusFilter === filter
                    ? 'bg-card text-foreground shadow-sm dark:bg-card dark:text-foreground'
                    : 'text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white',
                ].join(' ')}
              >
                {filter === 'all' ? 'Hamısı' : filter === 'active' ? 'Aktiv' : 'Deaktiv'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Table/List */}
      <div className="bg-card dark:bg-card border border-border dark:border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <Spinner className="h-8 w-8 text-indigo-600" />
            <p className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground">Kateqoriyalar yüklənir...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-500 dark:text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-foreground dark:text-foreground">Xəta baş verdi</h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground max-w-sm">Kateqoriya siyahısını yükləmək mümkün olmadı. Lütfən yenidən cəhd edin.</p>
          </div>
        ) : filteredFlattened.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-muted dark:bg-background rounded-2xl text-muted-foreground">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-foreground dark:text-foreground">Kateqoriya tapılmadı</h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground max-w-xs">
              Axtarış meyarlarınıza uyğun gələn kateqoriya yoxdur.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-border/60 bg-muted/50 dark:bg-background/20 text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Şəkil</th>
                  <th className="px-6 py-4">Kateqoriya Adı</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Məhsullar</th>
                  <th className="px-6 py-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border/40">
                {filteredFlattened.map((cat) => {
                  return (
                    <tr 
                      key={cat.id} 
                      className="group hover:bg-muted/30 dark:hover:bg-background/5 transition-colors"
                    >
                      {/* Thumbnail Image */}
                      <td className="px-6 py-4 shrink-0">
                        {cat.image ? (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-border dark:border-border">
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted dark:bg-background flex items-center justify-center text-muted-foreground dark:text-muted-foreground border border-border dark:border-border">
                            <Folder className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                      
                      {/* Hierarchical Indented Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {cat.level > 0 && (
                            <span 
                              className="text-muted-foreground dark:text-foreground font-medium select-none mr-2"
                              style={{ paddingLeft: `${(cat.level - 1) * 1.5}rem` }}
                            >
                              └─
                            </span>
                          )}
                          <span className={[
                            'text-sm font-semibold tracking-tight text-foreground dark:text-foreground',
                            cat.level === 0 ? 'font-bold text-base' : 'font-medium'
                          ].join(' ')}>
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      
                      {/* Slug */}
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground dark:text-muted-foreground">
                        {cat.slug}
                      </td>
                      
                      {/* Active Status Badge */}
                      <td className="px-6 py-4 text-center">
                        {cat.isActive !== false ? (
                          <Badge variant="success" className="inline-flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Aktiv
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Deaktiv
                          </Badge>
                        )}
                      </td>
                      
                      {/* Products Count */}
                      <td className="px-6 py-4 text-center text-sm font-bold text-foreground dark:text-muted-foreground">
                        {cat._count?.products ?? 0}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-2 h-auto text-muted-foreground hover:text-indigo-650 dark:text-muted-foreground dark:hover:text-indigo-400 bg-muted hover:bg-indigo-50 dark:bg-background dark:hover:bg-indigo-950/20 rounded-lg transition-colors duration-200"
                            title="Redaktə Et"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenDeleteConfirm(cat.id)}
                            className="p-2 h-auto text-muted-foreground hover:text-red-650 dark:text-muted-foreground dark:hover:text-red-400 bg-muted hover:bg-red-50 dark:bg-background dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200"
                            title="Sil"
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
      </div>

      {/* Create / Edit Overlay Modal Form */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCategory ? 'Kateqoriyanı Redaktə Et' : 'Yeni Kateqoriya Yarat'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Category Name */}
          <div className="space-y-1.5">
            <Label htmlFor="categoryName">Kateqoriya Adı *</Label>
            <Input
              id="categoryName"
              value={formName}
              onChange={handleNameChange}
              placeholder="Məs. Geyim, Telefonlar və s."
              required
              className="rounded-xl"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="categorySlug">Slug (URL Yolu)</Label>
            <Input
              id="categorySlug"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="geyim-telefonlar"
              className="rounded-xl font-mono text-xs"
            />
          </div>

          {/* Parent Category Choice */}
          <div className="space-y-1.5">
            <Label htmlFor="categoryParent">Üst Kateqoriya (Parent)</Label>
            <select
              id="categoryParent"
              value={formParentId}
              onChange={(e) => setFormParentId(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
            >
              <option value="">-- Heç biri (Ana Kateqoriya) --</option>
              {getParentCandidates().map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.level > 0 ? '  '.repeat(cat.level) + '└─ ' : ''}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="categoryDescription">Təsvir (Description)</Label>
            <textarea
              id="categoryDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Kateqoriya haqqında qısa məlumat..."
              rows={3}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background dark:text-foreground resize-none"
            />
          </div>

          {/* Image Drag & Drop Upload Zone */}
          <div className="space-y-2">
            <Label>Kateqoriya Şəkli</Label>
            <div className="flex gap-4 items-center">
              {formImage ? (
                <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-border dark:border-border shadow-sm">
                  <Image
                    src={formImage}
                    alt="Preview"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormImage('')}
                    className="absolute top-1 right-1 p-1 bg-black/75 rounded-full text-white hover:bg-black/90 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-xl bg-muted dark:bg-background border border-dashed border-border dark:border-border flex flex-col items-center justify-center shrink-0 text-muted-foreground dark:text-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Şəkil yoxdur</span>
                </div>
              )}

              <div className="flex-1">
                <label className="relative flex flex-col items-center justify-center h-20 w-full border-2 border-border border-dashed rounded-xl bg-muted/50 hover:bg-muted hover:border-indigo-400 dark:border-border dark:bg-background/50 dark:hover:bg-background dark:hover:border-indigo-900 cursor-pointer transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-3 pb-3">
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    ) : (
                      <Upload className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                    )}
                    <p className="text-xs font-bold text-muted-foreground dark:text-muted-foreground mt-1.5">
                      {uploadMutation.isPending ? 'Fayl yüklənir...' : 'Şəkil Yüklə (Max. 2MB)'}
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

          {/* Accordion SEO meta tags */}
          <div className="border border-border dark:border-border/80 rounded-xl overflow-hidden bg-muted/50 dark:bg-background/20">
            <button
              type="button"
              onClick={() => setShowSeoSettings(!showSeoSettings)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase text-muted-foreground dark:text-muted-foreground tracking-wider hover:bg-muted dark:hover:bg-background transition-colors focus:outline-none"
            >
              <span>SEO Meta Tənzimləmələri</span>
              <ChevronDown className={['h-4 w-4 transition-transform duration-250', showSeoSettings ? 'rotate-180' : ''].join(' ')} />
            </button>

            {showSeoSettings && (
              <div className="p-4 border-t border-border dark:border-border space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label htmlFor="metaTitle">Meta Başlıq (Meta Title)</Label>
                  <Input
                    id="metaTitle"
                    value={formMetaTitle}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    placeholder="Məs. Premium Geyim Kolleksiyası | ShopFlow"
                    className="rounded-xl text-xs"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="metaDesc">Meta Təsvir (Meta Description)</Label>
                  <textarea
                    id="metaDesc"
                    value={formMetaDesc}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    placeholder="Axtarış motorları üçün qısa açıqlama..."
                    rows={2}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-indigo-500 focus:outline-none dark:border-border dark:bg-background dark:text-foreground resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* IsActive status toggle switch */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="formIsActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-border text-indigo-650 focus:ring-indigo-500 dark:border-border dark:bg-background"
            />
            <Label htmlFor="formIsActive" className="cursor-pointer select-none">
              Bu kateqoriya aktivdir (müştərilərə göstərilsin)
            </Label>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border dark:border-border/80">
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
                uploadMutation.isPending ||
                !formName.trim()
              }
              className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/10 transition-all duration-200"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingCategory ? 'Dəyişiklikləri Saxla' : 'Kateqoriya Yarat'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Kateqoriyanı Sil"
        message="Bu kateqoriyanı silmək istədiyinizdən əminsiniz? Əgər bu kateqoriya altında alt kateqoriyalar varsa, onlar da silinə bilər və ya iyerarxiya pozula bilər. Bu əməliyyat geri qaytarıla bilməz!"
        confirmText="Bəli, Sil"
        cancelText="Ləğv Et"
        variant="destructive"
      />
    </div>
  );
}
