'use client'

import React, { useState, useEffect } from 'react'
import { AdminDashboard } from '../../components/Admin/Analytics/AdminDashboard'
import type { AdminDashboardData } from '../../types/admin'
import { 
  generateMockPlatformMetrics,
  generateMockSystemHealth,
  generateMockAPIUsage,
  generateMockUserEngagement,
  generateMockLearningAnalytics,
  generateMockErrorLogs,
  generateMockInsights
} from '../../types/admin'

export default function AdminPage() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In development, use mock data
      // In production, this would make an API call to /api/admin/analytics
      const mockData: AdminDashboardData = {
        metrics: generateMockPlatformMetrics(),
        systemHealth: generateMockSystemHealth(),
        apiUsage: generateMockAPIUsage(),
        userEngagement: generateMockUserEngagement(),
        learningAnalytics: generateMockLearningAnalytics(),
        recentErrors: generateMockErrorLogs(),
        activeAlerts: [],
        insights: generateMockInsights(),
        lastUpdated: new Date(),
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setDashboardData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchDashboardData()
  }

  const handleExportReport = async () => {
    try {
      // Simulate report generation
      const reportData = {
        generatedAt: new Date().toISOString(),
        metrics: dashboardData?.metrics,
        systemHealth: dashboardData?.systemHealth,
        userEngagement: dashboardData?.userEngagement,
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const handleConfigureAlerts = () => {
    // In a real application, this would open an alert configuration modal
    alert('Alert configuration feature would open here')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">No Data Available</h2>
          <p className="text-gray-600">Unable to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard
          data={dashboardData}
          onRefresh={handleRefresh}
          onExportReport={handleExportReport}
          onConfigureAlerts={handleConfigureAlerts}
        />
      </div>
    </div>
  )
}
