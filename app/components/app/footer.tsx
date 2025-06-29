export default function Footer() {
    const currentYear = new Date().getFullYear()
    
    return (
      <footer className="bg-green-700 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <span className="text-2xl mr-2">🐾</span>
                VetConnect
              </h3>
              <p className="text-green-100">
                Connecting farmers with veterinarians for better animal healthcare.
              </p>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <div className="space-y-2 text-green-100">
                <a href="mailto:support@vetconnect.rw" className="flex items-center hover:text-white transition-colors">
                  <i className="bi bi-envelope mr-2"></i>
                  yusufuthuman009@gmail.com
                </a>
                <a href="tel:+250788123456" className="flex items-center hover:text-white transition-colors">
                  <i className="bi bi-telephone mr-2"></i>
                  +250 786 994 584
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-green-100">
                <a href="#how-it-works" className="block hover:text-white transition-colors">
                  How It Works
                </a>
                <a href="/benefits" className="block hover:text-white transition-colors">
                  Benefits
                </a>
                <a href="/register" className="block hover:text-white transition-colors">
                  Get Started
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-600 mt-8 pt-6 text-center text-green-100">
            <p>&copy; {currentYear} VetConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }