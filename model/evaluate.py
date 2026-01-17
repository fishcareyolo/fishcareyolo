"""
Final Evaluation Script for Fish Disease Detection Model

Evaluates a trained model on the held-out test set to get unbiased
performance metrics. This should only be run after training is complete.

Usage:
    uv run evaluate.py --weights runs/detect/fish_disease/weights/best.pt
    uv run evaluate.py --weights runs/detect/fish_disease/weights/best.pt --test-dir test_data
"""

import argparse
from pathlib import Path

from ultralytics import YOLO


# Disease classes (must match training)
DISEASE_CLASSES = [
    "bacterial_infection",
    "fungal_infection",
    "healthy",
    "parasite",
    "white_tail",
]


def create_test_yaml(test_dir: Path) -> Path:
    """Create a temporary data.yaml for test evaluation."""
    yaml_content = f"""# Fish Disease Detection - Test Set Evaluation
path: {test_dir.absolute()}
train: images  # Not used, but required by YOLO
val: images    # Point to test images for evaluation

names:
  0: bacterial_infection
  1: fungal_infection
  2: healthy
  3: parasite
  4: white_tail

nc: 5
"""
    yaml_path = test_dir / "test_data.yaml"
    yaml_path.write_text(yaml_content)
    return yaml_path


def evaluate(
    weights: Path,
    test_dir: Path,
    imgsz: int = 640,
    confidence: float = 0.001,
    iou: float = 0.6,
) -> dict:
    """
    Evaluate model on test set.

    Args:
        weights: Path to trained model weights (.pt or .tflite)
        test_dir: Path to test data directory (with images/ and labels/ subdirs)
        imgsz: Input image size
        confidence: Confidence threshold for predictions
        iou: IoU threshold for NMS

    Returns:
        Dictionary containing evaluation metrics
    """
    # Validate test directory structure
    images_dir = test_dir / "images"
    labels_dir = test_dir / "labels"

    if not images_dir.exists():
        raise FileNotFoundError(f"Test images directory not found: {images_dir}")
    if not labels_dir.exists():
        raise FileNotFoundError(f"Test labels directory not found: {labels_dir}")

    image_count = len(list(images_dir.glob("*")))
    if image_count == 0:
        raise ValueError(f"No images found in {images_dir}")

    print(f"Evaluating on {image_count} test images...")

    # Create temporary yaml for evaluation
    test_yaml = create_test_yaml(test_dir)

    # Load model
    model = YOLO(str(weights))

    # Run validation on test set
    results = model.val(
        data=str(test_yaml),
        imgsz=imgsz,
        conf=confidence,
        iou=iou,
        split="val",  # We pointed 'val' to test images in yaml
        verbose=True,
    )

    # Extract metrics
    metrics = {
        "mAP50": results.box.map50,
        "mAP50-95": results.box.map,
        "precision": results.box.mp,
        "recall": results.box.mr,
        "per_class_ap50": {
            DISEASE_CLASSES[i]: results.box.ap50[i]
            for i in range(len(DISEASE_CLASSES))
            if i < len(results.box.ap50)
        },
    }

    # Clean up temporary yaml
    test_yaml.unlink()

    return metrics


def print_results(metrics: dict) -> None:
    """Print evaluation results in a formatted table."""
    print("\n" + "=" * 60)
    print("FINAL TEST SET EVALUATION RESULTS")
    print("=" * 60)

    print(f"\n{'Metric':<25} {'Value':>15}")
    print("-" * 40)
    print(f"{'mAP@50':<25} {metrics['mAP50']:>15.4f}")
    print(f"{'mAP@50-95':<25} {metrics['mAP50-95']:>15.4f}")
    print(f"{'Precision':<25} {metrics['precision']:>15.4f}")
    print(f"{'Recall':<25} {metrics['recall']:>15.4f}")

    print(f"\n{'Per-Class AP@50':<25}")
    print("-" * 40)
    for cls_name, ap in metrics["per_class_ap50"].items():
        print(f"  {cls_name:<23} {ap:>15.4f}")

    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate trained model on held-out test set"
    )
    parser.add_argument(
        "--weights",
        type=str,
        required=True,
        help="Path to trained model weights (.pt or .tflite)",
    )
    parser.add_argument(
        "--test-dir",
        type=str,
        default="test_data",
        help="Path to test data directory (default: test_data)",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Input image size (default: 640)",
    )
    parser.add_argument(
        "--confidence",
        type=float,
        default=0.001,
        help="Confidence threshold (default: 0.001, low for mAP calculation)",
    )
    parser.add_argument(
        "--iou",
        type=float,
        default=0.6,
        help="IoU threshold for NMS (default: 0.6)",
    )

    args = parser.parse_args()

    weights_path = Path(args.weights)
    if not weights_path.exists():
        raise FileNotFoundError(f"Weights file not found: {weights_path}")

    test_dir = Path(args.test_dir)
    if not test_dir.exists():
        raise FileNotFoundError(
            f"Test directory not found: {test_dir}\n"
            "Make sure you ran 'python dataset/get.py' to download the dataset."
        )

    metrics = evaluate(
        weights=weights_path,
        test_dir=test_dir,
        imgsz=args.imgsz,
        confidence=args.confidence,
        iou=args.iou,
    )

    print_results(metrics)

    # Return non-zero exit code if mAP is very low (potential issue)
    if metrics["mAP50"] < 0.1:
        print("\nWARNING: mAP@50 is below 0.1 - model may have issues.")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
