# Configurar variables
$resourceGroup = "aabrilr_rg_2045"
$acrName = "chatbotsensa"
$imageName = "assistant"
$appServicePlan = "aabrilr_asp_9094"
$webAppName = "chatbotwhatsapp"

# Iniciar sesión en Azure
az login

# Obtener las credenciales de ACR
$acrCredentials = az acr credential show -n $acrName | ConvertFrom-Json
$acrUsername = $acrCredentials.username
$acrPassword = $acrCredentials.passwords[0].value

# Configurar el contenedor en la Web App
az webapp config container set --name $webAppName --resource-group $resourceGroup --docker-registry-server-url $("https://$acrName.azurecr.io") --docker-registry-server-user $acrUsername --docker-registry-server-password $acrPassword
