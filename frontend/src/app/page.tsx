import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Users, Lock, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Wishlist</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Gift giving made{' '}
            <span className="text-primary">simple</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Create wishlists, coordinate gift exchanges, and make sure everyone
            gets what they actually want. No ads, no clutter, just gifting done right.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Gift className="h-10 w-10" />}
            title="Universal Wishlists"
            description="Add items from any store. Paste a URL or add manually. Your wishlist, your way."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="Secret Santa"
            description="Organize gift exchanges with automatic name drawing. Set exclusions, budgets, and more."
          />
          <FeatureCard
            icon={<Lock className="h-10 w-10" />}
            title="Surprise Preserved"
            description="Reserve gifts without the recipient knowing. No more duplicate presents."
          />
        </div>

        {/* CTA */}
        <div className="mt-32 rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to simplify gift giving?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join thousands of families and friends who use Wishlist to coordinate gifts.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="mt-8">
              Create Your First Wishlist
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Wishlist. Made with care.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="text-primary">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
