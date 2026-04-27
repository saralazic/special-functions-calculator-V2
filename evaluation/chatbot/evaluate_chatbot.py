"""
Chatbot evaluation script for the Special Functions Calculator.

Sends predefined questions to the LLM service and collects answers
into an HTML report with KaTeX rendering (matching the chatbot UI).

Runs both English and Serbian question sets in a single invocation.

Usage:
    1. Start Ollama (ollama serve).
    2. Start the LLM service (uvicorn main:app in llm-service/).
    3. Run: python evaluate_chatbot.py [--url http://localhost:8000] [--model qwen]
"""

import json
import sys
import argparse
import html
from datetime import datetime
from pathlib import Path
from collections import OrderedDict

import requests

SCRIPT_DIR = Path(__file__).resolve().parent

EVALUATION_RUNS = [
    {"input": SCRIPT_DIR / "chatbot_questions.json",    "output": SCRIPT_DIR / "chatbot_evaluation.html",    "language": "en"},
    {"input": SCRIPT_DIR / "chatbot_questions_sr.json",  "output": SCRIPT_DIR / "chatbot_evaluation_sr.html", "language": "sr"},
]

FUNCTION_LABELS = {
    "bessel1": "Bessel Function of the First Kind",
    "gamma": "Gamma Function",
    "beta": "Beta Function",
    "laguerre": "Laguerre Polynomial",
    "legendre": "Legendre Polynomial",
    "jacobi": "Jacobi Polynomial",
    "chebyshev1": "Chebyshev Polynomial of the First Kind",
    "chebyshev2": "Chebyshev Polynomial of the Second Kind",
    "hermite1": "Physicist's Hermite Polynomial",
    "hermite2": "Probabilist's Hermite Polynomial",
}


def send_question(base_url, question, model, language):
    """Send a question to the LLM chat endpoint and return the response text."""
    resp = requests.post(
        f"{base_url}/chat",
        json={"prompt": question, "model": model, "language": language},
        timeout=180,
    )
    resp.raise_for_status()
    return resp.json().get("response", "")


def build_html_report(results, model, base_url, language):
    """Build an HTML document with KaTeX rendering from the Q&A results."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    sections_html = []
    for func_type, qas in results.items():
        label = FUNCTION_LABELS.get(func_type, func_type)
        cards = []
        for qa in qas:
            q_escaped = html.escape(qa["question"])
            answer_text = qa["answer"]
            # Preserve newlines as <br> for plain-text portions,
            # but leave LaTeX delimiters intact for KaTeX
            answer_html = answer_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            answer_html = answer_html.replace("\n", "<br>\n")

            status_class = "success" if qa["status"] == "ok" else "error"
            status_badge = (
                '<span class="badge success">OK</span>'
                if qa["status"] == "ok"
                else f'<span class="badge error">ERROR</span>'
            )

            cards.append(f"""
            <div class="qa-card">
                <div class="question">
                    <span class="q-label">Q{qa['question_number']}.</span>
                    {q_escaped}
                    {status_badge}
                </div>
                <div class="answer">
                    {answer_html}
                </div>
            </div>
            """)

        sections_html.append(f"""
        <div class="function-section">
            <h2>{html.escape(label)}</h2>
            <p class="func-type-code">{html.escape(func_type)}</p>
            {"".join(cards)}
        </div>
        """)

    toc_items = []
    for func_type in results:
        label = FUNCTION_LABELS.get(func_type, func_type)
        toc_items.append(
            f'<li><a href="#{html.escape(func_type)}">{html.escape(label)}</a></li>'
        )

    # Add id anchors to sections
    sections_with_ids = []
    for func_type, section in zip(results.keys(), sections_html):
        section = section.replace(
            '<div class="function-section">',
            f'<div class="function-section" id="{html.escape(func_type)}">',
            1,
        )
        sections_with_ids.append(section)

    total_questions = sum(len(qas) for qas in results.values())
    total_ok = sum(1 for qas in results.values() for qa in qas if qa["status"] == "ok")
    total_err = total_questions - total_ok

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Evaluation Report</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
        onload="renderMathInElement(document.body, {{
            delimiters: [
                {{left: '$$', right: '$$', display: true}},
                {{left: '\\\\[', right: '\\\\]', display: true}},
                {{left: '$', right: '$', display: false}},
                {{left: '\\\\(', right: '\\\\)', display: false}}
            ],
            throwOnError: false
        }});">
    </script>
    <style>
        :root {{
            --bg: #0f1117;
            --surface: #1a1b26;
            --card: #1e1f2e;
            --border: #2a2b3d;
            --text: #e0e0e0;
            --text-muted: #888;
            --accent: #7c3aed;
            --accent-light: #a78bfa;
            --success: #22c55e;
            --error: #ef4444;
            --question-bg: #252640;
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.7;
            padding: 2rem;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
        }}
        header {{
            text-align: center;
            padding: 2rem 0 1.5rem;
            border-bottom: 1px solid var(--border);
            margin-bottom: 2rem;
        }}
        header h1 {{
            font-size: 1.8rem;
            color: var(--accent-light);
            margin-bottom: 0.5rem;
        }}
        .meta {{
            color: var(--text-muted);
            font-size: 0.9rem;
        }}
        .meta span {{
            margin: 0 0.75rem;
        }}
        .stats {{
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin: 1.5rem 0;
        }}
        .stat {{
            background: var(--surface);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            text-align: center;
        }}
        .stat .number {{
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--accent-light);
        }}
        .stat .label {{
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        .toc {{
            background: var(--surface);
            border-radius: 10px;
            padding: 1.5rem 2rem;
            margin-bottom: 2rem;
        }}
        .toc h3 {{
            color: var(--accent-light);
            margin-bottom: 0.75rem;
        }}
        .toc ol {{
            columns: 2;
            column-gap: 2rem;
            padding-left: 1.5rem;
        }}
        .toc li {{
            margin-bottom: 0.3rem;
        }}
        .toc a {{
            color: var(--text);
            text-decoration: none;
        }}
        .toc a:hover {{
            color: var(--accent-light);
        }}
        .function-section {{
            margin-bottom: 3rem;
        }}
        .function-section h2 {{
            font-size: 1.4rem;
            color: var(--accent-light);
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
        }}
        .func-type-code {{
            font-family: 'Fira Code', monospace;
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
        }}
        .qa-card {{
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 10px;
            margin-bottom: 1.25rem;
            overflow: hidden;
        }}
        .question {{
            background: var(--question-bg);
            padding: 1rem 1.25rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        .q-label {{
            color: var(--accent-light);
            font-weight: 700;
            min-width: 2rem;
        }}
        .badge {{
            font-size: 0.7rem;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-weight: 600;
            margin-left: auto;
            text-transform: uppercase;
        }}
        .badge.success {{
            background: rgba(34,197,94,0.15);
            color: var(--success);
        }}
        .badge.error {{
            background: rgba(239,68,68,0.15);
            color: var(--error);
        }}
        .answer {{
            padding: 1.25rem;
            line-height: 1.8;
        }}
        .answer .katex-display {{
            margin: 1rem 0;
        }}
        footer {{
            text-align: center;
            color: var(--text-muted);
            font-size: 0.8rem;
            padding: 2rem 0;
            border-top: 1px solid var(--border);
        }}
        @media print {{
            body {{ background: #fff; color: #111; padding: 1rem; }}
            .qa-card {{ border: 1px solid #ccc; break-inside: avoid; }}
            .question {{ background: #f0f0f0; }}
            .function-section {{ break-before: page; }}
            :root {{
                --bg: #fff; --surface: #f9f9f9; --card: #fff;
                --border: #ddd; --text: #111; --text-muted: #666;
                --accent: #5b21b6; --accent-light: #6d28d9;
                --question-bg: #f5f3ff;
            }}
        }}
    </style>
</head>
<body>
<div class="container">
    <header>
        <h1>Chatbot Evaluation Report</h1>
        <div class="meta">
            <span>{timestamp}</span>
            <span>Model: <strong>{html.escape(model)}</strong></span>
            <span>Selected language: <strong>{html.escape(language)}</strong></span>
            <span>LLM Service: {html.escape(base_url)}</span>
        </div>
    </header>

    <div class="stats">
        <div class="stat">
            <div class="number">{total_questions}</div>
            <div class="label">Questions</div>
        </div>
        <div class="stat">
            <div class="number">{len(results)}</div>
            <div class="label">Functions</div>
        </div>
        <div class="stat">
            <div class="number">{total_ok}</div>
            <div class="label">Answered</div>
        </div>
        <div class="stat">
            <div class="number">{total_err}</div>
            <div class="label">Errors</div>
        </div>
    </div>

    <div class="toc">
        <h3>Table of Contents</h3>
        <ol>
            {"".join(toc_items)}
        </ol>
    </div>

    {"".join(sections_with_ids)}

    <footer>
        Generated by evaluate_chatbot.py &mdash; Special Functions Calculator
    </footer>
</div>
</body>
</html>"""


def run_evaluation(base_url, model, input_path, output_path, language):
    """Run evaluation for a single question file and write the HTML report."""
    print(f"  Selected language: {language}")
    print(f"  Input:             {input_path}")
    print(f"  Output:            {output_path}")
    print()

    with open(input_path, "r") as f:
        questions = json.load(f)

    results = OrderedDict()
    total = len(questions)

    for i, entry in enumerate(questions, 1):
        func_type = entry["function_type"]
        q_num = entry["question_number"]
        question = entry["question"]

        print(f"  [{i}/{total}] {func_type} Q{q_num}: {question[:60]}...")

        try:
            answer = send_question(base_url, question, model, language)
            status = "ok"
            print(f"           -> {len(answer)} chars received")
        except requests.ConnectionError:
            print(f"  ERROR: Cannot connect to LLM service at {base_url}")
            print(f"  Make sure Ollama and the LLM service are running.")
            sys.exit(1)
        except Exception as e:
            answer = f"Error: {e}"
            status = "error"
            print(f"           -> ERROR: {e}")

        if func_type not in results:
            results[func_type] = []
        results[func_type].append({
            "question_number": q_num,
            "question": question,
            "answer": answer,
            "status": status,
        })

    report = build_html_report(results, model, base_url, language)
    with open(output_path, "w") as f:
        f.write(report)

    ok_count = sum(1 for qas in results.values() for qa in qas if qa["status"] == "ok")
    err_count = total - ok_count
    print(f"\n  Done! {ok_count}/{total} answered, {err_count} errors.")
    print(f"  Report: {output_path}\n")

    return ok_count, err_count


def main():
    parser = argparse.ArgumentParser(description="Evaluate chatbot answers for special functions")
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL of the LLM service (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--model",
        default="qwen",
        help="Model to use: 'qwen' or 'llama' (default: qwen)",
    )
    args = parser.parse_args()

    print(f"Chatbot evaluation")
    print(f"  LLM service: {args.url}")
    print(f"  Model:       {args.model}")
    print()

    total_ok = 0
    total_err = 0

    for run in EVALUATION_RUNS:
        input_path = run["input"]
        output_path = run["output"]
        language = run["language"]

        print(f"{'=' * 60}")
        ok, err = run_evaluation(args.url, args.model, input_path, output_path, language)
        total_ok += ok
        total_err += err

    print(f"{'=' * 60}")
    print(f"All done! Total: {total_ok} answered, {total_err} errors across {len(EVALUATION_RUNS)} runs.")
    print(f"Open reports in a browser to see rendered LaTeX.")


if __name__ == "__main__":
    main()
