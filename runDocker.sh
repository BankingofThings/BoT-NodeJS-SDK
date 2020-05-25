docker stop nodesdk
docker image prune
docker container prune
docker build --tag=nodesdk .
#docker -d run --name nodesdk -d -p 3001:3001 --log-opt max-size=50m nodesdk
docker run --name nodesdk -p 3001:8080 --log-opt max-size=50m nodesdk
docker logs nodesdk