/**
 * API Service - Utility functions for making HTTP requests
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"

export interface RequestOptions {
  url: string
  method: HttpMethod
  headers?: Record<string, string>
  body?: string
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  time: number
}

/**
 * Send an HTTP request through the proxy API
 */
export async function sendRequest(options: RequestOptions): Promise<ApiResponse> {
  const startTime = Date.now()

  const response = await fetch("/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: options.url,
      method: options.method,
      headers: options.headers || {},
      body: options.body && options.method !== "GET" ? options.body : undefined,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const responseData = await response.json()
  const endTime = Date.now()
  const responseTime = endTime - startTime

  // Extract headers
  const responseHeaders: Record<string, string> = {}
  if (Array.isArray(responseData.headers)) {
    responseData.headers.forEach((header: { key: string; value: string }) => {
      responseHeaders[header.key] = header.value
    })
  }

  return {
    data: responseData.data,
    status: responseData.status || 0,
    statusText: responseData.statusText || "",
    headers: responseHeaders,
    time: responseTime,
  }
}

/**
 * Helper function for GET requests
 */
export async function get(url: string, headers?: Record<string, string>): Promise<ApiResponse> {
  return sendRequest({
    url,
    method: "GET",
    headers,
  })
}

/**
 * Helper function for POST requests
 */
export async function post(url: string, body?: string, headers?: Record<string, string>): Promise<ApiResponse> {
  return sendRequest({
    url,
    method: "POST",
    headers,
    body,
  })
}

/**
 * Helper function for PUT requests
 */
export async function put(url: string, body?: string, headers?: Record<string, string>): Promise<ApiResponse> {
  return sendRequest({
    url,
    method: "PUT",
    headers,
    body,
  })
}

/**
 * Helper function for DELETE requests
 */
export async function del(url: string, headers?: Record<string, string>): Promise<ApiResponse> {
  return sendRequest({
    url,
    method: "DELETE",
    headers,
  })
}

/**
 * Helper function for PATCH requests
 */
export async function patch(url: string, body?: string, headers?: Record<string, string>): Promise<ApiResponse> {
  return sendRequest({
    url,
    method: "PATCH",
    headers,
    body,
  })
}

