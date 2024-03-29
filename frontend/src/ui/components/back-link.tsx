import { useNavigate } from 'react-router-dom'
import { ReactNode } from 'react'

/** Link that navigates back. */
export function BackLink({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  return <a onClick={() => navigate(-1)}>{children}</a>
}
