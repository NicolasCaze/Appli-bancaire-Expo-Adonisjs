/**
 * Formate une date ISO en format JJ/MM/AAAA
 * @param isoDate - Date au format ISO (ex: "2026-01-29T00:00:00.000Z")
 * @returns Date formatée (ex: "29/01/2026")
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate)
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}
