/**
 * post controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::post.post', ({strapi}) => ({
  /**
   * a temporary solution that is not very performant until Strapi allows to get
   * creator data like they did in previous versions
   * https://github.com/strapi/documentation/issues/762
   */
  // @ts-ignore
  async find(ctx) {
    const { data, meta } = await super.find(ctx);

    const query = strapi.db.query('api::post.post');

    await Promise.all(
      data.map(async (item, index) => {
        const post = await query.findOne({
          where: {
            id: item.id,
          },
          select: [],
          populate: ['createdBy'],
        });

        data[index].attributes.createdBy = {
          id: post.createdBy.id,
          firstname: post.createdBy.firstname,
          lastname: post.createdBy.lastname,
        };
      })
    );

    return { data, meta };
  },
}));
