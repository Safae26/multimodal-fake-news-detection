"""
predict.py  –  Dynamic best-model inference engine
====================================================
Loads the best-trained model as recorded in models/best_model.json.
Falls back to EANN if no registry exists.

Registry format (models/best_model.json):
{
    "name":      "VisualBERT",          # human-readable name
    "path":      "models/visualbert/best_visualbert_model.pth",
    "arch":      "VisualBertFusion",    # class name key
    "img_dim":   512,
    "text_dim":  768,
    "num_classes": 2,
    "val_accuracy": 0.9864,
    "f1_score":  0.9840
}
"""

import os
import json
import torch
import torch.nn as nn
from PIL import Image
from transformers import AutoTokenizer, XLMRobertaModel, CLIPProcessor, CLIPModel

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🖥️  API running on device: {device}")

# ─────────────────────────────────────────────────────────────
# 1.  Architecture declarations  (all models that can be saved)
# ─────────────────────────────────────────────────────────────

class GradientReversal(torch.autograd.Function):
    @staticmethod
    def forward(ctx, x, alpha):
        ctx.alpha = alpha
        return x

    @staticmethod
    def backward(ctx, grad_output):
        return -grad_output * ctx.alpha, None


class EANNWithFeatures(nn.Module):
    """EANN (BatchNorm + GELU) — standard architecture."""
    def __init__(self, img_dim=512, text_dim=768, num_classes=2, num_events=15):
        super().__init__()
        self.text_proj = nn.Linear(text_dim, img_dim)
        combined_dim = img_dim * 2

        self.class_classifier = nn.Sequential(
            nn.Linear(combined_dim, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_classes)
        )
        self.event_discriminator = nn.Sequential(
            nn.Linear(combined_dim, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_events)
        )

    def forward(self, img_feats, text_feats, alpha):
        projected_text = self.text_proj(text_feats)
        combined = torch.cat([img_feats, projected_text], dim=1)
        label_output = self.class_classifier(combined)
        reverse_feat = GradientReversal.apply(combined, alpha)
        event_output = self.event_discriminator(reverse_feat)
        return label_output, event_output, projected_text


class EANNWithFeaturesLegacy(nn.Module):
    """Legacy EANN (ReLU, no BatchNorm)."""
    def __init__(self, img_dim=512, text_dim=768, num_classes=2, num_events=12):
        super().__init__()
        self.text_proj = nn.Linear(text_dim, img_dim)
        combined_dim = img_dim * 2

        self.class_classifier = nn.Sequential(
            nn.Linear(combined_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
        self.event_discriminator = nn.Sequential(
            nn.Linear(combined_dim, 512),
            nn.ReLU(),
            nn.Linear(512, num_events)
        )

    def forward(self, img_feats, text_feats, alpha):
        projected_text = self.text_proj(text_feats)
        combined = torch.cat([img_feats, projected_text], dim=1)
        label_output = self.class_classifier(combined)
        reverse_feat = GradientReversal.apply(combined, alpha)
        event_output = self.event_discriminator(reverse_feat)
        return label_output, event_output, projected_text


import torch.nn.functional as F

class CrossModalAttention(nn.Module):
    def __init__(self, text_dim, image_dim, hidden_dim=256):
        super().__init__()
        # Projections
        self.text_proj = nn.Linear(text_dim, hidden_dim)
        self.image_proj = nn.Linear(image_dim, hidden_dim)
        
        # 1. Unimodal Self-Attention (Intra-modal)
        self.text_self_attn = nn.MultiheadAttention(hidden_dim, num_heads=8, batch_first=True)
        self.text_self_norm = nn.LayerNorm(hidden_dim)
        
        self.image_self_attn = nn.MultiheadAttention(hidden_dim, num_heads=8, batch_first=True)
        self.image_self_norm = nn.LayerNorm(hidden_dim)
        
        # 2. Cross-Modal Attention (Inter-modal)
        self.cross_attn = nn.MultiheadAttention(hidden_dim, num_heads=8, batch_first=True)
        self.cross_norm = nn.LayerNorm(hidden_dim)

    def forward(self, text_feats, image_feats):
        # Projections
        t_proj = self.text_proj(text_feats)
        i_proj = self.image_proj(image_feats)
        
        # Intra-modal Attention
        t_self, _ = self.text_self_attn(query=t_proj, key=t_proj, value=t_proj)
        t_feat = self.text_self_norm(t_proj + t_self)
        
        i_self, _ = self.image_self_attn(query=i_proj, key=i_proj, value=i_proj)
        i_feat = self.image_self_norm(i_proj + i_self)
        
        # Cross-Modal Attention
        attended, _ = self.cross_attn(query=t_feat, key=i_feat, value=i_feat)
        attended = self.cross_norm(t_feat + attended)
        
        # Mean pool over sequence length
        return attended.mean(dim=1)


class HierarchicalContextEncoder(nn.Module):
    def __init__(self, input_dim, hidden_dim=512):
        super().__init__()
        self.local_proj = nn.Linear(input_dim, hidden_dim // 2)
        self.global_proj = nn.Linear(input_dim, hidden_dim)
        self.fusion = nn.Linear(hidden_dim + hidden_dim // 2, hidden_dim // 4)
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        local = self.local_proj(x)
        global_c = self.global_proj(x)
        fused = self.fusion(torch.cat([local, global_c], dim=-1))
        return F.relu(self.dropout(fused))


class HMCAN(nn.Module):
    def __init__(self, img_dim=768, text_dim=768, num_classes=2, use_metadata=True, **kwargs):
        super().__init__()
        from transformers import XLMRobertaModel, CLIPVisionModel
        
        self.use_metadata = use_metadata
        
        # Re-use global xlm_model if available to conserve VRAM
        global xlm_model
        if xlm_model is not None:
            self.text_encoder = xlm_model
        else:
            self.text_encoder = XLMRobertaModel.from_pretrained('xlm-roberta-base')
            
        self.image_encoder = CLIPVisionModel.from_pretrained('openai/clip-vit-base-patch16', use_safetensors=True)
        
        # Freeze encoders
        for param in self.text_encoder.parameters():
            param.requires_grad = False
        for param in self.image_encoder.parameters():
            param.requires_grad = False
            
        # Metadata encoder
        if self.use_metadata:
            self.metadata_encoder = nn.Sequential(
                nn.Linear(5, 32),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(32, 64)
            )
            self.context_encoder = HierarchicalContextEncoder(256 + 64, hidden_dim=512)
        else:
            self.context_encoder = HierarchicalContextEncoder(256, hidden_dim=512)
        
        self.text_image_attn = CrossModalAttention(768, 768, hidden_dim=256)
        
        self.classifier = nn.Sequential(
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(64, num_classes)
        )
        
    def forward(self, input_ids, attention_mask, images, metadata):
        with torch.no_grad():
            text_outputs = self.text_encoder(input_ids, attention_mask=attention_mask, output_hidden_states=True)
            hidden_states = text_outputs.hidden_states
            # Average layers 4, 8, and 12 for intermediate linguistic abstraction levels
            text_features = torch.stack([hidden_states[4], hidden_states[8], hidden_states[12]], dim=0).mean(dim=0)
            
        with torch.no_grad():
            image_outputs = self.image_encoder(images)
            image_features = image_outputs.last_hidden_state
            
        text_image_out = self.text_image_attn(text_features, image_features)
        
        if self.use_metadata:
            metadata_features = self.metadata_encoder(metadata)
            multi_modal = torch.cat([text_image_out, metadata_features], dim=-1)
        else:
            multi_modal = text_image_out
            
        context_out = self.context_encoder(multi_modal)
        
        logits = self.classifier(context_out)
        return logits


class UnimodalClassifier(nn.Module):
    def __init__(self, input_dim=768, num_classes=2, dropout=0.3, **kwargs):
        super().__init__()
        self.projection = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.LayerNorm(512),
            nn.Dropout(dropout)
        )
        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(64, num_classes)
        )

    def forward(self, features, *args, **kwargs):
        proj = self.projection(features)
        return self.classifier(proj)


# Registry of architecture names → constructors
ARCH_REGISTRY = {
    "EANN":                   EANNWithFeatures,
    "EANNWithFeatures":       EANNWithFeatures,
    "EANNWithFeaturesLegacy": EANNWithFeaturesLegacy,
    "HMCAN":                  HMCAN,
    "UnimodalClassifier":     UnimodalClassifier,
}

# ─────────────────────────────────────────────────────────────
# 2.  Embedding extractors  (shared by all architectures)
# ─────────────────────────────────────────────────────────────

xlm_tokenizer = None
xlm_model = None
clip_model = None
clip_processor = None
model = None          # the active inference model
active_arch = None    # architecture name of loaded model
_load_error = None

try:
    print("⏳ Loading embedding extractors (CLIP & XLM-RoBERTa)...")
    xlm_tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-base")
    xlm_model = XLMRobertaModel.from_pretrained("xlm-roberta-base").to(device)
    xlm_model.eval()

    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    clip_model.eval()
    print("✅ Embedding extractors loaded successfully.")
except Exception as e:
    _load_error = str(e)
    print(f"❌ Failed to load embedding extractors: {e}")

# ─────────────────────────────────────────────────────────────
# 3.  Dynamic best-model loading from registry
# ─────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_PATH = os.path.join(BASE_DIR, "models", "best_model.json")


def _load_best_model():
    """
    Read models/best_model.json and load the corresponding model.
    Falls back gracefully to EANN checkpoints if registry is absent.
    """
    global model, active_arch, _load_error

    # ── Try registry first ──────────────────────────────────
    if os.path.exists(REGISTRY_PATH):
        try:
            with open(REGISTRY_PATH, "r") as f:
                reg = json.load(f)

            arch_name = reg.get("arch", "EANNWithFeatures")
            ckpt_path = os.path.join(BASE_DIR, reg["path"])

            if not os.path.exists(ckpt_path):
                raise FileNotFoundError(f"Checkpoint not found: {ckpt_path}")

            arch_cls = ARCH_REGISTRY.get(arch_name)
            if arch_cls is None:
                raise ValueError(f"Unknown architecture: {arch_name}")

            # Build kwargs from registry (drop non-constructor keys)
            ctor_keys = {"img_dim", "text_dim", "num_classes", "hidden_dim", "num_events"}
            ctor_kwargs = {k: v for k, v in reg.items() if k in ctor_keys}
            loaded_model = arch_cls(**ctor_kwargs)

            ckpt = torch.load(ckpt_path, map_location=device)
            state = ckpt.get("model_state_dict", ckpt)
            loaded_model.load_state_dict(state)
            loaded_model.to(device)
            loaded_model.eval()

            model = loaded_model
            active_arch = arch_name
            print(f"✅ Best model loaded: {reg.get('name', arch_name)} "
                  f"(acc={reg.get('val_accuracy', '?'):.4f})")
            return

        except Exception as e:
            _load_error = str(e)
            print(f"⚠️ Registry load failed, falling back to EANN: {e}")

    # ── Fallback: EANN checkpoints ──────────────────────────
    sota_path        = os.path.join(BASE_DIR, "models", "eann", "EANN_Standard_classifier_best.pth")
    sota_path_lower  = os.path.join(BASE_DIR, "models", "eann", "eann_standard_classifier_best.pth")
    saved_path       = os.path.join(BASE_DIR, "models", "eann", "eann_standard_model_saved", "model.pth")
    legacy_path      = os.path.join(BASE_DIR, "models", "eann", "best_eann.pt")

    if xlm_tokenizer is None or clip_model is None:
        print("⚠️ Skipping model load: embedding extractors not available.")
        return

    try:
        for path, cls, kwargs in [
            (sota_path,        EANNWithFeatures,       {"img_dim": 512, "text_dim": 768, "num_classes": 2, "num_events": 15}),
            (sota_path_lower,  EANNWithFeatures,       {"img_dim": 512, "text_dim": 768, "num_classes": 2, "num_events": 15}),
            (saved_path,       EANNWithFeatures,       {"img_dim": 512, "text_dim": 768, "num_classes": 2, "num_events": 15}),
        ]:
            if os.path.exists(path):
                m = cls(**kwargs)
                ckpt = torch.load(path, map_location=device)
                state = ckpt.get("model_state_dict", ckpt)
                m.load_state_dict(state)
                m.to(device)
                m.eval()
                model = m
                active_arch = "EANNWithFeatures"
                print(f"✅ EANN fallback loaded: {path}")
                return

        # Legacy EANN
        if os.path.exists(legacy_path):
            ckpt = torch.load(legacy_path, map_location=device)
            state = ckpt.get("model_state_dict", ckpt) if isinstance(ckpt, dict) else ckpt
            has_bn = any("class_classifier.1" in k for k in state.keys())
            n_events = 12
            for k, v in state.items():
                if "event_discriminator" in k and "weight" in k and v.dim() == 2:
                    n_events = v.shape[0]
                    break
            cls = EANNWithFeatures if has_bn else EANNWithFeaturesLegacy
            m = cls(img_dim=512, text_dim=768, num_classes=2, num_events=n_events)
            m.load_state_dict(state)
            m.to(device)
            m.eval()
            model = m
            active_arch = cls.__name__
            print(f"✅ Legacy EANN loaded (events={n_events})")
            return

        raise FileNotFoundError("No EANN checkpoint found in models/eann/.")

    except Exception as e:
        _load_error = str(e)
        model = None
        print(f"❌ Model loading failed: {e}")


text_unimodal_model = None
image_unimodal_model = None

def _load_unimodal_models():
    global text_unimodal_model, image_unimodal_model
    txt_path = os.path.join(BASE_DIR, "models", "unimodal", "best_TextOnly_MLP_classifier.pth")
    img_path = os.path.join(BASE_DIR, "models", "unimodal", "best_ImageOnly_MLP_classifier.pth")

    if os.path.exists(txt_path):
        try:
            m = UnimodalClassifier(input_dim=768, num_classes=2)
            ckpt = torch.load(txt_path, map_location=device)
            state = ckpt.get("model_state_dict", ckpt)
            m.load_state_dict(state)
            m.to(device).eval()
            text_unimodal_model = m
            print(f"✅ Unimodal Text-Only Model loaded: {txt_path}")
        except Exception as e:
            print(f"⚠️ Could not load unimodal text model: {e}")

    if os.path.exists(img_path):
        try:
            m = UnimodalClassifier(input_dim=512, num_classes=2)
            ckpt = torch.load(img_path, map_location=device)
            state = ckpt.get("model_state_dict", ckpt)
            m.load_state_dict(state)
            m.to(device).eval()
            image_unimodal_model = m
            print(f"✅ Unimodal Image-Only Model loaded: {img_path}")
        except Exception as e:
            print(f"⚠️ Could not load unimodal image model: {e}")

_load_best_model()
_load_unimodal_models()

# ─────────────────────────────────────────────────────────────
# 4.  Embedding helpers
# ─────────────────────────────────────────────────────────────

def extract_text_embeddings(text: str) -> torch.Tensor:
    if xlm_tokenizer is None or xlm_model is None:
        raise RuntimeError("XLM-RoBERTa tokenizer/model not loaded.")
    encoded = xlm_tokenizer(
        text,
        max_length=170,
        truncation=True,
        padding="max_length",
        return_tensors="pt"
    ).to(device)
    with torch.no_grad():
        outputs = xlm_model(**encoded)
        text_features = outputs.last_hidden_state[:, 0, :]   # [CLS]
    return text_features


def extract_image_embeddings(pil_image: Image.Image) -> torch.Tensor:
    if clip_processor is None or clip_model is None:
        raise RuntimeError("CLIP model/processor not loaded.")
    inputs = clip_processor(images=pil_image, return_tensors="pt").to(device)
    with torch.no_grad():
        image_features = clip_model.get_image_features(**inputs)
    return image_features


clip_processor_patch16 = None

def predict_hmcan(text: str, pil_image: Image.Image) -> torch.Tensor:
    global clip_processor_patch16
    if clip_processor_patch16 is None:
        clip_processor_patch16 = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")
    
    # 1. Tokenize
    encoded = xlm_tokenizer(
        text,
        max_length=170,
        truncation=True,
        padding="max_length",
        return_tensors="pt"
    ).to(device)
    
    # 2. Process image
    img_inputs = clip_processor_patch16(images=pil_image, return_tensors="pt").to(device)
    pixel_values = img_inputs["pixel_values"]
    
    # 3. Build metadata: [is_ai, img_exists, word_count, manipulated, use_caption]
    has_image = 1.0 if pil_image is not None else 0.0
    word_count = len(text.split()) / 50.0
    metadata = torch.tensor([[0.0, has_image, word_count, 0.0, 0.0]], dtype=torch.float).to(device)
    
    # 4. Forward
    with torch.no_grad():
        logits = model(encoded["input_ids"], encoded["attention_mask"], pixel_values, metadata)
    return logits


def get_model_name() -> str:
    """Return the human-readable name of the currently loaded model."""
    if os.path.exists(REGISTRY_PATH):
        try:
            with open(REGISTRY_PATH, "r") as f:
                reg = json.load(f)
            return reg.get("name", active_arch or "Unknown")
        except Exception:
            pass
    return active_arch or "EANN"