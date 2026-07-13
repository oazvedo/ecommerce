import { getAuthHeader } from './client'

const API_BASE = 'http://localhost:5103/api'
const STATIC_BASE = 'http://localhost:5103'

export type UploadEntidade = 'usuario' | 'produto' | 'empresa'

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${STATIC_BASE}${url}`
}

export async function uploadImagem(entidade: UploadEntidade, id: string, file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_BASE}/upload/${entidade}/${id}`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.mensagem ?? 'Erro ao fazer upload')
  }

  const data = await res.json()
  return resolveImageUrl(data.url)!
}
