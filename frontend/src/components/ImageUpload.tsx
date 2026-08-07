import { useRef, useState, useEffect } from 'react'
import { Camera, Loader2, User, Building2, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadImagem, type UploadEntidade } from '@/api/upload'
import { toast } from 'sonner'

interface ImageUploadProps {
  entidade: UploadEntidade
  id: string
  currentUrl?: string | null
  variant?: 'avatar' | 'logo' | 'produto'
  onSuccess?: (url: string) => void
  className?: string
}

const PLACEHOLDERS = {
  avatar: User,
  logo: Building2,
  produto: Package,
}

const SIZES = {
  avatar: 'h-20 w-20 rounded-full',
  logo: 'h-20 w-20 rounded-xl',
  produto: 'h-32 w-32 rounded-xl',
}

export function ImageUpload({ entidade, id, currentUrl, variant = 'avatar', onSuccess, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { setPreview(currentUrl ?? null) }, [currentUrl])
  const Placeholder = PLACEHOLDERS[variant]

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    setUploading(true)
    try {
      const url = await uploadImagem(entidade, id, file)
      setPreview(url)
      onSuccess?.(url)
      toast.success('Imagem atualizada.')
    } catch (err) {
      setPreview(currentUrl ?? null)
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn('relative group cursor-pointer shrink-0', SIZES[variant], className)}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      {preview ? (
        <img
          src={preview}
          alt="imagem"
          className={cn('h-full w-full object-cover', SIZES[variant])}
        />
      ) : (
        <div className={cn('flex h-full w-full items-center justify-center bg-muted', SIZES[variant])}>
          <Placeholder className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <div className={cn(
        'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity',
        SIZES[variant],
        uploading && 'opacity-100'
      )}>
        {uploading
          ? <Loader2 className="h-5 w-5 text-white animate-spin" />
          : <Camera className="h-5 w-5 text-white" />
        }
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
