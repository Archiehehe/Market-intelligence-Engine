import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Network, 
  Briefcase, 
  TrendingUp,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Narratives', icon: LayoutDashboard, description: 'Active market beliefs' },
  { path: '/belief-graph', label: 'Belief Graph', icon: Network, description: 'Narrative connections' },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase, description: 'Your exposure' },
  { path: '/assets', label: 'Assets', icon: TrendingUp, description: 'Individual tickers' },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare, description: 'Explore with AI' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-card"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">Narrative</h1>
                    <p className="text-xs text-muted-foreground">Market Intelligence</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-1 items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className={cn(
                            "text-xs",
                            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {item.description}
                          </div>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  <p className="font-medium">Sensemaking, not trading.</p>
                  <p className="mt-1">Markets move through narratives.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-[280px]" : "ml-[80px]"
        )}
      >
        <div className="container max-w-7xl py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
