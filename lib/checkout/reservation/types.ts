// Guest Checkout Inventory Reservation - Shared Type Definitions
// Matches all interfaces defined in PRD specifications and test files

// ============================================================================
// Token State Machine
// ============================================================================

export type TokenState = 'FREE' | 'RESERVING' | 'ACTIVE' | 'CANCELLING' | 'REALIZING'

// ============================================================================
// Queue Types
// ============================================================================

export interface QueueRequest {
  id: string
  type: 'create_reservation' | 'rollback_reservation' | 'realize_reservation'
  reservationToken?: string
  idempotencyKey: string
  payload: {
    clientBasket?: ClientBasket
    metadata?: Record<string, unknown>
  }
  priority: 'normal' | 'high'
  createdAt: Date
  retryCount: number
  lastRetryAt?: Date
}

export interface QueueResponse {
  requestId: string
  status: 'success' | 'error' | 'retry' | 'processing'
  data?: unknown
  error?: string
  retryAfter?: number
}

export interface ReservationToken {
  token: string
  state: TokenState
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  idempotencyKey: string
  requestFingerprint: string
  data?: unknown
}

// ============================================================================
// Redis Schema Types
// ============================================================================

export interface ReservationTTLData {
  state: 'ACTIVE' | 'EXPIRED'
  token: string
  createdAt: string
  expiresAt: string
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailureTime: string | null
  nextAttemptTime: string | null
}

export interface IdempotencyCacheData {
  requestFingerprint: string
  response: unknown
  createdAt: string
  expiresAt: string
}

// ============================================================================
// Client Basket (input from UI)
// ============================================================================

export interface ClientBasketProduct {
  id: string
  stripePriceId: string
  quantity: number
}

export interface ClientBasket {
  products: ClientBasketProduct[]
  totalAmount: number
  currency: string
}

// ============================================================================
// Reserved Basket (output from reservation)
// ============================================================================

export interface ReservedProduct {
  id: string
  name: string
  stripePriceId: string
  requestedQuantity: number
  reservedQuantity: number
  availableQuantity: number
  pricePln: number
  totalPricePln: number
  imageUrl: string | null
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

export interface ReservedBasket {
  reservationToken: string
  idempotencyKey: string
  expiresAt: string
  amountPln: number
  products: ReservedProduct[]
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Zustand Store Types
// ============================================================================

export type BasketStatus = 'none' | 'full' | 'decremented' | 'empty'

export interface ReservedBasketState {
  // State
  reservedBasket: ReservedBasket | null
  isLoading: boolean
  error: string | null
  operationInProgress: boolean

  // Actions
  setReservedBasket: (basket: ReservedBasket | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setOperationInProgress: (inProgress: boolean) => void
  clearReservedBasket: () => void

  // Computed
  hasReservedBasket: boolean
  basketStatus: BasketStatus
}

export interface ReservedBasketStore extends ReservedBasketState {
  _lastRequestId: string | null
  _requestQueue: Set<string>
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateReservationRequest {
  clientBasket: ClientBasket
}

export interface RollbackReservationRequest {
  reservationToken: string
}

export interface RealizeReservationRequest {
  type: string
  data: {
    object: {
      metadata?: {
        reservation_token?: string
      }
    }
  }
}

export type ErrorCode =
  | 'INVALID_CONTENT_TYPE'
  | 'MISSING_IDEMPOTENCY_KEY'
  | 'IDEMPOTENCY_KEY_PARAMETER_MISMATCH'
  | 'MISSING_CLIENT_BASKET'
  | 'MISSING_RESERVATION_TOKEN'
  | 'MISSING_STRIPE_SIGNATURE'
  | 'INVALID_WEBHOOK_PAYLOAD'
  | 'OPERATION_IN_PROGRESS'
  | 'SERVICE_TEMPORARILY_UNAVAILABLE'
  | 'INSUFFICIENT_STOCK'
  | 'RESERVATION_EXPIRED'
  | 'RESERVATION_NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'

export interface APIErrorResponse {
  success: false
  requestId: string
  status: 'failed'
  error: {
    code: ErrorCode
    message: string
  }
}

export interface APISuccessResponse {
  success: true
  requestId: string
  status: 'processing' | 'completed'
  data: unknown
}

export type APIResponse = APISuccessResponse | APIErrorResponse

// ============================================================================
// Logging Types
// ============================================================================

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export enum LogCategory {
  SYSTEM = 'system',
  QUEUE = 'queue',
  RESERVATION = 'reservation',
  API = 'api',
  REDIS = 'redis',
  STRIPE = 'stripe',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  requestId?: string
  reservationToken?: string
  userId?: string
  component: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  metadata?: Record<string, unknown>
  tags?: string[]
}
