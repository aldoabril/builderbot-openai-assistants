docker build --build-arg PORT=3008 -t chatbotsensa.azurecr.io/assistant:latest .
az acr login --name chatbotsensa.azurecr.io  
docker push chatbotsensa.azurecr.io/assistant:latest
