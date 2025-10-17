"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabaseClient";
import Sidebar from "./Sidebar";
import { FaBars } from "react-icons/fa";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Initialize state from localStorage synchronously
  const getInitialSidebarState = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      const saved = localStorage.getItem('sidebar-open');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Default to open on desktop, closed on mobile
      return window.innerWidth >= 768;
    } catch (error) {
      console.error('Error reading sidebar state from localStorage:', error);
      return false;
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState);
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error.message);
          // If refresh token is invalid, redirect to login
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
            router.replace("/login");
            return;
          }
        }

        if (!session?.user) {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      }
    };

    checkAuth();

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Initialize mobile state and handle responsive behavior
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // Check if desktop (1024px+ for burger button logic)
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);

    // Sync with localStorage to ensure consistency
    const savedState = localStorage.getItem('sidebar-open');
    if (savedState !== null) {
      const savedOpen = JSON.parse(savedState);
      if (savedOpen !== isSidebarOpen) {
        console.log('Syncing sidebar state with localStorage:', savedOpen);
        setIsSidebarOpen(savedOpen);
      }
    }

    const checkScreenSize = () => {
      const currentMobile = window.innerWidth < 768;
      const currentDesktop = window.innerWidth >= 1024;

      setIsMobile(currentMobile);
      setIsDesktop(currentDesktop);

      // Auto-close sidebar when switching FROM desktop TO mobile only
      if (!currentMobile && window.innerWidth < 768) {
        setIsSidebarOpen(false);
        localStorage.setItem('sidebar-open', 'false');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); // Only run once on mount

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    console.log('Toggling sidebar:', !isSidebarOpen, 'Current state:', isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Desktop/Tablet Sidebar - Hidden when closed, part of layout when open */}
      <div className={`desktop-sidebar ${isMobile ? 'mobile-hidden' : (isSidebarOpen ? 'open' : 'closed')}`}>
        <Sidebar
          onClose={() => setIsSidebarOpen(false)}
          isOverlay={false}
          isCollapsed={false}
          onToggleCollapse={undefined}
        />
      </div>

      {/* Mobile Sidebar - Overlay */}
      <div className={`mobile-sidebar ${!isMobile ? 'desktop-hidden' : ''} ${isMobile && isSidebarOpen ? 'open' : ''}`}>
        <Sidebar
          onClose={() => {
            console.log('Closing sidebar from mobile sidebar');
            setIsSidebarOpen(false);
          }}
          isOverlay={true}
          isCollapsed={false}
          onToggleCollapse={undefined}
        />
      </div>

      {/* Mobile Overlay Background */}
      {isMobile && isSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => {
            console.log('Closing sidebar from overlay click');
            setIsSidebarOpen(false);
          }}
        />
      )}

      {/* Main Content - Always render this */}
      <main className={`main-content ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`}>
        {children}
      </main>

      {/* Burger Button - Show only on mobile/tablet, completely removed on desktop */}
      {!isDesktop && (
        <button
          className="burger-btn"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Burger button clicked, current state:', isSidebarOpen);
            toggleSidebar();
          }}
          title={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          <FaBars />
        </button>
      )}
    </div>
  );
}
