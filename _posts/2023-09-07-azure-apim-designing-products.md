---
title: Designing Products in API Management (API-M)
date: 2023-09-07
comments: true
toc: true
categories: 
    - Azure
tags:
    - API-M
    - Bicep
    - Zero To Hero
header:
  teaser: "/media/2023/teasers/azure-apim-s01p02.png"

excerpt: Azure API Management Products logically separates APIs into units to offer a subset of the APIs or different SLAs to consumers. It's a powerful concept that makes API-M stand out to offer true enterprise-ready managed API service. So it's important to understand the basic principles and design considerations of designing products in API-M, which this post will dive into.
---

This blog is a multi-part series, and visit other sections for a complete understanding of the overall API-M solution.


**Navigate in Blog Series**
- [Azure API Management (API-M) Overview](/blogs/2023/09/azure-api-management-series-overview) :arrow_upper_right:
- Designing API Products  [👈You are here]
- [Versioning and Revisioning](/blogs/2023/09/azure-apim-versioning-and-revisioning) :arrow_upper_right:
- [Understanding and Designing Policies](/blogs/2023/09/azure-apim-understanding-and-designing-policies) :arrow_upper_right:
- [Security Best Practices](/blogs/2023/10/azure-apim-security-best-practices) :arrow_upper_right:
- Project Structure
- Monitoring Analytics
- API Documentation
- Development Workflow & APIs CI/CD
- Automating Developer Portal via CI/CD
{: .notice--primary}


# What is an API-M Product?

Azure API Management (API-M) **Products** logically group one or more APIs into cohesive units. Whether it is to separate various features, offer separate SLAs, or segregate the consumers by the scope of their engagement, it is up to the API owners to decide how to slice and dice the APIs and package them into products.

APIs associated with a product may have one or more operations pointing to a single or several backends. APIs can be shared between products, too. We will discuss the API design considerations later in the series. Also, a product can be associated with one or more user groups. By default, each product is associated with the Administrators group, and we can extend to developers, guests and custom groups as required. The access to a product is governed by the users associated with the groups. A group can have access to one or more products. Groups will be discussed later under the security aspects of API in a dedicated post.

A product is given a display name, an internal name and a section to host the terms and conditions of its use, along with some other configurations. Each product has a policy that controls the behaviour and security of all APIs attached.

Essentially, API-M products package our APIs into units.

## Open vs. Protected Products

Depending on how the product is set up for consumers, a product can be opened or protected. If a product is configured with the subscription Required flag enabled, the consumers must first subscribe to the **protected** product to access the product's APIs. When they subscribe, they get a primary and secondary API key, which gets validated before accessing the associated APIs.

Opposite an **open** product, consumers can access associated APIs without a subscription key. However, you can configure other mechanisms to secure client access to the APIs, including [OAuth 2.0](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-protect-backend-with-aad), [client certificates](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-mutual-certificates-for-clients), and [restricting caller IP addresses](https://learn.microsoft.com/en-us/azure/api-management/ip-filter-policy).

## Subscriptions

Developers can generate subscriptions against All APIs, a Product or a single API. Passing the subscription key in the payload header is necessary to access any protected APIs.

```html
Ocp-Apim-Subscription-Key: [Subscription Key]
```

Getting a subscription can be self-managed or approval workflow-driven, where an API administrator must first accept the API subscription key. Additionally, we can specify how many subscriptions a consumer can have. Ignoring a value will be unlimited, and generally, given each subscription comes with primary and secondary keys to support zero downtime one per user is ideal unless there is a very valid business case.

**Note:** By opening the product to use without a subscription, we will also lose the ability to set usage limits quota or rate limit against the subscription key. Enabling consumers to obtain multiple subscriptions will allow them to work around usage limits and quota restrictions.
{: .notice--warning}

## Policies in Product

Each product also carries a policy dictating the behaviour and securing the associated APIs. Product policies are evaluated before and after assessing API and operation-level policies depending on how the policy blogs are defined at the product level.

## Product Monetisation

Product-level policies help shape product behaviour to be white-labelled or branded for monetisation. For example, a free tier can limit the number of API calls, while another product offers the same APIs with unlimited access. While charges, handling payments and SLAs for products is a carried outside of the scope of API-M, it comes with a set of management APIs allowing integration and automation tasks.

# The Big Picture - Product Design Approach

So far, we have looked into what constitutes a product. As an enterprise-grade API management suite, the Azure API-M is an excellent platform with enormous flexibility. When flexibility is a luxury, it comes at a cost. We must think about how we strategise and package our consumer APIs.

We must decide if APIs or integration capabilities expand horizontally, vertically, or both as new requirements arise or consumers grow. To better understand this, let's look at a few case studies to help us navigate this thought process.

## Case Study #1: Horizontal Products

A leading software vendor builds an Employee & HR management solution as a [SaaS](https://www.oracle.com/au/applications/what-is-saas) offering. They wanted to enable integration with their product and ensure their APIs follow the same modular approach as their software product. Their software has multiple sub-modules extending various features to their clients. Not all customers are interested in all modules. Each module offers the same functionality to all customers who use them. Their clients can purchase or decommission these modules through the software. The organisation uses API-M to segregate numerous features at the API level and only associate relevant modules to the users who have purchased the respective module. So, they decided to create horizontal products grouping various APIs and allow consumers to access those products by associating them with the correct user group.

So, products read as **Onboarding**, **Payroll**, **Learning Management**, **Performance Appraisals**, etc., and each product was associated with a group with the same names. They decided to use the integration APIs to API-M to associate consumers with respective user groups, giving access to the modules they have purchased or removing them from the group as they cancel the subscription to the module.

![Azure API Management - Horizontal Products]({{ site.baseurl }}/media/2023/apim-series/apim-designing-products-horizontal-products.png){: style="display:block; margin-left:auto; margin-right:auto"}

## Case Study #2: Vertical Products

A field service company that provides their services to various organisations wanted to create an integration platform for their in-house work (job) management system. While the create job (POST) and get job details (GET) endpoints had different API payload structures specific to the client, their job status update, and a few other standard functionalities (get job notes, get job documents and get job logs) remain consistent for all clients. To align with this strategy, the organisation aligned their APIs vertically, grouping APIs specific for each client and shared APIs, creating products per client, and associating each client user account with the product-associated user group.

So, products read as **Client A - Jobs APIs**, **Client B - Jobs APIs**, etc. Some APIs were shared between products, while some were specific only for the particular client.

![Azure API Management - Vertical Products]({{ site.baseurl }}/media/2023/apim-series/apim-designing-products-vertical-products.png){: style="display:block; margin-left:auto; margin-right:auto"}

## Case Study #3: Combined (Horizontal & Vertical) Products

A government agency that collects traffic and road disruption information decides to make its data available via APIs to the general public as a part of its open data policy. Given that it's not a sponsored project, they only made information refreshed hourly, and they restricted one request per minute to the general public.

However, the APIs have become so popular with transport and courier companies that they are keen to get near real-time data without throttling and would even like to sponsor the project team. Therefore, the government agency combined horizontal and vertical approaches and created free and unlimited tiers for each data set. The paid (sponsored) tier remained less restrictive in throttling, and the free tier continued the limits.

In this scenario, the agency created products for each dataset with a paid and free tier. Therefore, the products read as **Traffic - Free**, **Traffic - Unlimited**, **Distructions Free**, **Distructions - Unlimited**, etc. The beauty of this approach is both tiers were attached to the same APIs, but the policy attached to the product changed the throttling behaviour.

![Azure API Management - Combined Products]({{ site.baseurl }}/media/2023/apim-series/apim-designing-products-combined-products.png){: style="display:block; margin-left:auto; margin-right:auto"}

# The Sucess Contributors

To develop a successful product strategy to reap the best results from the product design, exercise these are a few things I have personally encouraged in my projects. It is entirely subjective, and sharing these fundamental principles helped my teams define a solid foundation for our products and many other aspects of API-M.

## The Core Team

API-M is to manage APIs. But API-M itself also should be managed well. Otherwise, you will likely end up with a soup made by many cooks that is tasteless and bland. In my projects, I encourage having an API-M owner, a single person or a team. Which we usually call the **Core Team**. The core team should make such decisions at a much higher level. They should see the bigger picture and understand the organisational needs to strategise the API-M to the organisation's long-term goal.

Naming products to maintain consistency is the fundamental goal of this clan. Sure, they can consult the individual API team for better clarity. However, the core team's decision is final. When you don't have the luxury of separate teams, I usually encourage one team member or a subset of the team to understand the big picture better. This person or group should look beyond the current project scope, envision how the API-M will be strategically used in the organisation, and guide the rest of the API developers to follow that big vision.

## Products Characteristics

Let's start from the basics— product name. It should describe what it is for and what it offers. Avoid arbitrary or confusing names like Product 01, Product 02, etc. You can change the display name of the product quickly. However, changing an internal representation in the Infrastructure Code will create a new product. Separating existing products is even more cumbersome. All these changes down the line will require migrating existing subscribers.

![Azure API Management - Create Product]({{ site.baseurl }}/media/2023/apim-series/apim-designing-products-create-product.png){: style="display:block; margin-left:auto; margin-right:auto"}


Secondly, changing from an open to a protected product will also mean your consumers suddenly require a subscription key or even limit the number of subscriptions later, which can create inconsistent behaviours.

Finally, APIs, Operations and Policies. Ensure that policy restrictions are a combination of all levels. If you have a less restrictive product-level policy, it means nothing if a policy at the API or operation level has more strict controls. To maintain consistency, ensure all APIs and operations observe similar characteristics and align to the product offering. Determine when different types of policies are evaluated at which level. Also, set the correct expectations in documentation and terms and conditions of its usage.

## Backward Compatability

Once we have launched a product with certain APIs and policies, we can't keep changing the direction each time and introduce breaking changes. That will be a frustration for our consumers. For example, if we used to offer less restrictive (throttled) APIs in the past, we can't just introduce new policies to make them strict. Also, if many APIs were available under a particular product, we can't simply decommission some of it and separate it into another product as the business changes direction.

Consider a published product like a Contract between your API-M and consumers. If a characteristic of a product or the nature of the API offering changes, you must declare some grace period for your consumers to get alignment with their implementation. I am not stressing here about API schema changes. That will be discussed in the versioning strategy in the next post. The primary focus here is policies and APIs associated with products being constant after being published. If we want to test the waters and how it impacts the current consumers, we can use the API-M revisions; that's also a topic for the next post.

# Implementing API-M Products

Once we have identified the primary objectives of our product grouping strategy and understand the boundaries we want to set, we can bake some of these into our Infrastructure as Code (IaC) snippets. Whether we want to default the number of subscriptions to a fixed value, if our products always require subscriptions and that require approval before they are allowed to be used, we can configure all of it in IaC modules.

The below example illustrates a product module written in Bicep that permanently limits the number of subscriptions to 1 and requires subscription and approval. Depending on our needs, we can make any of these configurable. 

```bicep
/*
------------------------------------------------
Parameters
------------------------------------------------
*/
@description('Required. The name of the API-M instance.')
param apimServiceName string

@description('Required. The name of the product.')
param productName string 

@description('Required. The display name of the product.')
param productDisplayName string

@description('Optional. The description of the product.')
param productDescription string

resource apimService 'Microsoft.ApiManagement/service@2023-03-01-preview' existing = {
  name: apimServiceName

  resource product 'products@2023-03-01-preview' = {
    name: productName
    properties: {
      displayName: productDisplayName
      state: 'published'
      subscriptionRequired: true
      approvalRequired: true
      subscriptionsLimit: 1
      description: productDescription
      terms: 'Some T&Cs here.'
    }
  }
}
```

Every API-M instance, by default, creates two products (Starter & Unlimited) and a dummy (Echo) API for demonstration's sake. In a fully automated world, I don't encourage developers to go into API-M instances and delete these manually. Leaving them on is no harm, as it provides some examples. However, we don't want default products and APIs to be available to consumers.

I use following Bicep to unpublish the two default APIs immediately at inception.

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
Unpublish Default Products
------------------------------------------------
*/
var defaultProducts = [
  'Starter'
  'Unlimited'
]

resource apimService 'Microsoft.ApiManagement/service@2021-08-01' existing = {
  name: apimServiceName

  resource defaultProduct 'products@2021-08-01' = [for product in defaultProducts: {
    name: product
    properties: {
      displayName: product
      state: 'notPublished'
    }
  }]
}
```

**Don't Forget:** If you decide to delete the two products manually, ensure to remove this code block. Otherwise, you will wonder why these appear again as unpublished products each time your deployment runs. It's obviously what the code block does. Create/ Override existing default products in the unpublished state.
{: .notice--warning}

I will leave the attaching policy to a product until we understand the policy design and development later in the series and link a user group to a product under security considerations later in the series. 

# Conclusion

As we have just uncovered, Azure API Management (API-M) offers excellent flexibility to define and package our APIs into cohesive units depending on how the business wants to promote its APIs. Due to its great flexibility, products and API-M, in general, should be managed and should undergo a proper design and discovery phase to identify how we want to wrap them up in a group.

Products offer an excellent want to control access, monetise and manage APIs for various reasons. Policies attached to products provide a way to control the API behaviour even for the same APIs because APIs can be shared between products. The product concept can be a compelling feature of our API management layer when the design is correct. Taking it less important can lead us into an unmanaged mess.

In the next post, let's explore how versioning and revision management in API-M can contribute to this success.

