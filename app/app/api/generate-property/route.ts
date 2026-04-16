import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import {
  GeneratePropertyRequestSchema,
  buildRegionResponseSchema,
  buildPointResponseSchema,
} from '../../components/shared/schemas'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = GeneratePropertyRequestSchema.parse(await request.json())
    const { propertyName, propertyType, domainName, dimensions } = body

    if (!dimensions.length) {
      return NextResponse.json(
        { error: 'At least one dimension is required' },
        { status: 400 }
      )
    }

    const responseSchema = propertyType === 'region'
      ? buildRegionResponseSchema(dimensions)
      : buildPointResponseSchema(dimensions)

    const dimensionDescriptions = dimensions
      .map((d) => `  - "${d.name}" (range: [${d.range[0]}, ${d.range[1]}])`)
      .join('\n')

    const typeInstruction = propertyType === 'region'
      ? 'For each dimension, provide a min and max range that defines where this property exists within that dimension. The range should be a meaningful sub-region of the domain range.'
      : 'For each dimension, provide a single numeric value that represents where this property falls within that dimension.'

    const prompt = `You are an expert at defining quality domain properties in a conceptual space framework.

Given a quality domain called "${domainName}" with the following dimensions:
${dimensionDescriptions}

Generate appropriate ${propertyType === 'region' ? 'dimension ranges' : 'dimension values'} for a property called "${propertyName}".

${typeInstruction}

Think carefully about what "${propertyName}" means in the context of the "${domainName}" quality domain, and choose values that make semantic sense. The values must be within each dimension's domain range.`

    const response = await openai.responses.parse({
      model: 'gpt-4o',
      input: prompt,
      text: {
        format: zodTextFormat(responseSchema, 'property_dimensions'),
      },
    })

    const parsed = response.output_parsed

    if (!parsed) {
      return NextResponse.json({ error: 'No parsed output in response' }, { status: 500 })
    }

    // Transform the response into the format the frontend expects
    if (propertyType === 'region') {
      const regionDimensions = dimensions.map((dim) => {
        const dimData = parsed.dimensions[dim.id] as { min: number; max: number }
        return {
          dimensionId: dim.id,
          range: [dimData.min, dimData.max] as [number, number],
        }
      })
      return NextResponse.json({ type: 'region', dimensions: regionDimensions })
    } else {
      const pointDimensions = dimensions.map((dim) => ({
        dimensionId: dim.id,
        value: parsed.dimensions[dim.id] as number,
      }))
      return NextResponse.json({ type: 'point', dimensions: pointDimensions })
    }
  } catch (error) {
    console.error('Error generating property:', error)
    return NextResponse.json(
      { error: 'Failed to generate property dimensions' },
      { status: 500 }
    )
  }
}
