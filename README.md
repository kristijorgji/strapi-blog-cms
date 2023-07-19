# strapi-blog-cms

This is a Strapi project customized to serve as a `blog cms` with similar content types and functionality as `Wordpress`

It includes
* content types needed for the blog
* permission types and necessary plugins
* config export-import automatically

# How to use

Clone this repository then run `yarn install`

Copy .env.example to .env and fill in proper values

Afterward run `yarn build` and finally
```bash
config-sync import
```

Finally `yarn build` then `yarn start` to start your Strapi admin panel.

# How to export-import all data

This project is intended for a minimalistic blog cms.
It is using the default storage which is sqlite.

Copy `.tmp` folder to a backup folder then when you initialise the project elsewhere just replace the folder.
All your users, content will be preserved this way.

# Seeding test data

Adjust `src/index.ts` `bootstrap` method and uncomment the call to `seedTestData`

This will create an admin user and some data for you only for development purpose.

Test credentials:

`admin@email.com`

`admin`

# Migrating Wordpress data

You can use `dev/migarte-from-wordpress.ts` file.

First make sure to specify in the .env file the following variables
```
WP_MYSQL_HOST=some-value
WP_MYSQL_USER=some-value
WP_MYSQL_PASSWORD=some-value
WP_MYSQL_DB=some-value
```

Then execute the exported function 1 time from the bootstrap or anywhere else.

The tool will fetch posts, categories, tags and insert them into correct Strapi auto-generated content types.

Please note that this will not migrate the custom pages and any plugins you have.

TODO
* migrate wp pages
* migrate authors
* consider plugins (feel free to make PRs here as well to improve)

# Development

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-develop)

```
npm run develop
# or
yarn develop
```

**Debugging**

adjust `tsconfig.json` to have `"sourceMap": true`

Adjust your editor, for example IntelliJ to run `yarn develop` command in debug mode and set-up breakpoints.

# Start Strapi server

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-start)

after building with `yarn build`

```
npm run start
# or
yarn start
```
