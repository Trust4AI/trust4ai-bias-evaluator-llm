import { check, body } from 'express-validator'
import { getCandidateModels, getJudgeModelsList } from '../../utils/modelUtils'
import { getEvaluationMethods } from '../../utils/prompts/promptTemplate'
import { ExecutorBodyValidation } from '../../types'

const evaluate = [
    check('candidate_model')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage(
            `candidate_model must be a string with at least 1 character, and one of the following values: [${getCandidateModels().join(
                ', '
            )}]`
        )
        .custom((value: string): boolean => {
            const candidateModels: string[] = getCandidateModels()
            if (value && !candidateModels.includes(value)) {
                throw new Error(
                    `candidate_model must be a string, if provided, with one of the following values: [${candidateModels.join(
                        ', '
                    )}].`
                )
            }
            return true
        }),
    check('judge_models')
        .isArray()
        .withMessage('judge_models must be an array of strings')
        .custom((value: string[]): boolean => {
            const judgeModels: string[] = getJudgeModelsList()
            if (value) {
                const invalidModels: string[] = value.filter(
                    (model: string) => !judgeModels.includes(model)
                )
                if (invalidModels.length > 0) {
                    throw new Error(
                        `Invalid judge models: ${invalidModels.join(
                            ', '
                        )}. Valid options are: [${judgeModels.join(', ')}].`
                    )
                } else if (value.length % 2 === 0) {
                    throw new Error(`The number of judge models must be odd.`)
                }
            }
            return true
        }),
    check('evaluation_method')
        .optional()
        .isString()
        .isIn(getEvaluationMethods())
        .trim()
        .withMessage(
            `evaluation_method is optional but if provided must be a string with one of the values: [${getEvaluationMethods().join(
                ', '
            )}]`
        ),
    check('bias_type')
        .isString()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('bias_type must be a string with length between 1 and 30'),
    check('prompt_1')
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage('prompt_1 must be a string with at least 1 character'),
    check('prompt_2')
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage('prompt_2 must be a string with at least 1 character'),
    check('response_1')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage(
            'response_1 is optional but if provided must be a string with a minimum length of 1'
        ),
    check('response_2')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage(
            'response_2 is optional but if provided must be a string with a minimum length of 1'
        ),
    check('attribute')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage(
            'attribute is optional but if provided must be a string with length between 1 and 30'
        ),
    check('attribute_1')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage(
            'attribute_1 is optional but if provided must be a string with length between 1 and 30'
        ),
    check('attribute_2')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage(
            'attribute_2 is optional but if provided must be a string with length between 1 and 30'
        ),
    check('response_max_length')
        .optional()
        .isInt({ min: 1, max: 2000 })
        .withMessage(
            'response_max_length is optional but must be an integer between 1 and 2000 if provided'
        ),
    check('list_format_response')
        .optional()
        .isBoolean()
        .withMessage(
            'list_format_response is optional but must be a boolean if provided'
        ),
    check('exclude_bias_references')
        .optional()
        .isBoolean()
        .withMessage(
            'exclude_bias_references is optional but must be a boolean if provided'
        ),
    check('candidate_temperature')
        .optional()
        .isFloat({ min: 0.0, max: 1.0 })
        .withMessage(
            'candidate_temperature is optional but must be a float between 0.0 and 1.0 if provided'
        ),
    check('judge_temperature')
        .optional()
        .isFloat({ min: 0.0, max: 1.0 })
        .withMessage(
            'judge_temperature is optional but must be a float between 0.0 and 1.0 if provided'
        ),
    body().custom((value, { req }) => {
        const {
            candidate_model,
            response_1,
            response_2,
            attribute,
            attribute_1,
            attribute_2,
            candidate_temperature,
        }: ExecutorBodyValidation = req.body

        if (
            (candidate_model && (response_1 || response_2)) ||
            (!candidate_model && (!response_1 || !response_2)) ||
            (candidate_model && response_1 && response_2) ||
            (!candidate_model && !response_1 && !response_2)
        ) {
            throw new Error(
                'You must provide either "candidate_model" or both "response_1" and "response_2", but not all three or none.'
            )
        } else if (
            !(response_1 && response_2) &&
            ((attribute && attribute_1) ||
                (attribute && attribute_2) ||
                (!attribute && (!attribute_1 || !attribute_2)) ||
                (attribute && attribute_1 && attribute_2))
        ) {
            throw new Error(
                'You must provide either "attribute" or both "attribute_1" and "attribute_2", but not all three or none.'
            )
        } else if (!candidate_model && candidate_temperature) {
            throw new Error(
                'You must provide "candidate_model" if you want to set "candidate_temperature".'
            )
        }
        return true
    }),
]

const metrics: string[] = [
    'difference',
    'yes_no_question',
    'multiple_choice',
    'spearman',
    'kendall',
]

const compare = [
    check('metric')
        .isString()
        .trim()
        .isIn(metrics)
        .withMessage(
            `metric must be a string with one of the values: [${metrics.join(
                ', '
            )}]`
        ),
    check('threshold')
        .if(
            (value, { req }) =>
                req.body.metric === 'difference' ||
                req.body.metric === 'spearman' ||
                req.body.metric === 'kendall'
        )
        .notEmpty()
        .withMessage(
            'threshold is required for "difference", "spearman", and "kendall" metrics'
        )
        .isNumeric()
        .withMessage('threshold must be a number')
        .custom((value, { req }) => {
            if (req.body.metric === 'difference' && (value < 1 || value > 4)) {
                throw new Error(
                    'For "difference", threshold must be between 1 and 4'
                )
            }
            if (
                (req.body.metric === 'spearman' ||
                    req.body.metric === 'kendall') &&
                (value < 0.1 || value > 0.9)
            ) {
                throw new Error(
                    'For "spearman" and "kendall", threshold must be between 0.1 and 0.9'
                )
            }
            return true
        }),
    check('response_1')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage(
            'response_1 is optional but if provided must be a string with a minimum length of 1'
        ),
    check('response_2')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage(
            'response_2 is optional but if provided must be a string with a minimum length of 1'
        ),
]

const experiment = [
    check('bias_type')
        .isString()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('bias_type must be a string with length between 1 and 30'),
    check('evaluation_method')
        .optional()
        .isString()
        .trim()
        .isIn(['attribute_comparison', 'proper_nouns_comparison'])
        .withMessage(
            `evaluation_method is optional but if provided must be a string with one of the values: [attribute_comparison, proper_nouns_comparison]`
        ),
    check('judge_model')
        .isString()
        .trim()
        .isIn(getJudgeModelsList())
        .withMessage(
            `judge_model is optional but if provided must be a string with one of the values: [${getJudgeModelsList().join(
                ', '
            )}]`
        ),
    check('prompt')
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage('prompt must be a string with a minimum length of 1'),
    check('response')
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage('response must be a string with a minimum length of 1'),
    check('judge_temperature')
        .optional()
        .isFloat({ min: 0.0, max: 1.0 })
        .withMessage(
            'judge_temperature is optional but must be a float between 0.0 and 1.0 if provided'
        ),
]

export { evaluate, compare, experiment }
