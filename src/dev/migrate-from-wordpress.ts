import * as mysql from 'mysql2/promise';
import {Strapi} from "@strapi/strapi";
import {createdAndUpdatedByPayload} from "./testdata/factories";
import {RowDataPacket} from "mysql2/typings/mysql/lib/protocol/packets";

type MigrationObject<T = unknown> = {
  originalId: string,
  strapiCreatedId: string,
  strapiObject: unknown,
};

export async function migrateFromWordpressMysql(strapi: Strapi) {
  const connection = await mysql.createConnection({
    host: process.env.WP_MYSQL_HOST,
    user: process.env.WP_MYSQL_USER,
    password: process.env.WP_MYSQL_PASSWORD,
    database: process.env.WP_MYSQL_DB
  });

  try {
    await strapi.db.query('api::category.category').create({
      data: {
        title: 'Uncategorized',
        slug: 'uncategorized',
        publishedAt: new Date(),
        ...createdAndUpdatedByPayload(),
      },
    });
  } catch (e) {
    if (!e.message.includes('UNIQUE constraint failed: categories.slug') && e.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
      throw e;
    }
  }

  const [allTermsAndCategories] = await connection.execute(
    'select * from wp_terms inner join wp_term_taxonomy on wp_terms.term_id = wp_term_taxonomy.term_taxonomy_id order by wp_terms.term_id asc'
  );
  const categoryRows: RowDataPacket[] = [];
  const categories: MigrationObject[] = [];
  const tags: MigrationObject[] = [];
  for (const row of allTermsAndCategories as RowDataPacket[]) {
    if (row.taxonomy === 'category') {
      categoryRows.push(row);
    } else if (row.taxonomy === 'post_tag') {
      const creq = {
        name: row.name,
        slug: row.slug,
        publishedAt: new Date(),
        ...createdAndUpdatedByPayload(),
      };

      let cr = await strapi.db.query('api::tag.tag').findOne({
        where: {
          slug: row.slug
        },
      });
      if (!cr) {
        cr = await strapi.db.query('api::tag.tag').create({data: creq,});
      }

      tags.push({
        originalId: row.term_id,
        strapiCreatedId: cr.id,
        strapiObject: creq,
      });
    }
  }

  await insertCategories(categoryRows);

  const [posts] = await connection.execute(
    'SELECT * FROM `wp_posts` where post_status = \'publish\' and post_type=\'post\''
  );
  for (const row of posts as any[]) {
    if (await strapi.db.query('api::post.post').findOne({
      where: {
        slug: row.post_name
      },
    })) {
      continue;
    }

    const [postTerms] = await connection.execute(`
        select * from wp_term_relationships inner join wp_term_taxonomy on wp_term_taxonomy.term_taxonomy_id = wp_term_relationships.term_taxonomy_id
      where object_id = ?
    `, [row.ID]);

    const categoriesIds = (postTerms as RowDataPacket[])
      .filter((el) => el.taxonomy === 'category')
      .map((el) => categories.find((s) => s.originalId === el.term_id).strapiCreatedId);
    const tagsIds = (postTerms as RowDataPacket[])
      .filter((el) => el.taxonomy === 'post_tag')
      .map((el) => tags.find((s) => s.originalId === el.term_id).strapiCreatedId);

    await strapi.db.query('api::post.post').create({
      data:
        {
          title: row.post_title,
          content: row.post_content,
          slug: row.post_name,
          categories: {
            connect: categoriesIds,
          },
          tags: {
            connect: tagsIds,
          },
          publishedAt: row.post_date_gmt,
          createdAt: row.post_date_gmt,
          updatedAt: row.post_modified_gmt,
          ...createdAndUpdatedByPayload(),
        },
    });
  }

  async function insertCategories(all: RowDataPacket[]) {
    for (const row of all) {
      await insertCategoryAndParentIfNeeded(row, all);
    }
  }

  async function insertCategoryAndParentIfNeeded(row: RowDataPacket, all: RowDataPacket[]): Promise<MigrationObject> {
    let parent = null;
    if (row.parent !== 0) {
      let parentCat = categories.find((el) => el.originalId === row.parent);
      if (!parentCat) {
        parentCat = await insertCategoryAndParentIfNeeded(all.find((el) => el.term_id === row.parent), all);
      }
      parent = {
        connect: [parentCat.strapiCreatedId],
      }
    }

    const creq = {
      title: row.name,
      slug: row.slug,
      parent: parent,
      publishedAt: new Date(),
      ...createdAndUpdatedByPayload(),
    };

    let cr = await strapi.db.query('api::category.category').findOne({
      where: {
        slug: row.slug
      },
    });
    if (!cr) {
      cr = await strapi.db.query('api::category.category').create({data: creq,});
    }

    const response = {
      originalId: row.term_id,
      strapiCreatedId: cr.id,
      strapiObject: cr,
    };
    categories.push(response);

    return response;
  }
}
