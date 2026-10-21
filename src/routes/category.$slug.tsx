import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Layout";
import { categories } from "@/lib/products";
import { ProductGrid } from "./shop";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const c = categories.find((x) => x.slug === params.slug);
    if (!c) throw notFound();
    return { name: c.name, slug: c.slug };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Category"} — MK Enterprises` },
      { name: "description", content: `Shop ${loaderData?.name ?? "herbal products"} from MK Enterprises.` },
      { property: "og:title", content: `${loaderData?.name ?? "Category"} — MK Enterprises` },
      { property: "og:description", content: `Shop ${loaderData?.name ?? "herbal products"} from MK Enterprises.` },
    ],
  }),
  component: Cat,
});

function Cat() {
  const c = Route.useLoaderData();
  return (
    <>
      <PageHero title={c.name} />
      <ProductGrid fixedCategory={c.slug} key={c.slug} />
    </>
  );
}
