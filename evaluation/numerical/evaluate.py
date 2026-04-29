"""
Evaluation script for the Special Functions Calculator.

Compares backend results against high-precision reference values:
  - resultReal (float64)  vs  SciPy       (~15 significant digits)
  - result64   (64-digit) vs  mpmath      (80-digit arbitrary precision)

Computes MAE, RMSE, and Relative Error for each function type.

Usage:
    1. Start the backend server (e.g., npm run dev in the backend folder).
    2. Run: python evaluate.py [--url http://localhost:3000]
"""

import json
import sys
import argparse
from datetime import datetime
from pathlib import Path
from decimal import Decimal

import requests
import numpy as np
from scipy import special
import mpmath

mpmath.mp.dps = 80

SCRIPT_DIR = Path(__file__).resolve().parent
INPUT_FILE = SCRIPT_DIR / "test_inputs.json"
OUTPUT_FILE = SCRIPT_DIR / "evaluation_results.txt"


# ---------------------------------------------------------------------------
# SciPy references (float64 precision — for resultReal comparison)
# ---------------------------------------------------------------------------

def scipy_reference(function_type, params):
    """Compute ground truth using SciPy (float64 precision, ~15 digits)."""
    alpha = params.get("alpha", 0)
    x = params.get("x", 0)
    y = params.get("y", 0)
    a = params.get("a", 0)
    b = params.get("b", 0)

    if function_type == "bessel1":
        return float(special.jv(alpha, x))
    elif function_type == "gamma":
        return float(special.gamma(x))
    elif function_type == "beta":
        return float(special.beta(x, y))
    elif function_type == "laguerre":
        return float(special.eval_laguerre(int(alpha), x))
    elif function_type == "legendre":
        return float(special.eval_legendre(int(alpha), x))
    elif function_type == "jacobi":
        return float(special.eval_jacobi(int(alpha), a, b, x))
    elif function_type == "chebyshev1":
        return float(special.eval_chebyt(int(alpha), x))
    elif function_type == "chebyshev2":
        return float(special.eval_chebyu(int(alpha), x))
    elif function_type == "hermite1":
        return float(special.eval_hermite(int(alpha), x))
    elif function_type == "hermite2":
        return float(special.eval_hermitenorm(int(alpha), x))
    else:
        raise ValueError(f"Unknown function type: {function_type}")


# ---------------------------------------------------------------------------
# mpmath references (80-digit precision — for result64 comparison)
# ---------------------------------------------------------------------------

def mpmath_reference(function_type, params):
    """Compute ground truth using mpmath (80-digit precision)."""
    alpha = params.get("alpha", 0)
    x = mpmath.mpf(str(params.get("x", 0)))
    y = mpmath.mpf(str(params.get("y", 0)))
    a = mpmath.mpf(str(params.get("a", 0)))
    b = mpmath.mpf(str(params.get("b", 0)))

    if function_type == "bessel1":
        return mpmath.besselj(alpha, x)
    elif function_type == "gamma":
        return mpmath.gamma(x)
    elif function_type == "beta":
        return mpmath.beta(x, y)
    elif function_type == "laguerre":
        return _laguerre_recurrence(int(alpha), x)
    elif function_type == "legendre":
        return _legendre_recurrence(int(alpha), x)
    elif function_type == "jacobi":
        return _jacobi_recurrence(int(alpha), a, b, x)
    elif function_type == "chebyshev1":
        return _chebyshev_t_recurrence(int(alpha), x)
    elif function_type == "chebyshev2":
        return _chebyshev_u_recurrence(int(alpha), x)
    elif function_type == "hermite1":
        return _hermite_phys_recurrence(int(alpha), x)
    elif function_type == "hermite2":
        return _hermite_prob_recurrence(int(alpha), x)
    else:
        raise ValueError(f"Unknown function type: {function_type}")


# ---------------------------------------------------------------------------
# Three-term recurrence implementations (exact for polynomials)
# ---------------------------------------------------------------------------

def _laguerre_recurrence(n, x):
    """L_n(x): L0=1, L1=1-x, L_{k+1} = ((2k+1-x)*L_k - k*L_{k-1}) / (k+1)"""
    if n == 0:
        return mpmath.mpf(1)
    prev, curr = mpmath.mpf(1), mpmath.mpf(1) - x
    for k in range(1, n):
        prev, curr = curr, ((2 * k + 1 - x) * curr - k * prev) / (k + 1)
    return curr


def _legendre_recurrence(n, x):
    """P_n(x): P0=1, P1=x, (k+1)*P_{k+1} = (2k+1)*x*P_k - k*P_{k-1}"""
    if n == 0:
        return mpmath.mpf(1)
    prev, curr = mpmath.mpf(1), x
    for k in range(1, n):
        prev, curr = curr, ((2 * k + 1) * x * curr - k * prev) / (k + 1)
    return curr


def _jacobi_recurrence(n, a, b, x):
    """P_n^(a,b)(x) via the standard three-term recurrence."""
    if n == 0:
        return mpmath.mpf(1)
    prev = mpmath.mpf(1)
    curr = (a - b) / 2 + (a + b + 2) * x / 2
    for k in range(1, n):
        k1 = mpmath.mpf(k)
        t = 2 * k1 + a + b
        a1 = 2 * (k1 + 1) * (k1 + a + b + 1) * t
        a2 = (t + 1) * (a * a - b * b)
        a3 = t * (t + 1) * (t + 2)
        a4 = 2 * (k1 + a) * (k1 + b) * (t + 2)
        prev, curr = curr, ((a2 + a3 * x) * curr - a4 * prev) / a1
    return curr


def _chebyshev_t_recurrence(n, x):
    """T_n(x): T0=1, T1=x, T_{k+1} = 2x*T_k - T_{k-1}"""
    if n == 0:
        return mpmath.mpf(1)
    prev, curr = mpmath.mpf(1), x
    for _ in range(1, n):
        prev, curr = curr, 2 * x * curr - prev
    return curr


def _chebyshev_u_recurrence(n, x):
    """U_n(x): U0=1, U1=2x, U_{k+1} = 2x*U_k - U_{k-1}"""
    if n == 0:
        return mpmath.mpf(1)
    prev, curr = mpmath.mpf(1), 2 * x
    for _ in range(1, n):
        prev, curr = curr, 2 * x * curr - prev
    return curr


def _hermite_phys_recurrence(n, x):
    """H_n(x): H0=1, H1=2x, H_{k+1} = 2x*H_k - 2k*H_{k-1}"""
    if n == 0:
        return mpmath.mpf(1)
    prev, curr = mpmath.mpf(1), 2 * x
    for k in range(1, n):
        prev, curr = curr, 2 * x * curr - 2 * k * prev
    return curr


def _hermite_prob_recurrence(n, x):
    """He_n(x): He0=1, He1=x, He_{k+1} = x*He_k - k*He_{k-1}"""
    if n == 0:
        return mpmath.mpf(1)
    prev, curr = mpmath.mpf(1), x
    for k in range(1, n):
        prev, curr = curr, x * curr - k * prev
    return curr


# ---------------------------------------------------------------------------
# Backend API interaction
# ---------------------------------------------------------------------------

def build_request_body(function_type, params):
    """Build the POST body expected by the backend /api/calculate endpoint."""
    alpha = params.get("alpha", 0)
    x = params.get("x", 0)
    y = params.get("y", 0)
    a = params.get("a", 0)
    b = params.get("b", 0)
    eps = params.get("eps", 1e-15)

    params_real = {
        "alpha": alpha,
        "x": x,
        "y": y,
        "eps": eps,
        "a": a,
        "b": b,
    }

    params_big = {
        "alphaBig": str(alpha),
        "xBig": str(x),
        "yBig": str(y),
        "epsBig": "1e-64",
        "a": str(a),
        "b": str(b),
    }

    return {
        "functionType": function_type,
        "paramsReal": params_real,
        "params": params_big,
    }


def call_backend(base_url, function_type, params):
    """Call the backend API. Returns resultReal as float and result64 as raw string."""
    body = build_request_body(function_type, params)
    resp = requests.post(f"{base_url}/api/calculate", json=body, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return {
        "resultReal": float(data["resultReal"]),
        "result64_str": str(data["result64"]),
    }


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def compute_metrics(errors):
    """Compute MAE, RMSE from a list of absolute errors."""
    arr = np.array(errors, dtype=np.float64)
    return {
        "mae": float(np.mean(arr)),
        "rmse": float(np.sqrt(np.mean(arr ** 2))),
    }


def relative_error_float(computed, reference):
    """Relative error for float64 values. Returns None if reference is zero."""
    if reference == 0.0:
        return None if computed == 0.0 else float("inf")
    return abs(computed - reference) / abs(reference)


def relative_error_mp(computed_mp, reference_mp):
    """Relative error using mpmath. Returns None if reference is zero."""
    if reference_mp == 0:
        return None if computed_mp == 0 else mpmath.inf
    return abs(computed_mp - reference_mp) / abs(reference_mp)


def format_number(val, precision=15):
    """Format a number for display, handling None and mpmath types."""
    if val is None:
        return "N/A (ref=0)"
    val = float(val)
    if val == float("inf"):
        return "inf"
    return f"{val:.{precision}e}"


def format_mp(val, digits=64):
    """Format an mpmath number to a given number of significant digits."""
    if val is None:
        return "N/A"
    return mpmath.nstr(val, digits, strip_zeros=False)


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

def run_evaluation(base_url):
    """Run evaluation for all function types and return the report as a string."""
    with open(INPUT_FILE, "r") as f:
        test_data = json.load(f)

    lines = []
    lines.append("=" * 100)
    lines.append("SPECIAL FUNCTIONS CALCULATOR — EVALUATION REPORT")
    lines.append(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"Backend URL: {base_url}")
    lines.append(f"Reference for resultReal: SciPy (float64, ~15 significant digits)")
    lines.append(f"Reference for result64:   mpmath (80-digit arbitrary precision)")
    lines.append("=" * 100)
    lines.append("")

    summary_rows = []

    for func_type, func_data in test_data.items():
        description = func_data["description"]
        test_cases = func_data["test_cases"]

        lines.append("-" * 100)
        lines.append(f"Function: {func_type} — {description}")
        lines.append(f"Number of test cases: {len(test_cases)}")
        lines.append("-" * 100)

        abs_errors_real = []
        rel_errors_real = []
        abs_errors_64 = []
        rel_errors_64 = []
        case_lines = []

        for i, tc in enumerate(test_cases):
            scipy_ref = scipy_reference(func_type, tc)
            mp_ref = mpmath_reference(func_type, tc)

            try:
                backend = call_backend(base_url, func_type, tc)
                result_real = backend["resultReal"]
                result_64_str = backend["result64_str"]
                result_64_mp = mpmath.mpf(result_64_str)
            except Exception as e:
                case_lines.append(f"  Case {i+1}: {tc}")
                case_lines.append(f"    ERROR calling backend: {e}")
                case_lines.append("")
                continue

            # resultReal vs SciPy (float64)
            ae_real = abs(result_real - scipy_ref)
            re_real = relative_error_float(result_real, scipy_ref)

            # result64 vs mpmath (arbitrary precision)
            ae_64_mp = abs(result_64_mp - mp_ref)
            re_64_mp = relative_error_mp(result_64_mp, mp_ref)

            abs_errors_real.append(ae_real)
            if re_real is not None and re_real != float("inf"):
                rel_errors_real.append(re_real)

            ae_64_float = float(ae_64_mp)
            abs_errors_64.append(ae_64_float)
            if re_64_mp is not None and re_64_mp != mpmath.inf:
                rel_errors_64.append(float(re_64_mp))

            case_lines.append(f"  Case {i+1}: {tc}")
            case_lines.append(f"    SciPy ref (f64)   = {format_number(scipy_ref)}")
            case_lines.append(f"    mpmath ref (80d)  = {format_mp(mp_ref)}")
            case_lines.append(f"    resultReal        = {format_number(result_real)}")
            case_lines.append(f"    result64          = {result_64_str}")
            case_lines.append(f"    |err| real/scipy  = {format_number(ae_real)}")
            case_lines.append(f"    rel err real/scipy= {format_number(re_real)}")
            case_lines.append(f"    |err| 64/mpmath   = {format_mp(ae_64_mp)}")
            case_lines.append(f"    rel err 64/mpmath = {format_mp(re_64_mp)}")
            case_lines.append("")

        lines.append("")
        lines.append("  Per-case results:")
        lines.extend(case_lines)

        if abs_errors_real:
            metrics_real = compute_metrics(abs_errors_real)
            metrics_64 = compute_metrics(abs_errors_64)
            avg_rel_real = float(np.mean(rel_errors_real)) if rel_errors_real else None
            avg_rel_64 = float(np.mean(rel_errors_64)) if rel_errors_64 else None
            max_rel_real = float(np.max(rel_errors_real)) if rel_errors_real else None
            max_rel_64 = float(np.max(rel_errors_64)) if rel_errors_64 else None

            lines.append(f"  ── Aggregate metrics for {func_type} ──")
            lines.append(f"  resultReal vs SciPy (float64):")
            lines.append(f"    MAE               = {format_number(metrics_real['mae'])}")
            lines.append(f"    RMSE              = {format_number(metrics_real['rmse'])}")
            lines.append(f"    Avg Relative Err  = {format_number(avg_rel_real)}")
            lines.append(f"    Max Relative Err  = {format_number(max_rel_real)}")
            lines.append(f"  result64 vs mpmath (80-digit):")
            lines.append(f"    MAE               = {format_number(metrics_64['mae'])}")
            lines.append(f"    RMSE              = {format_number(metrics_64['rmse'])}")
            lines.append(f"    Avg Relative Err  = {format_number(avg_rel_64)}")
            lines.append(f"    Max Relative Err  = {format_number(max_rel_64)}")
            lines.append("")

            summary_rows.append({
                "func": func_type,
                "n": len(abs_errors_real),
                "mae_real": metrics_real["mae"],
                "rmse_real": metrics_real["rmse"],
                "avg_re_real": avg_rel_real,
                "mae_64": metrics_64["mae"],
                "rmse_64": metrics_64["rmse"],
                "avg_re_64": avg_rel_64,
            })
        else:
            lines.append("  No successful test cases — skipping metrics.")
            lines.append("")

    lines.append("")
    lines.append("=" * 100)
    lines.append("SUMMARY TABLE")
    lines.append("=" * 100)
    lines.append("")
    lines.append("resultReal compared against SciPy (float64, ~15 digits)")
    lines.append("result64   compared against mpmath (80-digit arbitrary precision)")
    lines.append("")

    header = (
        f"{'Function':<14} {'N':>3} │ "
        f"{'MAE(real)':>14} {'RMSE(real)':>14} {'AvgRE(real)':>14} │ "
        f"{'MAE(64)':>14} {'RMSE(64)':>14} {'AvgRE(64)':>14}"
    )
    lines.append(header)
    lines.append("─" * len(header))

    for r in summary_rows:
        row = (
            f"{r['func']:<14} {r['n']:>3} │ "
            f"{format_number(r['mae_real'], 6):>14} "
            f"{format_number(r['rmse_real'], 6):>14} "
            f"{format_number(r['avg_re_real'], 6):>14} │ "
            f"{format_number(r['mae_64'], 6):>14} "
            f"{format_number(r['rmse_64'], 6):>14} "
            f"{format_number(r['avg_re_64'], 6):>14}"
        )
        lines.append(row)

    lines.append("")
    lines.append("=" * 100)
    lines.append("END OF REPORT")
    lines.append("=" * 100)

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Evaluate special functions calculator accuracy")
    parser.add_argument(
        "--url",
        default="http://localhost:3000",
        help="Base URL of the backend server (default: http://localhost:3000)",
    )
    parser.add_argument(
        "--output",
        default=str(OUTPUT_FILE),
        help=f"Output file path (default: {OUTPUT_FILE})",
    )
    args = parser.parse_args()

    print(f"Running evaluation against {args.url} ...")
    print(f"Reading test inputs from {INPUT_FILE}")
    print(f"resultReal reference: SciPy (float64)")
    print(f"result64   reference: mpmath ({mpmath.mp.dps}-digit precision)")

    try:
        report = run_evaluation(args.url)
    except requests.ConnectionError:
        print(f"\nERROR: Cannot connect to backend at {args.url}")
        print("Make sure the backend server is running (e.g., npm run dev in the backend folder).")
        sys.exit(1)

    output_path = Path(args.output)
    with open(output_path, "w") as f:
        f.write(report)

    print(f"\nResults written to {output_path}")
    print("\n--- Quick Summary ---")
    for line in report.split("\n"):
        if line.startswith("Function") or line.startswith("─") or any(
            line.strip().startswith(ft) for ft in [
                "bessel1", "gamma", "beta", "laguerre", "legendre",
                "jacobi", "chebyshev1", "chebyshev2", "hermite1", "hermite2"
            ]
        ):
            print(line)


if __name__ == "__main__":
    main()
