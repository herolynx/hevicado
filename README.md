kunishu
=======

Cloud management of the business 

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