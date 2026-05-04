import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogiCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blogi' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

const mediaCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/medialle' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blogi: blogiCollection,
  medialle: mediaCollection,
};
