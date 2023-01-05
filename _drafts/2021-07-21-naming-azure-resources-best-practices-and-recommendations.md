---
title: "Naming Azure Resources - Best Practices and Recommendations"
date: 2021-07-21
comments: true
toc: true
categories: 
    - Azure
tags:
    - Best Practices
    - Azure
header:
  teaser: "/media/2021/2021-07-07/teaser.png"

---

Names are a significant part of an identity. Naming azure resources is no different. However, many organisations struggle to adopt a better naming strategy for their Azure environments, especially the ones adopting cloud from on-prem environments. Compared to owning your data centre, the cloud is built for scale. It has many built-in ways to handle redundancy and high availability. So the naming resources with regions and instance count may not add much value. But failing to understand this potential, most end up with a naming standard that hinders the scalability of the cloud. Hence, this article focuses on establishing some ground rules which I have personally used in many projects.

# Objectives
Let's agree on some ground rules and understand the objectives of the naming strategy.

## Clearness
The name must be clear and self-describe what it meant to be. In addition, it has to be short enough to comply with naming restrictions but long enough to explain its characteristics. However, we should avoid too much information crammed into the name. i.e. location, os type, redundancy, instance count or even what software version (sql2019) installed should not be part of the name. These types of naming are likely to inherit from on-prem practices.

Cloud environments are designed to scale. Therefore, new geographical regions are added from time to time. Redundancy and high availability, and scale are built into most Azure resources. Thus, naming with an on-prem mindset will hinder your ability to scale these services in the future.

## Easy to Remember
Names should be easier to remember. But, of course, it doesn't mean you should be able to memorise them. However, the team should be able to identify the resource, especially when you have more than one of the same kind within the same context (subscription, resource group).

For example, these naming standards become essential when teams try to troubleshoot and investigate logs. When it comes to cost, the team should be able to identify the specific resource and its purpose. In addition, the insights and monitoring should be able to point out what part of the application component is having issues without needing to refer to any documentation.

## Consistancy
A unified format matters. A well-thought naming standard will help find all your similar type resources next to each other alphabetically organised. More importantly, this can become standardised knowledge if your team members work across multiple projects over time, reducing the need to re-share the same knowledge.

Consistent naming conventions make resources easier to locate and assist in establishing a common understanding with team members.

# Parts of Name

## Organisation Name
Why do we need the organisation's name in our naming strategy? Don't we all know the Azure resource belongs to the organisation already? 

We certainly do. Two reasons. The abbreviated name adds uniqueness to your Azure resource naming strategy. It would help when your Azure resources, such as storage accounts and app services, where names expected to be globally unique.

Secondly, consider that your team may get external collaborators or Microsoft support to look into Azure environments to troubleshoot issues. External people may work with many clients. Having your name embedded into your resource would be more accessible to anyone to identify.

I **recommend** an abbreviated organisation name, not more than four letters, to be embedded in your naming.

## Project or Product Line (Application Name)
The next and most crucial part of your naming strategy is your application or project/ product name. It should help quickly identify the scope of the application or product and be something unique to your organisation. I even recommend my client to name source code repositories or projects closer to this abbreviation.

I **recommend** an abbreviated application/ project/ product code, no more than six characters (if required) separated by hyphens (if the resource naming allows) to a maximum of two parts.

## Environments
The environments get used in each project or organisation widely vary. Costs and other factors make the team decide how many environments they may maintain to deliver the project. Usually, the first and the last are very clear. It's what's in between the two that raises a lot of questions.

I **recommend** a three-letter abbreviated environment name. However, suppose your strategy struggles with the length restrictions. In that case, I suggest dropping it to one character as far as it's clear what it stands for. Here are a few standard environment names we generally come across and their abbreviations I suggest.

| Environment     | Short Name |
|-----------------|------------|
| Development     | dev        |
| Test            | tst        |
| QA              | qat        |
| User Acceptance | uat        |
| Staging         | stg        |
| Production      | prd        |
 
