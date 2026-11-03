import sys 
from pathlib import Path
import requests

sys.path.append(str(Path.cwd().parent))

from enums import (
    QuestionKind, 
    RequirementType, 
    ObjectProperty, 
    ExtractedProperty, 
    Status, 
    CatalogueProperty, 
    QuestionProperty,
    RequirementProperty,
    Subject,
    Support,
    StatementProperty,
    Scoring
)

from judge import judge_answer, judge_support


# if subject is formula, we expect in response the content which contains definition_formula
content_type_rules = {
    "what_is": ["description", "definition_formula", "differential_equation"],
    "definition": ["description", "definition_formula"],
    "formula": ["definition_formula"],
    "differential_equation": ["differential_equation"],
    "application": ["application"]
}


# extracted = {
#     "statement_keys": {"variant", "notation"},
#     "objects": [
#         {"object_type": "definition_formula", "status": "correct"}
#     ],
#     "subject": "this_function",
#     "content_types": {"definition_formula", "application"},
#     "context": "tekst komada u kome stoji red za J_n",
#     "statements": [
#         {"content_type": "definition_formula", "support": "supported"},
#         {"content_type": "application", "support": "not_in_context"},
#     ],
# }

def extract_answer(answer, context, q_gold, catalogue_record):
    """
        Extracts objects and statements from answer
    """
    if answer is None or str(answer).strip() == "":
        return {
            ExtractedProperty.STATEMENT_KEYS.value: set(),
            ExtractedProperty.OBJECTS.value: [],
            ExtractedProperty.SUBJECT.value: Subject.UNCLEAR.value,
            ExtractedProperty.CONTENT_TYPES.value: set(),
            ExtractedProperty.CONTEXT.value: context,
            ExtractedProperty.STATEMENTS.value: [],
        }
        
    answer_analysis = judge_answer(answer, q_gold, catalogue_record)
    question_kind = q_gold[QuestionProperty.QUESTION_KIND.value]
    expected_content_types = content_type_rules.get(question_kind, [])
    
    claims = sorted(
        answer_analysis["claims"],
        key=lambda claim: 0 if claim["content_type"] in expected_content_types else 1,
    )
    content_types = set(answer_analysis["content_types"])
    statements = []
    for claim in claims:
        content_types.add(claim["content_type"])
        if context is None or len(context) == 0:
            support = Support.NOT_IN_CONTEXT.value
        else:
            support = judge_support(context, claim["text"])
        statements.append({
            StatementProperty.CONTENT_TYPE.value: claim["content_type"],
            StatementProperty.SUPPORT.value: support,
        })
    return {
        ExtractedProperty.STATEMENT_KEYS.value: answer_analysis["statement_keys"],
        ExtractedProperty.OBJECTS.value: answer_analysis["objects"],
        ExtractedProperty.SUBJECT.value: answer_analysis["subject"],
        ExtractedProperty.CONTENT_TYPES.value: content_types,
        ExtractedProperty.CONTEXT.value: context,
        ExtractedProperty.STATEMENTS.value: statements,
    }

def get_function_from_catalogue(catalogue, function_type):
    return next(
        (item for item in catalogue if item["function_type"] == function_type),
        None,
    )
 
def is_requirement_met(requirement, extracted_statements, extracted_objects):
    """
        Evaluates one requirement against extracted statements and objects
    """
    ## if requirement is text, 
    ## check if all statements are in extracted statements!
    if (requirement[ObjectProperty.OBJECT_TYPE.value] == RequirementType.TEXT.value):
        return all(statement in extracted_statements for statement in requirement[ExtractedProperty.STATEMENTS.value])
    
    ## if requirement is formula, equation or application 
    ## check if object which matches this requirement type is correct, if there is one!
    # (we can have multiple objects extracted, such as formula and equation both)
    return any(
        obj[ObjectProperty.OBJECT_TYPE.value] == requirement[ObjectProperty.OBJECT_TYPE.value] and obj[ObjectProperty.STATUS.value] == Status.CORRECT.value
        for obj in extracted_objects
    )


def accuracy_score(question, catalogue, extracted):
    """
        Calculates accuracy score based on question, catalogue for this function and extracted data from response
    """ 

    extracted_statements = extracted[ExtractedProperty.STATEMENT_KEYS.value] # set of keys for text statements
    extracted_objects = extracted[ExtractedProperty.OBJECTS.value] # list of objects {object_type, status}

    known_statements = catalogue[CatalogueProperty.TEXT_STATEMENTS.value]

    question_kind = question[QuestionProperty.QUESTION_KIND.value]
    function_type = catalogue[CatalogueProperty.FUNCTION_TYPE.value]
    partial_answer = question[QuestionProperty.PARTIAL_ANSWER.value]

    req_any = question[QuestionProperty.REQUIRED_ANY.value]

    ## check if gold matches statements from catalogue, raise exception if not 
    for statement in partial_answer:
        if statement not in known_statements:
            raise Exception("Partial answer contains unknown statement")

    for requirement in req_any:
        if requirement[RequirementProperty.OBJECT_TYPE.value] == RequirementType.TEXT.value:
            for statement in requirement[RequirementProperty.STATEMENTS.value]:
                if statement not in known_statements: 
                    raise Exception("Text form contains unknown statement")

    ## if gold is missing, evaluate with None to signal the need for manual evaluation
    if question_kind == QuestionKind.APPLICATION.value:
        applications = catalogue[CatalogueProperty.APPLICATIONS.value]
        if applications is None or len(applications) == 0:
            return {"score": None, "reason": f"Applications not found in catalogue for {function_type}"}
    
    if question_kind == QuestionKind.DIFF_EQ.value: 
        def_eq = catalogue[CatalogueProperty.DIFFERENTIAL_EQUATIONS.value]
        if def_eq is None or len(def_eq) == 0:
            return {"score": None, "reason": f"Differential equations not found in catalogue for: {function_type}"}

    if question_kind in [QuestionKind.FORMULA.value, QuestionKind.DEF.value]:
        points = catalogue[CatalogueProperty.POINTS.value]
        if points is None or len(points)==0:
            return {"score": None, "reason": f"Points not found in catalogue for {function_type}"}
        
    ## if response is for sibling function or is wrong, return 0
    for obj in extracted_objects:
        status = obj[ObjectProperty.STATUS.value]
        if (status in [Status.SIBLING.value, Status.WRONG.value]):
            return {"score": 0, "reason": f"{obj[ObjectProperty.OBJECT_TYPE.value]} is {status}"}

    ## Did response met any requirement?
    for requirement in req_any:
        if is_requirement_met(requirement, extracted_statements, extracted_objects):
            return {"score": 1, "reason": f"Met requirement {requirement[ObjectProperty.OBJECT_TYPE.value]} for {question_kind}" }
    
    ## If response is not complete, check if it matches partial answer
    if partial_answer:
        for statement in partial_answer:
            if statement not in extracted_statements:
                return {"score": 0, "reason": f"Missing required partial statement {statement} for {question_kind}"}

        return {"score": 0.5, "reason": f"Answer is partially correct for {question_kind}"}
    
    return {"score": None, "reason": f"{question_kind} didn't meet any branches in function!"}

def relevance_score(question, catalogue, extracted):
    """
        Calculates relevance based on question, catalogue and extracted data
    """
    # subject is one of: "this_function", "sibling", "other", "unclear"
    # content_types is a subset of: ["description", "definition_formula", "differential_equation", "application"]
    variant_required = True 
    if "variant_required" in question:
        variant_required = bool(question["variant_required"])
    
    extracted_subject = extracted[ExtractedProperty.SUBJECT.value]
    # for example, Bessel's equation covers both first and second kind, so variant_required = False
    if variant_required:
        matches_function = (extracted_subject == Subject.THIS_FUNCTION.value)
    else:
        matches_function = (extracted_subject in [Subject.THIS_FUNCTION.value, Subject.SIBLING.value])

    question_kind = question[QuestionProperty.QUESTION_KIND.value]
    content_types = extracted[ExtractedProperty.CONTENT_TYPES.value]

    if question_kind in content_type_rules:
        # check if content_type from response matches any of the content from rules 
        # for example, if question is "what is ..." we accept any of: description, formula or equation
        covers_question_kind = any(key in content_types for key in content_type_rules[question_kind])
    else:
        raise ValueError(f"Unknown question_kind: {question_kind}")

    if matches_function and covers_question_kind:
        return {"score": 1, "reason": "Matches function and covers question kind"}
    
    if not matches_function: 
        return {"score": 0, "reason": f"Subject is: {extracted_subject}"}
    
    return {"score": 0, "reason": f"contents = {content_types} don't cover question kind = {question_kind}"}
    
def faithfullness_score(question, catalogue, extracted):
    # extracted["statements"] is list of objects {content type, support}
    extracted_statements = extracted.get(ExtractedProperty.STATEMENTS.value)
    extracted_context = extracted.get(ExtractedProperty.CONTEXT.value)

    question_kind = question[QuestionProperty.QUESTION_KIND.value]

    if extracted_context is None or len(extracted_context) == 0:
        return { "binary": None, "relaxed": None, "reason": f"Context not found" }

    if extracted_statements is None or len(extracted_statements)==0:
        return { "binary": 0, "relaxed": 0, "reason": f"Statements not found" }
        
    all_supported = True 
    for statement in extracted_statements:
        if statement[StatementProperty.SUPPORT.value] != Support.SUPPORTED.value:
            all_supported = False
    
    if question_kind not in content_type_rules:
        raise ValueError(f"Unknown question_kind: {question_kind}")

    main_statement = None
    for statement in extracted_statements:
        if statement[StatementProperty.CONTENT_TYPE.value] in content_type_rules[question_kind]:
            main_statement = statement
            break

    main_supported = main_statement is not None and main_statement[StatementProperty.SUPPORT.value] == Support.SUPPORTED.value

    if all_supported:
        return { "binary": 1, "relaxed": 1, "reason": f"All statements supported by context" }

    if main_supported:
        return { "binary": 0, "relaxed": 0.5, "reason": f"Main statement supported, another statement is not" }

    return { "binary": 0, "relaxed": 0, "reason": f"Main statement is not supported by context" }


def calculate_metrics(language_question, q_gold, catalogue_record, base_url, model, language):
    text = language_question["question"]

    if catalogue_record is None:
        reason = f"Catalogue record not found for {text}"
        return {
            "id": q_gold[QuestionProperty.ID.value],
            "question": text,
            "answer": "",
            "context": None,
            "status": "error",
            "accuracy_score": None,
            "accuracy_reason": reason,
            "relevance_score": None,
            "relevance_reason": reason,
            "faithfullness_binary_score": None,
            "faithfullness_relaxed_score": None,
            "faithfullness_reason": reason,
        }

    try:
        resp = requests.post(
            f"{base_url}/chat",
            json={"prompt": text, "model": model, "language": language},
            timeout=180,
        )
        resp.raise_for_status()
        body = resp.json()
    except Exception as e:
        reason = f"{e}"
        return {
            "id": q_gold[QuestionProperty.ID.value],
            "question": text,
            "answer": reason,
            "context": None,
            "status": "error",
            "accuracy_score": None,
            "accuracy_reason": reason,
            "relevance_score": None,
            "relevance_reason": reason,
            "faithfullness_binary_score": None,
            "faithfullness_relaxed_score": None,
            "faithfullness_reason": reason,
        }
    
    answer = body.get("response", "")
    context = body.get("context")

    extracted = extract_answer(answer, context, q_gold, catalogue_record)

    accuracy = accuracy_score(q_gold, catalogue_record, extracted)
    relevance = relevance_score(q_gold, catalogue_record, extracted)
    faithfullness = faithfullness_score(q_gold, catalogue_record, extracted)

    return {
        "id": q_gold[QuestionProperty.ID.value],
        "question": text,
        "answer": answer, 
        "context": context, 
        "status": "ok",
        "accuracy_score": accuracy[Scoring.SCORE.value],
        "accuracy_reason": accuracy[Scoring.REASON.value],
        "relevance_score": relevance[Scoring.SCORE.value],
        "relevance_reason": relevance[Scoring.REASON.value],
        "faithfullness_binary_score": faithfullness[Scoring.BINARY.value], 
        "faithfullness_relaxed_score": faithfullness[Scoring.RELAXED.value], 
        "faithfullness_reason": faithfullness[Scoring.REASON.value], 
    }
