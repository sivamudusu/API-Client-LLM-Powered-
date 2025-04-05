"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface JsonViewProps {
    data: any
    level?: number
    isLast?: boolean
    isCollapsible?: boolean
    defaultExpanded?: boolean
}

export default function JsonView({
    data,
    level = 0,
    isLast = true,
    isCollapsible = true,
    defaultExpanded = true,
}: JsonViewProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const toggleExpand = () => {
        if (isCollapsible) {
            setIsExpanded(!isExpanded)
        }
    }

    const getDataType = (value: any): string => {
        if (value === null) return "null"
        if (Array.isArray(value)) return "array"
        return typeof value
    }

    const getTypeColor = (type: string): string => {
        switch (type) {
            case "string":
                return "text-green-600 dark:text-green-400"
            case "number":
                return "text-blue-600 dark:text-blue-400"
            case "boolean":
                return "text-purple-600 dark:text-purple-400"
            case "null":
                return "text-gray-500 dark:text-gray-400"
            default:
                return "text-foreground"
        }
    }

    const renderValue = (value: any, key?: string, isArrayItem = false, index?: number) => {
        const type = getDataType(value)
        const isExpandable = type === "object" || type === "array"
        const canCollapse = isExpandable && isCollapsible
        const indent = level * 16

        // For array items or object properties
        const keyContent =
            key !== undefined ? (
                <span className="text-red-600 dark:text-red-400">
                    {isArrayItem ? index : `"${key}"`}
                    <span className="text-gray-600 dark:text-gray-400">{isArrayItem ? "" : ": "}</span>
                </span>
            ) : null

        if (isExpandable) {
            const isArray = Array.isArray(value)
            const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0
            const bracketOpen = isArray ? "[" : "{"
            const bracketClose = isArray ? "]" : "}"

            return (
                <div className="font-mono text-sm">
                    <div
                        className={cn("flex items-center", canCollapse && "cursor-pointer")}
                        onClick={toggleExpand}
                        style={{ paddingLeft: `${indent}px` }}
                    >
                        {canCollapse && (
                            <span className="mr-1">
                                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </span>
                        )}
                        {keyContent}
                        <span>{bracketOpen}</span>
                        {isEmpty && <span>{bracketClose}</span>}
                        {!isExpanded && !isEmpty && <span>…{bracketClose}</span>}
                        {!isLast && <span>,</span>}
                    </div>

                    {isExpanded && !isEmpty && (
                        <>
                            {isArray
                                ? value.map((item: any, i: number) => <div key={i}>{renderValue(item, undefined, true, i)}</div>)
                                : Object.entries(value).map(([k, v], i, arr) => (
                                    <div key={k}>{renderValue(v, k, false, undefined)}</div>
                                ))}
                            <div style={{ paddingLeft: `${indent}px` }}>
                                <span>{bracketClose}</span>
                                {!isLast && <span>,</span>}
                            </div>
                        </>
                    )}
                </div>
            )
        } else {
            // For primitive values
            let displayValue: React.ReactNode

            if (type === "string") {
                displayValue = <span className={getTypeColor(type)}>{`"${value}"`}</span>
            } else if (type === "null") {
                displayValue = <span className={getTypeColor(type)}>null</span>
            } else {
                displayValue = <span className={getTypeColor(type)}>{String(value)}</span>
            }

            return (
                <div className="font-mono text-sm flex" style={{ paddingLeft: `${indent}px` }}>
                    {keyContent}
                    {displayValue}
                    {!isLast && <span>,</span>}
                </div>
            )
        }
    }

    return renderValue(data)
}

