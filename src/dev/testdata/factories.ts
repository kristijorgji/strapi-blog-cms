import {faker} from "@faker-js/faker";
import {crandom, makeUnique} from "./_utils";
import {categories, tags} from "./data";
import {randomInt} from "crypto";

export const SeoFactory = () => {
  return {
    metaTitle: faker.lorem.words(5),
    metaDescription: faker.word.words(10),
    keywords: faker.word.words(10).split(' ').join(','),
  };
}

export const PostFactory = () => {
  const title = faker.lorem.words(5);
  return {
    title: title,
    content: faker.word.words(50),
    slug: title.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, ""),
    categories: {
      connect: makeUnique(randomInt(0, categories.length), () => crandom(categories)),
    },
    tags: {
      connect: makeUnique(randomInt(0, tags.length), () => crandom(tags)),
    },
    // TODO for some reason Strapi does not add the component here...
    seo: faker.datatype.boolean() ? null: SeoFactory(),
    publishedAt: new Date(),
    ...createdAndUpdatedByPayload(),
  };
}

export function createdAndUpdatedByPayload(): {
  createdBy: number;
  updatedBy: number;
} {
  return {
    createdBy: 1,
    updatedBy: 1,
  };
}
