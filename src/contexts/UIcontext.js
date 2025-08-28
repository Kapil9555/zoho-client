'use client'
import { createContext, useContext, useState } from 'react'

const UIContext = createContext()

export const UIProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)

  const showLoader = () => setLoading(true)
  const hideLoader = () => setLoading(false)

  return (
    <UIContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => useContext(UIContext)
