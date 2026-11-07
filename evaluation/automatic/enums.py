from enum import Enum

class FunctionType(Enum):
    BESSEL1 = "bessel1"
    BESSEL2 = "bessel2"
    LEGENDRE = "legendre"
    HERMITE = "hermite"

class QuestionKind(Enum):
    WHAT_IS = "what_is"
    DEF = "definition"
    APPLICATION = "application"
    DIFF_EQ = "differential_equation"
    FORMULA = "formula"


class RequirementType(Enum):
    DEF_FORMULA = "definition_formula"
    DIFF_EQ = "differential_equation"
    TEXT = "text"
    APPLICATION = "application"

class ObjectProperty(Enum):
    OBJECT_TYPE = "object_type"
    STATUS = "status"

class ExtractedProperty(Enum):
    STATEMENT_KEYS = "statement_keys"
    OBJECTS = "objects"
    SUBJECT = "subject"
    CONTENT_TYPES = "content_types"
    CONTEXT = "context"
    STATEMENTS = "statements"

class Subject(Enum):
    THIS_FUNCTION = "this_function"
    SIBLING = "sibling"
    OTHER = "other"
    UNCLEAR = "unclear"

class Support(Enum):
    SUPPORTED = "supported"
    CONTRADICTED = "contradicted"
    NOT_IN_CONTEXT = "not_in_context"


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

class CatalogueProperty(Enum):
    FUNCTION_TYPE = "function_type"
    VARIANT = "variant"
    SIBLING = "sibling"
    REFERENCE = "reference"
    POINTS = "points"
    DIFFERENTIAL_EQUATIONS = "differential_equations"
    WEIGHTS = "weights"
    APPLICATIONS = "applications"
    TEXT_STATEMENTS = "text_statements"

class QuestionProperty(Enum):
    ID = "id"
    FUNCTION_TYPE = "function_type"
    QUESTION_KIND = "question_kind"
    SPLIT = "split"
    REQUIRED_ANY = "required_any"
    PARTIAL_ANSWER = "partial_answer"
    VARIANT_REQUIRED = "variant_required"

class ChatbotQuestionProperty(Enum):
    ID = "id"
    FUNCTION_TYPE = "function_type"
    QUESTION_NUMBER = "question_number"
    QUESTION = "question"

class RequirementProperty(Enum):
    OBJECT_TYPE = "object_type"
    STATEMENTS = "statements"
    CHECK = "check"


class Status(Enum):
        CORRECT = "correct"
        WRONG = "wrong"
        SIBLING = "sibling"
        UNCLEAR = "unclear"

class StatementProperty(Enum):
    CONTENT_TYPE = "content_type"
    SUPPORT = "support"

class Scoring(Enum):
    SCORE = "score"
    BINARY = "binary"
    RELAXED = "relaxed"
    REASON = "reason"

class JudgeAnswerProperty(Enum):
    SUBJECT = "subject"
    CONTENT_TYPES = "content_types"
    STATEMENT_KEYS = "statement_keys"
    OBJECTS = "objects"
    CLAIMS = "claims"
    CONTENT_TYPE = "content_type"
    TEXT = "text"

class MetricsProperty(Enum):
    ID = "id"
    QUESTION = "question"
    ANSWER = "answer"
    CONTEXT = "context"
    STATUS = "status"
    ACCURACY_SCORE = "accuracy_score"
    ACCURACY_REASON = "accuracy_reason"
    RELEVANCE_SCORE = "relevance_score"
    RELEVANCE_REASON = "relevance_reason"
    FAITHFULLNESS_BINARY_SCORE = "faithfullness_binary_score"
    FAITHFULLNESS_RELAXED_SCORE = "faithfullness_relaxed_score"
    FAITHFULLNESS_REASON = "faithfullness_reason"