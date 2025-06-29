'use client'

import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Check, Phone, Users, BarChart3 } from 'lucide-react'

const features = [
  { icon: <Phone className="h-5 w-5" />, text: 'Unlimited voice calls' },
  { icon: <Users className="h-5 w-5" />, text: 'Unlimited lead management' },
  { icon: <BarChart3 className="h-5 w-5" />, text: 'Advanced analytics & reporting' },
  { icon: <Check className="h-5 w-5" />, text: 'Priority customer support' },
]

export default function UpgradePage() {
  const handleContactSales = () => {
    window.open('mailto:sales@conversailabs.com?subject=Upgrade to Pro Plan', '_blank')
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upgrade to Pro Plan
          </h1>
          <p className="text-lg text-gray-600">
            Unlock unlimited calling and advanced features for your voice AI campaigns
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Demo Plan Limitations
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Limited to 5 calls total</li>
                <li>• Can only call verified leads</li>
                <li>• Basic features only</li>
                <li>• Shared daily limits</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pro Plan Benefits
              </h2>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <div className="text-green-600">
                      {feature.icon}
                    </div>
                    {feature.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Scale Your Voice AI?
          </h3>
          <p className="text-blue-100 mb-6">
            Contact our sales team to discuss pricing and get started with your Pro plan today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleContactSales}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Contact Sales
            </Button>
            <Button
              variant="outline"
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.open('https://calendly.com/conversailabs', '_blank')}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}