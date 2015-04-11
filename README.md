kunishu ![build](https://circleci.com/gh/m-wrona/kunishu-server.svg?style=svg&circle-token=56943cf387202a237dbed64a5f11c89e7d9a6ca7)
=======

Kunishu is a coding name of Hevicado.
Hevicado is an application for office and schedule management for doctors and small organizations.

## Tasks

#### Install dependencies

```shell
   $npm install
```

#### Run unit tests

```shell
   $npm test
```

or

```shell
   gulp test
```

#### Run e2e tests

```shell
   $npm start
   $npm run protractor
```

#### Run application locally

```shell
   $npm start
```

or run using gulp for browser auto-refreshing:

```shell
   $gulp
```

## Release build

1) Change application version

a) 'version' value in app/modules/base/js/app.js

b) bower.json

c) package.json

2) Clean your current build

```shell
   $gulp clean
```
3) Create new release build

```shell
   $gulp release
```

4) Check locally whether release build is OK

```shell
   $gulp serve:release
```

## Deploy

All deploy script are kept in *build* directory at the moment

1) Building package with current version

```shell
build.sh
```

2) Building package with current version

```shell
deploy.sh <env> <version>
```

For instance:

```shell
deploy.sh kunishu-dev 1.2.0
```

***Note***: 

It's assumed that you have your environemts defined in SSH configuration. 

You have to have access granted (via public key) to environment too.

