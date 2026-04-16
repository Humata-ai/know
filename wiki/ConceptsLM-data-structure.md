# The ConceptsLM data structure
The framework we are applying to model concepts as geometry is built upon the work Peter Gardenfors has done in his two books Conceptual Spaces: The Geometry of Thought and the Geometry of Meaning: Semantics Based on Conceptual Spaces. 

### Quality Dimensions

To understand what is meant by "quality dimensions" please see its [glossary definition](./Glossary.md#quality-dimensions).

```ts
const NumberRangeTuple = z.tuple([z.number(), z.number()]).readonly()
export const QualityDimensionSchema = z.object({
  id: z.string(),
  name: z.string(),
  range: NumberRangeTuple,
})
```
- [schemas.ts:9](/app/app/components/shared/schemas.ts#L9)

### Quality Domain
To understand what is meant by "quality domain" please see its [glossary definition](./Glossary.md#quality-domain).

```ts
export const QualityDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  dimensions: z.array(QualityDimensionSchema),
  properties: z.array(QualityDomainPropertySchema),
  createdAt: z.date(),
})
```
- [schemas.ts:51](/app/app/components/shared/schemas.ts#L51)


### Property

To understand what is meant by "property" please see its [glossary definition](./Glossary.md#property).

```ts
export const RegionDimensionRangeSchema = z.object({
  dimensionId: z.string(),
  range: NumberRangeTuple,
})

export const PointDimensionValueSchema = z.object({
  dimensionId: z.string(),
  value: z.number(),
})
```

### Concept

To understand what is meant by "concept" please see its [glossary definition](./Glossary.md#concept).

```ts
export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  propertyRefs: z.array(PropertyReferenceSchema),
  createdAt: z.date(),
})
```

### Actions

To understand what is meant by "action" please see its [glossary definition](./Glossary.md#action).
