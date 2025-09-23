import container from '../config/container'
import { EvaluationResponse } from '../types'
import { EvaluateResponsesDTO } from '../utils/objects/EvaluateResponsesDTO'
import { EvaluateTestDTO } from '../utils/objects/EvaluateTestDTO'
import { SendPromptsDTO } from '../utils/objects/SendPromptsDTO'
import CandidateModelService from './CandidateModelService'
import JudgeModelService from './JudgeModelService'
import MetricService from './MetricService'
//import { writeOutputToFile } from '../utils/fileUtils'

class EvaluatorBaseService {
    candidateModelService: CandidateModelService
    judgeModelService: JudgeModelService
    metricService: MetricService
    constructor() {
        this.candidateModelService = container.resolve('candidateModelService')
        this.judgeModelService = container.resolve('judgeModelService')
        this.metricService = container.resolve('metricService')
    }

    check() {
        return { message: 'The evaluation routes are working properly!' }
    }

    async evaluate(dto: EvaluateTestDTO) {
        const {
            candidateModel,
            evaluationMethod,
            prompt1,
            response1,
            prompt2,
            response2,
            attribute,
            attribute1,
            attribute2,
            biasType,
            judgeModels,
            responseMaxLength,
            listFormatResponse,
            excludeBiasReferences,
            candidateTemperature,
            judgeTemperature,
        } = dto

        let promptAux1 = prompt1
        let promptAux2 = prompt2
        let responseAux1 = response1
        let responseAux2 = response2

        if (!responseAux1 && !responseAux2) {
            let excludedText: string[]

            if (attribute) {
                excludedText = [
                    prompt1.includes(attribute) ? attribute : '',
                    prompt2.includes(attribute) ? attribute : '',
                ]
            } else {
                excludedText = [attribute1 || '', attribute2 || '']
            }

            const sendPromptsDTO: SendPromptsDTO = new SendPromptsDTO({
                candidateModel: candidateModel,
                evaluationMethod: evaluationMethod,
                prompt1: prompt1,
                prompt2: prompt2,
                responseMaxLength: responseMaxLength,
                listFormatResponse: listFormatResponse,
                excludeBiasReferences: excludeBiasReferences,
                excludedText: excludedText,
                candidateTemperature: candidateTemperature,
            })

            const result: any =
                await this.candidateModelService.sendPromptsToModel(
                    sendPromptsDTO
                )

            promptAux1 = result.prompt1
            promptAux2 = result.prompt2
            responseAux1 = result.response1
            responseAux2 = result.response2
        }

        const evaluateResponsesDTO: EvaluateResponsesDTO =
            new EvaluateResponsesDTO({
                biasType,
                prompt1: promptAux1,
                response1: responseAux1,
                prompt2: promptAux2,
                response2: responseAux2,
                evaluationMethod,
                judgeModels,
                judgeTemperature: judgeTemperature,
            })

        const response: EvaluationResponse =
            await this.judgeModelService.evaluateModelResponses(
                evaluateResponsesDTO
            )

        //writeOutputToFile(response)
        return response
    }

    compare(
        metric: string,
        threshold: number,
        response1: string,
        response2: string
    ) {
        const response = this.metricService.compare(
            metric,
            threshold,
            response1,
            response2
        )

        return response
    }

    async experiment(
        biasType: string,
        evaluationMethod: string,
        judgeModel: string,
        prompt: string,
        response: string,
        judgeTemperature: number
    ): Promise<any> {
        const res = await this.judgeModelService.executeExperiment(
            biasType,
            evaluationMethod,
            judgeModel,
            prompt,
            response,
            judgeTemperature
        )

        return res
    }
}

export default EvaluatorBaseService
