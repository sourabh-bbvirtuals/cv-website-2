import { ProductCard } from '../products/ProductCard';

export default function TopOffers({ products }: { products: any }) {
  return (
    <section className="w-full min-h-[500px] mb-24">
      <div className="z-10 p-4 sm:p-10 bg-black">
        <h1 className="text-3xl text-center text-white font-bold">
          Explore Top Offers
        </h1>
        <div className="grid px-8 grid-cols-1 sm:px-1 sm:grid-cols-2 md:px-[66px] md:grid-cols-2 lg:px-[86px] lg:grid-cols-2 xl:grid-cols-4 xl:px-[66px] gap-6 mt-8">
          {products.slice(0, 4).map((item) => (
            <ProductCard key={item.productId} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
