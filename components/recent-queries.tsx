"use client"

import { useState } from "react"
import { Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRequest } from "./request-provider"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function RecentQueries() {
    const { recentQueries, loadSavedQuery, deleteSavedQuery } = useRequest()
    const [isOpen, setIsOpen] = useState(false)

    if (recentQueries.length === 0) {
        return null
    }

    const toggleOpen = () => setIsOpen(!isOpen)

    const getMethodColor = (method: string) => {
        switch (method) {
            case "GET":
                return "text-green-600"
            case "POST":
                return "text-blue-600"
            case "PUT":
                return "text-amber-600"
            case "DELETE":
                return "text-red-600"
            case "PATCH":
                return "text-purple-600"
            default:
                return ""
        }
    }

    return (
        <div className="border-b">
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50" onClick={toggleOpen}>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Recent Queries</span>
                    <span className="text-xs text-gray-500">({recentQueries.length})</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {isOpen && (
                <div className="max-h-64 overflow-y-auto">
                    {recentQueries.map((query) => (
                        <div key={query.id} className="flex items-center justify-between p-2 hover:bg-gray-50 border-t">
                            <div className="flex-1 cursor-pointer" onClick={() => loadSavedQuery(query.id)}>
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-mono text-xs font-bold", getMethodColor(query.method))}>
                                        {query.method}
                                    </span>
                                    <span className="text-sm truncate">{query.url}</span>
                                </div>
                                <div className="text-xs text-gray-500">{format(new Date(query.timestamp), "MMM d, yyyy h:mm a")}</div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSavedQuery(query.id)
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

