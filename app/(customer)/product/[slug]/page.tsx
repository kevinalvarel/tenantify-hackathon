import { ProductDetailView } from "@/components/customer/product-detail-view";
import { getProductBySlug } from "@/data/customer-demo";
import { Metadata } from "next";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Menu Tidak Ditemukan | Tenantify",
    };
  }

  return {
    title: `${product.name} - ${product.tenantName} | Tenantify`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";
  return (
    <div className="font-poppins w-full" style={{ fontFamily: '"Poppins", sans-serif' }}>
      <ProductDetailView slug={slug} />
    </div>
  );
}

