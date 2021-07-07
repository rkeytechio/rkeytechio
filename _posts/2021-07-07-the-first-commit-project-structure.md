---
title: "The first commit - Project Strcture"
date: 2021-07-07
comments: true
toc: true
categories: 
    - Best Practices
tags:
    - How To
    - Best Practices
    - Azure DevOps
    - GitHub
header:
  teaser: "/media/2021/2021-07-07/teaser.png"

excerpt: "It is undoubtedly one of the first questions I asked when I was a junior developer, and it is still a question from my team on a kick-off of a new project. How do we structure and set up our source code? What folder structure makes more sense? Is there a standard? Who decides the format and such standards? Let's deep dive into this post to understand an ideal project folder structure."
---

The first team members usually set the project's standards and structure — usually, the first few commits are all about putting the skeleton in place. Indeed, it could change over time as the team matures and requirements evolve. But who likes to change? Generally, developers are not enjoying the exercise of refactoring, especially when they are already familiar with their work.

Secondly, having a structured method to organise your source code makes things easier to document and explain things. So onboardings and handovers become a smooth experience.

So is there a golden standard for how to best structure a project? What is the best way to structure a project? Who decides the structure? As a junior developer, it was one of my first questions as I started a new project and still a question I usually get from junior devs now that I lead projects.

# Short Answer

Indeed, there is no universally agreed way to structure the code. Reading this post, someone of you may agree, and some wouldn't. That's what would happen if you ask this from the team. It is entirely up to the team and certainly depends on what your source code is trying to deliver. But there are some guidelines to consider so the development workflow remains smooth. In this post, I aim to explain some ground rules to help you decide on the structure with some food for thought.

# Considerations

To evaluate how best to structure the project source, we must consider a few aspects of the project's source code.

## What your deliver

Some code repositories may deliver one or more artifacts. Let's consider the artifacts as a deliverable. Generally, a single repository may contain source code to deliver one or several. Some examples are;

- Infrastructure
- Frontend
- Backend
- Tests (Unit, Functional, Integration, Load, UI, etc.)
- Support Scripts
- Automation Workflows (Pipelines)
- Documentation

Based on various features and application components, it could be subdivided further. However, my proposed approach considers the top-level artifacts to keep this post concise.

## How you deliver

Does your team logically separated and responsible for delivering different artifact types, or is the team generally full-stack capable of delivering across domains? Of course, it doesn't mean everyone has to do everything. But do you have members of the team who generally work on one side of the spectrum? For example, would you prefer the pull requests to each artifact type being reviewed by separate stream leads? In addition, do your artifacts delivered to production in isolation? Or do all of them get deployed same time as a single unit?

Depending on your answers, it is best to mirror the same delivery model when you structure your project. So you can apply folder path-based filtering for PR approvals and to trigger build and deployment workflows.

My approach would focus on maintaining codes of all disciplines in a single repository with the ability to do path-based workflow triggers and code approvals.

## How efficiently you delivery

Especially when your repository has source code for more than one type of deliverable, you don't want to build, test, deploy and exhaust your CI/CD workflow minutes unnecessarily. Plus, if you use the same repository to maintain documentation, you don't want the CI/CD pipelines to get triggered. Again, that's a waste of precious build minutes.

If the team decides to maintain separate repositories for different deliverables, that's fine. Even I would recommend doing so if you have a well architectured and various development practices observed by teams. But for most of the smaller projects doing so adds a burden on maintenance, and people who work across these deliveries will need to context switch between repositories.

My approach aims to maintain a clear structure so that one day if required, the team can lift and shift the source code to a separate repository.

## Where is documentation

Documentation in any project is critical. One of the most tedious tasks in any project is onboarding and offboarding. We all have been there. Most projects struggle to keep up-to-date documentation and instructions on setting up and getting going with the project.

We don't want the excellent work and design thoughts we initially discussed to go to waste. Instead, we want the important standards, culture and enthusiasm we had on day one to be carried throughout the project to the end. Additionally, we need a traceable way to maintain why we did certain things at a particular time remains key knowledge to anyone who joins the team later, so it makes sense. More importantly, we want our documentation and decisions to be the team's constitution. So everyone follows with understanding.

In my proposed structure, we will look at how well to organise the documentation as a part of the source code and a few critical files we should put in place that developers follow in the open source projects.

# The proposed structure

Considering the above, the below is a structure I commonly employ for most projects. To set an example, I have assumed that we use Azure DevOps to host our source code for applications with a backend, frontend and mobile with Azure Infrastructure as Code (IaC).

I will look at each folder structure in detail.

```treeview
root/
|-- .azuredevops/
|   |-- pipelines/
|   |-- |-- templates/
|   |-- |-- variables/
|-- |-- |-- azure-pipelines.yml
|   |-- pull_request_template/
|-- docs/
|-- |-- CODE_OF_CONDUCT.md
|-- |-- CONTRIBUTING.md
|-- |-- GETTING_STARTED.md
|-- |-- SECURITY.md
|-- |-- SUPPORT.md
|-- env/
|   |-- modules/
|   |-- main.bicep
|-- src/
|   |-- shared/
|   |-- backend/
|   |-- frontend/
|   |-- mobile/
|-- tests/
|   |-- unit/
|   |-- integration/
|   |-- load/
|   |-- penetration/
|   |-- ui/
|-- .gitignore
`-- README.md
```

## .azuredevops / .github Folder

Given above example is hosted on Azure DevOps, this folder contains all the files and configuration definitions that define the build and deployment pipelines and pull requests templates. This structure is similar to the `.github` folder when hosting source code on GitHub. While GitHub is sensitive to this path, Azure DevOps is not. To enhance the developer experience, I have made `.azuredevops` a convention in my projects to streamline the developer experience.

In GitHub-based projects, the `.azuredevops` will be replaced by the following.

```treeview
root/
|-- .github/
|   |-- actions/
|-- |-- ISSUE_TEMPLATE/
|   |-- PULL_REQUEST_TEMPLATE/
|-- |-- scripts/
|   |-- workflows/

```

## docs Folder

In this directory, I propose maintaining all the documentation for the project. The list files under the docs folder got inspired by [GitHub Community Documentation Guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file). But it is not limited, the developer team can extend this folder to whatever it best suits their needs to explain the project and ways of working. These files are written in the [Markdown](https://www.markdownguide.org/getting-started/) file format, making both GitHub and Azure DevOps render these as nice readable files.

In Azure DevOps, you can configure this docs folder to become the [Project Wiki](https://docs.microsoft.com/en-us/azure/devops/project/wiki/publish-repo-to-wiki).

Also, given this folder doesn't change your deployable solution, we can use it to exclude this path from build and deployment workflows.

## env Folder

I intend to host all Infrastructure as Code (IaC) related files in this directory. The example illustrated focuses on storing Azure Bicep files and modules. But it can be [Terraform](https://www.terraform.io/), [Azure Bicep](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview) or [AWS CloudFormation Templates](https://aws.amazon.com/cloudformation/resources/templates/) or any other infrastructure codes or scripts your team maintains.

By segregating the infrastructure code to this folder, we can easily configure the pull requests reviewers and trigger infrastructure build/ deployment workflows based on the path.

## src Folder

As the abbreviated name implies, this is where we host all application source code. In this example, I have further subdivided the sections. However, depending on your scenario, your team must agree on what works best for them.

If you are working on a modern [.NET MAUI](https://docs.microsoft.com/en-us/dotnet/maui/what-is-maui) project, this sort of project structure works well for you to maintain shared code at a top level for the rest of the delivery types.

## tests Folder

This folder entirely depends on how your team delivers automated testing and how mature your testing is. So while all the illustrated subfolders don't need to be there, depending on your automated tests, you can structure this folder to your team's needs.

There have been controversial questions raised in the past should we maintain unit tests closer to the source code of each artifact type. Indeed, I am not against that. However, if you are developing your frontend applications using Angular, Vue, and React by default, have your tests sit next to your source code.

However, in .NET, there is no such constraint and where there is no constraint, I suggest maintaining your tests-related code in this folder for one good reason. During security and code vulnerability scans, if for any noise you don't want to retro-fix your entire solution, it's easier to exclude this path from your scans because this code never reaches production servers. By all means, I don't suggest ignoring them forever. But you can identify what is more critical vs trivial.

## .gitignore File

You can read more about the intention of this file [here](https://git-scm.com/docs/gitignore). Having a structure baked into your project now would be much easier to maintain one standard .gitignore file to meet the needs of your entire project at the root.

## README.md File

This file should be the starting point for your project. If any new member joins the project, this is the entry point to your source code. It should provide a brief description of your project and lays the foundation for understanding the project structure. Also, it should contain the links to the various sections under the `/docs` to explain things further and help them get going as soon as possible.

# Conculsion

For a development team, having a structure that the team can universally adopt to any project is a great way to reduce the additional learning curve. However, it is debatable how we should name each folder, whether we should use abbreviations such as `env`, `src` or be more specific. There isn't a golden rule. My simple rule is if there isn't one in place, talk with your team and agree on a structure. If you already have one, now that you know certain modern practices, see how much it aligns and discuss changes with your team. Think about the top level, and keep the structure extendible for various projects. 

Whichever you go, document it so that you have a baseline. Keep evolving and innovating. It's a journey of continuous improvement.