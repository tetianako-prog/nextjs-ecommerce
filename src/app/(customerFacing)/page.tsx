import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Suspense } from "react"
import { cache } from "@/lib/cache";

const getMostPopular = cache(() => {
    return db.product.findMany({
        where: {isAvailableForPurchase: true},
        orderBy: {orders: {_count: "desc"}},
        take: 6
    })
}, ["/", "getMostPopular"], {revalidate: 60 * 60 * 24})

const getNewestProducts = cache(() => {
    return db.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      })
}, ["/", "getNewestProducts"], {revalidate: 60 * 60 * 24})

export default function HomePage() {
  return (
   <main className="space-y-12">
    <ProductGridSection title="Most popular" productFetcher={getMostPopular}/>
    <ProductGridSection title="Newest" productFetcher={getNewestProducts} />
   </main>
  );
}
type ProductGridSectionProps = {
    productFetcher: () => Promise<Product[]>
    title: string
}
function ProductGridSection({productFetcher, title}: ProductGridSectionProps) {
return <div className="space-y-4">
    <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
        <Link className="space-x-2" href="/products">
            <span>View all</span>
            <ArrowRight className="size-4"/>
            </Link>
        </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productFetcher} />
        </Suspense>
    </div>
</div>
}

async function ProductSuspense({
    productsFetcher,
  }: {
    productsFetcher: () => Promise<Product[]>
  }) {
    return (await productsFetcher()).map(product => (
      <ProductCard key={product.id} {...product} />
    ))
  }