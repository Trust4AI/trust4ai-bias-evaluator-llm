import { Ajv, ValidateFunction } from 'ajv'
import { getPrompt } from '../utils/prompts/systemPrompts'
import {
    responseConsistencyPrompt as userResponseConsistencyPrompt,
    responseComparisonPrompt as userResponseComparisonPrompt,
} from '../utils/prompts/userPrompts'
import { judgeResponseValidation } from '../utils/validation/judgeResponseValidation'
import container from '../config/container'
import { openAIModels } from '../config/evaluatorModels'
import { debugLog } from '../utils/logUtils'

const ajv = new Ajv()

const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '5', 10)

class JudgeModelService {
    ollamaJudgeModelService: any
    openAIGPTJudgeModelService: any
    validate: ValidateFunction
    constructor() {
        this.ollamaJudgeModelService = container.resolve(
            'ollamaJudgeModelService'
        )
        this.openAIGPTJudgeModelService = container.resolve(
            'openAIGPTJudgeModelService'
        )
        this.validate = ajv.compile(judgeResponseValidation)
    }

    async evaluateModelResponses(
        role: string,
        biasType: string,
        prompt1: string,
        response1: string,
        prompt2: string,
        response2: string,
        generationExplanation: string,
        evaluationMethod: string,
        evaluatorModel: string
    ): Promise<JSON> {
        const evaluationPrompt = getPrompt(evaluationMethod)
        const userPrompt =
            evaluationMethod === 'consistency'
                ? userResponseConsistencyPrompt({
                      prompt: prompt2,
                      response: response1,
                  })
                : userResponseComparisonPrompt({
                      role,
                      biasType,
                      prompt1,
                      response1,
                      prompt2,
                      response2,
                  })

        try {
            const judgeEvaluation = await this.fetchModelComparison(
                evaluationPrompt,
                userPrompt,
                evaluatorModel
            )
            const res = JSON.parse(judgeEvaluation)

            return {
                role,
                bias_type: biasType,
                prompt_1: prompt1,
                response_1: response1,
                prompt_2: prompt2,
                response_2: response2,
                generation_explanation: generationExplanation,
                ...res,
            }
        } catch (error: any) {
            debugLog(
                `Failed to evaluate model responses: ${error.message}`,
                'error'
            )
            throw new Error(
                `[Evaluator] Failed to evaluate model responses: ${error.message}`
            )
        }
    }

    async fetchModelComparison(
        systemPrompt: string,
        userPrompt: string,
        evaluatorModel: string
    ): Promise<string> {
        let attempts = 0
        let content: string | undefined
        let evaluationError: any
        while (attempts < MAX_RETRIES) {
            try {
                content = await this.getModelService(
                    evaluatorModel
                ).fetchModelComparison(systemPrompt, userPrompt, evaluatorModel)

                if (content && content.includes('{') && content.includes('}')) {
                    const startIndex = content.indexOf('{')
                    const endIndex = content.lastIndexOf('}')
                    content = content.slice(startIndex, endIndex + 1)
                    const jsonContent = JSON.parse(content)

                    this.addMissingSeverity(jsonContent)
                    this.validateResponse(jsonContent)
                    return content
                }
                throw new Error(
                    '[EVALUATOR] The response from the model is not in the expected format'
                )
            } catch (error: any) {
                debugLog(
                    `Attempt ${attempts + 1} failed. Error: ${error.message}`,
                    'error'
                )
                attempts++
                evaluationError = error
            }
        }
        debugLog('Error evaluating model responses', 'error')
        throw new Error(evaluationError.message)
    }

    private getModelService(generatorModel: string) {
        return openAIModels.includes(generatorModel)
            ? this.openAIGPTJudgeModelService
            : this.ollamaJudgeModelService
    }

    private addMissingSeverity(jsonContent: any) {
        if (
            jsonContent.verdict === 'UNBIASED' &&
            !jsonContent.hasOwnProperty('severity')
        ) {
            jsonContent.severity = 'N/A'
        }
    }

    private async validateResponse(jsonContent: any): Promise<void> {
        if (!this.validate(jsonContent)) {
            throw new Error(
                `[EVALUATOR] Invalid response from model: ${JSON.stringify(
                    this.validate.errors
                )}`
            )
        }
    }
}

export default JudgeModelService
