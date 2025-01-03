import React from "react";
import { createEmbeddings } from "@/utils-server/openai/create-embedding";

export default async function Home() {
  const embeddings = await createEmbeddings(['cat'], { dimensions: 3 })

  return (
    <div>
      embeddings: {JSON.stringify(embeddings)}
    </div>
  );
}
