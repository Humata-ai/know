## About

The ambition of this project is to create a knowledge API capable of responding to complex knowledge queries with traceability and human interpretability.

Think of it as a fusion between LLMs, which can answer complex human questions, and Git, which can model representational version changes.

## Solving the Retrieval Accuracy Problem in Document-Based RAG Pipelines

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

Problems such as these are the inspiration for this project
