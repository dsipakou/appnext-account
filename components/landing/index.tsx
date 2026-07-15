import { BarChart, Calendar, Check, LineChart, PieChart, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="ml-2 text-2xl font-thin uppercase text-primary">I spent a</span>
          <span className="ml-2 text-2xl font-bold uppercase text-primary">Dollar</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#how-it-works">
            How It Works
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#pricing">
            Pricing
          </Link>
          <Button size="lg" variant="outline" className="border-blue-500 text-blue-500">
            <Link href="https://app.ispentadollar.com/login">Sign In</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex flex-col space-y-2">
                <span className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl/none">
                  Master Your Finances with
                </span>
                <div>
                  <span className="text-2xl font-thin uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    I spent a
                  </span>
                  <span className="ml-4 text-2xl font-bold uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Dollar
                  </span>
                </div>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Empower your financial journey with our comprehensive budgeting tool. Track spending, manage accounts,
                  and achieve your financial goals with ease.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg">
                  <Link href="https://app.ispentadollar.com/signup">Sign Up Now</Link>
                </Button>
                <span>or</span>
                <Button size="lg" variant="outline" className="border-blue-500 text-blue-500">
                  <Link href="https://app.ispentadollar.com/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
              Powerful Features for complete financial control
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <BarChart className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Comprehensive Expense Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monitor your expenses across multiple categories and accounts with intuitive categorization.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <PieChart className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Category Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Organize your transactions with customizable categories and subcategories for granular control over
                    your spending habits.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Collaborative Budgeting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Share and manage budgets with family members, perfect for household or individuals.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Calendar className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Goal-Oriented Budget Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Set short-term and long-term financial goals with a planning tools and track your progress in
                    real-time.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <LineChart className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Analytics and Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gain deep insights into your financial health with interactive charts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
              How I spent a Dollar works
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-xl font-bold">Sign Up in Seconds</h3>
                <p className="text-muted-foreground">
                  Create your free account with just an email and password. No credit card required.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="mb-2 text-xl font-bold">Add Your Accounts</h3>
                <p className="text-muted-foreground">Create your accounts, categories and granular sub-categories.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-xl font-bold">Customize Your Budget</h3>
                <p className="text-muted-foreground">
                  Set up your personalized budget, spending limits, and financial goals to start taking control of your
                  finances.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col justify-center px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <div className="grid grid-cols-1 gap-8">
              <Card className="m-auto">
                <CardHeader>
                  <CardTitle>Open Alpha</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-4xl font-bold">$0</p>
                  <p className="mb-4 text-muted-foreground">Perfect for individuals and household</p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary" /> Be the first to explore new features
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary" /> Experience improvements as they happen
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary" /> Try out all features during development
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary" /> No credit card
                    </li>
                  </ul>
                  <Button className="mt-6 w-full">
                    <Link href="https://app.ispentadollar.com/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="cta" className="w-full bg-primary py-12 text-primary-foreground md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Start Your Financial Journey Today</h2>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">© 2024 I spent a Dollar.</p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs hover:text-primary" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:text-primary" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:text-primary" href="#">
            Cookie Policy
          </Link>
          <Link className="text-xs hover:text-primary" href="#">
            Contact Us
          </Link>
        </nav>
      </footer>
    </div>
  );
};

Index.layout = 'public';

export default Index;
