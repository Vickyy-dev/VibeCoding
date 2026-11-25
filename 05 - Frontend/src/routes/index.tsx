import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, RotateCcw, ShieldCheck, SlidersHorizontal, Truck } from "lucide-react";
import brandTree from "@/assets/brand-tree.png";
import christmasMarketBanner from "@/assets/christmas-market-banner.svg";
import christmasGiftsBanner from "@/assets/christmas-gifts-banner.svg";
import christmasSaleBanner from "@/assets/promo-seasonal.jpg";
import { CATEGORIES, formatBRL, PRODUCTS, type CategoryId } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart-context";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type SortOption = "relevance" | "price-asc" | "price-desc" | "rating" | "discount";

const PROMO_BANNERS = [
  {
    type: "welcome",
    alt: "Boas-vindas ao VerdeMarket",
  },
  {
    type: "image",
    src: christmasSaleBanner,
    alt: "Promoção de Natal: até 30% de desconto",
    background: "#9a0808",
    position: "center 32%",
  },
  {
    type: "image",
    src: christmasMarketBanner,
    alt: "Um Natal mais especial no VerdeMarket, até 40% off",
    background: "#092b20",
    position: "center",
  },
  {
    type: "image",
    src: christmasGiftsBanner,
    alt: "Celebre o Natal com ofertas de até 30% off",
    background: "#6d1018",
    position: "center",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verde Market — Ofertas e Vitrine Minimalista" },
      {
        name: "description",
        content:
          "Explore eletrônicos, casa, moda e acessórios com frete grátis e parcelamento sem juros no Verde Market.",
      },
      { property: "og:title", content: "Verde Market — Ofertas e Vitrine Minimalista" },
      {
        property: "og:description",
        content:
          "Explore eletrônicos, casa, moda e acessórios com frete grátis e parcelamento sem juros no Verde Market.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { searchQuery, setSearchQuery } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("todos");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [isCarouselFocused, setIsCarouselFocused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (!carouselApi || isCarouselHovered || isCarouselFocused || prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => carouselApi.scrollNext(), 5000);
    return () => window.clearInterval(intervalId);
  }, [carouselApi, isCarouselFocused, isCarouselHovered]);

  useEffect(() => {
    if (!carouselApi) return;

    const updateCurrentSlide = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    updateCurrentSlide();
    carouselApi.on("select", updateCurrentSlide);
    carouselApi.on("reInit", updateCurrentSlide);

    return () => {
      carouselApi.off("select", updateCurrentSlide);
      carouselApi.off("reInit", updateCurrentSlide);
    };
  }, [carouselApi]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matches = PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === "todos" || product.category === selectedCategory;
      const matchesQuery =
        query.length === 0 ||
        product.title.toLowerCase().includes(query) ||
        product.categoryLabel.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    const sorted = [...matches];
    if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "discount") sorted.sort((a, b) => b.discountPercent - a.discountPercent);
    return sorted;
  }, [searchQuery, selectedCategory, sortBy]);

  const hasActiveFilters = selectedCategory !== "todos" || searchQuery.trim().length > 0;

  return (
    <div>
      <section
        aria-label="Ofertas em destaque"
        className="relative border-b border-border bg-surface-subtle pb-[92px] sm:pb-[132px]"
      >
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: true, align: "start" }}
          className="group relative"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          onFocusCapture={() => setIsCarouselFocused(true)}
          onBlurCapture={(event) => {
            const nextFocused = event.relatedTarget;
            if (!(nextFocused instanceof Node) || !event.currentTarget.contains(nextFocused)) {
              setIsCarouselFocused(false);
            }
          }}
        >
          <CarouselContent className="ml-0">
            {PROMO_BANNERS.map((banner) => (
              <CarouselItem key={banner.alt} className="pl-0">
                {banner.type === "welcome" ? (
                  <WelcomeBanner />
                ) : (
                  <div
                    className="h-[210px] w-full overflow-hidden sm:h-[300px] lg:h-[420px]"
                    style={{ backgroundColor: banner.background }}
                  >
                    <img
                      src={banner.src}
                      alt={banner.alt}
                      className="size-full object-contain sm:object-cover"
                      style={{ objectPosition: banner.position }}
                    />
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            aria-label="Banner anterior"
            className="left-3 size-10 border-0 bg-card/95 text-foreground shadow-md opacity-80 transition-opacity hover:bg-card hover:opacity-100 sm:left-5"
          />
          <CarouselNext
            aria-label="Próximo banner"
            className="right-3 size-10 border-0 bg-card/95 text-foreground shadow-md opacity-80 transition-opacity hover:bg-card hover:opacity-100 sm:right-5"
          />
          <div
            className="absolute inset-x-0 bottom-[76px] flex justify-center gap-2 sm:bottom-[124px]"
            aria-label="Selecionar banner"
          >
            {PROMO_BANNERS.map((banner, index) => (
              <button
                key={banner.alt}
                type="button"
                aria-label={`Mostrar banner ${index + 1}`}
                aria-current={currentSlide === index ? "true" : undefined}
                onClick={() => carouselApi?.scrollTo(index)}
                className={`size-2.5 rounded-full border border-white/80 shadow-sm transition-all ${
                  currentSlide === index ? "scale-110 bg-primary" : "bg-card/80 hover:bg-card"
                }`}
              />
            ))}
          </div>
          {filteredProducts.length > 0 && (
            <div className="pointer-events-none absolute inset-x-0 -bottom-[56px] z-10 px-4 sm:-bottom-[100px] sm:px-6">
              <div className="mx-auto max-w-6xl">
                <div
                  aria-label="Produtos em destaque"
                  className="pointer-events-auto flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0"
                >
                  {filteredProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      to="/produto/$id"
                      params={{ id: product.id }}
                      className="flex min-w-[78%] snap-start items-center gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-lg shadow-foreground/10 transition-transform hover:-translate-y-1 hover:shadow-xl sm:min-w-0"
                    >
                      <span className="flex size-[76px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
                        <img
                          src={product.image}
                          alt=""
                          className="size-full object-contain"
                          loading="lazy"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="mb-1 inline-flex rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
                          -{product.discountPercent}% OFF
                        </span>
                        <span className="block truncate text-xs font-medium text-foreground">
                          {product.title}
                        </span>
                        <span className="mt-1 block text-base font-bold text-foreground">
                          {formatBRL(product.price)}
                        </span>
                        <span className="block text-[11px] text-shipping">Ver oferta</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Carousel>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 text-sm sm:grid-cols-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Truck className="size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Frete grátis</p>
              <p className="text-xs text-muted-foreground">Em pedidos acima de R$ 199</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Até 12x sem juros</p>
              <p className="text-xs text-muted-foreground">Cartão de crédito ou Pix</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Compra garantida</p>
              <p className="text-xs text-muted-foreground">Devolução grátis em até 30 dias</p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Filtrar por categoria"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-9 rounded-full px-4 text-sm font-medium transition-all duration-200 active:scale-95 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-brand-soft/60"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <label htmlFor="sort-select" className="sr-only">
              Ordenar produtos
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 rounded-full border border-border bg-card px-3.5 text-sm font-medium text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              <option value="relevance">Mais relevantes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="rating">Melhor avaliados</option>
              <option value="discount">Maior desconto</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
            {searchQuery.trim() ? ` para "${searchQuery.trim()}"` : ""}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("todos");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <RotateCcw className="size-3.5" />
              Limpar filtros
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center">
            <p className="text-base font-semibold text-foreground">
              Nenhum produto encontrado para essa busca.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente outro termo ou explore todas as categorias da vitrine.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("todos");
                setSearchQuery("");
              }}
              className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WelcomeBanner() {
  const leaves = [
    { left: "8%", delay: "0s", duration: "7.4s" },
    { left: "19%", delay: "2.1s", duration: "8.2s" },
    { left: "31%", delay: "4.5s", duration: "7.8s" },
    { left: "47%", delay: "1.2s", duration: "8.5s" },
    { left: "61%", delay: "3.4s", duration: "7.1s" },
    { left: "74%", delay: "5s", duration: "8.1s" },
    { left: "87%", delay: "2.8s", duration: "7.6s" },
    { left: "95%", delay: "0.8s", duration: "8.3s" },
  ];

  return (
    <div className="h-[300px] w-full px-3 py-3 sm:h-[360px] sm:px-6 sm:py-5 lg:h-[420px]">
      <div className="welcome-hero relative mx-auto flex size-full max-w-6xl items-center overflow-hidden rounded-3xl border border-emerald-950/10 shadow-[0_14px_36px_-14px_rgba(30,86,49,0.2)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {leaves.map((leaf, index) => (
            <span
              key={leaf.left}
              className="welcome-hero-leaf absolute text-primary"
              style={{
                left: leaf.left,
                animationDelay: leaf.delay,
                animationDuration: leaf.duration,
              }}
            >
              <svg
                viewBox="0 0 32 20"
                width={index % 2 === 0 ? 20 : 15}
                height={index % 2 === 0 ? 13 : 10}
                fill="none"
              >
                <path d="M2 13C6 3 20 1 30 6 25 15 13 19 2 13Z" fill="currentColor" />
                <path d="M4 13Q16 9 28 6.5" stroke="white" strokeOpacity=".55" strokeWidth="1.2" />
              </svg>
            </span>
          ))}
        </div>

        <div className="relative z-10 flex w-full flex-col items-center justify-between gap-4 px-5 py-5 text-center sm:flex-row sm:gap-8 sm:px-8 sm:py-7 sm:text-left lg:px-12">
          <span className="welcome-logo-shine relative isolate inline-flex size-24 shrink-0 overflow-hidden rounded-full sm:size-32 lg:size-40">
            <img
              src={brandTree}
              alt="Logo VerdeMarket com árvore em tons de verde e laranja"
              className="static-logo-badge size-full object-contain"
            />
          </span>

          <div className="flex-1 space-y-2 sm:space-y-3">
            <div className="welcome-entrance inline-flex items-center gap-2 rounded-full border border-[#1E5631]/15 bg-[#1E5631]/[0.06] px-3 py-1 text-xs font-semibold tracking-wide text-[#1E5631]">
              <span className="size-1.5 rounded-full bg-[#E07A22]" />
              Marketplace sustentável &amp; marcas conscientes
            </div>
            <h1 className="welcome-gentle-bounce text-2xl leading-tight font-bold tracking-tight text-[#1E5631] sm:text-3xl lg:text-5xl">
              Bem-vindo ao <span className="text-[#E07A22]">VerdeMarket</span>
            </h1>
            <p className="welcome-sub-entrance mx-auto max-w-xl text-sm leading-relaxed text-emerald-950/75 sm:mx-0 sm:text-base">
              Descubra produtos selecionados, criadores responsáveis e marcas com propósito reunidos
              em um só lugar.
            </p>
            <a
              href="#catalogo"
              className="welcome-actions-entrance ui-button inline-flex items-center justify-center rounded-xl bg-[#1E5631] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2D6A3E]"
            >
              Conhecer novidades
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
