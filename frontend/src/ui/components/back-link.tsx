import { useNavigate } from 'react-router'
import { ReactNode } from 'react'

/** Link that navigates back. */
export function BackLink({
  children,
  ariaLabel,
}: {
  children: ReactNode
  ariaLabel?: string
}) {
  const navigate = useNavigate()
  return (
    <a role="link" aria-label={ariaLabel} onClick={() => navigate(-1)}>
      {children}
    </a>
  )
}
