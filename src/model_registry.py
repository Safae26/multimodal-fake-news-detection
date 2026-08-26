"""
src/model_registry.py
======================
Utility for managing the best-model registry (models/best_model.json).

Any training notebook or script calls `update_registry(...)` after
evaluation. The registry is read by predict.py at API startup to
automatically serve the best available model — no hardcoding needed.

Usage
-----
from model_registry import update_registry

update_registry(
    name        = "EANN",                                      # display name
    arch        = "EANNWithFeatures",                          # class in predict.py
    rel_path    = "models/eann/EANN_Standard_classifier_best.pth",
    val_accuracy= 0.9521,
    val_f1      = 0.9488,
    test_accuracy= 0.9490,
    test_f1     = 0.9460,
    test_auc    = 0.9870,
    img_dim     = 512,
    text_dim    = 768,
    num_classes = 2,
    num_events  = 15,   # EANN-specific
)
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_PATH = os.path.join(ROOT, "models", "best_model.json")


def load_registry() -> Optional[Dict[str, Any]]:
    """Return current registry dict, or None if not present."""
    if not os.path.exists(REGISTRY_PATH):
        return None
    try:
        with open(REGISTRY_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Could not read registry: {e}")
        return None


def update_registry(
    name: str,
    arch: str,
    rel_path: str,
    val_accuracy: float,
    val_f1: float,
    test_accuracy: float = 0.0,
    test_f1: float = 0.0,
    test_auc: float = 0.0,
    force: bool = False,
    **extra_kwargs,
) -> bool:
    """
    Write to models/best_model.json if this model beats the current champion.

    Parameters
    ----------
    name         : Human-readable model name (shown in the UI).
    arch         : Architecture class key (must exist in predict.ARCH_REGISTRY).
    rel_path     : Path to .pth checkpoint, relative to project root.
    val_accuracy : Validation accuracy of this run.
    val_f1       : Validation F1 of this run.
    test_accuracy: Test accuracy (informational).
    test_f1      : Test F1 (informational).
    test_auc     : Test AUC-ROC (informational).
    force        : If True, overwrite even if the new model scores lower.
    **extra_kwargs : Architecture-specific kwargs forwarded to the registry
                     (e.g. img_dim, text_dim, num_classes, num_events, hidden_dim).

    Returns
    -------
    True if registry was updated, False otherwise.
    """
    current = load_registry()
    current_best = current.get("val_accuracy", 0.0) if current else 0.0

    if not force and val_accuracy <= current_best:
        print(f"ℹ️  Registry unchanged — current champion "
              f"'{current.get('name', '?')}' (acc={current_best:.4f}) "
              f"leads '{name}' (acc={val_accuracy:.4f}).")
        return False

    # Normalise path separators
    rel_path_normalised = rel_path.replace("\\", "/")

    entry: Dict[str, Any] = {
        "name":          name,
        "arch":          arch,
        "path":          rel_path_normalised,
        "val_accuracy":  round(val_accuracy, 6),
        "val_f1":        round(val_f1, 6),
        "test_accuracy": round(test_accuracy, 6),
        "test_f1":       round(test_f1, 6),
        "test_auc":      round(test_auc, 6),
    }
    entry.update(extra_kwargs)

    os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
    with open(REGISTRY_PATH, "w") as f:
        json.dump(entry, f, indent=2)

    print(f"🏆  '{name}' is the new best model!")
    if current:
        print(f"   {current.get('name','?')} ({current_best:.4f}) → {name} ({val_accuracy:.4f})")
    print(f"   Registry: {REGISTRY_PATH}")
    return True


def show_registry():
    """Pretty-print the current registry."""
    reg = load_registry()
    if reg is None:
        print("📭  No registry found. Train a model first.")
        return
    print(json.dumps(reg, indent=2))
