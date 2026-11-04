"""Evidence-based scale selection. Model labels are observations, never truth."""
import math
import statistics
from .store import LabError


def positive(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and 0 < value <= 1000000


def texts(value, limit=20):
    return [item[:500] for item in value[:limit] if isinstance(item, str)] if isinstance(value, list) else []


def anchor(value, width, height, allowed_sources):
    if not isinstance(value, dict) or value.get("source") not in allowed_sources or not positive(value.get("lengthMm")):
        raise LabError("scale_evidence_invalid", "尺度锚点缺少可靠来源或正数标注长度。", 422)
    points = []
    for key in ("p1", "p2"):
        point = value.get(key)
        if not isinstance(point, list) or len(point) != 2 or any(not isinstance(n, (int, float)) or isinstance(n, bool) or not math.isfinite(n) for n in point) or not 0 <= point[0] <= width or not 0 <= point[1] <= height:
            raise LabError("scale_evidence_invalid", "尺度锚点必须位于原图像素范围内。", 422)
        points.append(point)
    pixels = math.dist(*points)
    if pixels <= 0:
        raise LabError("scale_evidence_invalid", "尺度锚点不能重合。", 422)
    return {"label": str(value.get("label", "尺度参考"))[:200], "p1": points[0], "p2": points[1], "lengthMm": value["lengthMm"], "source": value["source"]}, value["lengthMm"] / pixels


def validate_scale_input(payload, asset):
    mode = payload.get("scaleMode", "auto")
    if mode not in ("auto", "manual", "calibrated"):
        raise LabError("invalid_scale_mode", "比例模式仅支持 auto、calibrated、manual。")
    if mode == "manual" and not positive(payload.get("mmPerPixel")):
        raise LabError("scale_required", "手动比例必须提供正数 mmPerPixel。")
    if mode == "calibrated":
        supplied = payload.get("calibration")
        if not isinstance(supplied, dict):
            raise LabError("calibration_required", "请提供两点及其已知毫米长度。")
        anchor({**supplied, "source": "user_measurement"}, asset["width"], asset["height"], {"user_measurement"})


def choose_scale(payload, analysis, asset):
    """Compute annotated ratios ourselves; never trust a model's mode upgrade."""
    validate_scale_input(payload, asset)
    mode = payload.get("scaleMode", "auto")
    common = {"assumptions": ["比例为图纸标定或估算，不代表现场测量精度。"]}
    if mode == "manual":
        return {**common, "mode": "manual", "mmPerPixel": payload["mmPerPixel"], "confidence": "medium", "evidence": ["采用用户显式输入的毫米/原图像素比例，分析不会覆盖该值。"], "anchors": []}
    if mode == "calibrated":
        item, ratio = anchor({**payload["calibration"], "source": "user_measurement", "label": "用户两点标定"}, asset["width"], asset["height"], {"user_measurement"})
        return {**common, "mode": "measured", "mmPerPixel": ratio, "confidence": "medium", "evidence": ["由用户两点的原图像素距离与已知长度计算；没有独立核验标注真值。"], "anchors": [item]}
    scale = analysis.get("scale", analysis.get("scaleProvenance", {}))
    if not isinstance(scale, dict):
        raise LabError("scale_unknown", "未能获得有依据的自动比例，请标定或手动输入。", 422)
    anchors = scale.get("anchors", [])
    if not isinstance(anchors, list) or len(anchors) > 30:
        raise LabError("scale_evidence_invalid", "尺度锚点数量或格式无效。", 422)
    dimensions, priors = [], []
    for value in anchors:
        item, ratio = anchor(value, asset["width"], asset["height"], {"dimension_annotation", "object_prior"})
        (dimensions if item["source"] == "dimension_annotation" else priors).append((item, ratio))
    evidence, assumptions = texts(scale.get("evidence"), 14), texts(scale.get("assumptions"), 12)
    confidence = scale.get("confidence") if scale.get("confidence") in ("low", "medium", "high") else "low"
    if dimensions:
        ratio = statistics.median(value for _, value in dimensions)
        # Explicit policy: contradictory labels cannot be silently discarded.
        if any(abs(value - ratio) / ratio > .02 for _, value in dimensions):
            raise LabError("scale_anchors_conflict", "多个图纸长度标注推导的比例不一致，请用户校准；未改用猜测比例。", 422)
        if len(dimensions) == 1 and confidence == "high":
            confidence = "medium"
        return {**common, "mode": "measured", "mmPerPixel": ratio, "confidence": confidence, "evidence": evidence + [f"按 {len(dimensions)} 个图纸标注锚点计算中位比例；锚点相对差异不超过2%。"], "assumptions": common["assumptions"] + assumptions, "anchors": [item for item, _ in dimensions]}
    interval = scale.get("rangeMmPerPixel")
    ratio = statistics.median(value for _, value in priors) if priors else None
    if not isinstance(interval, list) or len(interval) != 2 or not all(positive(n) for n in interval) or interval[0] > interval[1] or not evidence or not priors:
        raise LabError("scale_unknown", "无标注图纸需要常识参考锚点、比例范围及估算依据；请校准或手动输入。", 422)
    if not interval[0] <= ratio <= interval[1] or any(not interval[0] <= value <= interval[1] for _, value in priors):
        raise LabError("scale_anchors_conflict", "常识参考锚点与估算比例范围不一致，请重新标定。", 422)
    return {**common, "mode": "estimated", "mmPerPixel": ratio, "rangeMmPerPixel": interval, "confidence": "low" if confidence == "high" else confidence, "evidence": evidence + ["基于典型尺寸假设的锚点比值中位数；不是测量真值。"], "assumptions": common["assumptions"] + assumptions + ["无可靠长度标注，常见物件尺寸仅作假设范围，不能当作测量真值。"], "anchors": [item for item, _ in priors]}
