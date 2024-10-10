import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, BarChart, LineChart, Wallet, Users, Calendar, ArrowRight, Check, Star } from "lucide-react"
import Link from "next/link"

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link className="flex items-center justify-center" href="#">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="ml-2 text-2xl font-bold text-primary">HomeBudget</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#how-it-works">
            How It Works
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#testimonials">
            Testimonials
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#pricing">
            Pricing
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Master Your Finances with HomeBudget
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Empower your financial journey with our comprehensive budgeting tool. Track spending, manage accounts, and achieve your financial goals with ease.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg">Start Your Free Trial</Button>
                <Button variant="outline" size="lg">Watch Demo</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Powerful Features for Complete Financial Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <BarChart className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Comprehensive Expense Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Monitor your expenses across multiple categories and accounts with real-time updates and intuitive categorization.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <PieChart className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Smart Category Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Organize your transactions with customizable categories and subcategories for granular control over your spending habits.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Collaborative Budgeting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Share and manage budgets with family members or team members, perfect for household or small business finances.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Goal-Oriented Budget Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Set short-term and long-term financial goals with our intelligent planning tools and track your progress in real-time.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <LineChart className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Advanced Analytics and Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Gain deep insights into your financial health with interactive charts, customizable reports, and predictive analysis.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Wallet className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Secure Multi-Account Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Connect and manage multiple financial accounts in one place with bank-level security and daily synchronization.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How HomeBudget Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Sign Up in Seconds</h3>
                <p className="text-muted-foreground">Create your free account with just an email and password. No credit card required to start your 30-day trial.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Connect Your Accounts</h3>
                <p className="text-muted-foreground">Securely link your bank accounts, credit cards, and other financial institutions for automatic transaction importing.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Customize Your Budget</h3>
                <p className="text-muted-foreground">Set up your personalized budget categories, spending limits, and financial goals to start taking control of your finances.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"HomeBudget has completely transformed how I manage my finances. The insights I've gained have helped me save for my dream vacation!"</p>
                  <p className="font-semibold mt-4">- Sarah T., Small Business Owner</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"As a freelancer, keeping track of my income and expenses was a nightmare until I found HomeBudget. Now, I feel in control of my finances."</p>
                  <p className="font-semibold mt-4">- Mike R., Freelance Designer</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <Star className="h-5 w-5 text-yellow-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"The collaborative features in HomeBudget have made managing our household budget a breeze. My partner and I are finally on the same financial page."</p>
                  <p className="font-semibold mt-4">- Emily and John D., Newlyweds</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Simple, Transparent Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold mb-4">$0</p>
                  <p className="text-muted-foreground mb-4">Perfect for individuals just starting their financial journey</p>
                  <ul className="space-y-2">
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Expense tracking</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Basic budgeting tools</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Connect up to 2 accounts</li>
                  </ul>
                  <Button className="w-full mt-6">Get Started</Button>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold mb-4">$9.99/mo</p>
                  <p className="text-muted-foreground mb-4">Ideal for households and growing financial needs</p>
                  <ul className="space-y-2">
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> All Basic features</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Advanced analytics</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Connect up to 10 accounts</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Bill reminders</li>
                  </ul>
                  <Button className="w-full mt-6">Start Free Trial</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold mb-4">$24.99/mo</p>
                  <p className="text-muted-foreground mb-4">Comprehensive solution for small businesses</p>
                  <ul className="space-y-2">
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> All Pro features</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Unlimited account connections</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Multi-user access</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-2" /> Customizable reports</li>
                  </ul>
                  <Button className="w-full mt-6">Contact Sales</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Start Your Financial Journey Today</h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Join thousands of users who have taken control of their finances with HomeBudget. Try it free for 30 days, no credit card required.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-primary-foreground text-primary" placeholder="Enter your email" type="email" />
                  <Button type="submit" variant="secondary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-primary-foreground/60">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2 hover:text-primary-foreground" href="#">
                    Terms & Conditions
                  </Link>
                  {" "}and{" "}
                  <Link className="underline underline-offset-2 hover:text-primary-foreground" href="#">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 HomeBudget. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
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
  )
}

Index.layout = 'public'

export default Index
