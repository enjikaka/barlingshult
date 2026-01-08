type Normalized = {
  id: string;
  title: string;
  description: string;
  imageWidth: string | null;
  imageUrl: string | null;
  price: number | null;
};

export function normalizeShopifyProduct(p: any): Normalized {
  const images = p?.images?.edges?.map((e: any) => e?.node).filter(Boolean) ??
    [];

  const price = p?.selectedOrFirstAvailableVariant?.price?.amount ?? null;

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: images[0]?.url ?? null,
    imageWidth: images[0]?.width ?? null,
    price,
  };
}

export function renderShopifyProductMarkdown(p: Normalized): string {
  const maybeImage = p.imageUrl
    ? `<img src="${p.imageUrl}" width="${p.imageWidth}" alt="${p.title}" />` : '';

  return `---
title: "${p.title}"
id: "${p.id}"
---

${maybeImage}

# ${p.title}

${p.description}
`;
}

async function getProducts() {
  const url =
    "https://barlingshult-seed-shop-hfpko.myshopify.com/api/2025-10/graphql.json";
  const gql = `
  {
    products(first: 99) {
      edges {
        node {
          id
          title
          description
          images(first: 1) {
            edges { node { url altText width height } }
          }
        }
      }
    }
  }
  `;
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
    },
    body: `{"query":"${gql}"}`,
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();

    return json.data.products.edges;
  } catch (error) {
    console.error(error);
  }
}

async function createProductFiles() {
  const products = await getProducts();

  for (const product of products) {
    const productData = normalizeShopifyProduct(product.node);
    const productDataMarkdown = renderShopifyProductMarkdown(productData);

    const fileName = `produkter/${productData.id.split("/").pop()}.md`;
    await Deno.writeTextFile(fileName, productDataMarkdown);
    console.log(`Created file: ${fileName}`);
  }
}

createProductFiles();
