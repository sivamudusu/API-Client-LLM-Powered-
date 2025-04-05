import { type NextRequest, NextResponse } from "next/server"
import { getOllamaConfig, prepareJsonGenerationPrompt, createBasicAuthHeader } from "@/lib/ollama-config"

export async function POST(request: NextRequest) {
    try {
        const { description } = await request.json()

        if (!description) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 })
        }

        const config = getOllamaConfig()
        const prompt = prepareJsonGenerationPrompt(description)

        // Prepare headers with authentication if provided
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        }

        // Add Basic Auth header if credentials are provided
        const authHeader = createBasicAuthHeader(config.username, config.password)
        if (authHeader) {
            headers["Authorization"] = authHeader
        }

        // Make request to Ollama API
        const response = await fetch(`${config.baseUrl}/api/generate`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: config.model,
                prompt: prompt,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                stream: false,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Ollama API error: ${response.status} ${errorText}`)
        }

        const data = await response.json()

        // Extract the JSON from the response
        let jsonResponse = data.response

        // Try to clean up the response if it contains markdown code blocks
        if (jsonResponse.includes("```json")) {
            jsonResponse = jsonResponse.split("```json")[1].split("```")[0].trim()
        } else if (jsonResponse.includes("```")) {
            jsonResponse = jsonResponse.split("```")[1].split("```")[0].trim()
        }

        // Validate that the response is valid JSON
        try {
            JSON.parse(jsonResponse)
            return NextResponse.json({ json: jsonResponse })
        } catch (e) {
            return NextResponse.json(
                {
                    error: "Generated response is not valid JSON",
                    rawResponse: data.response,
                },
                { status: 500 },
            )
        }
    } catch (error) {
        console.error("Error generating JSON:", error)
        return NextResponse.json({ error: "Failed to generate JSON", details: String(error) }, { status: 500 })
    }
}

