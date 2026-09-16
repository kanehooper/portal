import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  fluid?: boolean
}

export function PageContainer({ children, fluid = false }: PageContainerProps) {
  return (
    <div className={`page-container${fluid ? ' page-container-fluid' : ''}`}>
      <div className='page-stack'>{children}</div>
    </div>
  )
}
