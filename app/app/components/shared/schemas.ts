import { z } from 'zod'

// ===== Number Range Tuple =====

const NumberRangeTuple = z.tuple([z.number(), z.number()]).readonly()

// ===== Quality Dimension =====

export const QualityDimensionSchema = z.object({
  id: z.string(),
  name: z.string(),
  range: NumberRangeTuple,
})

// ===== Region/Point Label Types (Discriminated Union) =====

export const RegionDimensionRangeSchema = z.object({
  dimensionId: z.string(),
  range: NumberRangeTuple,
})

export const PointDimensionValueSchema = z.object({
  dimensionId: z.string(),
  value: z.number(),
})

const QualityDomainLabelBaseSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  domainId: z.string(),
  createdAt: z.date(),
})

export const QualityDomainRegionSchema = QualityDomainLabelBaseSchema.extend({
  type: z.literal('region'),
  dimensions: z.array(RegionDimensionRangeSchema),
})

export const QualityDomainPointSchema = QualityDomainLabelBaseSchema.extend({
  type: z.literal('point'),
  dimensions: z.array(PointDimensionValueSchema),
})

export const QualityDomainLabelSchema = z.discriminatedUnion('type', [
  QualityDomainRegionSchema,
  QualityDomainPointSchema,
])

// ===== Backward Compatibility Aliases =====

export const PropertyDimensionRangeSchema = z.object({
  dimensionId: z.string(),
  range: NumberRangeTuple,
})

export const PropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  domainId: z.string(),
  dimensions: z.array(PropertyDimensionRangeSchema),
  createdAt: z.date(),
})

// ===== Quality Domain =====

export const QualityDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  dimensions: z.array(QualityDimensionSchema),
  labels: z.array(QualityDomainLabelSchema),
  properties: z.array(PropertySchema).optional(),
  createdAt: z.date(),
})

// ===== References =====

export const LabelReferenceSchema = z.object({
  domainId: z.string(),
  labelId: z.string(),
})

export const PropertyReferenceSchema = z.object({
  domainId: z.string(),
  propertyId: z.string(),
})

export const PointReferenceSchema = z.object({
  domainId: z.string(),
  pointId: z.string(),
})

// ===== Concept =====

export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  labelRefs: z.array(LabelReferenceSchema),
  propertyRefs: z.array(PropertyReferenceSchema).optional(),
  createdAt: z.date(),
})

// ===== Concept Instance =====

export const ConceptInstanceSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  name: z.string(),
  pointRefs: z.array(PointReferenceSchema),
  createdAt: z.date(),
})

// ===== Conceptual Structure =====

export const ConceptualStructureSchema = z.object({
  domains: z.array(QualityDomainSchema),
  concepts: z.array(ConceptSchema),
  instances: z.array(ConceptInstanceSchema),
})

// ===== Concepts Word Types =====

export const WordClassSchema = z.enum(['noun', 'adjective', 'verb', 'adverb', 'preposition'])

export const WordSchema = z.object({
  id: z.string(),
  name: z.string(),
  wordClass: WordClassSchema,
  conceptualStructure: ConceptualStructureSchema,
  createdAt: z.date(),
})

// ===== Dictionary Word =====

export const DictionaryWordSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Reference to a label (region/point) in a quality domain */
  labelRef: LabelReferenceSchema.optional(),
  /** Reference to a concept */
  conceptId: z.string().optional(),
  createdAt: z.date(),
})

// ===== Verb Type & Action =====

export const VerbTypeSchema = z.enum(['manner', 'result'])

export const ActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  verbType: VerbTypeSchema,
  createdAt: z.date(),
})

// ===== Generate Label API Schemas =====
// These schemas are used for OpenAI structured output in the generate-label API.

export const DimensionInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  range: z.tuple([z.number(), z.number()]),
})

export const GenerateLabelRequestSchema = z.object({
  propertyName: z.string().optional(),
  propertyType: z.enum(['region', 'point']).optional(),
  labelName: z.string().optional(),
  labelType: z.enum(['region', 'point']).optional(),
  domainName: z.string(),
  dimensions: z.array(DimensionInputSchema),
}).transform((data) => ({
  // Support both old (labelName/labelType) and new (propertyName/propertyType) parameters
  propertyName: data.propertyName || data.labelName || '',
  propertyType: data.propertyType || data.labelType || 'region',
  labelName: data.propertyName || data.labelName || '',
  labelType: data.propertyType || data.labelType || 'region',
  domainName: data.domainName,
  dimensions: data.dimensions,
}))

/**
 * Build a zod schema for the AI-generated region label response.
 * Each dimension gets a { min, max } object.
 */
export function buildRegionResponseSchema(dimensions: z.infer<typeof DimensionInputSchema>[]) {
  const shape: Record<string, z.ZodObject<{ min: z.ZodNumber; max: z.ZodNumber }>> = {}
  for (const dim of dimensions) {
    shape[dim.id] = z.object({
      min: z.number(),
      max: z.number(),
    })
  }
  return z.object({
    dimensions: z.object(shape),
  })
}

/**
 * Build a zod schema for the AI-generated point label response.
 * Each dimension gets a single number value.
 */
export function buildPointResponseSchema(dimensions: z.infer<typeof DimensionInputSchema>[]) {
  const shape: Record<string, z.ZodNumber> = {}
  for (const dim of dimensions) {
    shape[dim.id] = z.number()
  }
  return z.object({
    dimensions: z.object(shape),
  })
}
