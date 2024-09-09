import React from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const Index: React.FC = () => {
  const tiers = [
    {
      name: "Free Tier",
      price: "$0",
      description: "For individuals and small projects",
      features: ["1 user", "5 projects", "1GB storage", "Community support"],
    },
    {
      name: "Standard",
      price: "$5",
      description: "For growing teams and businesses",
      features: ["5 users", "20 projects", "10GB storage", "Email support", "Advanced analytics"],
    },
    {
      name: "Premium",
      price: "$20",
      description: "For large enterprises and high-volume needs",
      features: [
        "Unlimited users",
        "Unlimited projects",
        "100GB storage",
        "24/7 phone support",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <Card key={index} className={`flex flex-col ${index === 1 ? "border-primary shadow-lg" : ""}`}>
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-4xl font-bold mb-4">
                {tier.price}
                <span className="text-lg font-normal text-muted-foreground">{tier.price !== "$0" && "/month"}</span>
              </p>
              <ul className="space-y-2">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                {tier.price === "$0" ? "Get Started" : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Index
