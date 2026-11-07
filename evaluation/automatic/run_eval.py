import argparse
import json
import sys
from pathlib import Path
sys.path.append(str(Path.cwd().parent))

from metrics import calculate_metrics, get_function_from_catalogue
from enums import ChatbotQuestionProperty, QuestionProperty, MetricsProperty

EVAL_DIR = Path(__file__).resolve().parents[1]
GOLD_QUESTIONS = EVAL_DIR/"chatbot"/"gold"/ "questions.json"
CATALOGUE_PATH = EVAL_DIR/"chatbot"/"gold"/"functions_catalogue.json"
LANGUAGE_FILES = {
    "sr": EVAL_DIR/"chatbot"/"chatbot_questions_sr.json",
    "en": EVAL_DIR/"chatbot"/"chatbot_questions.json",
}


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def bessel_rows(language):
    gold = [
        item for item in load_json(GOLD_QUESTIONS)
        if item["function_type"] == "bessel1"
    ]
    text_by_id = {}
    for item in load_json(LANGUAGE_FILES[language]):
        item_id = item[ChatbotQuestionProperty.ID.value]
        if item_id in text_by_id:
            raise ValueError(f"Duplicate id in {language}: {item_id}")
        if item_id is not None:
            text_by_id[item_id] = item

    catalogue = load_json(CATALOGUE_PATH)
    record = get_function_from_catalogue(catalogue, "bessel1")
    rows = []
    for gold_question in gold:
        item_id = gold_question[QuestionProperty.ID.value]
        if item_id not in text_by_id:
            raise ValueError(f"{language} has no question for {item_id}")
        rows.append((text_by_id[item_id], gold_question, record))
    return rows


def mean(values):
    if not values:
        return None
    return sum(values) / len(values)


def percent_of_values_in_target(values, target):
    if not values:
        return None
    return 100.0 * sum(value == target for value in values) / len(values)

def format_metric_value(value):
    if value is None:
        return "None"
    if isinstance(value, float):
        return f"{value:.2f}"
    return str(value)

def summarize(rows, gold_by_id):
    test_rows = [row for row in rows if gold_by_id[row[MetricsProperty.ID.value]]["split"] == "test"]
    accuracy = [row[MetricsProperty.ACCURACY_SCORE.value] for row in test_rows if row[MetricsProperty.ACCURACY_SCORE.value] is not None]
    relevance = [row[MetricsProperty.RELEVANCE_SCORE.value] for row in test_rows if row[MetricsProperty.RELEVANCE_SCORE.value] is not None]
    faithfullness_binary = [row[MetricsProperty.FAITHFULLNESS_BINARY_SCORE.value] for row in test_rows if row[MetricsProperty.FAITHFULLNESS_BINARY_SCORE.value] is not None]
    faithfullness_relaxed = [row[MetricsProperty.FAITHFULLNESS_RELAXED_SCORE.value] for row in test_rows if row[MetricsProperty.FAITHFULLNESS_RELAXED_SCORE.value] is not None]
    null_accuracy = sum(row[MetricsProperty.ACCURACY_SCORE.value] is None for row in test_rows)
    return {
        "test_rows": len(test_rows),
        "accuracy_mean": mean(accuracy),
        "accuracy_exact_percent": percent_of_values_in_target(accuracy, 1),
        "relevance_percent": percent_of_values_in_target(relevance, 1),
        "faithfulness_binary_percent": percent_of_values_in_target(faithfullness_binary, 1),
        "faithfulness_relaxed_mean": mean(faithfullness_relaxed),
        "null_accuracy": null_accuracy,
    }


def main():
    parser = argparse.ArgumentParser(description="Score the Bessel gold questions")
    parser.add_argument("--url", default="http://localhost:8000")
    parser.add_argument("--model", default="qwen", choices=["qwen", "llama"])
    parser.add_argument("--language", default="sr", choices=["sr", "en"])
    args = parser.parse_args()

    paired = bessel_rows(args.language)
    gold_by_id = {gold["id"]: gold for _, gold, _ in paired}
    rows = []

    for index, (language_question, gold, record) in enumerate(paired, 1):
        print(f"[{index}/{len(paired)}] {gold['id']} ({gold['split']})")
        row = calculate_metrics(
            language_question, gold, record, args.url, args.model, args.language
        )
        rows.append(row)
        print(f"  question: {row[MetricsProperty.QUESTION.value]}")
        print(f"  status: {row[MetricsProperty.STATUS.value]}")
        print(f"  answer: {row[MetricsProperty.ANSWER.value]}")
        if "extracted" in row:
            print("  extracted:")
            print(json.dumps(row["extracted"], ensure_ascii=False, indent=2, default=list))
        print(
            "  scores:"
            f" accuracy={format_metric_value(row[MetricsProperty.ACCURACY_SCORE.value])} ({row[MetricsProperty.ACCURACY_REASON.value]});"
            f" relevance={format_metric_value(row[MetricsProperty.RELEVANCE_SCORE.value])} ({row[MetricsProperty.RELEVANCE_REASON.value]});"
            f" binary={format_metric_value(row[MetricsProperty.FAITHFULLNESS_BINARY_SCORE.value])},"
            f" relaxed={format_metric_value(row[MetricsProperty.FAITHFULLNESS_RELAXED_SCORE.value])}"
            f" ({row[MetricsProperty.FAITHFULLNESS_REASON.value]})"
        )
        print()

    totals = summarize(rows, gold_by_id)
    print("Test totals, dev row excluded, None dropped from each percent:")
    for key, value in totals.items():
        print(f"  {key}: {format_metric_value(value)}")


if __name__ == "__main__":
    main()