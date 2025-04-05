import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, method, headers, body } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Prepare request options
    const options: RequestInit = {
      method: method || "GET",
      headers: headers || {},
      // Add cache: 'no-store' to prevent caching
      cache: "no-store",
    }

    // Add body for non-GET requests
    if (body && method !== "GET") {
      options.body = body
    }

    console.log(`Making ${method} request to ${url}`)

    // Make the request
    const response = await fetch(url, options)

    // Parse response based on content type
    let data
    const contentType = response.headers.get("content-type") || ""

    try {
      if (contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }
    } catch (error) {
      // If parsing fails, get as text
      data = await response.text()
    }

    // Extract headers
    const responseHeaders: { key: string; value: string }[] = []
    response.headers.forEach((value, key) => {
      responseHeaders.push({ key, value })
    })

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Failed to make request", details: String(error) }, { status: 500 })
  }
}

