---
title: "Tagging Azure Resources in Bicep - The Clean Way"
date: 2022-08-03
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
  teaser: "/media/2022/teasers/tagging-azure-resources-in-bicep-the-clean-way.png"

excerpt: "Azure allows organisations an efficient way to classify Azure resources using tags. Azure tags are key-value pairs defined by users to manage and organise Azure resources for monitoring, billing and automation purposes. In this post, we look at how we do this effectively and cleanly using Azure Bicep and its native capabilities."
---

Azure allows organisations an efficient way to classify Azure resources using tags. Azure tags are key-value pairs defined by users to manage and organise Azure resources for monitoring, billing and automation purposes.

```bicep
// Defining tags in Azure resource as key-value pair.
resource <symbolic-name> '<full-type-name>@<api-version>' = {
  ...
  tags: { 
     tagName1: 'tagValue1'
     tagName2: 'tagValue2'
  }
  ...
}
``` 

# Problem
Depending on your organisation's tagging strategy, some tags are mandatory, while others are optional, and that may depend on the resource type and some conditions. Repeating these tags in each resource adds a challenge to maintainability. Hence, we need an effective, efficient, clean way to define and maintain tags.

# Defining Tags
In Bicep, these tags are defined as an object. Generally, maintaining the tags as an **optional parameter** at the top of our Bicep file gives greater flexibility. It provides the freedom to the calling party to pass the values, and if they do not give the values, it will fall back to the defaults.

```Bicep
param resourceTags object = {
  BusinessUnit: 'Finance'
  Project: 'Demo'
  CostCenter: 'FIN0099'
}
```

# Assigning Tags

Tagging resources, therefore, is now a matter of an assignment. It is much cleaner and maintainable compared to repeating each resource's tags and values separately.

```Bicep
resource <symbolic-name> '<full-type-name>@<api-version>' = {
  ...
  tags: resourceTags
  ...
}
```

However, your organisation's tagging strategy may demand more tags depending on the resource type and the deployed environment. As a result, you can't always assign the values you were passed as is. Instead, you will need to append or concatenate more tags in addition to the default tags.

## Inline Append
Using the union operation, you can continue to add more resource-specific tags on top of default ones, as below.

```Bicep
resource <symbolic-name> '<full-type-name>@<api-version>' = {
  ...
  tags: union(resourceTags, {
    tagName1: 'tagValue1'
    tagName2: 'tagValue2'
  })
  ...
}
```

## Concat and Assign
Otherwise, if your additional tags require a more dynamic, conditional and reusable manner, you can do it ahead of the assignment as below.

```bicep
// Environment as Parameter
@allowed([
  'Development'
  'Test'
  'Production'
])
param env string

// Example: Conditionally apply tag value based on environment.
var additionalTags = {
  supportModel: env == 'Production' ? '24x7 Support': 'Business Hours'
  tagName1: 'tagValue1'
  tagName2: 'tagValue2'
}

resource <symbolic-name> '<full-type-name>@<api-version>' = {
  ...
  tags: union(resourceTags, additionalTags)
  ...
}
```

# Conclusion

Tagging is essential in our cloud adoption and helps businesses thrive in well-architected cloud solutions. Maintaining tags in a practical, clean way helps us reach that objective. In addition, we should leverage the built-in capabilities of our infrastructure code, which in this case, Bicep, to maintain tags more compellingly.