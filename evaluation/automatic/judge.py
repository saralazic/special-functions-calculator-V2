import json 
import requests
from enums import (
    RequirementType, 
    CatalogueProperty, 
    QuestionProperty, 
    Subject, 
    Status, 
    ObjectProperty, 
    Support
) 

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

JUDGE_MODEL = "qwen2.5-math"

ALLOWED_CONTENT_TYPES = {
    "description",
    "definition_formula",
    "differential_equation",
    "application",
}

OBJECT_TYPES = {
    RequirementType.DEF_FORMULA.value,
    RequirementType.DIFF_EQ.value,
    RequirementType.APPLICATION.value,
}


def get_llm_judge_response(prompt):
    """
    Calls Ollama API to get a response for a given prompt and model.
    Parses response.
    """
    resp = requests.post(
        OLLAMA_URL,
        json={
            "model": JUDGE_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0, "num_predict": 1024},
        },
        timeout=180,
    )
    resp.raise_for_status()
    
    raw = resp.json().get("response", "")

    text = raw.strip()
    if text.startswith("```"):
        lines = [line for line in text.splitlines() if not line.strip().startswith("```")]
        text = "\n".join(lines).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Judge did not return JSON: {raw}") from e
    if not isinstance(data, dict):
        raise ValueError(f"Judge JSON is not an object: {raw}")
    return data

def validate_allowed_value(value, allowed, label):
    if value not in allowed:
        raise ValueError(f"Judge returned unknown {label}: {value}")
    return value


def validate_list(value, label):
    if not isinstance(value, list):
        raise ValueError(f"Judge field {label} is not a list: {value}")
    return value


def judge_answer(answer, q_gold, catalogue_record):
    text_statements = catalogue_record[CatalogueProperty.TEXT_STATEMENTS.value]
    gold_view = {
        "question_kind": q_gold[QuestionProperty.QUESTION_KIND.value],
        "function_type": catalogue_record[CatalogueProperty.FUNCTION_TYPE.value],
        "variant": catalogue_record[CatalogueProperty.VARIANT.value],
        "sibling": catalogue_record[CatalogueProperty.SIBLING.value],
        "reference": catalogue_record[CatalogueProperty.REFERENCE.value],
        "differential_equations": catalogue_record[CatalogueProperty.DIFFERENTIAL_EQUATIONS.value],
        "applications": catalogue_record[CatalogueProperty.APPLICATIONS.value],
        "text_statements": text_statements,
    }

    subjects = ", ".join(item.value for item in Subject)
    subject_prompt = f"""
"subject" is one of: {subjects}.
1. Use "{Subject.THIS_FUNCTION.value}" when the answer is about the asked variant.
Example: If question is "What is the Airy function of the first kind?", and answer refers to Airy function of the first kind (not the second kind, not some other function).
However, comparing this function with the other variant does not change the subject.

2. Use "{Subject.SIBLING.value}" when the answer is actually about the other variant of the same family.
Example: If question is "What is the Airy function of the first kind?", and answer references the second kind.

3. Use "{Subject.OTHER.value}" for a different function. 
Example: Question is on Airy function, answer referrs Gauss error function.

4. Use "{Subject.UNCLEAR.value}" when the subject cannot be told.
    """

    allowed_content = ", ".join(sorted(ALLOWED_CONTENT_TYPES))
    content_types_prompt = f"""
"content_types" is a subset of: {allowed_content}.
Include every action the answer actually performs.
Example 1: Answer contains only a textual definition, no mathematical expression and no application. We have ["description"].
Example 2: Answer contains text, mathematical expression for this function and its applications. We have ["description", "definition_formula", "application"]
    """


    obj_types = ", ".join(sorted(OBJECT_TYPES))

    statuses = ", ".join(item.value for item in Status)
    status_prompt = f"""
"status" is status of an object. It can be one of: {statuses}.
1. "{Status.CORRECT.value}" means the same mathematical object as reference, including another writing of that same function.
2. "{Status.SIBLING.value}" means the other function variant (example with Airy of first and second kind). 
3. "{Status.WRONG.value}" means a different object.
4. "{Status.UNCLEAR.value}" means the expression can't be identified (doesn't mean wrong).
    """

    prompt = f"""You label one chatbot answer about a special function.
Do not give a score. Do not use any retrieved context. The answer can be in either Serbian or English.

Catalogue:
{json.dumps(gold_view, ensure_ascii=False)}

Answer:
{answer}

Rules on forming the "subject":
{subject_prompt}

Rules on forming the "content_types":
{content_types_prompt}

"statement_keys" is a subset of the keys in text_statements.
The values in text_statements are instructions to you, not text the answer must copy.
Include a key only when the answer asserts that statement.

"objects" contains one item for each formula, differential equation, or application.
"object_type" is one of: {obj_types}.
"description" is never an object, it is a textual statement.

Rules on forming the "status":
{status_prompt}

"claims" contains one item per stated fact. Text should be split into claims.
"text" is a short quote from the answer, never a formula copied from the catalogue.
"content_type" uses the same vocabulary as content_types.
Every object has a matching claim. A description also has a claim.

Return one JSON object which looks like this:
{{
  "subject": "this_function",
  "content_types": ["description"],
  "statement_keys": ["variant"],
  "objects": [{{"object_type": "definition_formula", "status": "unclear"}}],
  "claims": [{{"content_type": "description", "text": "quote from the answer"}}]
}}
"""
    data = get_llm_judge_response(prompt)
    subject = validate_allowed_value(
        data.get("subject"),
        {item.value for item in Subject},
        "subject",
    )
    
    content_types = []
    for content_type in validate_list(data.get("content_types"), "content_types"):
        content_types.append(validate_allowed_value(content_type, ALLOWED_CONTENT_TYPES, "content_type"))

    statement_keys = []
    for key in validate_list(data.get("statement_keys"), "statement_keys"):
        if key not in text_statements:
            raise ValueError(f"Judge returned unknown statement key: {key}")
        statement_keys.append(key)

    objects = []
    for obj in validate_list(data.get("objects"), "objects"):
        if not isinstance(obj, dict):
            raise ValueError(f"Judge object is not an object: {obj}")
        objects.append({
            ObjectProperty.OBJECT_TYPE.value: validate_allowed_value(
                obj.get(ObjectProperty.OBJECT_TYPE.value), OBJECT_TYPES, "object_type"
            ),
            ObjectProperty.STATUS.value: validate_allowed_value(
                obj.get(ObjectProperty.STATUS.value),
                {item.value for item in Status},
                "status",
            ),
        })

    claims = []
    for claim in validate_list(data.get("claims"), "claims"):
        if not isinstance(claim, dict):
            raise ValueError(f"Judge claim is not an object: {claim}")
        text = claim.get("text")
        if not isinstance(text, str) or text.strip() == "":
            raise ValueError(f"Judge claim has no text: {claim}")
        claims.append({
            "content_type": validate_allowed_value(
                claim.get("content_type"), ALLOWED_CONTENT_TYPES, "claim content_type"
            ),
            "text": text.strip(),
        })

    return {
        "subject": subject,
        "content_types": set(content_types),
        "statement_keys": set(statement_keys),
        "objects": objects,
        "claims": claims,
    }


def judge_support(context, claim_text):
    prompt = f"""You check whether a retrieved context supports one claim.
Do not use outside knowledge. Do not decide whether the claim is mathematically true.
The claim and the context may be in different languages. Compare the meaning.

Context:
{context}

Claim:
{claim_text}

support is supported when the context states this claim.
support is contradicted when the context states the opposite.
support is not_in_context when the context does not state this claim.

Return one JSON object:
{{"support": "not_in_context"}}
"""
    data = get_llm_judge_response(prompt)
    return validate_allowed_value(
        data.get("support"),
        {item.value for item in Support},
        "support",
    )
  