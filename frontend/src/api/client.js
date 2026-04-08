const N8N_BASE = import.meta.env.VITE_N8N_WEBHOOK_BASE

async function request(path, options = {}) {
  const method = options.method || 'GET'
  const headers = method !== 'GET' ? { 'Content-Type': 'application/json' } : {}
  const res = await fetch(`${N8N_BASE}${path}`, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const getProducts = () => request('/products')

export const generateContent = (productId, marketingObjective) =>
  request('/generate-content', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, marketing_objective: marketingObjective }),
  })

export const getHistory = () => request('/history')

export const getGuidelines = () => request('/guidelines')

export const saveGuideline = (key, value) =>
  request('/guidelines', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  })

export const createProduct = (product) =>
  request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })

export const updateProduct = (id, product) =>
  request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })

export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: 'DELETE' })
