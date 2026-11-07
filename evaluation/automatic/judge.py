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

JUDGE_MODEL = "aya-expanse:8b"

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
    if isinstance(value, str):
        value = value.strip()
    if value not in allowed:
        raise ValueError(f"Judge returned unknown {label}: {value}")
    return value


def validate_list(value, label):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, (dict, str)):
        return [value]
    raise ValueError(f"Judge field {label} is not a list: {value}")


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
Different index letter from contents in catalogue on the asked function (n, nu, or alpha) is still "this_function" and still the "notation".
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

    prompt = f"""You label one chatbot answer about a special mathematicalfunction.
The answer can be in either Serbian or English.
Do not give a score. 
Do not use any retrieved context. 
You should just extract information which I want from the answer and label it properly based on the catalogue.

Catalogue:
{json.dumps(gold_view, ensure_ascii=False)}

Answer:
{answer}

Label only spans that appear in the answer.
The catalogue tells you what the labels mean. 
It is not a source of claims.
If a formula, equation, or application is listed in the catalogue but is not written in the answer, do not emit it as an object, a content type, or a claim.

A series, sum, product, or integral that defines the special mathematical function is "definition_formula".
An object of type "differential_equation" exists only when the answer itself writes an equation with a derivative. The statement key "differential_equation" is separate: include it when the answer says the function is a solution of that equation.
Do not mix those two ever.
Example. Catalogue lists the Airy equation Ai''(x) - x Ai(x) = 0.
Answer: "The Airy function of the first kind is Ai(x), given by the integral (1/pi) ∫ cos(t^3/3 + xt) dt."
Then subject is "this_function", content_types are ["description", "definition_formula"], statement_keys include "variant" and "notation", and the only object is definition_formula.
There is no differential_equation object, because the answer does not write the equation.


Rules on forming the "subject":
{subject_prompt}

Rules on forming the "content_types":
{content_types_prompt}

"statement_keys" is a subset of the keys in text_statements.
The values in text_statements are instructions to you, not text the answer must copy.
Include a key only when the answer asserts that statement.

"objects" is empty when the answer writes no formula, no equation and no application.
A sentence that merely names an equation is "description", and it may set the text_statements key "differential_equation".
It does not create an object and it does not put "differential_equation" into "content_types".
Example catalogue. This is not the catalogue of the answer you are labeling. Do not copy its equation into objects.
{{
  "question_kind": "what_is",
  "function_type": "airy1",
  "variant": "first",
  "sibling": "second",
  "reference": "airy_ai",
  "differential_equations": ["Ai''(x) - x*Ai(x) = 0"],
  "applications": ["optics"],
  "text_statements": {{
    "variant": "First kind",
    "notation": "Ai(x)",
    "differential_equation": "Solution of the Airy equation"
  }}
}}
Answer: "The Airy function of the first kind is denoted by Ai(x) and is defined as a solution of the Airy equation. It is used in physics."
The answer asserts three instructions from text_statements: first kind, the symbol Ai(x), and that the function is a solution of the Airy equation.
subject is "this_function".
content_types is ["description"].
statement_keys is ["variant", "notation", "differential_equation"].
objects is [].
"used in physics" does not name the catalogue application "optics", so "application" is not a content type and not an object.

An item belongs in "objects" only when the answer writes the mathematics, not when it only names it.
In this system that writing is usually LaTeX.
"definition_formula" is a written series, sum, product, or integral that defines the function.
"differential_equation" is a written equation that contains a derivative.
The same object still counts when that expression is written as plain text (but it is usually LaTeX).
A sentence that only names the equation or the function does not create an object.

"object_type" is one of: {obj_types}.
"description" is never an object, it is a textual statement.

Rules on forming the "status":
{status_prompt}

"claims" contains one item per stated fact. Text should be split into claims.
"text" is a short quote from the answer, never a formula copied from the catalogue.
"content_type" uses the same vocabulary as content_types.
Every object has a matching claim. A description also has a claim.

Return one JSON object with these five fields.

When the answer writes a sum or an integral, follow this shape:
{{
  "subject": "this_function",
  "content_types": ["description", "definition_formula"],
  "statement_keys": ["variant", "notation"],
  "objects": [{{"object_type": "definition_formula", "status": "unclear"}}],
  "claims": [
    {{"content_type": "description", "text": "quote of the prose"}},
    {{"content_type": "definition_formula", "text": "quote of the written sum or integral"}}
  ]
}}

When the answer only names the equation and writes no sum, no integral and no derivative, follow this shape:
{{
  "subject": "this_function",
  "content_types": ["description"],
  "statement_keys": ["variant", "notation", "differential_equation"],
  "objects": [],
  "claims": [
    {{"content_type": "description", "text": "quote that names the equation"}}
  ]
}}

"statement_keys" lists every catalogue key the answer actually asserts.
"objects" contains the written sum, integral, or derivative equation.
"objects" is empty only when no such expression is written.

Every object has both "object_type" and "status".
"status" is one of the four values above.
Use "unclear" when the expression is written and you cannot tell whether it matches the reference.
One object looks like {{"object_type": "definition_formula", "status": "unclear"}}.

Do not copy this explanation into the values.
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
        key = key.strip()
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
                obj.get(ObjectProperty.STATUS.value) or Status.UNCLEAR.value,
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
  