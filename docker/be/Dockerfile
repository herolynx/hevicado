# Define base image
FROM ubuntu:trusty

# Prepare ubuntu, install add-apt-repository command
RUN apt-get update && apt-get install -y software-properties-common python-software-properties

# Install Oracle Java 7 automatically
RUN add-apt-repository ppa:webupd8team/java
RUN apt-get update
RUN echo oracle-jdk7-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
RUN apt-get install -y oracle-jdk7-installer

# Copy start / stop scripts
COPY ./docker-entrypoint.sh /
RUN chmod +rx /docker-entrypoint.sh

# Prepare hevicado working directory
RUN mkdir /usr/share/hevicado

# Define mountable hevicado directory
VOLUME ["/usr/share/hevicado"]
VOLUME ["/var/log/hevicado"]

# Expose hevicado server port
EXPOSE 8000

# Define entry point
ENTRYPOINT ["/docker-entrypoint.sh"]

# Define default command
CMD ["start"]