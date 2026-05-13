/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses and extracts the most requested brands from the surveys list.
 * Handles parsing "Marcas: X, Y" from the curso_solicitado column.
 */
export function extractTopMarcas(surveys: any[]): { name: string; value: number }[] {
  const marcasCount: Record<string, number> = {}

  surveys.forEach((s) => {
    let extracted = false

    if (typeof s.curso_solicitado === 'string') {
      const regex = /Marcas?:\s*([^-\n|]+)/i
      const match = s.curso_solicitado.match(regex)

      if (match && match[1]) {
        const brands = match[1]
          .split(',')
          .map((m: string) => m.trim())
          .filter(Boolean)
        if (brands.length > 0) {
          brands.forEach((b: string) => {
            marcasCount[b] = (marcasCount[b] || 0) + 1
          })
          extracted = true
        }
      }
    }

    if (!extracted) {
      let fallbackMarca = ''
      if (s.detalhes_cursos && typeof s.detalhes_cursos === 'object') {
        const dc = s.detalhes_cursos as any
        if (dc.marca) fallbackMarca = dc.marca
        else if (dc.fabricante) fallbackMarca = dc.fabricante
      }
      if (!fallbackMarca && s.sistema) fallbackMarca = s.sistema

      if (fallbackMarca && typeof fallbackMarca === 'string') {
        const brands = fallbackMarca
          .split(',')
          .map((m: string) => m.trim())
          .filter(Boolean)
        brands.forEach((b: string) => {
          marcasCount[b] = (marcasCount[b] || 0) + 1
        })
      }
    }
  })

  return Object.entries(marcasCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}
