import { createContext, useContext } from 'react'

export const ModalContext = createContext({ openModal: () => {} })

export function useModal() {
  return useContext(ModalContext)
}
