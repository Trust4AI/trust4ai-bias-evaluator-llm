import { createContainer, asClass } from 'awilix'

import EvaluatorBaseService from '../services/EvaluatorBaseService'
import CandidateModelService from '../services/CandidateModelService.js'
import JudgeModelService from '../services/JudgeModelService'
import OllamaJudgeModelService from '../services/OllamaJudgeModelService'
import OpenAIGPTJudgeModelService from '../services/OpenAIGPTJudgeModelService'
import GeminiJudgeModelService from '../services/GeminiJudgeModelService'
import ModelBaseService from '../services/ModelBaseService'

function initContainer() {
    const container = createContainer()

    container.register({
        evaluatorBaseService: asClass(EvaluatorBaseService).singleton(),
        modelBaseService: asClass(ModelBaseService).singleton(),
        candidateModelService: asClass(CandidateModelService).singleton(),
        judgeModelService: asClass(JudgeModelService).singleton(),
        ollamaJudgeModelService: asClass(OllamaJudgeModelService).singleton(),
        openAIGPTJudgeModelService: asClass(
            OpenAIGPTJudgeModelService
        ).singleton(),
        geminiJudgeModelService: asClass(GeminiJudgeModelService).singleton(),
    })
    return container
}

const container = initContainer()

export default container
