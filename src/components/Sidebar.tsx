"use client";
import Link from "next/link";
import { FaHome, FaFolderOpen, FaCog, FaTimes, FaBars, FaChartBar } from "react-icons/fa";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOverlay?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isOverlay = false,
  onClose
}: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Collapse Button - Shows on mobile/tablet, hidden on desktop */}
        {onToggleCollapse && !isOverlay && (
          <button
            className="desktop-collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FaBars />
          </button>
        )}

        {/* Mobile Close Button - Only show on mobile */}
        <button
          className="mobile-close-btn"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <h2 className="sidebar-title">📚 My Collections</h2>
        <nav className="sidebar-nav">
           <Link href="/dashboard" className="sidebar-link" onClick={onClose}>
             <FaHome /> {!isCollapsed && <span>Home</span>}
           </Link>
           <Link href="/collections" className="sidebar-link" onClick={onClose}>
             <FaFolderOpen /> {!isCollapsed && <span>My Collections</span>}
           </Link>
           <Link href="/analytics" className="sidebar-link" onClick={onClose}>
             <FaChartBar /> {!isCollapsed && <span>Analytics</span>}
           </Link>
           <Link href="/settings" className="sidebar-link" onClick={onClose}>
             <FaCog /> {!isCollapsed && <span>Settings</span>}
           </Link>
         </nav>
      </aside>

      <style jsx>{`
        .desktop-collapse-btn {
          display: flex !important;
        }

        @media (max-width: 767px) {
          .mobile-close-btn {
            display: flex !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .desktop-collapse-btn {
            display: flex !important;
          }
        }

        @media (min-width: 2024px) {
          .desktop-collapse-btn {
            display: none !important;
          }
        }

      `}</style>
    </>
  );
}
