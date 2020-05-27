# enter your product ID from this URL https://maker.bankingofthings.io/products
export PRODUCT_ID='35cd6289-21fe-44cd-8482-18c03068a348'
#

docker stop nodesdk
docker image prune
docker container prune
echo "Setting Product ID: $PRODUCT_ID"
docker build --tag=nodesdk --no-cache --build-arg PRODUCT_ID=$PRODUCT_ID .

docker run --name nodesdk \
  -e PRODUCT_ID=$PRODUCT_ID \
  -p 3001:3001 \
  --mount type=bind,source="$(pwd)"/storage,target=/home/node/app/BoT-NodeJS-SDK/storage \
  --log-opt max-size=50m nodesdk
docker logs nodesdk