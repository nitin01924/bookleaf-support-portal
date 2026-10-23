import { NavLink, Outlet } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";
import Icon from "./Icon.jsx";

const authorLinks = [
  { to: "/author", label: "Overview", icon: "home", end: true },
  { to: "/author/books", label: "My books", icon: "books" },
  { to: "/author/tickets", label: "Support tickets", icon: "ticket" },
  { to: "/author/tickets/new", label: "Create a ticket", icon: "plus" },
];

const adminLinks = [
  { to: "/admin/tickets", label: "Ticket queue", icon: "ticket", end: true },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : authorLinks;
  const displayName = user?.email || (isAdmin ? "BookLeaf administrator" : "Author account");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to={isAdmin ? "/admin/tickets" : "/author"} className="brand-lockup">
          <span className="brand-mark">B</span>
          <span><strong>BookLeaf</strong><small>Publishing support</small></span>
        </NavLink>

        <div className="workspace-label">{isAdmin ? "ADMIN WORKSPACE" : "AUTHOR WORKSPACE"}</div>
        <nav aria-label="Main navigation" className="side-navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link flex items-center gap-3${isActive ? " is-active" : ""}`}
            >
              <Icon name={link.icon} size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="support-note">
            <span className="support-note-icon"><Icon name="message" size={17} /></span>
            <strong>Here to help</strong>
            <p>Our publishing support team is ready to assist.</p>
          </div>
          <div className="account-row">
            <span className="avatar">{(displayName[0] || "B").toUpperCase()}</span>
            <span className="account-name"><strong>{displayName}</strong><small>{isAdmin ? "Administrator" : "Author"}</small></span>
            <button className="icon-button logout-button" title="Sign out" aria-label="Sign out" onClick={logout}>
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="mobile-header">
          <NavLink to={isAdmin ? "/admin/tickets" : "/author"} className="brand-lockup">
            <span className="brand-mark">B</span><strong>BookLeaf</strong>
          </NavLink>
          <button className="icon-button" title="Sign out" aria-label="Sign out" onClick={logout}><Icon name="logout" /></button>
        </header>
        <nav className="mobile-navigation" aria-label="Main navigation">
          {links.map((link) => <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>)}
        </nav>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
