## About

The ambition of this project is to create a knowledge API capable of responding to complex knowledge queries with traceability and human interpretability.

Think of it as a fusion between LLMs, which can answer complex human questions, and Git, which can model representational version changes.

## Approach

The fundamental approach is around building a concept map in digital geometric space that accurately represents the underlying fundamental knowledge.

If humans can share a conceptual map with an AI system, then debugging, citing, explaining, and interpreting results of the AI system will become easy, helpful, and trustworthy. When humans do not share the same conceptual map with an AI system, results—however accurate—become nearly impossible to debug, cite, or explain. This limits both the helpfulness and trustworthiness of the AI system.

For example, embedding models generate a continuous, high-dimensional vector space where similar inputs have similar vectors. However, the dimensional space of embeddings is based upon the eventual conclusion of the neural network training process. The output of two embeddings—"this word or sentence is similar to that word or sentence"—is helpful, but it is not possible for human deduction or intuition to be applied further into the results of current-day embedding models because the meaning of differences in vectors is not interpretable by humans.

In the conceptual map proposed in this project, similarity will be possible to achieve through the geometry of the system, and the results of such a system will be able to produce a meaningful human-interpretable representation of conceptual relationships.

## Real World Examples
### Solving the Retrieval Accuracy Problem in Document-Based RAG Pipelines

A primary application of Know is to address the retrieval accuracy problem in document-based RAG (Retrieval-Augmented Generation) pipelines.

The main quality challenge in RAG systems today lies in retrieval intelligence — that is, how effectively the system can identify and surface the precise knowledge needed to generate a correct and complete answer.

Key questions include:
- Given a user’s query, how accurately can the retrieval system find the relevant knowledge?
- If the knowledge is missing, does the system recognize that?
- If the knowledge is partial, does it understand the incompleteness?
- If the knowledge exceeds the context window, does the system handle that intelligently?
- Can the retrieval system aggregate and synthesize information that is distributed across large or disjointed sections of documents?

For example:
- Can it return a summary of a book?
- Can it produce a synthesis of how a new piece of legislation impacts a business agreement?

### A Research Tool
Since the nature of Know is interoperable and explainable, it's a great fit for researchers and decision makers because explainability and interpretability are built into the fabric of the technology. Questions like "What sources make this answer true?" are easily surfaced and findable. Additionally, exploration and searchability become simple because nearby concepts are immediately viewable.

### Mapping a Codebase for Improved Retrieval by Coding Agents
When the concepts of a codebase can be accurately mapped, this will improve the performance of AI coding agents by enhancing their ability to search, understand, and make proper changes to the correct sections of large codebases.

### News Mapping

Example use case: Determining if a new legislative court hearing is impacting my business.
