# What is a .know file?

Embeddings represent a single point in vector space that maps to a semantic meaning. For example `[3...,5...,7...,...]` might be the vector point that represents the word "dog", `[3...,6...,5...,...]` might be "cat", `[2...,4...,6...,...]` might be "construction", by getting the distance between these points we can see which pionts are the most similiar. 

A know file uses many of these singular points to create higher dimensional shapes that more completely represent the knowledge found in the provided files. For example `research_paper_a.pdf` can be converted into a know file `research_paper_1.know`. This conversion opens the door to the various knowledge operations listed below.

# Knowledge Operations
## know encode
I can convert a file into know file like so
```nu
know encode ./research-paper-A.pdf | save research-paper-A.know
```
## know diff
To see what knowledge is in A that is not in B
```nu
know diff A.know B.know
```
## know merge

I can merge multiple pieces of knowledge together
```nu
know merge A.know B.know | save C.know
```
## know subtract

This will give me the net new knowledge of new-paper against my existing research
```nu
know subtract paper-A.know all-my-research.know
  | save paper-A-new-knowledge.know
```

## know intersection

To determine where two pieces of knowledge overlap
```nu
know intersection paper-A.know all-my-research.know
```

## know volume

Get the volume of a knowledge file
```nu
let percent_new_knowledge = (know volume paper-new-knowledge.know) / (know volume all-my-research.know)
```

## know view

View the knowledge chunks taht are in this file (most likely opens a browser )
```nu
know view paper-new-knowledge.know
```

## Example Usecases

- If you can represent what you currently know as a `.know` file then you can use this operations to help you discover new knowledge
  - You'll be able to view the new knowledge of a new research paper with this command `know subtract paper-A.know all-my-research.know | know view`
  - Then you can add this paper to your existing knowledge `know merge paper-A.know all-my-research.know | save all-my-research.know`
- Modeling knowledge with `know` can also be leveraged to improve the retrival accuracy of RAG pipelines. The reason for this is because `know` creates higher dimensional knowledge representations then classical semantic search and keyword search based approachs

## Configuration

~/.know-config
[encoder]: know-encoder 
[view-tool]: https//github.com/know/know-viewer

## Table of Contents
- [[conversation_for_jsal]]
- tasks
  - [[detail-how-know-files-will-be-generated]]
  - [[make_a_diff_from_two_files]]
  - [[make-example-know-viewer]]
  - [[how_todo_retrival_with_know_files]]
