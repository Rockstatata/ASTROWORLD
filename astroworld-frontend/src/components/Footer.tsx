const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-space-violet/20 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-inter font-bold bg-space-gradient bg-clip-text text-transparent mb-4">
              ASTROWORLD
            </h3>
            <p className="text-space-blue-light">
              Your cosmic journey starts here. Explore the universe with cutting-edge tools and AI guidance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-space-blue-lightest mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About', 'Features', 'Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-space-blue-light hover:text-space-bright transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold text-space-blue-lightest mb-4">Connect</h4>
            <div className="flex space-x-4">
              {['GitHub', 'Twitter', 'Discord'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-space-violet/20 hover:bg-space-bright/20 rounded-full flex items-center justify-center text-space-blue-light hover:text-space-bright transition-all duration-300"
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-space-violet/20 mt-8 pt-8 text-center text-space-blue-light">
          <p>&copy; 2025 ASTROWORLD. Made with ❤️ for space enthusiasts.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer