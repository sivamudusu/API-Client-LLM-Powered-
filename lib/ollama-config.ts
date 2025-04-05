/**
 * Configuration and utilities for Ollama LLM integration
 */

export interface OllamaConfig {
    baseUrl: string
    model: string
    temperature: number
    maxTokens: number
    username?: string
    password?: string
}

// Get Ollama configuration from environment variables
export function getOllamaConfig(): OllamaConfig {
    return {
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        model: process.env.OLLAMA_MODEL || "llama3",
        temperature: Number.parseFloat(process.env.OLLAMA_TEMPERATURE || "0.7"),
        maxTokens: Number.parseInt(process.env.OLLAMA_MAX_TOKENS || "2048", 10),
        username: process.env.OLLAMA_USERNAME,
        password: process.env.OLLAMA_PASSWORD,
    }
}

// Prompt template for generating JSON bodies
export const JSON_GENERATION_PROMPT = `
  You are a helpful assistant that generates JSON request bodies for API calls.
  Based on the user's description, create a valid JSON object with appropriate fields and sample data.
  Make sure the JSON is valid and properly formatted.
  Only respond with the JSON object, nothing else.
  
  User's description: {{DESCRIPTION}}
  
  Generate a JSON request body:
  `

// Function to prepare the prompt with the user's description
export function prepareJsonGenerationPrompt(description: string): string {
    return JSON_GENERATION_PROMPT.replace("{{DESCRIPTION}}", description)
}

// Function to create Basic Auth header
export function createBasicAuthHeader(username?: string, password?: string): string | undefined {
    if (!username || !password) return undefined

    const credentials = `${username}:${password}`
    const encodedCredentials = Buffer.from(credentials).toString("base64")
    return `Basic ${encodedCredentials}`
}

