import DOMPurify from 'dompurify'

export function useSanitize() {
  return (html) => {
    if (!html) return ''
    return DOMPurify.sanitize(html)
  }
}
