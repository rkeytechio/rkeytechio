---
title: "Set Bicep Output Variables as DevOps Pipeline Variables"
date: 2022-08-17
comments: true
toc: true
categories: 
    - Azure DevOps
tags:
    - How To
    - Bicep
    - Pipelines
header:
  teaser: "/media/2022/teasers/set-bicep-outputs-variables-as-ado-pipeline-variables.png"

---

When automating infrastructure deployments in Azure DevOps using pipelines, we often face the challenge of extracting the values calculated within the infrastructure scripts in follow-up tasks. This post looks into how Bicep output variables can be accessed as Azure DevOps pipeline variables so that follow-up tasks can use those values to perform the utterly automated deployment.

# Bicep File: Output Calculated Variables

When we need the infrastructure as code (IaC) to be completely automated, we can delegate the responsibility of generating the cloud resource names within the infrastructure script. Sometimes, the cloud resources demand the names be unique across the Azure ecosystem, and it is difficult to pre-determine the name. In such a situation, we can let output these calculated values back to the caller as information.

**Important:** Please note that you should refrain from passing back sensitive information like connection strings and storage keys as outputs. There are different ways to achieve it, which we will look at in a later post.
{: .notice--warning}

The following example illustrates how a unique storage account name is calculated within the Bicep file and is passed back to the caller via output variables.

To make the storage account name unique, I have used a built-in function in Bicep called [uniqueString](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-functions-string#uniquestring). This function helps generate a deterministic random string depending on the parameters passed into it. To meet the naming restrictions and to keep length limits, I have only used the first four (4) characters of the generated string.

Also, given that storage accounts don't support hyphens (-), I am using another built-in [replace](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-functions-string#replace) function to make the calculated name comply naming rules.

```bicep
/*
------------------------------------------------
Parameters
------------------------------------------------
*/
@description('Environment short name.')
param environmentShortName string

@description('Resource deployment location.')
param location string = resourceGroup().location

/*
------------------------------------------------
Variables
------------------------------------------------
*/
var projectCode = 'rkt-demo'
var appStackUniqueSuffix = '${projectCode}-${substring(uniqueString(resourceGroup().name), 0, 4)}'

var demoStorageAccountName = replace('stg-${appStackUniqueSuffix}-${environmentShortName}', '-', '')

resource demoStorageAccount 'Microsoft.Storage/storageAccounts@2021-08-01' = {
  name: demoStorageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}


/*
------------------------------------------------
Outputs
------------------------------------------------
*/
output stroageAccountName string = demoStorageAccount.name
```

The output variable `stroageAccountName` is available for the caller upon finishing this deployment.

# Azure Pipelines: Consume Bicep Output Variables
## Deploying Infrastructure

The deployment task of the Azure Bicep is standard. The most important thing here is the name given for the deployment, and the name of the resource group should be the same between the deployment step and the extraction step.

**Note:** The pipeline steps described below are running on the ubuntu latest agent image. Therefore, the commands and scripts must be aligned when using Windows agents.
{: .notice--info}

We leverage pipeline stage scope variables to keep these values constant between steps.

```yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureServiceConnection: 'sc-rkt-ado-arm'

stages:
  - stage: DeployDemoDev
    displayName: Deploy Demo Dev
    variables:
      environmentShortName: dev
      deploymentName: 'rkt-demo-$(environmentShortName)-deployment'
      azureResourceGroup: 'rg-rkt-demo-$(environmentShortName)'
```

Take note of how variables have been used, and this is a standard Azure CLI command to deploy a Bicep infrastructure script with some parameters.

```yml
          # Deploy Infrastructure
          - task: AzureCLI@2
            displayName: Deploy infrastructure
            inputs:
              azureSubscription: $(azureServiceConnection)
              scriptType: bash
              scriptLocation: inlineScript
              inlineScript: |
                az --version
                az deployment group create \
                --resource-group $(azureResourceGroup) \
                --name $(deploymentName) \
                --template-file "$(Build.SourcesDirectory)/env/main.bicep" \
                --parameters environmentShortName=$(environmentShortName)
```

## Set Pipeline Variables

The next is the most important and should be directly after the previous step. Again, it's a simple Azure CLI task. But we have a bit of script to extract the deployment output variables and set them as pipeline variables. The pipeline variable name will be the same as the Bicep output variables.

**Important:** If you had variables with the same names, you might risk overwriting them from this step forward. To avoid such mixups, we generally use a variable naming convention in YML pipelines so we know where the value originates.
{: .notice--info}

```yml
          # Set Deployment output values as pipeline variables
          - task: AzureCLI@2
            displayName: Set Pipeline Varaibles
            inputs:
              azureSubscription: $(azureServiceConnection)
              scriptType: bash
              scriptLocation: inlineScript
              inlineScript: |
                deploymentOutputs=$(az deployment group show \
                --resource-group $(azureResourceGroup) \
                --name $(deploymentName) \
                --query properties.outputs | jq -c 'to_entries[] | [.key, .value.value]')
                echo "$deploymentOutputs" | while IFS=$'\n' read -r c; do
                  outputname=$(echo "$c" | jq -r '.[0]')
                  outputvalue=$(echo "$c" | jq -r '.[1]')
                  echo "##vso[task.setvariable variable=$outputname;]$outputvalue"
                done
```
At the end of this script, all output variables from the Bicep deployment are set as Pipeline variables.

## Example Consume Step

Not necessarily a step you must have. But this step would help you to verify and confirm that your Bicep output variables are not set as Pipeline variables. How we use these output values in our deployment steps may depend on a case by case.

In my case, we use this storage account to host a single page application (SPA), and we use the storage account name and a few CLI commands directly to upload the SPA content back to the Azure storage account in the next step.

**Note:** Remember, in this example, the script sets the variables scoped to the current stage. So it is available for any tasks from the current point onwards. To understand how to use variables between jobs, read more [here](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-variables-scripts?view=azure-devops&tabs=bash#set-an-output-variable-for-use-in-future-jobs).
{: .notice--info}

```yml
          - script: |
              echo $(stroageAccountName) # outputs Demo Storage Account Name
            displayName: Usage Bicep Output Variables
```

## Complete Pipeline Script

```yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureServiceConnection: 'sc-rkt-ado-arm'

stages:
  - stage: DeployDemoDev
    displayName: Deploy Demo Dev
    variables:
      environmentShortName: dev
      deploymentName: 'rkt-demo-$(environmentShortName)-deployment'
      azureResourceGroup: 'rg-rkt-demo-$(environmentShortName)'

jobs:
      - job: DeployDev
        displayName: Deployment
        pool:
          vmImage: ubuntu-latest
        steps:
          # Deploy Infrastructure
          - task: AzureCLI@2
            displayName: Deploy infrastructure
            inputs:
              azureSubscription: $(azureServiceConnection)
              scriptType: bash
              scriptLocation: inlineScript
              inlineScript: |
                az --version
                az deployment group create \
                --resource-group $(azureResourceGroup) \
                --name $(deploymentName) \
                --template-file "$(Build.SourcesDirectory)/env/main.bicep" \
                --parameters environmentShortName=$(environmentShortName)

          # Set Deployment output values as pipeline variables
          - task: AzureCLI@2
            displayName: Set Pipeline Varaibles
            inputs:
              azureSubscription: $(azureServiceConnection)
              scriptType: bash
              scriptLocation: inlineScript
              inlineScript: |
                deploymentOutputs=$(az deployment group show \
                --resource-group $(azureResourceGroup) \
                --name $(deploymentName) \
                --query properties.outputs | jq -c 'to_entries[] | [.key, .value.value]')
                echo "$deploymentOutputs" | while IFS=$'\n' read -r c; do
                  outputname=$(echo "$c" | jq -r '.[0]')
                  outputvalue=$(echo "$c" | jq -r '.[1]')
                  echo "##vso[task.setvariable variable=$outputname;]$outputvalue"
                done

          - script: |
              echo $(stroageAccountName) # outputs Demo Storage Account Name
            displayName: Usage Bicep Output Variables
```

# Conclusion

We should refrain from hard coding or making static variables when naming infrastructure. Instead, we want our infrastructure scripts to be independent and self-contained. In such events, if we want our deployment pipelines to achieve fully automated steps, we can leverage Bicep output variables, consume their values directly after completing the deployment, and set them as Pipeline variables.

This post illustrated just that. However, not all projects are the same. How you handle and maintain other variables. How you determine your infrastructure names and where you define them will make changes to this script. It is just a starting point. I am sure you are clever enough to tweak it for your own use :smile: