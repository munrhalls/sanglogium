// Development-only seeing tool for checkout flow
// Runs only in development - zero production interference

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCheckoutEvents } from '@/lib/dev/event-logger';

// Development check - this page should only load in development
const isDevelopment = process.env.NODE_ENV === 'development';

interface CheckoutEvent {
  timestamp: string;
  correlationId: string;
  slice: string;
  event: string;
  data: Record<string, unknown>;
  outcome: 'success' | 'error';
  error?: Record<string, unknown> | string;
}

interface IntegrityViolation {
  correlationId: string;
  type: string;
  description: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export default function SeeingToolPage() {
  const [activeFlows, setActiveFlows] = useState<Map<string, CheckoutEvent[]>>(new Map());
  const [recentEvents, setRecentEvents] = useState<CheckoutEvent[]>([]);
  const [violations, setViolations] = useState<IntegrityViolation[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [redisStatus, setRedisStatus] = useState<{ success: boolean; error?: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Test Redis connection via server API
      const statusResponse = await fetch('/api/dev/seeing-tool/status');
      const redisStatus = await statusResponse.json();
      setRedisStatus(redisStatus);

      if (!redisStatus.success) {
        setTimeout(() => setLoading(false), 0);
        return;
      }

      const [recentResponse, violationsResponse] = await Promise.all([
        fetch('/api/dev/seeing-tool/recent-events'),
        fetch('/api/dev/seeing-tool/violations')
      ]);

      const recent = await recentResponse.json();
      const violationsData = await violationsResponse.json();

      // Defer setState calls to avoid synchronous setState in effect
      setTimeout(() => {
        setRecentEvents(recent.events || []);
        setViolations(violationsData.violations || []);
        setLoading(false);
      }, 0);
    } catch (error) {
      console.error('[DEV] Failed to load seeing tool data:', error);
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  useEffect(() => {
    if (!isDevelopment) {
      window.location.href = '/';
      return;
    }

    setTimeout(loadData, 0);
  }, [loadData]);

  useEffect(() => {
    if (!isDevelopment) return;

    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const loadFlowDetails = async (correlationId: string) => {
    try {
      const events = await getCheckoutEvents(correlationId);
      setActiveFlows(prev => new Map(prev.set(correlationId, events)));
      setSelectedFlow(correlationId);
    } catch (error) {
      console.error('[DEV] Failed to load flow details:', error);
    }
  };

  const copyTraceToClipboard = async (correlationId: string) => {
    try {
      const events = await getCheckoutEvents(correlationId);
      const traceData = {
        traceId: correlationId,
        eventCount: events.length,
        events: events.reverse(), // Chronological order
        exportedAt: new Date().toISOString(),
      };
      await navigator.clipboard.writeText(JSON.stringify(traceData, null, 2));
    } catch (error) {
      console.error('[DEV] Failed to copy trace:', error);
    }
  };

  const clearAllEvents = async () => {
    try {
      const response = await fetch('/api/dev/seeing-tool/clear', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        setActiveFlows(new Map());
        setRecentEvents([]);
        setSelectedFlow(null);
      }
    } catch (error) {
      console.error('[DEV] Failed to clear events:', error);
    }
  };

  const copyAllTracesToClipboard = async () => {
    try {
      const response = await fetch('/api/dev/seeing-tool/all-traces');
      const data = await response.json();

      if (data.success) {
        await navigator.clipboard.writeText(JSON.stringify(data.traces, null, 2));
      }
    } catch (error) {
      console.error('[DEV] Failed to copy all traces:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSliceColor = (slice: string) => {
    const colors: Record<string, string> = {
      'basket-address': 'bg-blue-100',
      'address-submit': 'bg-green-100',
      'payment-init': 'bg-yellow-100',
      'payment-submit': 'bg-purple-100',
      'webhook': 'bg-red-100'
    };
    return colors[slice] || 'bg-gray-100';
  };

  const getOutcomeIcon = (outcome: 'success' | 'error') => {
    return outcome === 'success' ? 'þ' : '×';
  };

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Checkout Seeing Tool (Development Only)
            </h1>
            <p className="text-gray-600">
              Real-time visibility into checkout flow data integrity
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyAllTracesToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy All Traces
            </button>
            <button
              onClick={clearAllEvents}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Traces
            </button>
          </div>
        </div>

        {/* Redis Status */}
        {redisStatus && (
          <div className={`mb-8 p-4 rounded-lg ${
            redisStatus.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className="text-lg font-semibold mb-2">
              Redis Connection Status
            </h2>
            <p className={redisStatus.success ? 'text-green-800' : 'text-red-800'}>
              {redisStatus.success ? 'Connected' : `Error: ${redisStatus.error}`}
            </p>
          </div>
        )}

        {/* Integrity Violations Alert */}
        {violations.length > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Integrity Violations ({violations.length})
            </h2>
            <div className="space-y-2">
              {violations.map((violation, index) => (
                <div key={index} className="text-sm">
                  <span className="font-mono text-red-700">{violation.type}</span>
                  <span className="text-red-600 ml-2">{violation.description}</span>
                  <span className="text-red-500 ml-2">
                    ({violation.correlationId})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Checkout Events
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Correlation ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Slice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {event.correlationId.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${getSliceColor(event.slice)}`}>
                        {event.slice}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.event}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg ${event.outcome === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {getOutcomeIcon(event.outcome)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => loadFlowDetails(event.correlationId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Flow
                      </button>
                      <button
                        onClick={() => copyTraceToClipboard(event.correlationId)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Copy Trace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Flow Details */}
        {selectedFlow && activeFlows.has(selectedFlow) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Flow Details: {selectedFlow}
              </h2>
              <button
                onClick={() => copyTraceToClipboard(selectedFlow)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Copy Full Trace
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {activeFlows.get(selectedFlow)?.map((event, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${getSliceColor(event.slice)}`}>
                          {event.slice}
                        </span>
                        <span className="font-semibold">{event.event}</span>
                        <span className={`text-lg ${event.outcome === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {getOutcomeIcon(event.outcome)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    {event.error && (
                      <div className="text-sm text-red-600 mb-2">
                        Error: {typeof event.error === 'string' ? event.error : JSON.stringify(event.error)}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading checkout events...</div>
          </div>
        )}
      </div>
    </div>
  );
}
