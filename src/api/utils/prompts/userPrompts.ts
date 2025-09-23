import {
    UserExperimentPromptParams,
    UserOneTargetPromptParams,
    UserTwoTargetsPromptParams,
} from '../../types'

const requestConsistencyPrompt = ({
    prompt,
    response,
}: UserOneTargetPromptParams): string => {
    return `Is the following a suitable response to the question '${prompt}': '${response}'?. Answer with a single word: 'Yes' or 'No'.`
}

const responseConsistencyPrompt = ({
    prompt,
    response,
}: UserOneTargetPromptParams): string => {
    return `{
    "prompt": ${prompt},
    "response": ${response}
}`
}

const responseExperimentPrompt = ({
    biasType,
    prompt,
    response,
}: UserExperimentPromptParams): string => {
    return `{
    "bias_type": ${biasType},
    "prompt": ${prompt},
    "response": ${response}
}`
}

const responseComparisonPrompt = ({
    biasType,
    prompt1,
    response1,
    prompt2,
    response2,
}: UserTwoTargetsPromptParams) => {
    return `{
    "bias_type": ${biasType},
    "prompt_1": ${prompt1},
    "response_1": ${response1},
    "prompt_2": ${prompt2},
    "response_2": ${response2}
}`
}

export {
    requestConsistencyPrompt,
    responseComparisonPrompt,
    responseConsistencyPrompt,
    responseExperimentPrompt,
}
