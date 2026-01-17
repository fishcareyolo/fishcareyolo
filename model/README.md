# Fish Disease Detection Model Training

This module contains the YOLOv8 training pipeline for the Mina fish disease detection app.

## Setup

```bash
cd model
uv sync
```

## Dataset

Download the fish disease dataset from Roboflow:

```bash
ROBOFLOW_API_KEY=your_key uv run dataset/get.py
```

This will:
1. Download the dataset from Roboflow
2. Organize training/validation data into `data/images/train`, `data/images/val`, `data/labels/train`, `data/labels/val`
3. Save test data separately to `test_data/images`, `test_data/labels` (for final evaluation)
4. Create `data/data.yaml` configuration file

## Training

Train the YOLOv8n model:

```bash
uv run train.py --epochs 100 --batch 16
```

Options:
- `--epochs`: Number of training epochs (default: 100)
- `--batch`: Batch size (default: 16)
- `--imgsz`: Input image size (default: 640)
- `--name`: Training run name (default: fish_disease)

Results are saved to `runs/detect/fish_disease/`.

## Final Evaluation

After training, evaluate the model on the held-out test set to get unbiased performance metrics:

```bash
uv run evaluate.py --weights runs/detect/fish_disease/weights/best.pt
```

Options:
- `--weights`: Path to trained weights (.pt or .tflite)
- `--test-dir`: Path to test data directory (default: test_data)
- `--imgsz`: Input image size (default: 640)
- `--confidence`: Confidence threshold (default: 0.001)
- `--iou`: IoU threshold for NMS (default: 0.6)

This reports mAP@50, mAP@50-95, precision, recall, and per-class AP on data the model has never seen during training or validation.

## Export to TFLite

Export the trained model to TFLite format for mobile deployment:

```bash
uv run export_model.py --weights runs/detect/fish_disease/weights/best.pt
```

Options:
- `--weights`: Path to trained weights (.pt file)
- `--no-int8`: Disable int8 quantization (not recommended)
- `--imgsz`: Input image size (default: 640)

The TFLite model is saved alongside the weights.

## Testing

### Test inference on images:

```bash
uv run test_inference.py --weights runs/detect/fish_disease/weights/best.tflite --dir data/images/val
uv run test_inference.py --weights runs/detect/fish_disease/weights/best.tflite --image path/to/image.jpg
```

Options:
- `--weights`: Path to model (.pt or .tflite)
- `--image`: Test a single image
- `--dir`: Test all images in a directory
- `--confidence`: Minimum confidence threshold (default: 0.3)

### Run property tests:

```bash
pytest tests/ -v
```

Tests cover:
- Training configuration validation
- TFLite export equivalence (Property 8)
- Detection structure validation (Property 5)
- Confidence filtering (Property 2)
- Detection sorting (Property 3)

## Disease Classes

| Index | Class |
|-------|-------|
| 0 | bacterial_infection |
| 1 | fungal_infection |
| 2 | healthy |
| 3 | parasite |
| 4 | white_tail |

## Output Structure

```
model/
├── data/
│   ├── images/
│   │   ├── train/
│   │   └── val/
│   ├── labels/
│   │   ├── train/
│   │   └── val/
│   └── data.yaml
├── test_data/
│   ├── images/
│   └── labels/
├── runs/
│   └── detect/
│       └── fish_disease/
│           └── weights/
│               ├── best.pt
│               └── best.tflite
├── tests/
│   ├── test_export.py
│   ├── test_inference.py
│   └── test_training.py
├── train.py
├── evaluate.py
├── export_model.py
└── test_inference.py
```
