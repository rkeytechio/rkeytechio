---
title: "Retrieve Azure Subscription ID as DevOps Pipeline Variable"
date: 2021-09-01
comments: true
toc: true
categories: 
    - Azure DevOps
tags:
    - How To
    - Azure
    - Pipelines
header:
  teaser: "/media/2021/2021-09-01/teaser.png"

---

When dealing with the Azure DevOps pipeline, we may have situations where we need to extract the current Azure subscription ID and use it as a variable in follow-up pipeline tasks. There are two ways of achieving this. One is storing the Azure subscription ID as a pipeline variable in a configurable place. Certainly nothing wrong with that. But we make the assumption we know it ahead of time.

# Problem
I was working on this engagement where a client did not have the Azure environment ready by the time I was onboarded. The client was planning to have a subscription for each of their target environment. In this case, that is four (4). Given my tight timeline, I want to wrap things up in a way my pipeline code can target any subscription scoped by the Azure DevOps service connection. So the client can use my pipeline whenever they are ready.

I have talked about Azure DevOps service connections before in this [post](https://rkeytech.io/2021/06/ado-service-connection-to-arm-using-service-principal). In this project, I know I will have a service connection setup scoped for each subscription, and I know the naming format of each service connection.

# Solution

Given that I know the service connection format, I added an Azure CLI task to get the Azure subscription ID into a variable and immediately set it as an Azure DevOps Pipeline variable.

The first thing I do, I make my service connection a calculated variable at run time. For illustration purposes, I do this same place. But you can easily modularise these deployment steps into a template and make it cleaner.

The magical Azure CLI command help me extract the Azure subscription ID is below;
```bash
subscriptionId=$(az account show --query id --output tsv)
```

The very immediate thing I do is set this captured variable as a pipeline variable. To learn how to set the pipeline variables, deep dive into this [article](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-variables-scripts?view=azure-devops&tabs=bash#set-an-output-variable-for-use-in-future-jobs).

I set the pipeline variable scoped for the current job scope in this instance. So any job after this step can get hold of this new pipeline variable.

```bash
echo "##vso[task.setvariable variable=azureSubscriptionId;]$subscriptionId"
```

The complete pipeline with all steps included with an example of hot to use it looks like below. How exactly you use the subscription ID may depend upon your use case.

```yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: DeployDev
    displayName: Deploy DEV
    variables:
      environmentShortName: dev
      azureServiceConnection: 'sc-rkt-ado-arm-$(environmentShortName)'
    jobs:
      - job: DeployDev
        displayName: Deployment
        steps:
          - task: AzureCLI@2
            displayName: Fetch Azure subscription ID
            inputs:
              azureSubscription: $(azureServiceConnection)
              scriptType: bash
              scriptLocation: inlineScript
              inlineScript: |
                subscriptionId=$(az account show --query id --output tsv)
                echo "##vso[task.setvariable variable=azureSubscriptionId;]$subscriptionId"

          - script: |
              echo $(azureSubscriptionId) # outputs Azure subscription ID
            displayName: Using Azure subscription ID variable
```

# Conclusion
In this short post, I first intend to document what I did so that it will remind me that every problem has simple solutions. We often face similar issues where the environment is not ready, there needs to be more information, and the infrastructure needs to be set up.

If you develop any infrastructure or automation scripts targetting the cloud environments, your scripts should be clever enough to target any subscription without needing to depend on hard-coded variables. I hope this helps anyone.