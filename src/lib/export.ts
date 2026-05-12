export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((value) => {
          const strVal = String(value ?? '').replace(/"/g, '""')
          return `"${strVal}"`
        })
        .join(','),
    )
    .join('\n')

  const csv = `${headers}\n${rows}`
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function exportToExcel(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return
  const headers = Object.keys(data[0])
  let table =
    '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1"><tr>'
  headers.forEach((h) => (table += `<th style="background-color: #f3f4f6;">${h}</th>`))
  table += '</tr>'

  data.forEach((row) => {
    table += '<tr>'
    Object.values(row).forEach(
      (v) => (table += `<td>${v !== null && v !== undefined ? v : ''}</td>`),
    )
    table += '</tr>'
  })
  table += '</table></body></html>'

  const blob = new Blob([table], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
