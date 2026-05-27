import { useState } from "react";
import { ArrowRight, LogOut, Menu, X } from "lucide-react";

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
}

export default function Header({ currentPath, onNavigate, currentUser, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false); // Close mobile menu if open
    if (currentPath !== "/") {
      onNavigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <header className="header no-print">
        <div className="header-container">
          {/* Logo */}
          <div className="logo" onClick={() => handleNavClick("home")} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/favicon.png" alt="FirstStep Logo" style={{ width: "30px", height: "30px", objectFit: "contain", borderRadius: "6px" }} />
            <span>First</span>Step
          </div>

          {/* Navigation Links */}
          {(currentPath === "/" || currentPath === "/login") && (
            <nav className="nav-links-capsule">
              <button 
                className="nav-btn-pill"
                onClick={() => handleNavClick("home")}
              >
                Home
              </button>
              <button 
                className="nav-btn-pill"
                onClick={() => handleNavClick("how-it-works")}
              >
                How It Works
              </button>
              <button 
                className="nav-btn-pill"
                onClick={() => handleNavClick("features")}
              >
                Features
              </button>
              <button 
                className="nav-btn-pill"
                onClick={() => handleNavClick("faqs")}
              >
                FAQs
              </button>
            </nav>
          )}

          {/* Actions Section */}
          <div className="header-actions">
            {!currentUser && (
              <button 
                className="btn btn-primary header-cta-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate("/login");
                }}
              >
                Login
                <ArrowRight size={16} />
              </button>
            )}

            {currentUser && (
              <div className="user-profile-wrapper" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {currentPath !== "/builder" && (
                  <button 
                    className="btn btn-secondary header-cta-btn builder-btn-desktop"
                    onClick={() => onNavigate("/builder")}
                    style={{ height: "38px", padding: "0 16px", fontSize: "0.8rem" }}
                  >
                    Go to Builder
                  </button>
                )}
                <div className="user-profile-widget" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="user-avatar" style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", border: "1px solid var(--accent)", flexShrink: 0 }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info-text no-mobile" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <h5 style={{ fontWeight: 600, fontSize: "0.78rem", margin: 0, color: "var(--foreground)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{currentUser.name}</h5>
                    <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{currentUser.email}</span>
                  </div>
                  <button className="logout-btn" onClick={onLogout} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "4px", display: "flex", alignItems: "center" }} title="Sign Out">
                    <LogOut size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Hamburger Button for Mobile */}
            {(currentPath === "/" || currentPath === "/login") && (
              <button 
                className="mobile-menu-toggle-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                type="button"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Down Dropdown Menu */}
      {isMobileMenuOpen && (currentPath === "/" || currentPath === "/login") && (
        <div className="mobile-nav-overlay no-print">
          <nav className="mobile-nav-links">
            <button className="mobile-nav-link-btn" onClick={() => handleNavClick("home")}>Home</button>
            <button className="mobile-nav-link-btn" onClick={() => handleNavClick("how-it-works")}>How It Works</button>
            <button className="mobile-nav-link-btn" onClick={() => handleNavClick("features")}>Features</button>
            <button className="mobile-nav-link-btn" onClick={() => handleNavClick("faqs")}>FAQs</button>
          </nav>
        </div>
      )}

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 80px;
          z-index: 100;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          transition: var(--transition-fast);
        }

        .header-container {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 100%;
          width: 100%;
          max-width: 100%;
          padding: 0 32px;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-self: start;
          color: var(--foreground);
        }

        .logo span {
          color: var(--accent);
        }

        .nav-links-capsule {
          display: flex;
          background-color: var(--secondary);
          border: 1px solid var(--border);
          padding: 4px;
          border-radius: 40px;
          gap: 2px;
          justify-self: center;
        }

        .nav-btn-pill {
          background: none;
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--secondary-foreground);
          cursor: pointer;
          padding: 8px 18px;
          border-radius: 30px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-btn-pill:hover {
          color: var(--foreground);
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        .header-actions {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-cta-btn {
          font-size: 0.9rem;
          padding: 10px 20px;
          height: 42px;
        }

        .mobile-menu-toggle-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--foreground);
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .mobile-menu-toggle-btn:hover {
          background-color: var(--secondary);
        }

        /* Mobile Menu overlay drawer styling */
        .mobile-nav-overlay {
          position: fixed;
          top: 80px;
          left: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 20px 24px;
          z-index: 99;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          animation: slide-down-menu 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-nav-link-btn {
          background: none;
          border: none;
          text-align: left;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--secondary-foreground);
          cursor: pointer;
          padding: 12px 16px;
          border-radius: 8px;
          transition: all 0.2s;
          width: 100%;
        }

        .mobile-nav-link-btn:hover {
          color: var(--accent);
          background-color: var(--accent-light);
          padding-left: 20px;
        }

        @keyframes slide-down-menu {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .header-container {
            padding: 0 24px;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .nav-links-capsule {
            display: none;
          }
          .mobile-menu-toggle-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .builder-btn-desktop {
            display: none !important;
          }
        }

        @media (max-width: 580px) {
          .no-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

