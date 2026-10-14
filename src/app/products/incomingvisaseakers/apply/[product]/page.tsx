import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getHmrProduct, HMR_PRODUCTS } from "../../products";
import ApplyClient from "./ApplyClient";

type Params = { params: Promise<{ product: string }> };

export function generateStaticParams() {
  return HMR_PRODUCTS.map((product) => ({ product: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = getHmrProduct((await params).product);
  return product
    ? { title: `Apply for ${product.name} | InsurBe`, description: product.tagline }
    : { title: "Insurance not found | InsurBe" };
}

export default async function ApplyPage({ params }: Params) {
  const product = getHmrProduct((await params).product);
  if (!product) notFound();

  return <ApplyClient slug={product.slug} />;
}
