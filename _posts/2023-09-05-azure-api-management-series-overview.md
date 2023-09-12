---
title: "Azure API Management (API-M) Overview"
date: 2023-09-05
comments: true
toc: true
categories: 
    - Azure
tags:
    - API-M
    - Bicep
    - Azure CLI
    - Zero To Hero
header:
  teaser: "/media/2023/teasers/azure-apim-s01p01.png"

excerpt: "Azure API Management (API-M) is a fully managed service offered by Microsoft Azure that enables organisations to create, publish, secure, and manage APIs at scale. It acts as a gateway between backend services and consumers. It provides a unified platform for API creators, administrators, and developers to collaborate and manage the entire API lifecycle efficiently. This post is first in its series that will examine how Azure API-M fits in the iPaaS architecture and several key features it offers to API developers and consumers."
---

Azure API Management (API-M) is a fully managed service offered by Microsoft Azure that enables organisations to create, publish, secure, and manage APIs at scale. It acts as a gateway between backend services and consumers. It provides a unified platform for API creators, administrators, and developers to collaborate and manage the entire API lifecycle efficiently. Due to the nature of its broad capabilities and design flexibility, I am going to develop this as a multi-part blog series.

In this post, we will dive deep into understanding how Azure API-M fits in the iPaaS architecture and briefly touch on its core capabilities before we explore them in detail in upcoming posts.

**Navigate in Blog Series**
- Azure API Management (API-M) Overview [👈This]
- [Designing API Products](/blogs/2023/09/azure-apim-designing-products) :arrow_upper_right:
- [Versioning and Revisioning](/blogs/2023/09/azure-apim-versioning-and-revisioning) :arrow_upper_right:
- Policy Development
- Security Considerations
- Project Structure
- Monitoring Analytics
- API Documentation
- Development Workflow & APIs CI/CD
- Automating Developer Portal via CI/CD
{: .notice--primary}

# Integration Platform as a Service (iPaaS)

To better understand the Azure API-M use in an enterprise architecture, we must first understand what an Integration Platform as a Service (iPaaS) is. It is a cloud-based platform that facilitates the integration of various applications, data sources, and services within an organisation's IT infrastructure. iPaaS solutions provide a centralised environment for developing, deploying, and managing integration workflows, eliminating the need for extensive custom coding and hardware infrastructure.

## Azure iPaaS

Azure iPaaS is a collection of SaaS-based integration technologies created from native Azure cloud resources. Primarily, they act as middleware between multiple systems. Predominantly, there are four (4) components in Azure iPaaS. They are;

- Logic Apps and Function Apps (Integration Workflows)
- API Management (API-M)
- Azure Service Bus
- Event Grid

For a minimal iPaaS architecture, the integration workflow backends/ function Apps and API-M service should suffice. This architecture is described as [Basic enterprise integration on Azure](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/enterprise-integration/basic-enterprise-integration).

![Azure Basic enterprise integration Architecture]({{ site.baseurl }}/media/2023/apim-series/simple-enterprise-integration.png){: style="display:block; margin-left:auto; margin-right:auto"}

The alternative is a full-scale enterprise-grade iPaaS solution. To understand this in deapth refer to [Enterprise integration with message broker and events](https://learn.microsoft.com/en-us/azure/architecture/example-scenario/integration/queues-events). I will return to our two key components to keep this post brief.

## Azure Logic Apps and Function Apps

[Azure Logic Apps](https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-overview) is a serverless platform for building enterprise APIs and workflows that integrate applications, data, and services. It works best in scenarios that don't require low latency for a response, such as asynchronous or semi-long-running API calls. 

We lean towards [Azure Functions Apps](https://learn.microsoft.com/en-us/azure/azure-functions/) based workflows and APIs if low latency and for complex computing or transformation are requirements.

Both are ideal candidates to uplift backends that don't provide API interfaces in cases where API functionality is limited or if they are legacy systems that use older web protocols.

**Pro Tip:** Placing API Management and Logic/ Function Apps backends in the same region to minimise network latency. In general, choose the region that's closest to your users or closest to your backend services.
{: .notice--info}

# Introduction to Azure API Management (API-M)

![Azure API Management]({{ site.baseurl }}/media/2023/apim-series/azure-apim.png){: style="display:block; margin-left:auto; margin-right:auto"}

Azure API management (API-M) enables API products to publish, secure, transform, maintain, and monitor multiple APIs, consolidating one or more backend services under one unified platform. It will enable organisations to use their existing backend services to create complete API offerings by creating a consistent user experience. Whether the backend is hosted natively in Azure, on-prem, or other cloud platforms, API-M is a facade that encapsulates backend implementation and provides a unified view to the API consumers and developers.

In the rest of this blog series, we will discuss some of the below API-M features in greater depth. Until then, briefly using Azure API-M, organisations can achieve the following:

**API Centralisation**

API-M creates a platform to consolidate and centralise API management tasks in a single location, simplifying governance and policy enforcement.

**Security and Authentication**

Security features such as OAuth, JWT, and Azure Active Directory integration allow API-M to secure backed services from unauthorised access, offload authentication, and HTTPS traffic to API-M scope.

**Cache, Throttling and Rate Limiting**

API-M has built-in capabilities to rate limit, throttle API traffic, prevent abuse of backends and improve performance and load on backend services.

**Monitoring and Analytics**

The built-in monitoring and logging services in API-M provide detailed analytics and capabilities to gain insights into API usage and performance.

**Developer Engagement**

The Developer Portal offers self-service capabilities for developers to discover, subscribe to, and consume APIs and rotate their keys at their discretion.


**Is Azure API-M is a Glorified Swagger-Enabled Website**? Yes & No. API-M provides rich features to manage, monitor and administer APIs on top of standard API documentation and testing capabilities. Swagger-enabled websites, in contrast, are easier to set up, but security, management and monitoring will be a part of the backend itself. 
{: .notice--info}

Azure API-M consists of three (3) main components.
- API Gateway
- Management Plane
- Developer Portal

![Azure API Management - Components]({{ site.baseurl }}/media/2023/apim-series/apim-components.png){: style="display:block; margin-left:auto; margin-right:auto"}

## API Gateway

The API Gateway is a facade to backend services by routing them to appropriate backends. All consumer requests reach the API Gateway first, which then gets evaluated against policies to enforce quota limits, throttle, and rate limits, and validate JWT tokens before routing and caching while emitting metrics, traces and logs for analytical purposes.

Each API-M instance comes with a managed Gateway. It also allows setting up a [self-hosted gateway](https://learn.microsoft.com/en-us/azure/api-management/self-hosted-gateway-overview) to comply with regulations when customers have hybrid IT infrastructure such as on-premises and other clouds.

## Management Plane

The Management Plane is the API-M's back office, configuring APIs, backends, and documentation and providing the ability to set up policies and manage users, subscriptions and approval workflows.

The administrators and developers interact with the Management Plane through tools such as Azure CLI, PowerShell, Azure Portal and Bicep or similar Infrastructure as Code (IaC) configurations.

## Developer Portal

![Azure API Management - Developer Portal]({{ site.baseurl }}/media/2023/apim-series/apim-developer-portal.png){: style="display:block; margin-left:auto; margin-right:auto"}

An open-source, fully customisable and brandable website provisioned along with the API Management instance. The portal provides ClickOps-based UX design capabilities, which we will look into automating and promoting to multiple environments through CI/CD pipelines later in the series.

The API consumers can use the portal to read the API documentation and test APIs via the interactive console, self-signup (if configured), create and manage their API keys, reduce administration overheads, and access their usage and analytics information.

The developer portal could leave as Azure-managed or [self-hosted](https://learn.microsoft.com/en-us/azure/api-management/developer-portal-self-host) for valid reasons. However, the latter option makes it your responsibility to host, maintain and make it highly available, which also means extra cost.

# Azure API-M Building Blocks

Azure API-M is a combination of several core concepts.

![Azure API Management - Developer Portal]({{ site.baseurl }}/media/2023/apim-series/apim-building-blocks.png){: style="display:block; margin-left:auto; margin-right:auto"}

## APIs

API-M service is built on the foundation of APIs, each representing a collection of operations accessible to API consumers. Every API includes a reference to the corresponding backend service that implements it, and its operations align with backend operations.

API-M allows extensive configuration options to safeguard the backends and protects them from malicious use. Further to fast-track development, it can mock API responses per the agreed API contract until the backend implementation comes live.

## Workspaces

It may make sense to decentralise the API development to different teams to manage and productise their APIs in large API development projects. In contrast, the core API platform team maintains the core infrastructure. Workspace is a logical container that can group products, APIs and subscriptions accessible only to the workspace collaborators.
The access to the workspace is controlled through Azure Role Base Access Control (RABC), streamlining what a team can do within the given workspace.

Later in the post, we will dive deep to understand when it makes sense to have workspaces and when it does not and some design considerations. 

## Products

Products in API-M are logical containers where API administrators can group one or more APIs to set visibility, manage access and set usage quota and terms of use.

Protected products require consumers to have a subscription key, whereas open products can be accessed and consumed freely without needing a subscription key. Published products can be viewed by consumers who have given access to them, and they can request subscription keys which can be approved automatically or through a manual workflow. In upcoming posts, I will dive deep into my learning of design considerations on logically separating APIs into products.

## Groups

API-M groups help access control to products and, therefore, indirectly to associated APIs. There are three built-in groups,
- Administrator
- Developers
- Guests

Administrators have full rights to create and configure APIs, operations, products, and groups and manage the developer portal. Azure subscription administrators are members of this group by default. The developers are authenticated users who can use configured APIs, while guests are unauthenticated developer portal users. Administrators can create custom ones or associate external groups such as Azure Active Directory user groups. Again as you go through this blog series you will come into terms how well you can design the groups to fit for your needs.

## Policies

Policies are collections of statements (XML-based & C# code snippets) that execute sequentially on the request (inbound) or response (outbound) of an API call.

![Azure API Management - Policies]({{ site.baseurl }}/media/2023/apim-series/apim-policies.png){: style="display:block; margin-left:auto; margin-right:auto"}

There are various levels that policies are can be associated.
- Global (all APIs)
- Workspace
- Product
- API
- Operation

![Azure API Management - Policies]({{ site.baseurl }}/media/2023/apim-series/apim-policy-scopes.png){: style="display:block; margin-left:auto; margin-right:auto"}

Policies can be used to transform the payload, convert between XML and JSON, rate limit, restrict based on usage, IP restrictions, cache and more. The complete list of policies is available [here](https://learn.microsoft.com/en-us/azure/api-management/api-management-policies). Later in the series, we can understand better how effectively we can design reusable, maintainable, clean blocks of policies to well-designed APIs

## Backend

A backend in API-M is simply an HTTP service that implements the API operations, whether Azure-hosted, on-premises, or in another cloud or, as discussed at the top of this post, logic Apps or Function Apps can uplift the legacy system. As far as the connectivity from the API-M gateway can access those backends, it is considered a backend for API-M. 

The backend abstracts the information about implementation, making the APIs reusable and replaceable with minimal impact on the consumers.

# Integrations

API-M natively integrates with many Azure services to create an enterprise-grade API platform.

- **Azure Key Vault** for securely storing and managing client secrets and certificates.
- Logging, capturing metrics, alerting and troubleshooting through **Azure Monitor** and **App Insights**
- Using **Virtual Networks, Private Endpoints** and **Application Gateways** to isolate network communications between services and backends. 
- **Azure Active Directory** and **B2C** for authentication can authorisation.
- **Azure Functions, Logic Apps, Web Apps, Kubernetes**, and several compute services to deliver backend APIs.

We look into these in detail under the security, monitoring and implementation best practices later in the series.

# Implementing Azure API-M

Lastly, implementing the bare bones of API-M is simply a few commands or a few lines of infrastructure codes only. The rest of the series will focus on each area, assuming the API-M instance already exists in examples to keep things clean. It is the most suitable place to glance at the basics.

There are several ways we can spin up an Azure API-M instance. However, with automation and best practices in mind, the following are the ideal ways to provision API-M via CI/CD Pipelines.

## Azure CLI

```bash
az apim create --name apim-rkt-demo --resource-group rg-rkt-apim-demo --publisher-name rkeytech.io --publisher-email apim@rkeytech.io --no-wait
```
## Bicep

```bicep
resource apiManagementService 'Microsoft.ApiManagement/service@2023-03-01-preview' = {
  name: 'apim-rkt-demo'
  location: 'australiasoutheast'
  properties: {
    publisherEmail: 'apim@rkeytech.io'
    publisherName: 'rkeytech.io'
  }
}
```

# Conclusion

Azure API Management (API-M) is a powerful service that simplifies managing APIs, offering enhanced developer experiences and robust security features. With the Developer Portal and analytics capabilities, organisations can optimise their API strategies and foster developer engagement. By following best practices, organisations can ensure the success of their API-M implementations and provide a seamless experience to API consumers. In the rest of the series, we will dive deep into Product and API design considerations, Version strategy, security best practices, policy development and prevention abuse, monitoring and analytics and on each stream, we will look into CI/CD automation.

Stay Tuned for More 😊 See you in the next one!
