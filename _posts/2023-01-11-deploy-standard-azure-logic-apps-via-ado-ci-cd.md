---
title: "Deploy Single Tenant (Standard) Azure Logic Apps via Azure DevOps CI/CD"
date: 2023-01-11
comments: true
toc: true
categories: 
    - Azure
tags:
    - Logic App (Standard)
    - Bicep
    - DevOps
    - Pipelines
    - Best Practices

header:
  teaser: "/media/2023/teasers/deploy-standard-azure-logic-apps-via-ado-ci-cd.png"

excerpt: "Standard Logic Apps are suitable when it demands better isolation, performance and control over the executing environment. Unlike Logic App per workflow in the consumption model, Standard Logic App can host unlimited workflows. Further, the Standard Logic Apps model separates the concerns of deploying infrastructure and workflows into two different flows. This blog will give an overview to understand What LogicApps are, what flavours it offers and step through package and deployment steps using Azure DevOps pipelines."
---

More organisations are trending towards using low code/ no code cloud-native apps than traditional development. Among many choices, LogicApp has become the go-to choice for many integration workflows due to the large eco-system of configurable connectors to various systems. The ability to do the development through interactive designer UI through **ClickOps** has made it even more popular among business users. However, like any critical business application, we must use proper DevOps CI/CD practices to maintain consistency across environments by deploying these workflows faster and confidently.

This blog will give an overview to understand What LogicApps are, what flavours it offers and step through package deployment steps using Azure DevOps pipelines.

# Single-Tenant (Standard) Logic Apps

Compared to [Multi-Tenant (Consumption) Azure Logic Apps](https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-pricing#consumption-pricing), Standard Logic Apps are suitable when it demands better isolation, performance and control over the executing environment. Unlike Logic App per workflow in the Consumption model, Standard Logic App can host unlimited workflows. It also means rather than combining one deployment for the application infrastructure and the workflows, the Standard Logic Apps model separates the concerns of deploying infrastructure and workflows into two different flows.

# Logic App Project Structure

Standard Logic Apps require maintaining separate Infrastructure as Code (IaC) which I usually maintain under `env/main.bicep`. The root `src/MyStandardLogicApp` of the logic app source contains a host configuration file, a connection definition file, parameter definitions and a subfolder for each workflow containing the workflow definition.

I have structured my code example related to this blog as below. When you follow through with my example code snippets, I will refer to files relative to this structure.

```treeview
root/
|-- .azuredevops/
|   |-- pipelines/
|-- |-- |-- azure-pipelines.yml
|-- env/
|   |-- main.bicep
|-- src/
|   |-- MyStandardLogicApp/
|-- |-- |-- WorkflowName1/
|-- |-- |-- |-- workflow.json
|-- |-- |-- WorkflowName2/
|-- |-- |-- |-- workflow.json
|-- |-- |-- .funcignore
|-- |-- |-- connections.json
|-- |-- |-- host.json
|-- |-- |-- parameters.json
```

# Infrastructure as Code (IaC)

A Standard Logic App requires an App Service Plan or Environment, a storage account to host the logic app code package and an Azure Function base website resource at minimum. I am extending this further by having a User Managed Identity, a Key Vault, AppInsights and Log Analytics Workspace. But this is entirely optional.

**Note**: Through extended exercises, I demonstrate how sensitive information such as Storage connection string, AppInsights instrument key and connection strings are securely retrieved from Key Vault in Logic App Configuration. Though it is not necessary, developers often take security lightly.
{: .notice--info}

```bicep
/*
------------------------------------------------
Parameters
------------------------------------------------
*/
@allowed([ 'dev', 'test', 'prod' ])
@description('Required. Environment short name.')
param environmentShortName string

@description('Required. Resource deployment location.')
param location string = resourceGroup().location

@description('Optional. Tag values for the resource.')
param resourceTags object = {
  Environment: toLower(environmentShortName)
  Solution: 'Logic App DevOps Demo'
}

/*
------------------------------------------------
Variables
------------------------------------------------
*/
var appStackName = 'rkt-lapp-devops'
var managedIdentityName = 'mid-${appStackName}-${environmentShortName}'
var logAnalyticsWorkspaceName = 'log-${appStackName}-${environmentShortName}'
var appInsightsName = 'appi-${appStackName}-${environmentShortName}'
var keyVaultName = 'kv-${appStackName}-${environmentShortName}'
var appServicePlanName = 'asp-${appStackName}-lapp-${environmentShortName}'
var lappName = 'lapp-${appStackName}-${environmentShortName}'
var storageAccountName = 'stgrktlogicappdevops${environmentShortName}'
var appiInstrumentationKeyName = 'appinsights-instrumentation-key'
var appiConnectionStringKeyName = 'appinsights-connection-string'
var storageSecretKeyName = '${appStackName}-stg-connection-string'
var storageSku = 'Standard_LRS'
var logicAppSku = 'WS1'
var fileShares = [
  lappName
]

/*
------------------------------------------------
Managed Identity
------------------------------------------------
*/
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
  tags: resourceTags
}

/*
------------------------------------------------
Log Analytics Workspace
------------------------------------------------
*/
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: resourceTags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 120
    features: {
      searchVersion: 1
      legacy: 0
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

/*
------------------------------------------------
Application Insights
------------------------------------------------
*/
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: resourceTags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

/*
------------------------------------------------
Storage Account and Containers
------------------------------------------------
*/
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: storageSku
  }
  kind: 'StorageV2'
  tags: resourceTags
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }

  resource fileService 'fileServices@2022-09-01' = {
    name: 'default'

    resource fileShare 'shares@2022-09-01' = [for fileShareName in fileShares: {
      name: fileShareName
    }]
  }
}

/*
------------------------------------------------
Key Vault
------------------------------------------------
*/
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: keyVaultName
  location: location
  tags: resourceTags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enabledForTemplateDeployment: true
    accessPolicies: [
      {
        objectId: managedIdentity.properties.principalId
        tenantId: subscription().tenantId
        permissions: {
          secrets: [
            'all'
            'purge'
          ]
        }
      }
      {
        objectId: logicApp.identity.principalId
        tenantId: tenant().tenantId
        permissions: {
        secrets: [ 
            'Get'
            'List'
          ]
        }
      }
    ]
  }

  resource kvsAppInsightsInstrumentationKey 'secrets@2023-02-01' = {
    name: appiInstrumentationKeyName
    properties: {
      value: appInsights.properties.InstrumentationKey
    }
  }

  resource kvsAppInsightsConnectionStringKey 'secrets@2023-02-01' = {
    name: appiConnectionStringKeyName
    properties: {
      value: appInsights.properties.ConnectionString
    }
  }

  resource kvsStorageSecret 'secrets@2023-02-01' = {
    name: storageSecretKeyName
    properties: {
      value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
    }
  }
}

/*
------------------------------------------------
App Service Plans
------------------------------------------------
*/

resource appServicePlan 'Microsoft.Web/serverfarms@2021-03-01' = {
  name: appServicePlanName
  location: location
  kind: 'windows'
  sku: {
    name: logicAppSku
    tier: 'WorkflowStandard'
  }
  tags: resourceTags
}

/*
------------------------------------------------
Logic App
------------------------------------------------
*/
resource logicApp 'Microsoft.Web/sites@2022-09-01' = {
  name: lappName
  location: location
  kind: 'functionapp,workflowapp'
  tags: union(resourceTags, {
      'hidden-link: /app-insights-resource-id': appInsights.id
    })
  identity: {
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
    type: 'SystemAssigned, UserAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      netFrameworkVersion: 'v4.6'
      functionsRuntimeScaleMonitoringEnabled: false
    }
  }
}

/*
------------------------------------------------
App Settings of logic app
------------------------------------------------
*/
var storageAccountKvReference = '@Microsoft.KeyVault(vaultName=${keyVault.name};SecretName=${storageSecretKeyName})'
var appInsightsInstrumentationKeyKvReference = '@Microsoft.KeyVault(vaultName=${keyVault.name};SecretName=${appiInstrumentationKeyName})'
var appInsightsConnectionStringKvReference = '@Microsoft.KeyVault(vaultName=${keyVault.name};SecretName=${appiConnectionStringKeyName})'
resource logicAppSettings 'Microsoft.Web/sites/config@2022-03-01' = {
  parent: logicApp
  name: 'appsettings'
  properties: {
    APP_KIND: 'workflowApp'
    AzureFunctionsJobHost__extensionBundle__id: 'Microsoft.Azure.Functions.ExtensionBundle.Workflows'
    AzureFunctionsJobHost__extensionBundle__version: '[1.*, 2.0.0)'
    AzureWebJobsSecretStorageType: 'Files'
    AzureWebJobsStorage: storageAccountKvReference
    APPINSIGHTS_INSTRUMENTATIONKEY: appInsightsInstrumentationKeyKvReference
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsConnectionStringKvReference
    FUNCTIONS_EXTENSION_VERSION: '~4'
    FUNCTIONS_V2_COMPATIBILITY_MODE: 'true'
    FUNCTIONS_WORKER_RUNTIME: 'node'
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING: storageAccountKvReference
    WEBSITE_CONTENTSHARE: lappName
    WEBSITE_CONTENTOVERVNET: '1'
    WEBSITE_NODE_DEFAULT_VERSION: '~16'
  }
}

output keyVaultName string = keyVault.name
output logAnalyticsWorkspaceName string = logAnalyticsWorkspace.name
output appInsightsName string = appInsights.name
output managedIdentityName string = managedIdentity.name
output storageAccountName string = storageAccount.name
output appServicePlanName string = appServicePlan.name
output logicAppName string = logicApp.name
```

# CI/CD Pipeline

## Package Logic App

For Logic App, there is no build step. We need to zip-package the target folder containing definitions and workflows and upload it as a build artifact to use in the release stage.

**Important**: When packaging the logic app folder, ensure that files such as `local.settings.json` is not included with any sensitive credentials used during local development. In fact, any settings in that file will not be honoured by the logic app runtime. Hence, that file has no value.
{: .notice--warning}

```yml

- job: BuildLogicApp 
  displayName: 'Build LogicApp'
  steps:
    - task: ArchiveFiles@2
      displayName: 'Package Logic App'
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)/src/MyStandardLogicApp'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/lapp/MyStandardLogicApp.zip'
        replaceExistingArchive: true

    - task: PublishPipelineArtifact@1
      displayName: 'Publish Logic App Artifacts'
      inputs:
        path: '$(Build.ArtifactStagingDirectory)/lapp'
        artifact: lapp
        publishLocation: pipeline
        
```

## Deploy Logic App
The deployment is straightforward as deploying an Azure Function App. It is the same pipeline task. The `appName` need to be set to the logic app name; in this case, the value has been returned by infrastructure deployment output.

```yml

- task: AzureFunctionApp@1
   displayName: 'Deploy Logic App'
   inputs:
   	azureSubscription: $(azureServiceConnection)
        appType: 'functionApp'
        appName: '$(logicAppName)'
        package: '$(Pipeline.Workspace)/lapp/MyStandardLogicApp.zip'
        deploymentMethod: 'zipDeploy'

```

# Final Thoughts

Microsoft provides excellent documentation and use cases. However, almost all projects I dealt with Logic App presented various challenges in using different connections and parameters. Especially with Bicep, some types are missing, and I had to find the information with some R&D and sleepless nights.

We just briefly started, and more work needs to be done to make the logic app for production ready. I wanted to keep this blog post focused only on deploying the Logic App, and in future posts, I will develop more topics based on this foundation and keep updating this post.