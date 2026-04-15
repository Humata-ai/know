# The ConceptsLM data structure
The framework we are applying to model concepts as geometry is built upon the work Peter Gardenfors has done in his two books Conceptual Spaces: The Geometry of Thought and the Geometry of Meaning: Semantics Based on Conceptual Spaces. 

### Quality Domain
To understand what is meant by "quality domain" please see its [glossary definition](./Glossary.md#quality-domain).

```ts
export const QualityDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  dimensions: z.array(QualityDimensionSchema),
  labels: z.array(QualityDomainLabelSchema),
  properties: z.array(PropertySchema).optional(),
  createdAt: z.date(),
})
```
- [schemas.ts:66](./app/app/components/shared/schemas.ts#L66)

### Quality Dimensions

To understand what is meant by "quality dimensions" please see its [glossary definition](./Glossary.md#quality-dimensions).

### Property

To understand what is meant by "property" please see its [glossary definition](./Glossary.md#property).

### Concept

To understand what is meant by "concept" please see its [glossary definition](./Glossary.md#concept).

### Actions

To understand what is meant by "action" please see its [glossary definition](./Glossary.md#action).
