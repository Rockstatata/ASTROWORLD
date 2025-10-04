import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
  showLoginButton?: boolean
  isFullscreen?: boolean
  footer?: ReactNode
  mainClassName?: string
}

const Layout = ({
  children,
  showLoginButton = true,
  isFullscreen = false,
  footer,
  mainClassName = "pt-16"
}: LayoutProps) => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar - conditionally rendered based on fullscreen */}
      {!isFullscreen && <Navbar scrollY={scrollY} showLoginButton={showLoginButton} isFullscreen={isFullscreen} />}

      {/* Main Content */}
      <main className={mainClassName}>
        {children}
      </main>

      {/* Footer - conditionally rendered based on fullscreen */}
      {!isFullscreen && footer}
    </div>
  )
}

export default Layout