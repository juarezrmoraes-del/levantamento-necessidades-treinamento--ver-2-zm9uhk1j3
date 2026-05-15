import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractTopMarcas(surveys: any[]) {
  const marcasCount: Record<string, number> = {}
  surveys.forEach((s) => {
    let marcaStr = ''
    if (s.detalhes_cursos && typeof s.detalhes_cursos === 'object') {
      if (s.detalhes_cursos.marca) marcaStr = s.detalhes_cursos.marca
      else if (s.detalhes_cursos.fabricante) marcaStr = s.detalhes_cursos.fabricante
    }
    if (!marcaStr && s.sistema) marcaStr = s.sistema

    if (marcaStr) {
      marcasCount[marcaStr] = (marcasCount[marcaStr] || 0) + 1
    }
  })
  return Object.entries(marcasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))
}
