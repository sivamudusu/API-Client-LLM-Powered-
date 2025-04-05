"use client"

import { useState } from "react"
import { Check, Copy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRequest } from "./request-provider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Import react-json-view with dynamic import to avoid SSR issues
const ReactJsonView = dynamic(() => import("react-json-view"), {
  ssr: false,
  loading: () => <div className="p-4">Loading JSON viewer...</div>,
})

export default function ResponsePanel() {
  const { request, clearResponse } = useRequest()
  const [activeTab, setActiveTab] = useState("body")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (!request.response) return

    const textToCopy =
      typeof request.response.data === "object"
        ? JSON.stringify(request.response.data, null, 2)
        : String(request.response.data)

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 300 && status < 400) return "bg-blue-500"
    if (status >= 400 && status < 500) return "bg-amber-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }

  if (!request.response) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Send a request to see the response</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("font-mono", getStatusColor(request.response.status), "text-white")}>
            {request.response.status}
          </Badge>
          <span className="font-mono text-sm">{request.response.statusText}</span>
          <span className="text-sm text-muted-foreground">({request.response.time}ms)</span>
        </div>
        <Button variant="ghost" size="icon" onClick={clearResponse}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="body" className="text-xs">
              Body
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-xs">
              Headers
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="body"
          className="flex-1 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
        >
          <div className="relative flex-1 overflow-hidden">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <ScrollArea className="h-full">
              <div className="p-4">
                {typeof request.response.data === "object" ? (
                  <ReactJsonView
                    src={request.response.data}
                    theme="rjv-default"
                    name={null}
                    displayDataTypes={false}
                    collapsed={1}
                    enableClipboard={false}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      backgroundColor: "transparent",
                    }}
                  />
                ) : (
                  <pre className="font-mono text-sm whitespace-pre-wrap">{String(request.response.data)}</pre>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent
          value="headers"
          className="flex-1 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
        >
          <ScrollArea className="h-full">
            <div className="grid grid-cols-[1fr_2fr] gap-2 p-4">
              {Object.entries(request.response.headers).map(([key, value]) => (
                <>
                  <div key={`key-${key}`} className="font-mono text-sm font-medium">
                    {key}
                  </div>
                  <div key={`value-${key}`} className="font-mono text-sm">
                    {value}
                  </div>
                </>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

