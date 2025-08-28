// src/utils/handleApiError.js
export const handleApiError = (err, fallback = 'Something went wrong.') => {
  if (!err) return fallback

  if (err.data?.message) return err.data.message      // RTK Query standard
  if (err.error) return err.error                     // fallback message
  if (typeof err === 'string') return err             // direct string
  if (err.message) return err.message                 // JS Error object

  return fallback
}
