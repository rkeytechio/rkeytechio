---
title: "Managing variables in Azure DevOps"
date: 2021-07-06 11:00
comments: true
toc: true
categories: 
    - Azure DevOps
tags:
    - How To
    - YML
    - Pipelines
header:
  teaser: "/media/2021/2021-06-12/teaser.png"

---

In Azure DevOps, there are several ways to manage variables. Variables make the build and release pipelines act dynamically based on values provided for variables. It enables the Azure DevOps pipeline to be more reusable and modular. Variables are mutable key and value pairs stored within DevOps or as a part of the source code. This post will look at options available in greater detail and help understand more about variable scopes and their life cycle.

To set the context, let's first look at ways to store and retrieve variables for Azure pipelines.

- Variable Groups (Azure DevOps)
- Pipeline Variables
- Variable Templates

All of these approaches store key variables as key-value pairs. How they are stored, and ways of retrieving them are slightly different. In the rest of the post, let's look at each option in detail and investigate their ideal use cases.

# Variable Groups (Azure DevOps)
It is one of the easiest ways to set up Variables in our pipelines. The option is available under Azure DevOps > Pipelines > Library. The Graphical user interface is straightforward to capture these key-value pairs with few clicks.

[Image]()

There are two flavours for this option. But we must keep the approaches distinct.

It is crucial to decide the flavour you want to pick since switching between the two will lead you to the risk of losing values stored within Azure DevOps. If you are willing to try either side by side, I recommend creating a duplicate variable group until you decide which way to go.
{: .notice--warning}

## Storing and retrieving values within Azure DevOps
It allows the key and values to be stored within Azure DevOps. A user with adequate rights will have permission to view and set these values directly on the portal.

Also, sensitive information, such as credentials and connection strings, can be stored as secrets. These secrets are one way only. The users can set or update the value but cannot see the value once set. Only the pipeline agent will have ways to retrieve it back. It is still secure, and Azure DevOps manage the encryption key and rotation for us.

However, given this is maintained outside of the source code, it is challenging to keep version history, and developers need to remember manually promote the new variables and their values as the changes are merged.

On the flip side, updating the value of a particular key does not require any change to the source code.

**Summary**
<ul style="list-style: none;">
 <li>:heavy_check_mark: Simple to setup</li>
 <li>:heavy_check_mark: Allows handling secrets</li>
 <li>:heavy_check_mark: No code changes are required when updating</li>
 <li>:bangbang: Not supporting versioning</li>
 <li>:bangbang: New key values need to be promoted manually</li>
 <li>:bangbang: Not ideal for maintaining across multiple branches</li>
</ul>
 
## Storing and retrieving values from Azure Key Vault
Quite similar to the approach of variable groups storing key-value pairs within Azure DevOps. The difference is the key, and the values are stored within Azure Key Vault. The Azure DevOps variable group only access the keys and values as a reference using the trust established at the setup time. However, adding a new key-value pair will require configuring it both in the Key Vault and adding the same as a reference in the Azure DevOps variable group. So it's more of a hassle to maintain.

Choosing to use Key Vault linked variable group, even non-sensitive values will need to be maintained at the Key Vault, which is overkill, and developers will need access to the list and view the stored values in the Key Vault. However, since the values can be updated in the Key Vault, there is no need for a code change or a complete deployment life cycle to promote the new value.

Being able to see the version history in Azure Portal is excellent. However, since it happens outside of source control, it is challenging to relate and coordinate changes and their impact. For example, just because a value in the Key Vault directly changed outside a working solution may not work even though no source code modifications are done simultaneously.

There are better and simpler ways of accessing the Key Vault directly during the pipeline execution using Key Vault APIs and extensions. Also, we can find modern automated ways to share and configure these secrets between cloud resources without the pipeline ever needing to know about them.
{: .notice--success}

**Summary**
<ul style="list-style: none;">
 <li>:heavy_check_mark: Allows handling secrets</li>
 <li>:heavy_check_mark: No code changes are required when updating</li>
 <li>:heavy_check_mark: Can view version history</li>
 <li>:bangbang: Little complex to set up and maintain</li>
 <li>:bangbang: New key values need to be promoted manually</li>
 <li>:bangbang: Not ideal for maintaining across multiple branches</li>
</ul>