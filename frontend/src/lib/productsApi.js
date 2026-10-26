/** Fetch every page of the public product list. Accepts the paginated envelope and a bare array. */
export async function fetchAllPublicProducts(signal) {
  const perPage = 100;
  let page = 1;
  let lastPage = 1;
  const all = [];

  do {
    const response = await fetch(`/api/products?page=${page}&per_page=${perPage}&sort=title&order=asc`, { signal });
    if (!response.ok) throw new Error('Produk tidak tersedia');
    const body = await response.json();
    const rows = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : null);
    if (!rows) throw new Error('Format produk tidak dikenal');
    all.push(...rows);
    lastPage = Number(body?.meta?.last_page || 1);
    page += 1;
  } while (page <= lastPage);

  return all;
}
