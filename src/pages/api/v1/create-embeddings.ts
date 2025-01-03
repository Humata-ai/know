import { createEmbeddings } from '@/utils-server/openai/create-embedding';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const embeddings = await createEmbeddings(['cat'], { dimensions: 3 })
  res.status(200).json({ embeddings });
}
