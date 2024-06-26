import { createContainer, asClass } from 'awilix'

import JudgeModelService from '../services/JudgeModelService'
import CandidateModelService from '../services/CandidateModelService.js'
import MetamorphicTestingService from '../services/MetamorphicTestingService'
import HttpClient from '../services/HttpClient'
import OllamaJudgeModelService from '../services/OllamaJudgeModelService'
import OpenAIGPTJudgeModelService from '../services/OpenAIGPTJudgeModelService'

function initContainer() {
    const container = createContainer()

    container.register({
        judgeModelService: asClass(JudgeModelService).singleton(),
        candidateModelService: asClass(CandidateModelService).singleton(),
        metamorphicTestingService: asClass(
            MetamorphicTestingService
        ).singleton(),
        httpClient: asClass(HttpClient).singleton(),
        ollamaJudgeModelService: asClass(OllamaJudgeModelService).singleton(),
        openAIGPTJudgeModelService: asClass(
            OpenAIGPTJudgeModelService
        ).singleton(),
    })
    return container
}

const container = initContainer()

export default container
