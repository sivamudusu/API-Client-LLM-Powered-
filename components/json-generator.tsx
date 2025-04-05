"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface JsonGeneratorProps {
    onJsonGenerated: (json: string) => void
}

export default function JsonGenerator({ onJsonGenerated }: JsonGeneratorProps) {
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleGenerate = async () => {
        if (!description.trim()) {
            toast({
                title: "Description required",
                description: "Please enter a description of the JSON you want to generate.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/generate-json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ description }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate JSON")
            }

            if (data.json) {
                // Format the JSON nicely
                const formattedJson = JSON.stringify(JSON.parse(data.json), null, 2)
                onJsonGenerated(formattedJson)
                setOpen(false)
                setDescription("")
                toast({
                    title: "JSON Generated",
                    description: "The JSON has been generated and added to your request body.",
                })
            } else {
                throw new Error("No JSON was generated")
            }
        } catch (error) {
            console.error("Error generating JSON:", error)
            toast({
                title: "Error",
                description: String(error),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setOpen(true)}>
                <Wand2 className="h-3.5 w-3.5" />
                <span>Generate JSON</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Generate JSON Body</DialogTitle>
                        <DialogDescription>
                            Describe the JSON structure you need, and our AI will generate it for you.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Example: Create a user object with name, email, age, and an array of hobbies"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenerate} disabled={isLoading}>
                            {isLoading ? "Generating..." : "Generate JSON"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

