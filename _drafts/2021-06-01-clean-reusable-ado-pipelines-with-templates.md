---
title: "Clean, Reusable Azure Pipelines with Templates"
date: 2021-06-01 20:00
comments: true
categories: 
    - Azure DevOps
tags:
    - DevOps
    - Pipelines
    - YML
    - Best Practices
header:
  teaser: "/media/2021/editorconfig.png"

excerpt: "Let's look at writing clean, reusable, Azure DevOps pipeline code using templates and then using those simple building blocks to create various types of pipelines we need."
---

Azure Pipelines is a cloud service with Azure DevOps that empowers developers to script the build, test, deployment activities and maintain as source code. These scripts are written in YAML (*.yml or *.yaml) format, a human-readable data serialisation language.

Often when you want to follow proper CI/CD guidelines and do deployments, you will end up with multiple pipelines. In most cases, each of these pipelines shares the exact steps, more or less. Also, when you deploy the solution to different environments, using the same steps only differ by the configuration values.

You certainly can duplicate these steps across multiple pipelines and stages. However, as good developers, we should avoid creating maintenance nightmares and develop clean, maintainable code. So as a good developer, I will illustrate how to implement clean and reusable Azure DevOps pipeline codes using templates. For simplicity, I will only use the **script** task to output some text to the console to illustrate each step. Of course, when building and deploying your solution, the exact activities you need to perform may vary upon your tech stack and deployment needs.

If you are new to the concepts and developing pipelines, implement the primary skeleton pipeline before modularising it.

### The Hypothetical Scenario

We have a pipeline that builds our software and deploys it to DEV, UAT, and PRD environments.

During the build stage, we have to;
- Compile our source code
- Run unit tests
- Optionally, run some code vulnerability scan and
- Package our publish our build artifacts in preparation for deployment.

For the deployment stage, we have to;
- Download artifacts
- Deploy to a stage instance of the environment
- Run integration tests against staged instance only when it is not PRD
- Run performance tests only in UAT and PRD environment and finally
- Promote the stage deployment to a live environment
- Run application health check


**What is Staging?** It means the application is temporarily deployed to a replica of the target environment. Additional tests and verifications against the staged instance can confirm that deployment is successful and risk-free before promoting it to the live version. We can achieve zero downtime, and users do not experience any interruptions. This method is known as **[Blue-Green Deployment strategy](https://en.wikipedia.org/wiki/Blue-green_deployment)**.
{: .notice--info}

Let's take a look at the pipeline code below. In a single pipeline, t does all the build steps and deployment to a DEV environment.

#### `azure-pipelines.yml`

```yaml
trigger:
  - main
pool:
  vmImage: ubuntu-latest
stages:
  - stage: Build
    displayName: Build
    jobs:
      - job: Build
        displayName: Build Project
        steps:
          - script: echo Code Build - Success
            displayName: Build Project
          - script: echo Running Unit - Success
            displayName: Unit Tests
          - script: echo Vulnerability - PASS
            displayName: Vulnerability Scan
          - script: echo Packging and Publisihing Artifacts - DONE
            displayName: Package and Publish
  - stage: DeployDev
    displayName: Deploy to DEV
    jobs:
      - deployment: Deploy
        displayName: Deploy to DEV
        variables:
          - group: DEV-Settings
        environment: DEV
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo Staging Deployment - DONE
                  displayName: Staging Deployment
                - script: echo Integration Tests - PASS
                  displayName: Integration Tests
                - script: echo Performance Tests - PASS
                  displayName: Performance Tests
                - script: echo Promote Deployment to Live - DONE
                  displayName: Promote Stage to Live
                - script: echo Health Check - PASS
                  displayName: Run Health Check
```
### The Hypothetical Problem

The pipeline has nothing wrong with it. It should work as expected. However, let's assume that the **code vulnerability** scan takes longer to complete, and it may not report anything new compared to the last time unless a package you have used has changed. So it would be best if you had that to run perhaps only on a nightly build.

Secondly, **packaging and publishing artifacts** on a pull request build wouldn't add much value. For example, we may only need to know if code builds OK and unit tests are all passing.

Also, on the other hand, to extend this pipeline **deployment** stage to two (2) more environments, the developer will need to duplicate the entire section of the deployment steps again with some changes to the values where it explicitly refers to DEV. That will easily bloat this pipeline template and will not be easy to maintain, and perhaps adding an extra step later means you got to repeat that change for each environment stage.

This is where **templating** becomes a hero!

### Solution: Pipeline Templates

Templates let you define reusable content, logic, and parameters. It is like LEGO blocks. Using these template blocks, you could build your pipelines to act and run different sequences without duplicating the code. We can achieve this with the help of pipeline conditions.

Templates also support parameters, where the developer can pass in configurable and conditional values so that the template steps can run conditionally. Parameters must be defined on top and contain a name and data type. It supports string, number, boolean, other complex types. Please refer to the official [documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops#parameters) for the complete list.

Also, you can optionally define a default value so that the parent referring to the template can leverage the default behaviour and only need to pass in overridden values.

First, let's see how we can move the build steps into a template. I prefer to name my templates as `template-[stage]-steps.yml`

#### `template-build-steps.yml`

{% highlight yaml %}
parameters:
  - name: skipUnitTests
    type: boolean
    default: false
  - name: skipVulnerabilityScan
    type: boolean
    default: false
  - name: skipPublish
    type: boolean
    default: false
jobs:
  - job: Build
    displayName: Build Project
    steps:
      - script: echo Code Build - Success
        displayName: Build Project
      - script: echo Running Unit - Success
        displayName: Unit Tests
        condition: and(succeeded(), eq(${{ parameters.skipUnitTests }}, ''false''))
      - script: echo Vulnerability - PASS
        displayName: Vulnerability Scan
        condition: and(succeeded(), eq('${{ parameters.skipVulnerabilityScan }}',
          'false'))
      - script: echo Packging and Publisihing Artifacts - DONE
        displayName: Packge and Publish
        condition: 'and(succeeded(), eq(''${{ parameters.skipPublish }}'', ''false''))'
{% endhighlight %}

As you can see, I have used template parameters on top with a default value. These parameters are then used in a condition block where non-mandatory steps can be conditionally run if required. So the parent which refers to this template can pass in the values for these parameters and make these steps run in different combinations. However, you need to ensure any conditional steps are not pre-requisites of any later activities.

Secondly, let's look at how the deployment stage can move to a template, making it reusable by any environment present and future.

In addition to parameters here, the [variable groups](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups) also come in handy. As far as we name the variable groups in a consistent pattern, we can leverage that also to load the value of the correct variable set for each deployment environment dynamically.

#### `template-deploy-steps.yml`

```yml
parameters:
  - name: environmentName
    type: string
  - name: skipIntegrationTests
    type: boolean
    default: false
  - name: skipPerformanceTests
    type: boolean
    default: false
jobs:
  - deployment: Deploy
    displayName: 'Deploy to ${{ parameters.environmentName }}'
    variables:
      - group: "${{ parameters.environmentName }}-Settings"
    environment: "${{ parameters.environmentName }}"
    strategy:
      runOnce:
        deploy:
          steps:
            - script: echo Staging Deployment - DONE
              displayName: Staging Deployment
            - script: echo Integration Tests - PASS
              displayName: Integration Tests
              condition: >-
                and(succeeded(), eq('${{ parameters.skipIntegrationTests }}',
                'false'))
            - script: echo Performance Tests - PASS
              displayName: Performance Tests
              condition: >-
                and(succeeded(), eq('${{ parameters.skipPerformanceTests }}',
                'false'))
            - script: echo Promote Deployment to Live - DONE
              displayName: Promote Stage to Live
            - script: echo Health Check - PASS
              displayName: Run Health Check
```

As you can see, the same deployment steps, but there is no more explicit reference to the **DEV** environment anymore. Instead, the environment name is being referred from the parameters. I generally don't prefer reading the environment name within the template and conditionally calculating what steps to run, even if possible. Instead, I prefer delegating that responsibility to the parent to explicitly opt-out for steps they don't want the template to run. Hence, I follow the same pattern as the build stage.

Also, I have followed a naming convention `[Environment Name]-Settings` for my variable groups; I let the variable group name dynamically inherit its name based on the environment name.

The result is I am making the deployment steps completely reusable and reconfigurable by the parent.

With all these templates in place, now our main pipeline looks much lean and cleaner. As you can see, instead of lengthy steps, I have given the reference to the template file name and, provided parameter values where required, overridden the parameter defaults as necessary.

#### `azure-pipelines.yml`

```yml
trigger:
  - main
pool:
  vmImage: ubuntu-latest
stages:
  - stage: Build
    displayName: Build
    jobs:
      - template: template-build-steps.yml
  - stage: DeployDev
    displayName: Deploy to DEV
    jobs:
      - template: template-deploy-steps.yml
        parameters:
          environmentName: DEV
          skipPerformanceTests: true
  - stage: DeployUat
    dependsOn: DeployDev
    displayName: Deploy to UAT
    jobs:
      - template: template-deploy-steps.yml
        parameters:
          environmentName: UAT
  - stage: DeployPrd
    dependsOn: DeployUat
    displayName: Deploy to PRD
    jobs:
      - template: template-deploy-steps.yml
        parameters:
          environmentName: PRD
          skipIntegrationTests: true

```

Extending this example further, we now can have a pipeline for pull requests only having build steps with vulnerability scan and publish actions excluded.

#### `azure-pipelines-pr.yml`

```yml
trigger: none
pool:
  vmImage: ubuntu-latest
stages:
  - stage: Build
    displayName: Build
    jobs:
      - template: template-build-steps.yml
        parameters:
          skipVulnerabilityScan: true
          skipPublish: true

```

And to run a long-running vulnerability scan as another pipeline scheduled to run at midnight on the main branch skipping only the package and publish action.

#### `azure-pipelines-nightly.yml`

```yml
schedules:
  - cron: 0 0 * * *
    displayName: Daily midnight build
    branches:
      include:
        - main
pool:
  vmImage: ubuntu-latest
stages:
  - stage: Build
displayName: Build
jobs:
  - template: template-build-steps.yml
    parameters:
      skipPublish: true
```

### Conclusion

By using templates to reuse your common steps at a central place, you have achieved the flexibility of maintaining and extending pipeline activities from a single location. As a result, you also have confidence that all pipelines inherit those changes automatically, rather than updating each pipeline. Of course, there might be exceptional cases. Yet you still will be able to get around it by simply adding more conditions.