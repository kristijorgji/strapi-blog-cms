# strapi-blog-cms

This is a Strapi project customized to serve as a `blog cms` with similar content types and functionality as `Wordpress`

It includes
* content types needed for the blog
* permission types and necessary plugins
* config export-import automatically

# How to use

Clone this repository then run `yarn install`

Afterward run
```bash
config-sync import
```

Finally `yarn build` then `yarn start` to start your Strapi admin panel.

# How to export-import all data

This project is intended for a minimalistic blog cms.
It is using the default storage which is sqlite.

Copy `.tmp` folder to a backup folder then when you initialise the project elsewhere just replace the folder.
All your users, content will be preserved this way.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project. Find the one that suits you on the [deployment section of the documentation](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html).
