"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"

export interface Header {
  key: string
  value: string
  enabled: boolean
}

export interface RequestState {
  url: string
  method: HttpMethod
  headers: Header[]
  body: string
  isLoading: boolean
  response: {
    data: any
    status: number
    statusText: string
    headers: Record<string, string>
    time: number
  } | null
}

export interface SavedQuery {
  id: string
  timestamp: number
  url: string
  method: HttpMethod
  headers: Header[]
  body: string
}

interface RequestContextType {
  request: RequestState
  recentQueries: SavedQuery[]
  setUrl: (url: string) => void
  setMethod: (method: HttpMethod) => void
  setHeaders: (headers: Header[]) => void
  setBody: (body: string) => void
  addHeader: () => void
  updateHeader: (index: number, key: string, value: string) => void
  toggleHeader: (index: number) => void
  removeHeader: (index: number) => void
  sendRequest: () => Promise<void>
  clearResponse: () => void
  loadSavedQuery: (queryId: string) => void
  deleteSavedQuery: (queryId: string) => void
}

const RequestContext = createContext<RequestContextType | undefined>(undefined)

const MAX_RECENT_QUERIES = 10

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<RequestState>({
    url: "",
    method: "GET",
    headers: [{ key: "", value: "", enabled: true }],
    body: "",
    isLoading: false,
    response: null,
  })

  const [recentQueries, setRecentQueries] = useState<SavedQuery[]>([])

  // Load recent queries from localStorage on initial render
  useEffect(() => {
    const savedQueries = localStorage.getItem("recentQueries")
    if (savedQueries) {
      try {
        setRecentQueries(JSON.parse(savedQueries))
      } catch (error) {
        console.error("Failed to parse saved queries:", error)
      }
    }
  }, [])

  const setUrl = (url: string) => {
    setRequest((prev) => ({ ...prev, url }))
  }

  const setMethod = (method: HttpMethod) => {
    setRequest((prev) => ({ ...prev, method }))
  }

  const setHeaders = (headers: Header[]) => {
    setRequest((prev) => ({ ...prev, headers }))
  }

  const setBody = (body: string) => {
    setRequest((prev) => ({ ...prev, body }))
  }

  const addHeader = () => {
    setRequest((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: "", value: "", enabled: true }],
    }))
  }

  const updateHeader = (index: number, key: string, value: string) => {
    const newHeaders = [...request.headers]
    newHeaders[index] = { ...newHeaders[index], key, value }
    setRequest((prev) => ({ ...prev, headers: newHeaders }))
  }

  const toggleHeader = (index: number) => {
    const newHeaders = [...request.headers]
    newHeaders[index] = { ...newHeaders[index], enabled: !newHeaders[index].enabled }
    setRequest((prev) => ({ ...prev, headers: newHeaders }))
  }

  const removeHeader = (index: number) => {
    const newHeaders = [...request.headers]
    newHeaders.splice(index, 1)
    setRequest((prev) => ({ ...prev, headers: newHeaders }))
  }

  // Save the current query to recent queries
  const saveCurrentQuery = () => {
    // Don't save empty queries
    if (!request.url.trim()) return

    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
    }

    // Add to recent queries, avoiding duplicates by URL and method
    setRecentQueries((prev) => {
      const filtered = prev.filter((q) => !(q.url === newQuery.url && q.method === newQuery.method))
      const updated = [newQuery, ...filtered].slice(0, MAX_RECENT_QUERIES)

      // Save to localStorage
      localStorage.setItem("recentQueries", JSON.stringify(updated))

      return updated
    })
  }

  // Load a saved query
  const loadSavedQuery = (queryId: string) => {
    const query = recentQueries.find((q) => q.id === queryId)
    if (query) {
      setRequest((prev) => ({
        ...prev,
        url: query.url,
        method: query.method,
        headers: query.headers,
        body: query.body,
      }))
    }
  }

  // Delete a saved query
  const deleteSavedQuery = (queryId: string) => {
    setRecentQueries((prev) => {
      const updated = prev.filter((q) => q.id !== queryId)
      localStorage.setItem("recentQueries", JSON.stringify(updated))
      return updated
    })
  }

  const sendRequest = async () => {
    setRequest((prev) => ({ ...prev, isLoading: true }))

    try {
      const startTime = Date.now()

      // Prepare headers
      const headers: Record<string, string> = {}
      request.headers.forEach((header) => {
        if (header.enabled && header.key.trim()) {
          headers[header.key] = header.value
        }
      })

      // Add default Content-Type if not provided and we have a body
      if (request.body && request.method !== "GET" && !headers["Content-Type"] && !headers["content-type"]) {
        headers["Content-Type"] = "application/json"
      }

      // Make the request through our proxy API
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: request.url,
          method: request.method,
          headers,
          body: request.body && request.method !== "GET" ? request.body : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Parse response
      const responseData = await response.json()

      // Extract headers
      const responseHeaders: Record<string, string> = {}
      if (Array.isArray(responseData.headers)) {
        responseData.headers.forEach((header: { key: string; value: string }) => {
          responseHeaders[header.key] = header.value
        })
      }

      // Save the successful query to recent queries
      saveCurrentQuery()

      setRequest((prev) => ({
        ...prev,
        isLoading: false,
        response: {
          data: responseData.data,
          status: responseData.status || 0,
          statusText: responseData.statusText || "",
          headers: responseHeaders,
          time: responseTime,
        },
      }))
    } catch (error) {
      console.error("Error making request:", error)
      setRequest((prev) => ({
        ...prev,
        isLoading: false,
        response: {
          data: { error: "Failed to make request", details: String(error) },
          status: 0,
          statusText: "Error",
          headers: {},
          time: 0,
        },
      }))
    }
  }

  const clearResponse = () => {
    setRequest((prev) => ({ ...prev, response: null }))
  }

  return (
    <RequestContext.Provider
      value={{
        request,
        recentQueries,
        setUrl,
        setMethod,
        setHeaders,
        setBody,
        addHeader,
        updateHeader,
        toggleHeader,
        removeHeader,
        sendRequest,
        clearResponse,
        loadSavedQuery,
        deleteSavedQuery,
      }}
    >
      {children}
    </RequestContext.Provider>
  )
}

export function useRequest() {
  const context = useContext(RequestContext)
  if (context === undefined) {
    throw new Error("useRequest must be used within a RequestProvider")
  }
  return context
}

