---
title: "Defining an Effective Azure Tagging Strategy"
comments: true
toc: true
categories: 
    - Azure
tags:
    - Azure
    - Bicep
    - Tagging
    - Best Practices

header:
  teaser: "/media/2022/teasers/defining-an-effective-azure-tagging-strategy.png"

excerpt: "The ability to tag Azure resources significantly enhance resource management, cost allocation, and operational visibility. But like everything else, tagging also needs to be thought through and well-defined to ensure we find a balance to use it wisely. In this blog post, we will walk through the steps to define an effective Azure tagging strategy that aligns with the organisation's needs and optimises resource management within the Azure environment."
---

Azure tagging is a valuable feature that allows us to categorise and organise resources within the Azure cloud platform. A well-defined tagging strategy can significantly enhance resource management, cost allocation, and operational visibility. In this blog post, we will walk through the steps to define an effective Azure tagging strategy that aligns with the organisation's needs and optimises resource management within the Azure environment.

# Understanding Azure Tags

Azure tags are name-value pairs we can assign to resources to categorise and organise them logically. Tags provide additional context and enable fine-grained control over resources. Each tag consists of a key (name) and a value, allowing us to create multiple tags for a single resource.


![Azure Tagging]({{ site.baseurl }}/media/2022/2022-07-20/azure-tagging-example.png){:style="display:block; margin-left:auto; margin-right:auto"}


## Limitations to Consider

- Not all resource types support tags. To determine if we can apply a tag to a resource type, see [Tag support for Azure resources](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-support).

- Each resource, resource group, and subscription can have a maximum of 50 tag name-value pairs. A few resource types, like Azure Automation, CDN, and Azure DNS, only support 15. There are ways to store more. But having a balance would help to keep tags clean and aligned with organisation objectives.

- The tag name has a limit of 512 characters, and the tag value has a limit of 256 characters. For storage accounts, the tag name has a limit of 128 characters, and the tag value has a limit of 256 characters.

- Tag names can't contain these characters: `<`, `>`, `%`, `&`, `\`, `?`, `/`, and a few of them even further extend this limitation by not allowing `:` & `#` in the names and not allowing the names to start with a numeric value.

When we have different constraints for different resource types, I encourage following the most restrictive limitation as a guide. e.g., If one resource type allows a tag name to have 256 and another only 128 characters, I would use 128 as my baseline to ensure consistency.
{: .notice--info}


## Benefits of Azure Tags

Implementing a well-defined tagging strategy offers numerous benefits, including:

### Resource Organisation

Tags allow us to group and categorise resources based on custom criteria such as department, project, environment, or cost centre. It simplifies resource management and enhances overall organisation.

### Cost Allocation and Tracking

Proper tagging allows us to track and allocate costs accurately to different departments or projects within the organisation. It enables us to analyse resource consumption, optimise spending, and enforce cost accountability.

### Operational Visibility

Tags provide powerful filtering and grouping capabilities in Azure's management tools and APIs. We can quickly identify and monitor resources based on tags, improving visibility and simplifying monitoring and reporting tasks.

### Automation and Governance

Tags are crucial in automation and governance scenarios, enabling policy enforcement, resource deployment, and lifecycle management based on predefined tagging rules. Having applied some tags to the resources, we can implement our automation logic to include or exclude particular resource types from being considered for the automation task.

# Designing an Azure Tagging Strategy

To reap the benefits of tagging, it's essential to establish a well-thought-out tagging strategy. We can consider the following elements when designing a tagging strategy.

## Understand the Organisation's Requirements

Before defining the Azure tagging strategy, it's crucial to understand the organisation's requirements and objectives. Consider the following questions:

- What are the organisational goals for resource management and cost control?

- Which departments, projects, or teams will be using Azure resources?

- What information would be valuable for reporting, monitoring, and cost allocation?

- Are there any compliance or governance requirements specific to the organisation's industry?

- Are the resources logically separated at the subscription/ resource group level, or do they share the top-level hierarchy? 
(e.g., All non-production environments share the same subscription)

By identifying these requirements, we can tailor the tagging strategy to meet the organisation's unique needs.

## Identify Tagging Categories

Once we clearly understand the organisation's requirements, identify the categories that will form the basis of the tagging strategy. Common categories include:

- Department or Business Unit: Tagging resources based on the department or business unit that owns them.

- Environment: Categorising resources found in the environment (e.g., development, testing, production) they belong to.

- Project: Tagging resources found on the project they are associated with.

- Cost Center: Assigning tags to track resource costs and allocate expenses to specific cost centres.

- Owner: Tagging resources with the owner's information to enhance accountability and facilitate collaboration.

Select the categories that align with the organisational structure and resource management objectives. These categories will serve as the foundation for our tagging strategy.

## Establish Naming Conventions

Consistency in tag naming conventions is crucial for effective resource management. Define clear and standardised naming conventions for the tags. Consider the following guidelines:

- Use lowercase letters and avoid special characters or spaces.

- Keep tag names concise and meaningful.

- Use separators (e.g., hyphens or colons) to improve readability in the case of multi-word tags.

For example, we might use `department:marketing` or `environment:production` as tag names.

## Build a Tagging Taxonomy

After documenting the standards and expectations, the next most important task is building consistent tag values. We don't want our developers to start providing different values for the same tag. Ensure that the expected/ allowed tag values and your tag naming conventions are documented. (e.g., We don't want tag values like `production`, `prd`, or `prod` for the tag environment.)

## Prioritise Tags

While it's tempting to create numerous tags, it's essential to prioritise the tags that provide the most value for the organisation. Determine the critical tags for cost allocation, compliance, governance, or reporting purposes. Identify the tags developers should consistently apply to all relevant resources. Avoid over-crowing tags that are obvious by their resource group or subscription. (e.g., If the organisation logically separates resource groups/ subscriptions by various departments, there is no point in repeating the same information at the tag level, especially when it is apparent through its parent.)


## Implement Tagging at Resource Creation

Integrate tagging into the resource creation process to ensure tagging compliance from the start. Leverage [ARM templates](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview), [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/), [Azure PowerShell](https://learn.microsoft.com/en-us/powershell/azure/?view=azps-10.1.0), and platforms like Azure DevOps to automate the application of tags during resource provisioning. Enforcing tagging at resource creation minimises the risk of untagged resources and establishes a solid foundation for effective resource management.

## Tag Maintenance and Governance

Maintaining the accuracy and relevance of tags is essential for long-term success. Establish processes and governance mechanisms to monitor and enforce tagging standards. Periodically review and update tags as needed. Consider implementing an auditing process to identify untagged or mislabeled resources and provide guidelines and training to ensure consistent adherence to the tagging strategy.

## Leverage Azure Management Tools

Azure provides powerful management tools to facilitate tagging compliance and streamline resource management. Leverage Azure Policy to enforce tagging requirements across the organisation. Azure Management Groups enable centralised management of tags across subscriptions, simplifying tag management at scale. Azure Resource Graph provides advanced querying capabilities to search and filter resources based on tags, enhancing operational visibility.

# Conclusion
Defining an effective Azure tagging strategy is crucial for optimising resource management, cost allocation, and operational visibility within the Azure environment. By understanding the organisation's requirements, defining tagging categories, establishing naming conventions, prioritising critical tags, implementing tagging at resource creation, and ensuring ongoing maintenance and governance, we can unlock the full potential of Azure tagging. Embrace Azure tags as a fundamental part of our cloud resource management approach and streamline operations within the Azure environment.