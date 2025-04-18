"use client"

import { useState } from "react"
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useRequest, type HttpMethod } from "./request-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import JsonGenerator from "./json-generator"

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]

export default function RequestPanel() {
  const { request, setUrl, setMethod, setBody, addHeader, updateHeader, toggleHeader, removeHeader, sendRequest } =
    useRequest()

  const [activeTab, setActiveTab] = useState("headers")

  const handleSendRequest = async () => {
    if (!request.url) return

    // Validate JSON body if Content-Type is application/json
    const contentTypeHeader = request.headers.find(
      (h) => h.enabled && h.key.toLowerCase() === "content-type" && h.value.includes("application/json"),
    )

    if (contentTypeHeader && request.body && request.method !== "GET") {
      try {
        JSON.parse(request.body)
      } catch (e) {
        alert("Invalid JSON in request body")
        return
      }
    }

    await sendRequest()
  }

  const handleJsonGenerated = (json: string) => {
    setBody(json)

    // Check if we have a Content-Type header for JSON
    const hasJsonContentType = request.headers.some(
      (h) => h.enabled && h.key.toLowerCase() === "content-type" && h.value.includes("application/json"),
    )

    // If not, add it
    if (!hasJsonContentType) {
      const contentTypeIndex = request.headers.findIndex((h) => h.key.toLowerCase() === "content-type")

      if (contentTypeIndex >= 0) {
        // Update existing header
        updateHeader(contentTypeIndex, "Content-Type", "application/json")
        toggleHeader(contentTypeIndex)
      } else {
        // Add new header
        addHeader()
        updateHeader(request.headers.length, "Content-Type", "application/json")
      }
    }

    // Switch to body tab
    setActiveTab("body")
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[100px] justify-between font-mono",
                request.method === "GET" && "text-green-600",
                request.method === "POST" && "text-blue-600",
                request.method === "PUT" && "text-amber-600",
                request.method === "DELETE" && "text-red-600",
                request.method === "PATCH" && "text-purple-600",
              )}
            >
              {request.method}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {HTTP_METHODS.map((method) => (
              <DropdownMenuItem
                key={method}
                onClick={() => setMethod(method)}
                className={cn(
                  "font-mono",
                  method === "GET" && "text-green-600",
                  method === "POST" && "text-blue-600",
                  method === "PUT" && "text-amber-600",
                  method === "DELETE" && "text-red-600",
                  method === "PATCH" && "text-purple-600",
                )}
              >
                {method}
                {request.method === method && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder="Enter request URL"
          value={request.url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono text-sm"
        />
        <Button onClick={handleSendRequest} disabled={!request.url || request.isLoading}>
          {request.isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="headers" className="text-xs">
              Headers
            </TabsTrigger>
            <TabsTrigger value="body" className="text-xs">
              Body
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="headers"
          className="flex-1 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2">
              {request.headers.map((header, index) => (
                <>
                  <div key={`switch-${index}`} className="flex items-center">
                    <Switch checked={header.enabled} onCheckedChange={() => toggleHeader(index)} />
                  </div>
                  <Input
                    key={`key-${index}`}
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateHeader(index, e.target.value, header.value)}
                    className="font-mono text-xs"
                    disabled={!header.enabled}
                  />
                  <Input
                    key={`value-${index}`}
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, header.key, e.target.value)}
                    className="font-mono text-xs"
                    disabled={!header.enabled}
                  />
                  <Button
                    key={`delete-${index}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeader(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ))}
            </div>
          </div>
          <div className="border-t p-2">
            <Button variant="outline" size="sm" onClick={addHeader} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Header
            </Button>
          </div>
        </TabsContent>
        <TabsContent
          value="body"
          className="flex-1 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
        >
          <div className="flex-1 p-4 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">
                {request.method === "GET" ? "Body not available for GET requests" : "Request Body"}
              </div>
              {request.method !== "GET" && <JsonGenerator onJsonGenerated={handleJsonGenerated} />}
            </div>
            <Textarea
              placeholder={
                request.method === "GET"
                  ? "Body not available for GET requests"
                  : "Enter request body (JSON, XML, etc.)"
              }
              value={request.body}
              onChange={(e) => setBody(e.target.value)}
              className="h-full min-h-[200px] font-mono text-sm"
              disabled={request.method === "GET"}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

