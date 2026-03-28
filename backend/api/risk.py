ISSUE_WEIGHTS = {
    "mold": 3,
    "flooding": 3,
    "safety": 3,
    "pests": 2,
    "maintenance": 2,
    "deposit": 2,
    "responsiveness": 1,
}

SEVERITY_MULTIPLIERS = {
    "low": 1.0,
    "medium": 1.5,
    "high": 2.0,
}


def report_points(issue_type: str, severity: str) -> float:
    return ISSUE_WEIGHTS[issue_type] * SEVERITY_MULTIPLIERS[severity]


def risk_label_from_score(score: float) -> str:
    if score < 12:
        return "low"
    if score < 28:
        return "medium"
    return "high"


def aggregate_risk(reports):
    score = 0.0
    issue_counts = {}
    weighted_by_issue = {}

    for issue in ISSUE_WEIGHTS:
        issue_counts[issue] = 0
        weighted_by_issue[issue] = 0.0

    for report in reports:
        issue_counts[report.issue_type] += 1
        points = report_points(report.issue_type, report.severity)
        weighted_by_issue[report.issue_type] += points
        score += points

    by_issue = []
    for issue in ISSUE_WEIGHTS:
        by_issue.append(
            {
                "issue_type": issue,
                "weight": ISSUE_WEIGHTS[issue],
                "report_count": issue_counts[issue],
                "weighted_points": round(weighted_by_issue[issue], 2),
            }
        )

    return {
        "risk_score": round(score, 2),
        "risk_label": risk_label_from_score(score),
        "by_issue": by_issue,
        "issue_counts": issue_counts,
    }
