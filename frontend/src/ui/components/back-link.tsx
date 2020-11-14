import { useHistory } from 'react-router-dom'
import { ReactNode } from 'react'

export function BackLink({ children }: { children: ReactNode }) {
  const history = useHistory()
  return <a onClick={() => history.goBack()}>{children}</a>
}
