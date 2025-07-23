'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Activity, 
  AlertTriangle,
  DollarSign,
  Clock,
  Server,
  Zap,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import type { 
  AdminDashboardData,
  PlatformMetrics,
  SystemHealth,
  APIUsageMetrics,
  UserEngagementData,
  LearningAnalytics,
  AdminInsight,
  ChartData
} from '../../../types/admin'

const dashboardStyles = cva(
  ['w-full', 'space-y-6'],
  {
    variants: {
      layout: {
        compact: ['space-y-4'],
        default: ['space-y-6'],
        expanded: ['space-y-8'],
      },
    },
    defaultVariants: {
      layout: 'default',
    },
  }
)

const cardStyles = cva(
  ['bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200'],
  {
    variants: {
      variant: {
        default: ['p-6'],
        compact: ['p-4'],
        header: ['p-6', 'bg-gradient-to-r', 'from-indigo-50', 'to-purple-50', 'border-indigo-200'],
        metric: ['p-6', 'hover:shadow-md', 'transition-shadow'],
        alert: ['p-4', 'border-l-4'],
      },
      status: {
        default: [],
        success: ['border-l-green-500', 'bg-green-50'],
        warning: ['border-l-yellow-500', 'bg-yellow-50'],
        error: ['border-l-red-500', 'bg-red-50'],
      },
    },
    defaultVariants: {
      variant: 'default',
      status: 'default',
    },
  }
)

export interface AdminDashboardProps extends VariantProps<typeof dashboardStyles> {
  data: AdminDashboardData
  onRefresh?: () => Promise<void>
  onExportReport?: () => Promise<void>
  onConfigureAlerts?: () => void
  className?: string
}

export function AdminDashboard({
  data,
  layout,
  onRefresh,
  onExportReport,
  onConfigureAlerts,
  className,
}: AdminDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'users' | 'learning'>('overview')

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const formatNumber = (num: number, decimals = 0): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K'
    }
    return num.toFixed(decimals)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'learning', label: 'Learning', icon: MessageSquare },
  ]

  return (
    <div className={twMerge(dashboardStyles({ layout }), className)}>
      {/* Header */}
      <div className={cardStyles({ variant: 'header' })}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Platform monitoring and insights • Last updated: {data.lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={onConfigureAlerts}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title="Configure alerts"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onExportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Health Alert */}
      {data.systemHealth.status !== 'healthy' && (
        <div className={cardStyles({ 
          variant: 'alert', 
          status: data.systemHealth.status === 'warning' ? 'warning' : 'error' 
        })}>
          <div className="flex items-center space-x-3">
            {getHealthStatusIcon(data.systemHealth.status)}
            <div>
              <h3 className="font-medium text-gray-900">System Health Alert</h3>
              <p className="text-sm text-gray-600">
                System status is currently {data.systemHealth.status}. 
                {data.systemHealth.status === 'warning' 
                  ? ' Some performance degradation detected.' 
                  : ' Critical issues require immediate attention.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={cardStyles({ variant: 'metric' })}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.metrics.totalUsers)}</p>
              <p className="text-sm text-green-600">+{data.metrics.newUsersToday} today</p>
            </div>
          </div>
        </div>

        <div className={cardStyles({ variant: 'metric' })}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.metrics.activeUsers)}</p>
              <p className="text-sm text-gray-600">{formatPercentage(data.metrics.activeUsers / data.metrics.totalUsers)} of total</p>
            </div>
          </div>
        </div>

        <div className={cardStyles({ variant: 'metric' })}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.metrics.totalConversations)}</p>
              <p className="text-sm text-gray-600">{formatNumber(data.metrics.totalMessages)} messages</p>
            </div>
          </div>
        </div>

        <div className={cardStyles({ variant: 'metric' })}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.metrics.completionRate)}</p>
              <p className="text-sm text-gray-600">Target: 70%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={twMerge(
                  'flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <div className={cardStyles()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              {getHealthStatusIcon(data.systemHealth.status)}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">{data.systemHealth.uptime}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium">{data.systemHealth.responseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-medium">{formatPercentage(data.systemHealth.errorRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CPU Usage</span>
                <span className="font-medium">{formatPercentage(data.systemHealth.cpuUsage)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Memory Usage</span>
                <span className="font-medium">{formatPercentage(data.systemHealth.memoryUsage)}</span>
              </div>
            </div>
          </div>

          {/* API Usage */}
          <div className={cardStyles()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">API Usage</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Requests</span>
                <span className="font-medium">{formatNumber(data.apiUsage.totalRequests)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Requests Today</span>
                <span className="font-medium">{formatNumber(data.apiUsage.requestsToday)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost This Month</span>
                <span className="font-medium">{formatCurrency(data.apiUsage.costThisMonth)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Latency</span>
                <span className="font-medium">{data.apiUsage.averageResponseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Count</span>
                <span className="font-medium">{data.apiUsage.errorCount}</span>
              </div>
            </div>
          </div>

          {/* Recent Insights */}
          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
            <div className="space-y-3">
              {data.insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.actionRequired && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Errors */}
          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h3>
            <div className="space-y-3">
              {data.recentErrors.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No recent errors</p>
                </div>
              ) : (
                data.recentErrors.slice(0, 5).map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${
                        error.level === 'error' ? 'bg-red-100 text-red-600' :
                        error.level === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{error.message}</p>
                        <p className="text-xs text-gray-500">
                          {error.timestamp.toLocaleString()}
                          {error.count > 1 && ` (${error.count} occurrences)`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      error.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {error.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">{data.systemHealth.responseTime}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((data.systemHealth.responseTime / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-medium">{formatPercentage(data.systemHealth.cpuUsage)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${data.systemHealth.cpuUsage * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium">{formatPercentage(data.systemHealth.memoryUsage)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${data.systemHealth.memoryUsage * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
            <div className="space-y-3">
              {data.apiUsage.topEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{endpoint.endpoint}</p>
                    <p className="text-xs text-gray-500">{formatNumber(endpoint.requests)} requests</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(endpoint.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Session Duration</span>
                <span className="font-medium">{data.metrics.averageSessionLength} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Retention Rate</span>
                <span className="font-medium">{formatPercentage(data.metrics.retentionRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Satisfaction Score</span>
                <span className="font-medium">{data.metrics.satisfactionScore}/5.0</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Device Types</p>
                {data.userEngagement.deviceTypes.map((device, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{device.type}</span>
                    <span className="text-sm font-medium">{device.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
            <div className="space-y-3">
              {data.userEngagement.featureUsage.map((feature, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{feature.feature}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{feature.usage}%</span>
                      <span className={`text-xs ${feature.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {feature.growth > 0 ? '+' : ''}{feature.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${feature.usage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall Completion Rate</span>
                <span className="font-medium">{formatPercentage(data.learningAnalytics.completionRates.overall)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Study Time</span>
                <span className="font-medium">{data.learningAnalytics.averageStudyTime} min</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Completion by Subject</p>
                {data.learningAnalytics.completionRates.bySubject.map((subject, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{subject.subject}</span>
                    <span className="text-sm font-medium">{formatPercentage(subject.rate)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cardStyles()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
            <div className="space-y-3">
              {data.learningAnalytics.topPerformingContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{content.title}</p>
                    <p className="text-xs text-gray-500">{content.completions} completions</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{content.rating}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
