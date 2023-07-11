import {Strapi} from "@strapi/strapi";
import * as fs from "fs";
import {createdAndUpdatedByPayload, PostFactory} from "./testdata/factories";
import {make} from "./testdata/_utils";

export async function seedTestData(strapi: Strapi): Promise<void> {
  strapi.log.info(`seedTestData`);

  await seedTestAdminUser(strapi);
  await createDevelopmentBearerTokenIfNotExist(strapi);
  await seedCategories(strapi);
  await seedTags(strapi);
  await seedPosts(strapi);
}

async function seedTestAdminUser(strapi: Strapi): Promise<void> {
  // @ts-ignore
  await strapi.admin.services.role.createRolesIfNoneExist();
  const superAdminRole = await strapi.db.query('admin::role').findOne({where: {code: 'strapi-super-admin'}});
  const superAdmin = await strapi.db.query('admin::user').findOne({where: {username: 'admin'}});
  if (!superAdmin) {
    const params = {
      username: 'admin',
      email: 'admin@email.com',
      blocked: false,
      isActive: true,
      confirmed: true,
      password: null,
      roles: null
    }
    // @ts-ignore
    params.password = await strapi.admin.services.auth.hashPassword("admin");
    params.roles = [superAdminRole.id]
    await strapi.db.query("admin::user").create({
      data: {...params},
      populate: ['roles']
    });
  }
}

async function createDevelopmentBearerTokenIfNotExist(strapi: Strapi): Promise<void> {
  const tokenService = strapi.service('admin::api-token');
  if (tokenService && tokenService.create) {
    const name = 'development-only-token';
    const tokenAlreadyExists = await tokenService.exists({
      name: name,
    });
    if (tokenAlreadyExists) {
      strapi.log.info(`an api token named '${name}' already exists, skipping...`);
    } else {
      strapi.log.info(`creating '${name}' api token`);
      const {accessKey} = await tokenService.create({
        name: name,
        type: 'full-access',
        // lifespan: 7 * 24 * 3600 * 1000,
      });
      if (!fs.existsSync('build')) {
        fs.mkdirSync('build', {recursive: true});
      }
      const outputPath = 'build/devBearerToken';
      fs.writeFileSync(outputPath, accessKey);

      strapi.log.info(`Wrote dev bearerToken to ${outputPath}`);
    }
  }
}

async function seedCategories(strapi: Strapi): Promise<void> {
  const resource = 'api::category.category';
  const [_, count] = await strapi.db.query(resource).findWithCount({select: []});
  if (count === 0) {
    const phpCategory = await strapi.db.query(resource).create({
      data: {
        title: 'php',
        slug: 'php',
        publishedAt: new Date(),
        ...createdAndUpdatedByPayload(),
      },
    });

    // creating a nested category here
    const laravelCategory = await strapi.db.query(resource).create({
      data: {
        parent: {
          connect: [phpCategory.id],
        },
        title: 'laravel',
        slug: 'laravel',
        publishedAt: new Date(),
        ...createdAndUpdatedByPayload(),
      },
    });

    // nest level 2
    await strapi.db.query(resource).create({
      data: {
        parent: {
          connect: [laravelCategory.id],
        },
        title: 'laravel8',
        slug: 'laravel8',
        publishedAt: new Date(),
        ...createdAndUpdatedByPayload(),
      },
    });

    await strapi.db.query(resource).create({
      data: {
        title: 'travelling',
        slug: 'travelling',
        publishedAt: new Date(),
        ...createdAndUpdatedByPayload(),
      },
    });
  }
}

async function seedTags(strapi: Strapi): Promise<void> {
  const [_, count] = await strapi.db.query("api::tag.tag").findWithCount({select: []});
  if (count === 0) {
    await strapi.db.query("api::tag.tag").createMany({
      data: [
        {
          name: 'database',
          slug: 'database',
          publishedAt: new Date(),
          ...createdAndUpdatedByPayload(),
        },
        {
          name: 'seeder',
          slug: 'seeder',
          publishedAt: new Date(),
          ...createdAndUpdatedByPayload(),
        },
      ]
    });
  }
}

async function seedPosts(strapi: Strapi): Promise<void> {
  const [_, count] = await strapi.db.query("api::post.post").findWithCount({select: []});
  if (count === 0) {
    await strapi.db.query("api::post.post").create({
      data:
        {
          title: 'my first post',
          content: `#this is my first post and it is seeded by the strapi api in the bootstrap file
                    <p>It is using nested html inside markup as well</p>`,
          slug: 'my-first-post',
          categories: {
            connect: [3],
          },
          tags: {
            connect: [1],
          },
          publishedAt: new Date(),
          ...createdAndUpdatedByPayload(),
        },
    });

    make(100, PostFactory).map(async (post) => await strapi.db.query("api::post.post").create({
      data: post
    }));
  }
}
