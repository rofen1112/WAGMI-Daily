# Model Radar Framework

Model Radar tracks generative and multimodal model releases that matter to
design, spatial intelligence, 3D, video, world models, and physical AI. It is
separate from GitHub Radar because a model release may exist on a model hub
without a standalone GitHub repository.

## 1. Source priority

Review sources in this order:

1. The publisher's official model page, documentation, paper, or technical
   report.
2. Hugging Face model cards, model trees, recently updated models, and official
   publisher organizations.
3. The official or original inference, training, node, or workflow repository.
4. Community fine-tunes only when the upstream model, license, files, intended
   use, and a reproducible workflow can be verified.

Only metadata and official outbound links are stored. The collection job must
not automatically download or execute third-party weights.

## 2. Priority directions

The following directions are reviewed first even when download or like counts
are low:

- Image generation, image editing, identity preservation, and controllable
  visual generation.
- Video generation, video editing, digital humans, and video understanding.
- 3D generation, reconstruction, 3DGS, world models, and spatial intelligence.
- Architecture, interior, product, UI, visual, and generative design.
- Physical AI, embodied intelligence, simulation, and synthetic data.
- Multimodal models that connect language, images, video, 3D, and action.

## 3. Required classification

Every record must explicitly distinguish:

- `open-source`: code and model artifacts are released under an applicable
  open-source license.
- `open-weight`: model weights can be accessed, but source, data, usage, or
  commercial rights may remain restricted.
- `community-finetune`: a non-official derivative that must retain its upstream
  model and license lineage.
- `public` versus `gated` access.
- Official base model, official derivative, and community derivative.

Do not describe an open-weight or community-license model as fully open source.

## 4. Intake gate

Approve a model when:

- The exact publisher, model ID, upstream lineage, license, and access method
  are verifiable.
- It has original model value or a meaningful fine-tune, not only renamed
  files or copied metadata.
- The model has a clear industry use case in a priority direction.
- The model card explains intended use, dependencies, and material limitations.
- An official or original implementation can be linked when runtime support is
  required.

Record Chinese summaries, industry value, limitations, related repositories,
and the reason for intake. Popularity affects review order but is not required.

## 5. Rejection and observation

Reject or keep under observation:

- Models with missing or contradictory license and provenance.
- Reuploads, mirrors, copied checkpoints, or renamed derivatives without
  original value.
- Models whose advertised capability cannot be tied to a model card, paper,
  demo, or reproducible implementation.
- Identity, face, voice, or person-generation models that omit authorization,
  misuse, or content-safety boundaries.
- Gated or commercial releases whose claimed openness cannot be verified.

## 6. Data maintenance

`model-industry-watchlist.json` is the durable local inventory. Existing
records are cumulative and are not deleted merely because metrics stop moving
or a source temporarily disappears. After three consecutive days without
successful metadata refresh, mark the record for investigation and determine
whether it was gated, renamed, moved, or removed.
