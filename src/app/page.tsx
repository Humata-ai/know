import React from "react";
import { createEmbeddings } from "@/utils-server/openai/create-embedding";
import styles from "./page.module.css";
import { PlotExample } from "./plot.tsx";

async function addCoordinatesToWords(words: string[]): Promise<{ text: string, x: number, y: number, z: number }[]> {
  const embeddings = await createEmbeddings(words, { dimensions: 3 })
  return embeddings.map(({ embedding }, index) => {
    const [x, y, z] = embedding;
    return {
      text: words[index],
      x,
      y,
      z
    }
  })
}

function addColor<T>(word: T) {
  return {
    ...word,
    color: 'red'
  }
}

export default async function Home() {
  const [{ embedding: catEmbeddingFull }] = await createEmbeddings(['cat'])
  const [{ embedding: catEmbeddingThree }] = await createEmbeddings(['cat'], { dimensions: 3 })
  const words = [
    "cat",
    "cats",
    "dog",

    "pineapple",
    "banana",
    "apple",

    "dimensions",
    "Jesus",
    "Christian",
    "Mormon",
  ];

  const wordsWithEmbeddings = await addCoordinatesToWords(words)
  const points = wordsWithEmbeddings.map(addColor)

  return (
    <div style={styles}>
      <div>
        cat (dimensions {catEmbeddingFull.length})<span style={{ marginLeft: '54px' }}></span>: {JSON.stringify(catEmbeddingFull).slice(0, 200)}...
      </div>
      <div>
        cat (reduced to 3 dimensions): {JSON.stringify(catEmbeddingThree)}
      </div>

      <br />
      <br />

      <PlotExample points={points} />


    </div>
  );
}
