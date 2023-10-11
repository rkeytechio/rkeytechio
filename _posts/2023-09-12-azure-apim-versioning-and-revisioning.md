---
title: Versioning and Revisioning in API Management (API-M)
date: 2023-09-12
comments: true
toc: true
categories: 
    - Azure
tags:
    - API-M
    - Bicep
    - Zero To Hero
header:
  teaser: "/media/2023/teasers/azure-apim-s01p03.png"

excerpt: Changes and enhancements are inevitable in any product that wants to keep up with evolving requirements. Azure API Management (API-M) offers offers robust features to facilitate this process. One of the key aspects of API Management is revisioning and versioning, which ensures that our APIs remain functional and relevant as our service evolves. In this post, we will explore the concepts of revisioning and versioning in Azure API Management, learn how to leverage these capabilities effectively and discuss some design considerations.
---

This blog is a multi-part series, and visit related topics for a complete understanding of the overall API-M solution.

**Navigate in Blog Series**
- [Azure API Management (API-M) Overview](/blogs/2023/09/azure-api-management-series-overview) :arrow_upper_right:
- [Designing API Products](/blogs/2023/09/azure-apim-designing-products) :arrow_upper_right:
- Versioning and Revisioning  [👈You are here]
- [Understanding and Designing Policies](/blogs/2023/09/azure-apim-understanding-and-designing-policies) :arrow_upper_right:
- [Security Best Practices](/blogs/2023/10/azure-apim-security-best-practices) :arrow_upper_right:
- Project Structure
- Monitoring Analytics
- API Documentation
- Development Workflow & APIs CI/CD
- Automating Developer Portal via CI/CD
{: .notice--primary}

# Change Management in API-M?

Changes and enhancements are inevitable in any product that wants to keep up with evolving requirements. So, managing changes and their impact is essential. An API, is a contract between our service and the consumer. If our changes cause the client systems to fail as we publish new updates, our consumers may get frustrated and move away from our services. So, defining a change management strategy is crucial.

Azure API Management (API-M) offers robust features to facilitate the change management of our APIs. Revisioning and versioning concepts in API-M ensures that our APIs remain functional and relevant as our application ecosystem evolves to newer versions. In this post, we will explore the options in Azure API Management, learn how to leverage these capabilities effectively and discuss some design considerations.

![Azure API Management - Change Management]({{ site.baseurl }}/media/2023/apim-series/apim-versioning-path-options.png){: style="display:block; margin-left:auto; margin-right:auto"}

## When to Version

APIs need to be up-versioned each time we make a change. It is helpful to track the versions of APIs when changes are made to support customers who may be receiving cached versions of data or experiencing other API issues.

The format of the version could be anything that makes sense to our product or release cycle. Some use the most straightforward way by incrementing a number like v1, v2... Some use day or part of date string when their releases are more frequent.

Azure ARM APIs use the first day of the month when the APIs are released. Also, add the suffix `-preview` when necessary.
{: .notice--info}

## Breaking vs Non-Breaking Changes

Breaking changes are changes to our API that make it incompatible with our previous API versions. Breaking changes include:
- A change in the format of the request or response
- A change in the request or response field type (i.e. changing data type)
- Removing any part of the API endpoint or payload format.

In addition, as discussed in our [previous post](/blogs/2023/09/azure-apim-designing-products), changing the behaviour of API-M products or splitting APIs associated with the products can also be a breaking change.

In contrast, non-breaking changes maintain the API interface contract, request and response payloads and data types consistent while it may improve performance, fix a bug, or extend API capabilities. So they don't challenge the compatibility like breaking changes do.

Despite the nature of the change, we might need to consider a strategy to mitigate any devastating impact and reinstate the last well-known state as quickly as possible.
{: .notice--info}

## Why Change Management Matters

Before diving into Azure API Management's capabilities, let's understand why change management is essential.

**Backward Compatibility**

As our API evolves, we want to ensure that changes do not disrupt existing clients. Maintaining versions allows us to introduce new features or changes while maintaining backward compatibility with older versions.

**Documentation and Communication**

Explicit versioning helps API consumers understand which version to use and what changes have been made. It simplifies communication and ensures developers are aware of any updates or deprecations.

**Testing and Quality Assurance**

Versioning also helps us to thoroughly test and validate changes in isolation, reducing the risk of introducing bugs or vulnerabilities in our production APIs.

**Control & Governance**

Maintaining versioning gives us more granular control over the lifecycle management of our APIs. We can gracefully retire older versions, aligning our API strategy with our service roadmap and reducing infrastructure costs that we keep alive to support older versions by declaring end-of-life support and encouraging our consumers to align their implementation at their own pace. It also means we have to support only the most recent versions. 

# Versioning in API-M

Versioning addresses the need to release and manage different iterations of our API to meet evolving requirements and accommodate changes without disrupting existing consumers. Versioning is helpful when we want to introduce new features, enhancements, or changes to our API while maintaining support for existing clients who may continue to use older versions. Therefore, there can be more than one active version of the same API. Azure API-M provides three ways to version our APIs.
- Path (URL Segment)
- Query String
- Header

We can choose any particular method or combine methods. Generally, methods must only be combined when supporting legacy scenarios when versioning methods/ conventions is out of our control.

## Path (Segment) Versioning

The most straightforward and common approach to versioning is through the URL. Though this violates the REST principle that each URL refers to a specific resource, REST never specifies an alternative for versioning.

Various backend systems may choose to version their APIs using either of the following formats.

- https://api.com/**v1**/resource
- https://**v1**.api.com/resource
- https://api**v1**.com/resource

Whichever approach we use, We are guaranteed to break client integration when a version is updated. However, API-M only supports the format of the version string after the root URL method.

https://api.com**/v1**/resource
{: .notice--success}

![Azure API Management - Versioning - Path Based]({{ site.baseurl }}/media/2023/apim-series/apim-versioning-path-based.png){: style="display:block; margin-left:auto; margin-right:auto"}

Given its part of the URL, clients can easily cache resources. When a new version of the REST API is released, it is perceived as a new entry in the cache. On the flip side, path-based routing has a pretty big footprint in the code base, as introducing breaking changes implies branching the entire API, which means we need to duplicate all APIs in all versions regardless of whether they are being changed or not.

## Query String Versioning

Alternatively, API-M allows versioning REST APIs by including the version number as a query parameter.

https://api.com/resource**?api-version=1.0**
{: .notice--success}

![Azure API Management - Versioning - Query String]({{ site.baseurl }}/media/2023/apim-series/apim-versioning-query-string.png){: style="display:block; margin-left:auto; margin-right:auto"}

This is a straightforward way of versioning an API from an implementation point of view, especially when we want to maintain clean URLs and our API sets are updated at their own pace rather than as a whole. It is also easy to default to the latest version. However, Query parameters are more difficult to use for routing requests to the proper API version. However, this also means that our documentation and product support teams must clearly articulate each API separately as they can iterate at their own pace.

## Header Versioning

API-M also support versioning by providing custom headers with the version number included as an attribute. The main difference between this approach and the previous one is that it doesn’t clutter the URI with versioning information. It requires tools and knowledge to inspect the header to get the version information out.

![Azure API Management - Versioning - Header]({{ site.baseurl }}/media/2023/apim-series/apim-versioning-header.png){: style="display:block; margin-left:auto; margin-right:auto"}

## Selecting Versioning Strategy

As briefly discussed above, each versioning approach fulfils the same purpose. It brings critical information to the API gateway (API-M) to redirect the request to the appropriate backend version. There is no right or wrong way of doing it, which is why they co-exist. However, having mixed approaches for different APIs will confuse our client applications and developers. Also, establishing one practice could look better on our API standards. So, it is essential to understand what works best for us and decide on a strategy.

**Product Centric APIs**

Suppose our API is part of a one-product suite, and all our APIs evolve with the product version. In such cases, if it makes more sense to uplift all APIs to a newer version from the previous version, regardless of whether there are changes in individual APIs, the path-based version may be more appealing.

It also allows us to deprecate previous versions, making maintenance more smooth.

**Team, Release & Support Centric APIs**

If separate teams maintain and support our backends, they will likely follow their development and deployment cycles. Also, if our backend APIs are directly by various 3rd party vendors, where we do not have control over how often they are released, Query-based versioning would be more appealing in such scenarios. Also, when we are hesitant to lock down to a specific version strategy, query string may be the way to go.

It allows the development and support teams to evolve at their own pace; however, maintaining and deprecation comes at a cost.

# Revisioning in API-M

While versioning allows us to create new iterations of our API, managing revisions within each version is equally important. Revisioning is more about managing changes and updates within a specific version of our API. It allows us to make modifications, improvements, or bug fixes while keeping the same version number.

Unlike versions, there can be only one active revision. When requests are received from clients it defaults to the active revision all the time. Revisioning typically doesn't change the version identifier in the URL or path. Instead, it focuses on internal updates and refinements of the API. Because the API fundamentally doesn't change in its contract we can keep the same documentation and resources but improve the underlying API implementation. 

Each revision to our API can be accessed using a specially formed URL. Append `;rev={revisionNumber}` at the end of our API URL but before the query string.

https://api.com/resource;rev=x/....?.....
{: .notice--success}

**Pro Tip:** By default, each revision has the same security settings as the current revision. So, if we want to prevent external callers from accessing a revision still under development we might need to explore adding an IP restriction policy to the revision in progress.
{: .notice--info}

We can't change the following of an API under revision that is not current;
- Name
- Type
- Description
- Subscription required
- API version
- API version description
- Path
- Protocols

**Pro Tip:** A revision can be taken offline, which makes it inaccessible to callers even if they try to access the revision through its URL. It's always a good idea to keep it offline when we are not testing the changes.
{: .notice--info}

If you wish to turn a revision into a beta/ test version formally, we can create a version from a revision.

# Best Practices for Revisioning and Versioning
To master revisioning and versioning in Azure API Management, consider the following best practices:

**Start with a Clear Versioning Strategy**

Define a clear versioning strategy that aligns with our application's roadmap. Consider semantic versioning (e.g., v1.0.0) for clarity.

**Document Thoroughly**

Invest in comprehensive documentation for each version. Include release notes, migration guides, and examples to ease the transition for developers.

**Test Rigorously**

Implement a robust testing and quality assurance process for each revision. Automated testing can catch issues early in the development cycle.

**Automate Deployment**

Use Azure DevOps or similar CI/CD tools to automate the deployment of new API revisions. This ensures consistency and reliability. We discuss this later in our series.

**Communicate Changes**

Keep developers informed about changes through release notes, emails, or API management portal notifications. Transparency is key. No matter how minor the fix is, if it was published it is a contract. Any changes to the contract from its published point should be communicated.

**Monitor Continuously**

Setting up monitoring and analytics to track the performance and usage of our APIs is critical. Act on insights to optimise our API strategy. Also, by closely looking at the API version that causes more trouble we can encourage our consumers to promote their implementation to the latest version and look into deprecating them soon.

# Implementing Versioning and Revisions

The following Bicep code illustrates how to introduce an API versioning set (API Versioning Strategy) and link it to an API. The examples are path-based (Segment) but similar to query string or header-based versioning.

```bicep
/*
------------------------------------------------
Parameters
------------------------------------------------
*/
@description('Required. The name of the API-M instance.')
param apimServiceName string

resource apimService 'Microsoft.ApiManagement/service@2022-08-01' existing = {
  name: apimServiceName

  resource apiVersionset 'apiVersionSets@2023-03-01-preview' = {
    name: 'api'
    properties: {
      displayName: 'APIVersionSet'
      versioningScheme: 'Segment' // Header, Segment, Query
      // versionHeaderName: 'Api-Version' Required when versioningScheme = Header
      // versionQueryName: 'api-version' Required when versioningScheme = Query
    }
  }

  resource api 'apis@2023-03-01-preview' = {
    name: 'api-v1'
    properties: {
      displayName: 'Sample API'      
      subscriptionRequired: true
      path: 'api'
      protocols: [
        'https'
      ]
      isCurrent: true
      apiVersion: 'v1'
      apiVersionSetId: apiVersionset.id
    }
  }
}
```

The same code block with a few additional configuration we can repeat the same for revisions.

```bicep
/*
------------------------------------------------
Parameters
------------------------------------------------
*/
@description('Required. The name of the API-M instance.')
param apimServiceName string

/*
------------------------------------------------
Variables
------------------------------------------------
*/
var revision string = '2'

resource apimService 'Microsoft.ApiManagement/service@2022-08-01' existing = {
  name: apimServiceName

  resource api 'apis@2023-03-01-preview' = {
    name: 'api-v1;rev=${revision}'
    properties: {
      displayName: 'Sample API'      
      subscriptionRequired: true
      path: 'api'
      protocols: [
        'https'
      ]
      isCurrent: true
      apiRevision: revision
      apiRevisionDescription: 'API Revision Description'
    }
  }
}
```
# Conclusion

Versions and revisions are distinct features in Azure API-M. Each version can have multiple revisions, just like a non-versioned API. We can use revisions without using versions or the other way around. Typically, versions separate API versions with breaking changes, while revisions can be used for minor and non-breaking changes to an API.

This powerful duo enables us to offer our API consumers a smooth upgrade pathway and keep the latest API version up to date with minimal impact on the live version. The choice between them depends on our specific use case and the changes we must make to our APIs.
