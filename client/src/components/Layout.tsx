import { Link } from "react-router-dom";
import { Box } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="navbar">
        <nav className="inner">
          <div className="left">
            <Link to="/" className="brand">
              <Box className="logo" />
              <span className="name">Roomify</span>
            </Link>
            <ul className="links">
              <Link to="/">Projects</Link>
              <Link to="/upload">Upload</Link>
            </ul>
          </div>
        </nav>
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}
