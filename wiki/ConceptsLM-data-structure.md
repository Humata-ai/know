# The ConceptsLM data structure
The framework we are applying to model concepts as geometry is built upon the work Peter Gardenfors has done in his two books Conceptual Spaces: The Geometry of Thought and the Geometry of Meaning: Semantics Based on Conceptual Spaces. 

### Quality Domain
[Quality Domain](./Glossary.md#Quality Domain)

A quality domain is a collection of related quality dimensions that together characterize a particular aspect of experience or perception. Domains provide a natural grouping of dimensions that tend to co-vary or be processed together cognitively.

For example, the color domain combines three quality dimensions: hue (the spectrum from red through violet), saturation (the intensity or purity of the color), and brightness (the lightness or darkness). Together, these three dimensions form a complete characterization of color perception, and any specific color can be located as a point within this three-dimensional quality domain.

### Quality Dimensions

Quality dimensions are the fundamental building blocks of conceptual spaces. Each dimension represents a single quality along which entities can vary. Dimensions can be continuous (like temperature or brightness) or discrete (like number of sides).

Multiple quality dimensions combine to form a conceptual space. The number and nature of dimensions varies by the domain being modeled.

### Property

A property is a convex region of a domain. For example in the color domain there is a convex region labeled "red" which we call a property of that space. As it turns out convex regions of a conceptual space correspond to adjectives in english.

Examples of properties and the corresponding domain:
- red, blue → color domain
- tall, short → spatial / size domain
- heavy, light → weight domain
- sweet, bitter → taste domain

Property (and therefore adjectives) are represented as a convex region in a single domain. Some adjectives like "healthy" require an "illness-health domain" to support the single domain rule.

### Concept

A concept is a structured region across multiple domains that corresponds to nouns in natural language. When we use a common noun like "apple," "bird," or "chair," we are referring to a concept represented as an object category in conceptual space.

A concept is determined by:

1. A set of relevant domains (may be expanded over time)
2. A set of convex regions in these domains (in some cases, the region may be the entire domain)
3. Prominence weights of the domains (dependent on context)
4. Information about how the regions in different domains are correlated
5. Information about meronomic (part-whole) relations

Examples of object categories might include:

- Apple: regions in color domain (red, green, yellow), shape domain (roundness, size), taste domain (sweetness, tartness), texture domain (crispness, smoothness)
- Bird: regions in shape domain, size domain, color domain, with meronomic relations (has wings, has beak, has feathers)
- Chair: regions in shape domain (back, seat, legs), size domain, material domain, with specific part-whole structure

The prominence weights allow context-dependent emphasis. For example, when identifying fruit, the color and taste domains might be more prominent than texture, while when packing fruit for shipping, size and firmness become more prominent.

# Actions

This is an expression of the event modal that peter gardenfors lays out. Every event includes
- Subject 
- Force Vector
- Result Vector 
- Patient

We are still uncover exactly how this will be represented....
