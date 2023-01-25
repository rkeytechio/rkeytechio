---
title: "Structuring Maintainable Bicep Code: A Comprehensive Guide"
date: 2023-01-25
comments: true
toc: true
categories: 
    - Azure
tags:
    - Azure
    - Bicep
    - Best Practices
header:
  teaser: "/media/2023/2023-01-25/teaser.png"

excerpt: "Bicep is a Domain Specific Language (DSL) that defines and uses to deploy Azure resources. It provides a declarative way to express infrastructure as code (IaC) and enables you to define, manage effectively, and version your Azure deployments. It is crucial to structure your code properly for a maintainable and scalable Bicep project. This blog post will explore the best practices and guidelines I followed for structuring the Bicep codebase."
---

[Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview?tabs=bicep) is a Domain Specific Language (DSL) that defines and uses to deploy Azure resources. It provides a declarative way to express infrastructure as code (IaC) and enables you to define, manage effectively, and version your Azure deployments. It is crucial to structure your code properly for a maintainable and scalable Bicep project. This blog post will explore the best practices and guidelines I followed for structuring the Bicep codebase.

# Design Considerations
To organise your Bicep files and folders, keep template-level limitations in mind and design your overall infrastructure to stay within these limits. Remember, these are not limitations of the Bicep itself. Instead, they are limitations set by the Azure resource manager templates described [here](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/best-practices#template-limits).

The most common limit you hit in a large infrastructure code repository is its size. The overall template size should be less than 4MB, including the final state of your template after expanding all nested modules, iterative resource definitions and values for variables and parameters. The parameter file also should be less than 4 MB. On top of these, the following limitations also need to be considered.
- 256 parameters
- 256 variables
- 800 resources (including [copy count](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/copy-resources))
- 64 output values
- 10 unique locations per subscription/tenant/management group scope
- 24,576 characters in a template expression

# Organising Files and Folders

To start structuring your Bicep project, consider the following suggestions for organising files and folders:

## Root Folder
Begin by creating a root folder for your Bicep project, giving it a descriptive name that reflects its purpose. Suppose you place your infrastructure and application codes in the same repository; as in my previous blog, [The First Commit - Project Structure](/blogs/2021/07/the-first-commit-project-structure), you may put all infrastructure code in a dedicated root like **env** folder. Otherwise, give your bicep root folder a meaningful name.

**Example:** demo-bicep-project

## Module Folders
Modularisation is heavily encouraged by Bicep. If your Bicep project involves multiple modules, create separate folders for each module to keep them organised. We look at modularisation in depth a little later.

**Example:** 
- <root>/module1/
- <root>/module2/, etc.

## Logically Separated Folders
Infrastructure projects may vary in scope and can grow very large quite quickly. For maintainability and a clean code approach, it is recommended to follow some logical separation. It entirely depends on the nature of your project and the scope of your infrastructure deployment. Some projects may deploy end-to-end networks, other supporting resources, and the application workload-related infrastructure. In contrast, some other projects may be responsible only for maintaining application infrastructure while considering some resources as existing shared resources.

Depending on your project scope and design, consider creating subfolders for different resource types or logical groupings to organise your code further.

**Example:**
- <root>/network/[module]
- <root>/monitoring/[module]
- <root>/app/[module].

## Main Entry File
Create an entry Bicep file in each module folder that is the starting point for that module's resources and one in the root that wraps the entire infrastructure project. If your deployment pipelines have multiple workflows to deploy coherent parts of the infrastructure, ensure you have structured your code in logical folders.

**Example:**
- <root>/main.bicep
- <root>/module/main.bicep.

## Supporting Files
Place any supporting files, such as parameter or variables files, in the respective module folders or in the root directory.

**Example:**
- <root>/parameters.json
- <root>/variables.bicep
- <root>/module/parameters.json
- <root>/module/variables.bicep

# Modularisation
Modularisation is vital in creating reusable and maintainable Bicep code. Remember, modularisation comes at a cost. Remember the limitations set in the Design Considerations. However, where it is necessary large infrastructure projects can drastically reduce repeated code blocks. So ensure you find a balance. Follow these practices to modularise your code effectively:

## Break Down Resources

Split your Bicep code into logical resource groupings to distinct resources based on their purpose, dependencies, or lifecycle.

**Example:**

- Separate virtual network and
- App service resources into different Bicep files

## Using Modules

Identify reusable patterns or components within your infrastructure and abstract them into separate modules. Modules can be used across different Bicep projects, enabling code reuse and reducing duplication.

**Example:**
Create a module for deploying a common networking infrastructure and a module for deploying a set of monitoring resources.


I keep the resource deployment block within the top-level bicep file to simplify things. However, when the second instance of the same resource type is required, I promote the resource definition to its dedicated module. This way, I refrain from entertaining over-engineering and complicating my deployment.
{: .notice--info}

## Input Parameters, Variables and Output Variables

Leverage parameters, variables and output variables to make your modules more flexible and configurable. Parameters allow you to customise resource properties.

**Example:**
Pass parameter values to customise module behaviour or use variables to define shared values like resource tags (See: [Tagging Azure Resources in Bicep - The Clean Way](https://rkeytech.io/blogs/2022/08/tagging-azure-resources-in-bicep-the-clean-way/)])

Variables help define reusable values within a module to calculate runtime conditions such as resource names or to switch configurations based on the target environment passed in through parameters.

**Example:**

Calculate all resource names at the top of the Bicep file immediately after the parameters. They clarify where all the runtime values may be used later in the definition.


By defining output variables for your modules, the caller has a defined interface. Like input parameters enable you to pass values into a module, output variables provide information back to the caller.

**Example:**

Define an input parameter for the virtual network CIDR block and an output variable for the virtual network resource ID.

# Dependency Management
Managing dependencies is crucial for ensuring proper resource provisioning and deployment order. Consider the following practices:

## Implicit Dependency
Bicep cleverly builds the dependency hierarchy by the way the resources are decorated. As official [documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/resource-dependencies#implicit-dependency) suggests, if resources are nested, or one resource definition refers to another resource's symbolic name, the dependency is already known, and you don't need to declare depends. The language rules will discourage it.

**Example:**
```bicep
resource exampleDnsZone 'Microsoft.Network/dnszones@2018-05-01' = {
  name: 'myZone'
  location: 'global'
}

resource otherResource 'Microsoft.Example/examples@2023-05-01' = {
  name: 'exampleResource'
  properties: {
    // get read-only DNS zone property
    nameServers: exampleDnsZone.properties.nameServers
  }
}

resource myParent 'My.Rp/parentType@2023-05-01' = {
  name: 'myParent'
  location: 'West US'

  // implicit dependency on 'myParent'
  resource myChild 'childType' = {
    name: 'myChild'
  }
}
```

## Module Dependencies
When resources are not directly referable because of modules and if specific modules need to proceed before others, then ensure dependency is explicitly called out using the `dependsOn`. It ensures that resources are deployed in the correct order, satisfying any dependencies which otherwise Azure will try to deploy in parallel.

**Example:**
In a module for deploying an Azure SQL Database, specify a dependency on a module that provisions an Azure SQL Server.

## Inter Module Dependencies
Establish dependencies if your project has multiple modules to ensure proper sequencing during deployment.

**Example:**

 A module that deploys a web application may depend on a module that provisions the necessary infrastructure like virtual networks and app services.


# Naming Conventions
If you are following along with my content, it is no secret how much I insist on naming things correctly and consistently. No matter how small or not necessary it is. Consistent naming conventions enhance code readability and maintainability.

## Resource Names
Use descriptive and meaningful names for your resources. Follow Azure's resource naming rules and conventions. Follow the resource namespaces when you split your modules per resource type.

**Example:**

- virtual-network
- storage-account

## Files and Folders
Name your Bicep files, folders, and other supporting files using meaningful and self-explanatory names. It's your project, your context. A blog post like this can only define a solution for limited types. Discuss with your team. Review your code in each iteration. If something is not in the correct space, refactor them and keep them coherent with what you are doing.

# Documentation

Having no documentation is worse; explaining too much and having to read too much makes things far less attractive. So finding a balance is crucial. Compared to Azure ARM templates (JSON) which didn't support comments, Bicep allows you to add comments. Remember, you may implement the code, but someone else must maintain it. So make their lives easy and do yourself a favour by annotating any rationale behind certain logic or condition and consistently structure your code.

## Parameters
Parameters allow the caller to pass in configurable values in the Bicep file so that it behaves differently in various scenarios. Ensure the appropriate level of information is available to the caller to understand the usage and default behaviour if not set. It not only helps give hits during development time but also helps validations at the compile time.

**Example:**
```bicep
@description('Required. Environment Short Name. Default: dev')
@allowed([
   'dev'
   'tst'
   'prd'
])
param environmentShortName string = 'dev'
```
## Section Breaks

Once all team members agree on a structure, ensure that Bicep definitions are separated into distinctive sections. It helps to navigate to the correct section quickly when browsing a large file. I follow Parameters, Variables, User Defined Functions, Existing Resources, Resources and Output Variables in most projects. I use a big chunky block explaining the section at the beginning of each section. When familiar with the structure, you know exactly where to navigate from any given point in the file.

**Example:**
```bicep
/*
------------------------------------------------
Parameters
------------------------------------------------
*/

....
// Shorten for Bravity
....
/*
------------------------------------------------
Outputs
------------------------------------------------
*/
```

# Conclusion

Structuring your Bicep codebase with a well-defined organisation, modularisation, proper dependency management, and consistent naming conventions is essential for maintaining scalability, readability, and reusability. Outline some of these best practices as a guide that will help you build maintainable and robust infrastructure deployments using Bicep. If you do need some assistance, feel free to reach out.