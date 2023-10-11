---
title: Security Best Practices for Azure API Management (API-M)
date: 2023-10-11
comments: true
toc: true
categories: 
    - Azure
tags:
    - API-M
    - Bicep
    - Zero To Hero
header:
  teaser: "/media/2023/teasers/azure-apim-s01p05.png"

excerpt: APIs have become the building blocks of modern software applications, enabling data and services to be shared across diverse platforms and devices. As we have been understanding in this series, Azure API Management (API-M) is there to manage our APIs. So, the security of itself and the safety of the APIs it manages are equally important. This post will explore the options available to protect our APIs and API-M out of the box and look at examples of implementing some of them.
---

This blog is a multi-part series, and visit related topics for a complete understanding of the overall API-M solution.

**Navigate in Blog Series**
- [Azure API Management (API-M) Overview](/blogs/2023/09/azure-api-management-series-overview) :arrow_upper_right:
- [Designing API Products](/blogs/2023/09/azure-apim-designing-products) :arrow_upper_right:
- [Versioning and Revisioning](/blogs/2023/09/azure-apim-versioning-and-revisioning) :arrow_upper_right:
- [Understanding & Designing Policies](/blogs/2023/09/azure-apim-versioning-and-revisioning) :arrow_upper_right:
- Security Best Practices [👈You are here]
- Structuring Source Code [📝 Coming Next]
- Analyse and Monitor
- Document APIs
- Development Workflow & APIs CI/CD
- Automating Developer Portal via CI/CD
{: .notice--primary}

APIs have become the building blocks of modern software applications, enabling data and services to be shared across diverse platforms and devices. As we have been understanding in this series, Azure API Management (API-M) is there to manage our APIs. So, the security of itself and the safety of the APIs it manages are equally important. This post will explore the options available to protect our APIs and API-M out of the box and look at examples of implementing some of them.

# Why API Security is Important?

It's a no-brainer question. Still, let's establish our ground and why API security is paramount so we can understand how to protect API-M and the APIs it manages.

APIs expose mainly data and operations against that data. Securing APIs establishes trust in the systems and the integrity of the data. On top of it all, leaving data in the wrong hands can seriously damage the business's reputation and endanger the lives of individuals that data may associate with. As APIs continue to play a central role in modern software development, investing in their security is not an option but a necessity.

Strong security measures help us guard our APIs, protect our data, and backend resources.

# Security Best Practices with API-M

API-M has many out-of-the-box capabilities to support various security and compliance concerns. It can work natively with other Azure infrastructure to make it one of the best API Management solutions.

## Authentication to API-M

Azure API-M supports guest users and anonymous access. However, in most cases, we need to consider protecting our APIs and API-M itself, and it's always a good idea to configure the authorisation server configuration along with other social logins if that is a valid use case for our API-M use case.

```bicep
/*
------------------------------------------------
Authorisation Servers
------------------------------------------------
*/
resource apimService 'Microsoft.ApiManagement/service@2023-03-01-preview' existing = {
  name: apimServiceName

  resource authorizationServer 'authorizationServers@2023-03-01-preview' = {
    name: authorizationServer.name
    properties: {
      displayName: authorizationServer.displayName
      clientId: authorizationServer.clientId
      authorizationEndpoint: authorizationServer.authorizationEndpoint
      tokenEndpoint: authorizationServer.tokenEndpoint
      clientRegistrationEndpoint: 'https://jwt.ms'
      clientSecret: authorizationServer.clientSecret
      defaultScope: authorizationServer.defaultScope
      useInTestConsole: true
      useInApiDocumentation: false
      supportState: false
      authorizationMethods:[
        'GET'
      ]
      clientAuthenticationMethod: [
        'Body'
      ]
      grantTypes: [
        'authorizationCode'
      ]
      bearerTokenSendingMethods:[
        'authorizationHeader'
      ]
      tokenBodyParameters: [
      ]
    }
  }
}
```

## Role-Based Access Control (RBAC)

It is more likely that API-M will connect to other native Azure services like Application Insights, Key Vault, and even backend APIs within Azure infrastructure. It is best to assign a managed identity to the APIM and then grant the least required privilege access to it.

I have discussed managed identities and their use in this [post](/blogs/2021/06/securing-azure-resources-using-managed-identity) before. Assuming the managed identity already exists, the following code snippt shows how to configure API-M with managed identity.

```bicep
*
------------------------------------------------
APIM Instance
------------------------------------------------
*/

resource apiManagementService 'Microsoft.ApiManagement/service@2023-03-01-preview' = {
  name: apimServiceName
  ... 
  identity: {
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
    type: 'UserAssigned'
  }
}
```

## Rate Limiting and Quota

As we understood in our previous [post](/blogs/2023/09/azure-apim-understanding-and-designing-policies), we can use Azure policies to set quota and rate limits to prevent abuse and ensure fair usage of our APIs to protect our backend resources against DDoS attacks.

### Quota Limit Policy Example

The example code snippet below shows the quota limit for the 1000 API calls and 30000 kilobytes (KBS) of data transferred from an API for 1 hour (3600 seconds). If the API consumer exceeds one of these limits, the API-M will automatically throttle the usage, protecting our APIs from abusive use.

```xml
<policies>
    <inbound>
        <base />
        <quota calls="1000" bandwidth="30000" renewal-period="3600" />
    </inbound>
    ...
</policies>
```

### Rate Limit Policy Example

Similar to the quota limit, the following policy snippet below shows the number of calls limited to 100 calls per 90 seconds. After each policy execution, the remaining calls allowed in the period are stored against the variable `remainingCallsForSubscription`. This is tracked against the subscription key of the consumer.

```xml
<policies>
    <inbound>
        <base />
        <rate-limit calls="100" renewal-period="90" remaining-calls-variable-name="remainingCallsForSubscription"/>
    </inbound>
    ....
</policies>
```

**IMPORTANT:** Rate limiting and quota restrictions must factor in consumer SLAs and backend constraints and any agreed contracts with the consumer.
{: .notice--info}

## IP Whitelisting and Blacklisting

In cases where APIs should only be accessible through a defined range of IPs, the following API-M policy snippet allows or forbids traffic from a given IP address or range. It significantly increases the protection of APIs by restricting traffic only from known sources on top of other security and authentication requirements.

```xml
<ip-filter action="allow">
    <address>13.66.201.169</address>
    <address-range from="13.66.140.128" to="13.66.140.143" />
</ip-filter>
```

**Note:** On the flip side, IP filtering restricts developers from using the APIs
from their developer machines, as IPs are more likely to change more often. So, we should consider which environments to apply these to. Otherwise, this easily becomes an additional administration task.
{: .notice--info}

## Transport Security

We should encourage HTTPS (443) over HTTP (80) wherever possible. Even though our backends don't support HTTPS, we can ensure traffic inbound to API-M comes via HTTPS. So there is no excuse.

We can enforce this at each API backend. Also we can bake this requirement into global policy as follows.

```xml
<inbound>
	...
	<choose>
	    <when condition="@(context.Request.OriginalUrl.Scheme.Equals("http"))">
	        <return-response>
	             <set-status code="302" reason="Requires SSL" />
	                <set-header exists-action="override" name="Location">
	                    <value>@("https://" + context.Request.OriginalUrl.Host + context.Request.OriginalUrl.Path)</value>
	                </set-header>
	        </return-response>
	    </when>
	</choose>
	...
	<base />
</inbound>
```

Through this policy, we restrict all HTTP (80) calls and force consumers use HTTPS (443). In failure, we will block the traffic to HTTP with a status code 302 with a "Require SSL" message.

## Managing (Secret) & Name Value Pairs

Name Value Pairs built into the API-M is a great place to store configurable values. Name-value pairs like endpoints, API Keys, Usernames, and Passwords can be stored as sensitive and non-sensitive values. However, we should encourage using Azure Key Vault to store managed keys, secrets, passwords, and certificate values. Then, under name-value pairs, we can use them as a reference, as shown in the code snippet below.

```bicep
/*
------------------------------------------------
Existing Resources
------------------------------------------------
*/
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: managedIdentityName
}

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' existing = {
  name: keyVaultName
}

/*
------------------------------------------------
Named Values Secrets
------------------------------------------------
*/
resource service 'Microsoft.ApiManagement/service@2023-03-01-preview' existing = {
  name: apimServiceName

  resource nvkvsAppInsightsInstrumentationKey 'namedValues@2023-03-01-preview' = {
      name: 'appinsights-instrumentation-key'
      properties: {
        displayName: 'AppInsightsInstrumentationKey'
        keyVault: {
          secretIdentifier: '${keyVault.properties.vaultUri}secrets/appinsights-instrumentation-key'
          identityClientId: managedIdentity.properties.clientId
        }
        secret: true
        tags: [
          'apim'
          'logger'
        ]
      }
    }
}
```

Once these configurable values are stored as name values within policies, the values can referred to as below within policies and else where.

{% raw %}
```xml
{{name-value-pair-key}}
```
{% endraw %}

## Logging and Monitoring

We can use Azure AppInsights to push API-M logs. We will discuss this in more depth in a follow up post. Once we configure API-M to emit logs into Application Insights, we can use its native capabilities to query logs and create alerts that act as the first line of defence against anomalies so that we can take action to protect our APIs.

# Conclusion

Securing your Azure API Management instances is crucial for safeguarding your APIs and sensitive data. Following these security best practices and implementing the code samples provided can create a robust and resilient API Management environment. Stay vigilant, regularly review and update your security measures, and adapt to evolving threats to secure your APIs in the dynamic digital landscape is a must.