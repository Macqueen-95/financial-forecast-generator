"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, HelpCircle } from "lucide-react"

interface MascotProps {
  missingFields?: string[]
  backendError?: string
  statusMessage?: string | null
  onDismiss?: () => void
}

const mascotMessages = {
  missing: {
    title: "Hey CFO! 📊",
    message: "I need a few more details to build your financial forecast. Please provide:",
    icon: "📈",
    color: "bg-gray-100 border-gray-300 text-black"
  },
  error: {
    title: "Forecast Engine Error ⚠️",
    message: "I couldn't process your request. Please check your input and try again.",
    icon: "🔧",
    color: "bg-gray-100 border-gray-300 text-black"
  },
  help: {
    title: "Financial Planning Assistant 💼",
    message: "I'm here to help you create accurate forecasts! Include details like: timeframes, team size, marketing budget, CAC, conversion rates, and revenue metrics.",
    icon: "💡",
    color: "bg-gray-100 border-gray-300 text-black"
  }
}

const fieldSuggestions: Record<string, string> = {
  "MISSING_months": "📅 Forecast period: '12 months' or '18 months'",
  "MISSING_average_cac": "💰 Customer Acquisition Cost: 'CAC $1,250' or 'acquisition cost $800'",
  "MISSING_conversion_rate": "📊 Conversion rate: '4% conversion' or '6% signup rate'",
  "MISSING_initial_salespeople": "👥 Initial team: '2 initial salespeople' or 'start with 5 reps'",
  "MISSING_salespeople_added_per_month": "📈 Growth rate: 'add 1 every month' or 'hire 2 monthly'",
  "MISSING_marketing_spend_per_month": "📢 Marketing budget: 'spend $200k on ads' or '$150k marketing'",
  "MISSING_large_customer_revenue_per_month": "🏢 Enterprise revenue: 'large customers pay $6,000' or 'enterprise $8k/month'",
  "MISSING_sme_customer_revenue_per_month": "🏪 SME revenue: 'SME customers pay $11,000' or 'small business $2k/month'",
  "MISSING_deals_per_salesperson": "🎯 Sales capacity: '1 deal per salesperson' or '2 deals per rep'"
}

export default function Mascot({ missingFields = [], backendError, statusMessage, onDismiss }: MascotProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (missingFields.length > 0 || backendError) {
      setIsVisible(true)
    }
  }, [missingFields, backendError])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible && !statusMessage) return null

  const hasMissingFields = missingFields.length > 0
  const messageType = hasMissingFields ? 'missing' : 'error'
  const config = mascotMessages[messageType]

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      <div className="relative">
        {/* Speech bubble positioned above mascot */}
        {(isVisible || statusMessage) && (
          <div className={`absolute bg-white rounded-lg border shadow-lg px-4 py-3 md:px-5 md:py-4 
            w-[min(60vw,22rem)] md:w-[20rem]
            right-0 
            bottom-full mb-2`}>
            {/* downward-pointing tail toward mascot */}
            <div className="absolute right-6 -bottom-1 w-3 h-3 md:w-4 md:h-4 rotate-45 bg-white border-b border-r"></div>
            <div className="text-sm leading-relaxed">
            {/* Welcome/status line */}
            {statusMessage && (
              <div className="mb-2 text-neutral-700">{statusMessage}</div>
            )}
            {isVisible && (
              <>
                <div className="mb-2 font-medium">{config.title}</div>
                <div>{config.message}</div>
                {hasMissingFields && (
                  <ul className="mt-2 space-y-1">
                    {missingFields.map((field) => (
                      <li key={field} className="text-xs bg-neutral-50 border rounded px-2 py-1">
                        <strong>{field.replace('MISSING_', '').replace('_', ' ')}:</strong> {fieldSuggestions[field] || 'Please provide this value'}
                      </li>
                    ))}
                  </ul>
                )}
                {backendError && (
                  <div className="text-xs bg-red-50 border border-red-200 text-red-700 rounded px-2 py-1 mt-2">
                    <strong>Error:</strong> {backendError}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-xs h-7"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    {showHelp ? 'Hide' : 'Tips'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-xs h-7">
                    <X className="h-3 w-3 mr-1" /> Dismiss
                  </Button>
                </div>
                {showHelp && (
                  <div className="mt-3 p-3 bg-neutral-50 border rounded text-xs space-y-1">
                    <div className="font-semibold mb-2">Try a complete query:</div>
                    <div className="italic">
                      Forecast 12 months with 2 initial salespeople, add 1 monthly, spend $200k, CAC $1,250, 4% conversion, large $6,000, SME $11,000, 1 deal/rep.
                    </div>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        )}

        {/* Mascot image (responsive sizes) */}
        <div className="relative select-none pointer-events-none 
          w-28 h-40 sm:w-36 sm:h-56 md:w-44 md:h-72 lg:w-52 lg:h-80">
          <Image src="/mascotdao.png" alt="Assistant Mascot" fill className="object-contain drop-shadow-xl" priority />
        </div>
      </div>
    </div>
  )
}
