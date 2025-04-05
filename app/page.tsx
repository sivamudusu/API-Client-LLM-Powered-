import type { Metadata } from "next"
import RequestPanel from "@/components/request-panel"
import ResponsePanel from "@/components/response-panel"
import { RequestProvider } from "@/components/request-provider"
import RecentQueries from "@/components/recent-queries"

export const metadata: Metadata = {
  title: "API Client",
  description: "A simple API client for testing HTTP requests",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-xl font-bold">API Client</h1>
      </div>
      <RequestProvider>
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="border-r flex flex-col">
            <RecentQueries />
            <div className="flex-1">
              <RequestPanel />
            </div>
          </div>
          <div>
            <ResponsePanel />
          </div>
        </div>
      </RequestProvider>
    </main>
  )
}

