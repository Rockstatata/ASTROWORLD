import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { NavbarProps } from '../types'
import Astroworld from '../assets/images/ASTROWORLD_ONLYLOGO.png'
import {useAuth} from '../context/authContext'

interface ExtendedNavbarProps extends NavbarProps {
  showLoginButton?: boolean;
  isFullscreen?: boolean;
}

function Navbar({scrollY, showLoginButton = true, isFullscreen = false}: ExtendedNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isScrolled = scrollY > 50
  const { user, logout } = useAuth()
  // Don't render navbar in fullscreen mode
  if (isFullscreen) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-gray-900/80 backdrop-blur-xl border-b border-space-violet/30 shadow-lg shadow-space-violet/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <img src={Astroworld} alt="Astroworld Logo" className="h-10 w-auto transition-transform duration-300 hover:scale-105" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['Home', 'Explore', 'SkyMap', 'Events', 'MurphAI'].map((item) => (
                <a
                  key={item}
                  href={`${item.toLowerCase()}`}
                  className="relative font-inter text-white hover:text-space-blue transition-all duration-300 px-3 py-2 text-sm font-medium group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-space-blue transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-white font-space-mono text-sm">
                    {user.username}
                  </span>
                  <button 
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-inter font-semibold text-sm transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : showLoginButton && (
                <>
                  <Link to="/login">
                    <button className="bg-space-blue hover:bg-space-bright text-white px-6 py-2 rounded-full font-inter font-semibold text-sm transition-all duration-300">
                      Login
                    </button>
                  </Link>
                 
                </>
              )}
            </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-space-blue p-2 transition-colors duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/90 backdrop-blur-xl border-b border-space-violet/30 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {['Home', 'Explore', 'SkyMap', 'Events', 'MurphAI'].map((item) => (
              <a
                key={item}
                href={`${item.toLowerCase()}`}
                className="text-white hover:text-space-blue block px-3 py-2 text-base font-space-mono font-medium transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            {user ? (
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-space-mono font-semibold transition-all duration-300"
              >
                Logout
              </button>
            ) : showLoginButton && (
              <div className="space-y-2 mt-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full bg-space-gradient hover:opacity-90 text-white px-6 py-2 rounded-full font-space-mono font-semibold transition-all duration-300">
                    Login
                  </button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full bg-space-gradient hover:opacity-90 text-white px-6 py-2 rounded-full font-space-mono font-semibold transition-all duration-300">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar