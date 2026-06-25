---
title: "Hello QUERY: The HTTP Method We've Been Waiting For"
date: 2026-06-26
comments: true
toc: true
categories:
    - Architecture
tags:
    - HTTP
    - QUERY
    - APIs
header:
  teaser: "/media/2026/teasers/hello-query-the-http-method.png"

excerpt: RFC 10008 introduces the new `QUERY` HTTP method — a safe, idempotent way to express read-only requests that carry a request body, resolving the long-running GET vs POST search debate.
---

# 👋 Hello QUERY: The HTTP Method We've Been Waiting For

For as long as I've been designing APIs, one debate has surfaced over and over again.

**Should a search endpoint be a GET or a POST?**

If the search was simple, GET seemed obvious. Not only search endpoints sometimes a simple GET all method grows over time to have query parameters and then it eventually ends up in this debate. At the begining GET made sense, later on security scans forces us to change it to POST but it never felt right.

Specially, if the search became complex or contained Personally Identifiable Information (PII), things suddenly became much more complicated.

Neither option felt right.

After decades of developers working around this limitation, HTTP finally has a proper answer.

Meet **QUERY**, the newest member of the HTTP family.

---

## The GET vs POST Debate

Imagine you're building a customer search API.

```http
GET /customers?firstName=John&lastName=Smith
```

Looks perfectly reasonable.

Until someone asks to search by:

* Email address
* Phone number
* Passport number
* Medicare number
* Customer ID
* Date of birth

Now your URL starts carrying sensitive information.

That URL doesn't just travel between your application and your API.

It often ends up in places you never intended:

* Browser history
* Web server logs
* Reverse proxy logs
* CDN logs
* Application monitoring
* Analytics platforms
* Debugging tools
* Shared screenshots
* Browser bookmarks

Even if your application uses HTTPS, the URL itself can still be recorded by many systems along the request path.

For organisations handling customer data, healthcare records, financial information, or government services, this becomes much more than an architectural concern.

It becomes a security and compliance concern.

---

## So Why Not Just Use POST?

This has been the industry's workaround for years.

Instead of sending parameters in the URL:

```http
POST /customers/search

{
    "firstName": "John",
    "lastName": "Smith"
}
```

The data stays in the request body.

Problem solved?

Not exactly.

POST was designed for requests that create or modify server state.

Searching doesn't do either.

Using POST means we're asking infrastructure to treat a read operation like a write operation.

That has consequences.

Depending on the platform, you may lose expectations around:

* Safe operations
* Idempotency
* Automatic retries
* Caching behaviour
* API semantics
* Tooling assumptions

Developers accepted this compromise because there simply wasn't a better option.

---

## Enter QUERY

RFC 10008 introduces a brand new HTTP method:

**QUERY**

QUERY combines the strengths of both GET and POST.

Like GET, Idempotent and Clearly represents a read operation

Like POST, Safe as request body supported and therefore sensitive data stays out of the URL

For the first time, HTTP has a method whose semantics actually match what many APIs have been trying to express for years.

---

## A Simple Example

Instead of this:

```http
GET /customers?email=john@example.com
```

or this:

```http
POST /customers/search
```

we can now write:

```http
QUERY /customers

{
    "email": "john@example.com"
}
```

The intent is immediately obvious.

We're querying data.

We're not modifying anything.

---

## Why This Matters

At first glance, QUERY might seem like a very small addition to HTTP.

After all, developers already have workarounds.

But standards matter.

Good standards make APIs easier to understand.

They reduce ambiguity.

They allow frameworks, gateways, proxies, browsers, documentation tools, SDK generators, and API management platforms to make better assumptions.

The HTTP ecosystem has spent decades evolving around well-defined semantics.

QUERY fills one of the few remaining gaps.

---

## Will Everyone Adopt It Tomorrow?

Probably not.

Browsers, reverse proxies, API gateways, frameworks, load balancers, SDKs, OpenAPI tooling, and cloud platforms all need time to add support.

History tells us that adoption of new HTTP features doesn't happen overnight.

But every standard starts somewhere.

As platform vendors begin adding support, API designers will finally have a first-class way to model read-only operations that require a request body.

---

## Final Thoughts

I've lost count of how many architecture discussions I've had where the conversation eventually became,

*"Let it be a POST? So, that we get a security guys stay happy"*

There was never a perfect answer.

Only trade-offs.

QUERY doesn't reinvent HTTP.

It simply gives us the missing piece that developers have wanted for years.

Sometimes the smallest additions to a protocol end up solving the biggest everyday frustrations.

Welcome to the HTTP family, QUERY.

---

## References

RFC 10008 – The HTTP QUERY Method

https://www.rfc-editor.org/rfc/rfc10008.html
