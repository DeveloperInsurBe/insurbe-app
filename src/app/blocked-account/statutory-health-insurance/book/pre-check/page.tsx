import PreCheckClient from "./PreCheckClient";

type SearchParams = {
  product?: string | string[];
};

export default async function PreCheckPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const rawProduct = Array.isArray(resolved.product)
    ? resolved.product[0]
    : resolved.product;
  const product = rawProduct?.toUpperCase() === "AOK" ? "AOK" : "DAK";

  return <PreCheckClient initialProduct={product} />;
}
