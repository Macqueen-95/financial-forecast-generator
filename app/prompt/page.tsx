"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, TrendingUp, X, Upload, FileSpreadsheet, Calculator, BarChart3 } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Mascot from "@/components/Mascot"
 

export default function PromptPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [backendOk, setBackendOk] = useState<null | boolean>(null)
  const [error, setError] = useState<string | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [showMascot, setShowMascot] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  

  useEffect(() => {
    ;(async () => {
      try {
        const res = await axios.get("http://13.228.225.19:8000/health", { timeout: 3000 })
        setBackendOk(res.data?.status === "ok")
      } catch {
        setBackendOk(false)
      }
    })()
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setUploadedFile(file)
        setError(null)
      } else {
        setError('Please upload a valid Excel file (.xlsx or .xls)')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() && !uploadedFile) return

    setIsLoading(true)
    setError(null)
    setMissingFields([])
    setShowMascot(false)
    
    try {
      let res
      
      if (uploadedFile) {
        // Handle Excel file upload
        const formData = new FormData()
        formData.append('file', uploadedFile)
        res = await axios.post("http://13.228.225.19:8000/forecast-excel", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        // Handle text prompt
        res = await axios.post("http://13.228.225.19:8000/forecast", { query: prompt })
      }
      
      // Check if response has error
      if (res.data.error) {
        setError(`Backend Error: ${res.data.error}`)
        setShowMascot(true)
        setIsLoading(false)
        return
      }
      
      // Check if assumptions have missing fields
      const assumptions = res.data.assumptions || {}
      const missingFieldsList = Object.entries(assumptions)
        .filter(([key, value]) => typeof value === 'string' && value.startsWith('MISSING_'))
        .map(([key, value]) => value as string)
      
      if (missingFieldsList.length > 0) {
        setMissingFields(missingFieldsList)
        setShowMascot(true)
        setIsLoading(false)
        return
      }
      
      sessionStorage.setItem("forecastData", JSON.stringify(res.data))
      router.push("/dashboard")
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error occurred'
      setError(`Request failed: ${errorMsg}`)
      setShowMascot(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <video
          className="w-full h-full object-cover opacity-30"
          autoPlay
          loop
          muted
          playsInline
          src="/bg.mp4"
        />
      </div>
      {/* Floating container */}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black">
              Financial Forecast Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg text-balance max-w-xl mx-auto">
            Transform your business vision into detailed financial projections. Describe your SaaS strategy and get comprehensive forecasts instantly.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-black" />
              <span className="text-muted-foreground">Smart Calculations</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-black" />
              <span className="text-muted-foreground">Interactive Dashboards</span>
            </div>
          </div>
          <div className="mt-4 text-sm">
            {backendOk === null ? (
              <span className="text-muted-foreground">Connecting to forecast engine...</span>
            ) : backendOk ? (
              <span className="text-black font-medium">✓ Forecast engine ready</span>
            ) : (
              <span className="text-gray-600">⚠ Forecast engine unavailable</span>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-sm text-black">{error}</p>
            </div>
          )}
        </div>

        {/* Main input card */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Section */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-300">
              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                <FileSpreadsheet className="w-4 h-4" />
                Import Historical Data (Optional)
              </div>
              <p className="text-xs text-gray-600">
                Upload your existing financial data to get more accurate forecasts
              </p>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center gap-2 border-gray-400 text-black hover:bg-gray-100"
                >
                  <Upload className="w-4 h-4" />
                  Choose Excel File
                </Button>
                {uploadedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="font-medium">{uploadedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Describe Your Business Strategy
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={uploadedFile 
                  ? "Add additional context or leave empty to process Excel file..." 
                  : "Example: 'Forecast 12 months with 5 initial salespeople, add 2 monthly, spend $150k on marketing, CAC $800, 6% conversion rate, large customers $8k/month, SME customers $2k/month'"
                }
                className="min-h-[140px] resize-none text-base leading-relaxed bg-input border-border focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">{prompt.length} characters</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {uploadedFile ? "Historical data will be analyzed" : "Press Ctrl+Enter to generate forecast"}
              </div>
              <Button
                type="submit"
                disabled={(!prompt.trim() && !uploadedFile) || isLoading}
                className="bg-black hover:bg-gray-800 text-white px-8 py-2 font-semibold shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {uploadedFile ? "Analyzing Data..." : "Generating Forecast..."}
                  </>
                ) : (
                  <>
                    {uploadedFile ? <FileSpreadsheet className="w-4 h-4 mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                    {uploadedFile ? "Analyze & Forecast" : "Generate Forecast"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Enhanced footer with examples */}
        <div className="text-center mt-8 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
            <h3 className="text-sm font-semibold text-black mb-2">💡 Quick Examples</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• "12 months, 3 salespeople, $100k marketing, 5% conversion"</p>
              <p>• "Scale from 2 to 20 salespeople over 18 months"</p>
              <p>• "SaaS startup: $50k CAC, $5k LTV, 2% monthly churn"</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Be specific about timeframes, team size, and financial metrics for accurate forecasts
          </p>
        </div>
      </div>
      

      {/* Mascot for missing fields and errors + live status */}
      <Mascot 
        missingFields={missingFields}
        backendError={error}
        statusMessage={backendOk === null ? "Connecting to forecast engine..." : backendOk ? "I'm online and ready to forecast!" : "Forecast engine unavailable."}
        onDismiss={() => {
          setShowMascot(false)
          setMissingFields([])
          setError(null)
        }}
      />
    </div>
  )
}
