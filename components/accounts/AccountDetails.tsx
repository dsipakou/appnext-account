// System
import React from 'react'
import { useRouter } from 'next/router'
import { Wallet, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
// Components
import AccountDetailsCard from '@/components/accounts/components/AccountDetailsCard'
// Hooks
import { useAccount } from '@/hooks/accounts'

const AccountDetails = () => {
  const router = useRouter()
  const { uuid } = router.query

  if (typeof uuid !== 'string') return

  const { data: account } = useAccount(uuid)
  if (!account) return

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{account.title}</h1>
            </div>
          </div>
          <Link 
            href="/accounts" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Accounts
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {account && account.usage.map(item => (
            <AccountDetailsCard
              key={item.month}
              month={item.month}
              spendings={item.spendings}
              income={item.income || 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AccountDetails
