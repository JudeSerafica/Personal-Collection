"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import { supabase } from "@/supabaseClient";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setProfile({
        name: session.user.user_metadata?.name || "",
        email: session.user.email || "",
        notifications: true,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not authenticated");
      setSaving(false);
      return;
    }

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: { name: profile.name },
    });

    if (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save settings");
    } else {
      alert("Settings saved successfully!");
    }

    setSaving(false);
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
  };

  if (loading) {
    return (
      <ClientLayout>
        <main className="main-content">
          <div className="loading-state">Loading settings...</div>
        </main>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-description">
            Manage your account preferences and settings.
          </p>

          <div className="settings-container">
            <section className="settings-section">
              <h2>Profile Information</h2>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email <span style={{ fontSize: "12px", color: "#666" }}>(cannot be edited)</span></label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Enter your email"
                  disabled
                />
              </div>
            </section>

            <section className="settings-section">
              <h2>Preferences</h2>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={profile.notifications}
                    onChange={(e) =>
                      setProfile({ ...profile, notifications: e.target.checked })
                    }
                  />
                  Enable email notifications
                </label>
              </div>
            </section>

            <div className="settings-actions">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  padding: "12px 24px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
              </div>
            </div>
          </div>
        {/* Sign Out Confirmation Modal */}
        {showSignOutModal && (
          <div className="modal-overlay" style={{
            position: "sticky",
            bottom: "800px",
            backgroundColor:"rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            minHeight: "calc(80vh - 40px)",
            padding: 20,}}>
            <div className="modal-content" style={{ width: "400px", maxWidth: "90vw" }}>
              <div style={{ padding: "32px", textAlign: "center" }}>
                <h2 style={{ margin: "0 0 16px", color: "#111", fontSize: "24px", fontWeight: "700" }}>
                  Confirm Sign Out
                </h2>
                <p style={{ margin: "0 0 24px", color: "#555", fontSize: "16px"}}>
                  Are you sure you want to sign out? You will be redirected to the homepage.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    onClick={handleCancelSignOut}
                    style={{
                      position: "sticky",
                      padding: "12px 24px",
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSignOut}
                    style={{
                      position: "sticky",
                      padding: "12px 24px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </ClientLayout>
  );
}
