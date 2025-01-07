import { createEmbeddings } from "@/utils-server/openai/create-embedding"
import * as dot from 'compute-dot'

export async function EmbeddingDistance({ wordOne, wordTwo }: { wordOne: string, wordTwo: string }) {
  const [{ embedding: embeddingWordOne }, { embedding: embeddingWordTwo }] = await createEmbeddings([wordOne, wordTwo])
  const difference = dot(embeddingWordOne, embeddingWordTwo)
  return (
    <div>
      Embedding Distance between {wordOne} and {wordTwo}: {difference}
    </div>
  )
}
