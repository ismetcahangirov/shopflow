// src/app/[locale]/page.tsx
// Localized landing page with sleek visuals and design system tokens

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronRight,
  Star,
  Sparkles,
  TrendingUp,
  Gift
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const t = useTranslations('common');
  const tp = useTranslations('product');

  // Hardcoded mockup data for gorgeous visual presentation (no generic placeholders!)
  const categories = [
    { id: '1', slug: 'electronics', name: 'Elektronika', name_en: 'Electronics', count: 1420, icon: Sparkles, color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400' },
    { id: '2', slug: 'clothing', name: 'Geyim', name_en: 'Clothing', count: 850, icon: ShoppingBag, color: 'from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400' },
    { id: '3', slug: 'home-appliances', name: 'Ev alətləri', name_en: 'Appliances', count: 430, icon: Gift, color: 'from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400' },
    { id: '4', slug: 'sports', name: 'İdman', name_en: 'Sports & Outdoors', count: 290, icon: TrendingUp, color: 'from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400' },
  ];

  const popularProducts = [
    {
      id: '1',
      name: 'ShopFlow Premium Earbuds',
      price: 89.99,
      originalPrice: 129.99,
      rating: 4.8,
      reviewsCount: 124,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      badge: 'Yeni',
    },
    {
      id: '2',
      name: 'Minimalist Leather Watch',
      price: 199.99,
      originalPrice: 249.99,
      rating: 4.9,
      reviewsCount: 88,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      badge: 'Çox satılan',
    },
    {
      id: '3',
      name: 'Ultra-Comfort Ergonomic Chair',
      price: 349.99,
      rating: 4.7,
      reviewsCount: 56,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      badge: '-20%',
    },
    {
      id: '4',
      name: 'Smart Home Hub v2',
      price: 149.99,
      originalPrice: 179.99,
      rating: 4.6,
      reviewsCount: 104,
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      badge: 'Trend',
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-100 dark:border-primary-900/30 text-sm font-semibold text-primary-600 dark:text-primary-400">
              <Sparkles className="h-4 w-4 animate-spin-slow" />
              <span>Premium Alış-Veriş Təcrübəsi</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Həyatınızı <span className="bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">ShopFlow</span> ilə Rəngləndirin!
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              {t('site_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                href="/products" 
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  "rounded-xl px-8 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 shadow-md shadow-primary-500/20 text-white font-semibold flex items-center gap-2"
                )}
              >
                <span>Məhsulları kəşf et</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/register" 
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  "rounded-xl px-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center"
                )}
              >
                <span>Mağaza aç</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Visual Glassmorphism Card Frame */}
            <div className="relative mx-auto w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden shadow-card-lg border border-white/20 dark:border-slate-800/80 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md">
              <Image 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80" 
                alt="ShopFlow Hero Image" 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Overlay Interactive Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-white/20 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Həftənin Seçimi</p>
                  <p className="font-bold text-slate-900 dark:text-white">ShopFlow AirMax</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-sm font-bold">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sürətli Çatdırılma</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ölkənin hər yerinə 24 saat ərzində sürətli və təhlükəsiz çatdırılma xidməti.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Təhlükəsiz Ödəniş</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stripe inteqrasiyası ilə 3D Secure güvənli kart ödənişləri.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-card hover:shadow-card-hover transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">14 Gün İadə Zəmanəti</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Məhsulu bəyənmədiyiniz təqdirdə 14 gün ərzində asan və sürətli geri qaytarma.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kateqoriyalara görə axtar</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Ən çox seçilən məhsul kateqoriyalarımız</p>
          </div>
          <Link href="/categories" className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            <span>Hamısına bax</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link 
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900/20 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col justify-between aspect-[4/3]"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} w-fit`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{cat.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{cat.count} məhsul</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-primary-500">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. POPULAR PRODUCTS SECTION */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{tp('featured_products')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">İstifadəçilərimiz tərəfindən ən çox sevilən və seçilən məhsullar</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            <span>Hamısına bax</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {popularProducts.map((prod) => (
            <div 
              key={prod.id} 
              className="group flex flex-col bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              {/* Product Image Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image 
                  src={prod.image} 
                  alt={prod.name} 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                
                {/* Badge Overlay */}
                {prod.badge && (
                  <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {prod.badge}
                  </span>
                )}
              </div>

              {/* Product Content info */}
              <div className="p-5 flex flex-col flex-1 gap-3 justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
                    {prod.name}
                  </h3>
                  
                  {/* Rating indicator */}
                  <div className="flex items-center gap-1 mt-1.5 text-sm text-slate-500">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.rating}</span>
                    <span className="text-xs text-slate-400">({prod.reviewsCount} {tp('reviews')})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex flex-col">
                    {prod.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">₼{prod.originalPrice.toFixed(2)}</span>
                    )}
                    <span className="text-lg font-extrabold text-slate-950 dark:text-white">₼{prod.price.toFixed(2)}</span>
                  </div>
                  
                  <Button size="sm" className="rounded-xl px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 text-white font-semibold">
                    {tp('add_to_cart')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. VENDOR CTA BANNER */}
      <section className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-850 p-8 sm:p-12 md:p-16 text-center md:text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Background visuals */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_40%)] pointer-events-none" />
          
          <div className="md:col-span-8 space-y-4 z-10">
            <span className="text-primary-400 font-bold text-sm uppercase tracking-wider">Satıcı olaraq qoşul</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">ShopFlow-da öz mağazanı aç və satmağa başla!</h2>
            <p className="text-slate-350 max-w-2xl text-sm sm:text-base">
              Öz məhsullarını minlərlə alıcıya təqdim et. Biz sənə ödəniş, logistika və analitika xidmətlərini asanlıqla idarə etməkdə kömək edəcəyik.
            </p>
          </div>
          
          <div className="md:col-span-4 flex justify-center md:justify-end z-10">
            <Link 
              href="/register" 
              className={cn(
                buttonVariants({ size: 'lg' }),
                "rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold px-8 shadow-lg shadow-white/5 flex items-center justify-center"
              )}
            >
              <span>İndi başla</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
