"""
Module: data_pipeline.py
========================
Standardized data preprocessing pipeline for the M4FC project
for multimodal fake news detection.

This module provides the `M4FCDataPipeline` class which centralizes:
  1. Loading the cleaned dataset (M4FC.csv)
  2. Normalization / standardization of numerical features
  3. Stratified splitting (train / val / test)
  4. Aligned split and oversampling method for PyTorch tensors (text/image)
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


class M4FCDataPipeline:
    """Standardized pipeline: normalization + stratified split.

    Parameters
    ----------
    csv_path : str
        Path to the cleaned CSV file (default ``data/M4FC.csv``).
    target_col : str, default ``"target"``
        Name of the target column (binary label 0 / 1).
    feature_cols : list[str] | None
        Explicit list of columns to use as features.
        If ``None``, all numerical columns except ``target_col``
        will be used automatically.
    exclude_cols : list[str] | None
        Columns to exclude from features.
    test_size : float, default 0.15
        Proportion of the test set relative to the total dataset.
    val_size : float, default 0.15
        Proportion of the validation set relative to the total dataset.
    random_state : int, default 42
        Random seed for reproducibility.
    normalize : bool, default True
        If ``True``, applies ``StandardScaler`` to numerical features.
    """

    _DEFAULT_EXCLUDE_COLS: List[str] = [
        "image_path", "image_url", "article_url",
        "fc_org", "fc_pub_date", "fc_language", "fc_country",
        "verification_strategy", "verification_tools",
        "claim", "multilingual_claim", "claim_language",
        "verdict", "claimant", "claimant_intent",
        "claimed_date", "claimed_location",
        "claimed_people", "claimed_things", "claimed_event",
        "provenance", "source", "date", "location",
        "motivation", "people", "things", "event",
        "task_claim_extraction", "task_location_verification",
        "true_caption", "task_claimant_intent",
        "task_fake_detection", "task_image_contextualization",
        "split", "use_true_caption",
        "negative_geolocations", "coordinates", "negative_coordinates",
        "is_manipulated_fake", "verdict_coarse",
        "multilingual_true_caption", "task_verdict_prediction",
        "wayback_image_url", "full_image_path", "image_exists",
    ]

    def __init__(
        self,
        csv_path: str = "data/M4FC.csv",
        target_col: str = "target",
        feature_cols: Optional[List[str]] = None,
        exclude_cols: Optional[List[str]] = None,
        test_size: float = 0.15,
        val_size: float = 0.15,
        random_state: int = 42,
        normalize: bool = True,
    ) -> None:
        self.csv_path = csv_path
        self.target_col = target_col
        self.feature_cols = feature_cols
        self.exclude_cols = (
            exclude_cols if exclude_cols is not None
            else self._DEFAULT_EXCLUDE_COLS
        )
        self.test_size = test_size
        self.val_size = val_size
        self.random_state = random_state
        self.normalize = normalize
        self.scaler: Optional[StandardScaler] = None
        self.df: Optional[pd.DataFrame] = None
        self._splits: Optional[Dict[str, Union[pd.DataFrame, pd.Series]]] = None

    def _load_data(self) -> pd.DataFrame:
        df = pd.read_csv(self.csv_path)
        if self.target_col not in df.columns:
            raise ValueError(f"Target column '{self.target_col}' does not exist.")
        df = df.dropna(subset=[self.target_col])
        df[self.target_col] = df[self.target_col].astype(int)
        return df

    def _select_features(self, df: pd.DataFrame) -> List[str]:
        if self.feature_cols is not None:
            return list(self.feature_cols)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        exclude = set(self.exclude_cols) | {self.target_col}
        return [c for c in numeric_cols if c not in exclude]

    def _split(
        self,
        X: pd.DataFrame,
        y: pd.Series,
    ) -> Dict[str, Union[pd.DataFrame, pd.Series]]:
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=y,
        )
        relative_val_size = self.val_size / (1.0 - self.test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=relative_val_size,
            random_state=self.random_state,
            stratify=y_temp,
        )
        return {
            "X_train": X_train, "y_train": y_train,
            "X_val": X_val, "y_val": y_val,
            "X_test": X_test, "y_test": y_test,
        }

    def run(self, verbose: bool = True) -> Dict[str, Union[pd.DataFrame, pd.Series]]:
        self.df = self._load_data()
        if verbose:
            print(f"📂 Dataset loaded: {self.csv_path} ({len(self.df):,} rows)")

        feature_names = self._select_features(self.df)
        X = self.df[feature_names]
        y = self.df[self.target_col]

        self._splits = self._split(X, y)

        if self.normalize:
            self._splits = self._normalize(self._splits)

        return self._splits

    def split_dataframe(self, df: Optional[pd.DataFrame] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Returns stratified split dataframes (train_df, val_df, test_df)."""
        if df is None:
            df = self._load_data()
        indices = np.arange(len(df))
        idx_temp, idx_test = train_test_split(
            indices,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=df[self.target_col].values,
        )
        relative_val_size = self.val_size / (1.0 - self.test_size)
        idx_train, idx_val = train_test_split(
            idx_temp,
            test_size=relative_val_size,
            random_state=self.random_state,
            stratify=df[self.target_col].values[idx_temp],
        )
        train_df = df.iloc[idx_train].reset_index(drop=True)
        val_df = df.iloc[idx_val].reset_index(drop=True)
        test_df = df.iloc[idx_test].reset_index(drop=True)
        return train_df, val_df, test_df

    def _normalize(self, splits: dict) -> dict:
        self.scaler = StandardScaler()
        cols = splits["X_train"].columns.tolist()
        for k in ["X_train", "X_val", "X_test"]:
            if k == "X_train":
                splits[k] = pd.DataFrame(self.scaler.fit_transform(splits[k]), columns=cols, index=splits[k].index)
            else:
                splits[k] = pd.DataFrame(self.scaler.transform(splits[k]), columns=cols, index=splits[k].index)
        return splits

    # ------------------------------------------------------------------ #
    #  Split and oversampling method for PyTorch tensors                 #
    # ------------------------------------------------------------------ #

    def split_and_resample_tensors(
        self,
        img_feats: torch.Tensor,
        text_feats: torch.Tensor,
        labels: torch.Tensor,
        verbose: bool = True,
    ) -> Dict[str, Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor, torch.Tensor]]]:
        """Splits feature tensors.

        Parameters
        ----------
        img_feats : torch.Tensor
            Image feature tensor (shape: N x dim_img)
        text_feats : torch.Tensor
            Text feature tensor (shape: N x dim_txt)
        labels : torch.Tensor
            Label tensor (shape: N)

        Returns
        -------
        dict containing the split and oversampled tensors or tuples of tensors.
        """
        N = len(labels)
        indices = np.arange(N)

        # 1. Stratified index split
        idx_temp, idx_test = train_test_split(
            indices,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=labels.numpy(),
        )
        relative_val_size = self.val_size / (1.0 - self.test_size)
        idx_train, idx_val = train_test_split(
            idx_temp,
            test_size=relative_val_size,
            random_state=self.random_state,
            stratify=labels[idx_temp].numpy(),
        )

        # 2. Extraction of original subsets
        img_train, img_val, img_test = img_feats[idx_train], img_feats[idx_val], img_feats[idx_test]
        txt_train, txt_val, txt_test = text_feats[idx_train], text_feats[idx_val], text_feats[idx_test]
        y_train, y_val, y_test = labels[idx_train], labels[idx_val], labels[idx_test]

        if verbose:
            print(f"✂️  Tensor split completed → train={len(idx_train):,} | val={len(idx_val):,} | test={len(idx_test):,}")

        return {
            "img_train": img_train, "txt_train": txt_train, "y_train": y_train,
            "img_val": img_val, "txt_val": txt_val, "y_val": y_val,
            "img_test": img_test, "txt_test": txt_test, "y_test": y_test,
            "idx_train": idx_train, "idx_val": idx_val, "idx_test": idx_test,
        }

    def get_scaler(self) -> Optional[StandardScaler]:
        return self.scaler

    def summary(self) -> str:
        lines = [
            "╔══════════════════════════════════════════════╗",
            "║       M4FC Data Pipeline – Configuration     ║",
            "╠══════════════════════════════════════════════╣",
            f"║  CSV             : {self.csv_path}",
            f"║  Target          : {self.target_col}",
            f"║  Test size       : {self.test_size}",
            f"║  Val  size       : {self.val_size}",
            f"║  Random state    : {self.random_state}",
            f"║  Normalize       : {self.normalize}",
            "╚══════════════════════════════════════════════╝",
        ]
        return "\n".join(lines)


from PIL import Image
from torch.utils.data import Dataset


class M4FCDataset(Dataset):
    """Standard PyTorch Dataset for M4FC claims with text, CLIP image, and metadata."""

    def __init__(self, df: pd.DataFrame, tokenizer, processor, max_text_length: int = 512):
        self.df = df.reset_index(drop=True)
        self.tokenizer = tokenizer
        self.processor = processor
        self.max_text_length = max_text_length
        self.text_field = 'multilingual_claim'

    def __len__(self) -> int:
        return len(self.df)

    def load_image(self, image_path: str) -> torch.Tensor:
        try:
            if image_path and os.path.exists(image_path):
                image = Image.open(image_path).convert('RGB')
                pixel_values = self.processor(images=image, return_tensors='pt')['pixel_values'].squeeze(0)
                return pixel_values
            else:
                return torch.zeros(3, 224, 224)
        except Exception:
            return torch.zeros(3, 224, 224)

    def __getitem__(self, idx: int) -> dict:
        row = self.df.iloc[idx]
        text = str(row[self.text_field]) if pd.notna(row[self.text_field]) else ""
        encoding = self.tokenizer(
            text,
            max_length=self.max_text_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )

        image_path = row['full_image_path'] if pd.notna(row['full_image_path']) else ""
        image = self.load_image(image_path)

        is_ai = float(row['is_ai_generated']) if pd.notna(row['is_ai_generated']) else 0.0
        img_exists = float(row['image_exists']) if pd.notna(row['image_exists']) else 0.0
        word_count = float(row['claim_word_count']) if pd.notna(row['claim_word_count']) else 0.0
        word_count = word_count / 50.0
        manipulated = float(row['is_manipulated_fake']) if pd.notna(row['is_manipulated_fake']) else 0.0
        use_caption = float(row['use_true_caption']) if pd.notna(row['use_true_caption']) else 0.0

        metadata = torch.tensor([is_ai, img_exists, word_count, manipulated, use_caption], dtype=torch.float)
        label = torch.tensor(row['target'], dtype=torch.long)

        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'image': image,
            'metadata': metadata,
            'label': label,
            'text': text,
            'image_path': image_path
        }


