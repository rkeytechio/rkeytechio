---
title: "Securing Azure resources using managed identity"
date: 2021-06-12 17:00
comments: true
toc: true
categories: 
    - Azure
tags:
    - How To
    - Azure
    - Bicep
    - Azure CLI
    - RBAC
    - Security
    - Best Practices
header:
  teaser: "/media/2021/2021-06-12/teaser.png"

excerpt: "Security is the primary concern in any application, especially cloud resources, when you don't manage your infrastructure. Maintaining secrets, credentials, and permissions to secure communication of various application components is always a challenge. In this post, we deep dive into understanding what is a managed identity and particularly how to create and assign them to our Azure resources to establish secure communication."
---

Security is the primary concern in any application, primarily when your infrastructure is in the public cloud where you don't have physical control. Managing secrets and credentials for secure communications and ensuring the application components only have the right level of access is vital to maintaining a good security posture. One of the first things that come to mind when securely handling secrets and credentials in Azure is the Key Vault. True! But someone still needs to be responsible for managing and rotating those secrets to ensure it is not compromised. It is an overhead. Secondly, you still need a way to manage permissions on each cloud resource. In Azure, this is where we leverage the **Managed Identities**.

![Azure-Managed-Identity]({{ site.baseurl }}/media/2021/2021-06-12/teaser.png)

### What is Azure Managed Identity

Managed identities is an Azure AD (AAD) backed identity which can associate with an Azure cloud resource. It used to be known as Managed Service Identity (aka MSI). As the name suggests, it is **Managed** on behalf of you, and the overhead of keeping it secure is delegated to the Azure platform. These Azure resources can then obtain Azure AD tokens and work with other Azure AD authentication supported resources without developers maintaining any credentials. In fact, developers will never have access to any credentials. Additionally, since it's Azure AD identity, it can be easily associated with the RBAC role or add it to an AD security group.

After all, all these great benefits at no extra cost! It's **FREE**!!

### The Types of Managed Identities
There are two flavours of Managed Identities. They have different use cases and have different characteristics. Regardless of the type, it is a special kind of service principal that can only be associated with Azure resources.

To find all Managed Identity supported Azure services, see [Azure services that can use managed identities](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/managed-identities-status).

#### System-Assigned
System-assigned managed identities associated with the resource itself. The lifecycle of the identity is tightly coupled with the Azure resource. It is set at the time of provisioning or can enable later on. However, the associated managed identity can not be shared, and it is an excellent way if your Azure resource must have fine-grained (independent) permission.

To enable system-assigned managed identity in Bicep, you can add the `identity` property with the value for the `type` property as`'SystemAssigned'`.

```bicep
resource <resource-symbolic-name> '<resource-type>@<api-version>' = { 
  name: '${resourceName}'
  location: '${resourceLocation}'
  ...
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
  ...
  }
}
```

Or can be achieved via the Azure CLI command below.

```bash
az <resource-type> identity assign -g <resource-group-name> -n <resource-symbolic-name>
```

#### User-Assigned

Instead of an identity tightly coupled with a single Azure resource, you may create a standalone identity as another azure resource. This identity type can be associated with multiple Azure resources. It is an ideal way of centralising the identity and RBAC assignments to a single identity. The azure resources that share this identity have identical permission on what they can perform with other Azure resources. This type of identity is called **user-assigned identity**. The lifecycle of this identity remains independent from associated Azure resources. Also, compared to system-assigned identity, the azure resources can be associated with more than one **user-assigned identity**.

The following Bicep snippet creates a user-assigned manage identity.

```bicep
resource <identity-resource-name> 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {    
  name: 'string'
  location: 'string'
  tags: {
    tagName1: 'tagValue1'
    tagName2: 'tagValue2' 
  }
}
```

Using the Azure CLI command below, we can achieve the same.

```bash
az identity create -n <identity-resource-name> -g <resource-group-name> 
```

**Quick Tip**

Please note that the **identity resource name** across resource groups or subscriptions is not enforced to be unique within in same Azure AD. Therefore, the identity name will appear as duplicated objects in Azure AAD. It is a common pitfall Azure administrators face when assigning permissions. Therefore consider adopting a well-structured naming standard that identifies the identity correctly.
{: .notice--info}

![Azure-Managed-Identity]({{ site.baseurl }}/media/2021/2021-06-12/duplicate-managed-identities.png)

The below Bicep snippet shows how to associate the created identity with Azure resources. Compared to enabling system-assigned managed identity for Azure resources, you need to set the `identity` property `type` as`'UserAssigned'` and pass in the fully qualified Id of the created identity.

***Note:*** The code snippet assumes the managed identity already exists. Suppose your code provisioned the managed identity within the same template (similar to above). Then, you can skip the first part and use the symbolic name directly to get its (fully qualified) Id.

```bicep
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' existing = {
  name: <identity-resource-name>
}

resource <resource-symbolic-name> '<resource-type>@<api-version>' = { 
  name: '${resourceName}'
  location: '${resourceLocation}'
  ...
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}' :{}
    }
  }
  properties: {
  ...
  }
}
```

Here is the Azure CLI equivalent for the same.

```bash
az <resource-type> identity assign -g <resource-group-name> -n <resource-symbolic-name> --identities <identity-resource-fully-qualified-id>
```

### Conclusion
This post looked at why and what types of managed identities exist. In essence, managed identities allow the developers to delegate the task of managing identities to the Azure platform, focus on implementation, and make the entire security governance and RBAC role assignment a streamlined process. In most of my projects, all the policies are in place to enforce managed identities for supported resource types. In architecture and security reviews, it is one of my top recommendations if I find the developers have not leveraged the managed identities without a very good explanation why they can't or didn't.

I hope this article encourages you to leverage managed identities and make your cloud a more secure environment.