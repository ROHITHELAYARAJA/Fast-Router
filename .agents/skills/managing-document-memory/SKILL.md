---
name: managing-document-memory
description: Ingests large documents and creates structured document memory for token-efficient research workflows. Use when processing PDFs, research papers, or large textual documents.
---

# Document Memory

## When to use this skill
- Ingesting PDFs, financial reports, or research documents
- Building structured entity/relationship memory from text
- Handling document follow-up queries without re-transmitting full files

## Workflow & Checklist
- [ ] Ingest raw document and extract sections, entities, and facts
- [ ] Store structured document memory in project workspace
- [ ] Retrieve relevant excerpts for user questions
- [ ] Route simple follow-up questions to lightweight fast models
- [ ] Escalate complex synthetic questions to high-reasoning models

## Instructions & API Interfaces
### Document Ingestion Flow

```
Raw Document (PDF/Text)
       ↓
Structure Extraction (Sections, Entities, Facts)
       ↓
Persistent Document Memory
       ↓
Relevant Retrieval Chunking
       ↓
Targeted Model Context
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`
