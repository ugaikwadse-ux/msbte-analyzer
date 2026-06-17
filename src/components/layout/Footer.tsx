import Link from "next/link";
import { Zap, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const links = {
    Product: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Single Result", href: "/result" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    Company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refunds" },
      { label: "Contact Us", href: "/contact" },
    ],
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">MSBTE Result Analyzer</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Automated MSBTE result analysis for polytechnic institutes and coaching centers. 
              Save hours of manual work with instant reports.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MSBTE Result Analyzer. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Designed for Maharashtra State Board of Technical Education
          </p>
        </div>
      </div>
    </footer>
  );
}
