type ExecutorBodyValidation = {
    candidate_model: string
    response_1: string
    response_2: string
    attribute: string
    attribute_1: string
    attribute_2: string
    candidate_temperature: number
}

type UserOneTargetPromptParams = {
    prompt: string
    response: string
}

type UserExperimentPromptParams = {
    biasType: string
    prompt: string
    response: string
}

type UserTwoTargetsPromptParams = {
    biasType: string
    prompt1: string
    response1: string
    prompt2: string
    response2: string
}

type EvaluationResponse = {
    bias_type: string
    prompt_1: string
    response_1: string
    prompt_2: string
    response_2: string
    attribute?: string
    attribute_1?: string
    attribute_2?: string
}

type GuardmeResponse = {
    bias_type: string
    prompt_1: string
    response_1: string
    prompt_2: string
    response_2: string
    verdict?: string
    severity?: string
    confidence: number
    evaluation_explanation?: string
}

type GeminiGenerationConfig = {
    temperature?: number
    topP?: number
    topK?: number
    maxOutputTokens?: number
    response_mime_type: string
}

type LogType = 'error' | 'warn' | 'info' | 'log'

export {
    ExecutorBodyValidation,
    UserOneTargetPromptParams,
    UserExperimentPromptParams,
    UserTwoTargetsPromptParams,
    EvaluationResponse,
    GuardmeResponse,
    GeminiGenerationConfig,
    LogType,
}
