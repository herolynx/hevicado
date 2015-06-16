Hevicado [![Circle CI](https://circleci.com/gh/m-wrona/hevicado.svg?style=svg&circle-token=84be672fc11e78f986d3d14439eac2ddc9cfc8cd)](https://circleci.com/gh/m-wrona/hevicado)
==============

Hevicado is an application for office and schedule management for doctors and small organizations.


## Required

Generic:

* Docker: 1.6.0 or newer
* Ansible: 1.9.0.1 or newer

Backend: 

* Scala: 2.10.3
* Sbt: 0.13:6
* MongoDB: 3.0.0 or newer

Frontend:

* npm
* bower
* gulp

## Backend

1) Run sbt

```scala
    sbt
```

Once it's up, similar message will be displayed:

```scala
hevicado:master...origin/master:1.0.0>
```

2) Chose web project

```scala
hevicado:master...origin/master:1.0.0> project io-web
```

3) Run web project locally

```scala
web:master...origin/master:1.0.0> run
```

or for running with auto-refresh mode:

```scala
web:master...origin/master:1.0.0> ~re-start
```

After that server will be run at port 8000

4*) Demo data usage

*Demo* directory of project contains:

a) Project for Postman plugin (postman.json) which holds API with sample calls that can be made to back-end

b) Sample data that can be imported into hevicadoDB 

## Frontend

1) Install dependencies

```shell
   $npm install
```

2) Run unit tests

```shell
   $npm test
```

or

```shell
   gulp test
```

3) Run e2e tests

```shell
   $npm start
   $npm run protractor
```

4) Run application locally

```shell
   $npm start
```

or run using gulp for browser auto-refreshing:

```shell
   $gulp
```

## Build & deployment

Hevicado's environments are managed using Ansible. All tasks are automated and can be run at any time.

1) Provision server with needed packages:

```shell
ansible-playbook -i {{env}} provisioning/site.yml
```

2) Build packages:

```shell
sudo build.sh
```

***Note: since build prepares Docker images, root privileges are required***

3) Deploy all:

```shell
ansible-playbook -i {{env}} deployment/site.yml
```

##### Ansible - common commands

1) Ping

```shell
ansible all -i {{env}} -m ping
```

2) Run a command on all servers

```shell
ansible all -i {{env}} -a "whoami"
ansible all -i {{env}} -a "uptime"
ansible all -i {{env}} -a "date"
ansible all -i {{env}} -a "cat /etc/issue"
ansible all -i {{env}} -l hevi-dev -a "docker ps"
```

3) Show memory, cpu and other config options on all servers

```shell
ansible all -i {{env}} -m setup
ansible all -i {{env}} -m setup -a "filter=ansible_*_mb"
ansible all -i {{env}} -m setup -a "filter=ansible_processor*"
ansible all -i {{env}} -m setup -a "filter=ansible_all_ipv4_addresses"
ansible all -i {{env}} -m setup -a "filter=ansible_bios_*"
```

4) Run playbook

```shell
ansible-playbook -i {{env}} deployment.yml --ask-sudo-pass
ansible-playbook -i {{env}} deployment.yml --tags backend --ask-sudo-pass
```

5) Dry-run, i.e. only check and report what changes should be made without actually executing them

```shell
ansible-playbook -i {{env}} deployment.yml --tags "mongo" --ask-sudo-pass --check
ansible-playbook -i {{env}} deployment.yml --tags "backend" --ask-sudo-pass --check --diff
```
## Docker

Hevicado server works in a Docker container, in order to run hevicado on Docker one needs to:

***Note: CM is automated using Ansible. You don't have to run docker manually. See Ansible section for more details.***

##### Docker - common commands

1) List local docker images, the output should contain mongo and hevicado/server images:

```shell
docker images
```

2) List runnning containers:

```shell
docker ps
```

Congratulations, after those steps hevicado/server works in a dockerized environment.

3) Stop a container:

```shell
docker stop CONTAINER_ID / CONTAINER_NAME
```

4) Remove all stopped containers:

```shell
docker rm $(docker ps -a -q)
```

5) Remove all images issue:

```shell
docker rmi $(docker images -q)
```

6) Attach to a running container

```shell
docker exec -it CONTAINER_NAME bash
```

##### Docker - Hevicado

1) Build hevicado-server docker image:

***Note: hevicado package must be built first***

```shell
docker build -t hevicado-be .
```

2) Run hevicado/server container in detached mode using docker, set the name of the container to webXX,
link hevicado/server to mongodb01 container, map port 8000 to local port 80XX, map ./docker/workdir docker volume:

```shell
cd ./docker/workdir
```

```shell
docker run -d -P --name web01 --link mongodb01:mongodb01 -p 8001:8000 -v $PWD:/usr/share/hevicado -t hevicado/server:latest
docker run -d -P --name web02 --link mongodb01:mongodb01 -p 8002:8000 -v $PWD:/usr/share/hevicado -t hevicado/server:latest
..
docker run -d -P --name webXX --link mongodb01:mongodb01 -p 80XX:8000 -v $PWD:/usr/share/hevicado -t hevicado/server:latest
```

##### Docker - MongoDB

1) Download official MongoDB docker image:

```shell
docker pull mongo:latest
```

2) Run MongoDB container in detached mode using docker, set the name of the container to: mongodb01, define mongo db directory (here we map the current directory), map port 27017 locally

```shell
docker run -d --name mongodb01 -v $PWD:/data/db -p 27017:27017 -t mongo
```

##### Docker - Exim4

1) Build Exim4 docker image

```shell
docker build -t hevicado-exim4 .
```

2) Run Exim4 in a docker container

```shell
docker run -d --name exim4 -p 25:25 -v /var/log/exim4:/var/log/exim4 -t hevicado-exim4
```

##### Docker - Nginx

1) Download official Nginx docker image:

```shell
docker pull nginx:latest
```

2) Run Nginx in a docker container

```shell
docker run -d --name nginx -p 80:80 -p 443:443 -v /usr/share/nginx/html:/usr/share/nginx/html:ro -v /etc/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -t nginx
```