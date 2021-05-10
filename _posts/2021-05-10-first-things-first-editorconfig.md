---
title: "First things first - Setting up EditorConfig"
date: 2021-05-10 11:00
comments: true
categories: 
    - Best Practices
tags:
    - Dev Env Setup
    - Best Practices
    - IDE
    - DevOps
header:
  teaser: "/media/2021/editorconfig.png"
---

Before I dive into the article, I would like to post a question, and it is one of the general questions mostly I get from my team.

_If you are a developer or a project lead, what would be the first thing you do when setting up a brand new project? Generally, after setting up source control and maybe the boilerplate empty project structure._

For me, it's always the very first thing I do next is set up the [EditorConfig](https://editorconfig.org/) file.

![EditorConfig ]({{ site.baseurl }}/media/2021/editorconfig.png){: width="250" style="display:block; margin-left:auto; margin-right:auto"}


# Why

Often, we, as developers, show some bias towards our favourite IDEs and for a bunch of our favourite extensions that come with them or are purchased to make our lives easy.

Nothing wrong with that.

You could ask but can't enforce what IDEs the developer should use, nor you will win this battle of controlling it. However, as the development team grows and as people move in and out of the project, soon you will realise you if you don't introduce some check gates, you can't regulate different styles creep into the codebase. Later this results in blaming culture, pointing fingers at the people who are usually no longer in the project, and you will start accepting "it is what it is."

Even if everyone uses the same IDE, personal views and coding styles are different. For example, some like to mention the access modifiers explicitly, and some don't, as the programming language defaults to private under the hood. Some want to use the var keyword to declare an implicit type variable, while others tend to be explicit. Also, the various extensions and personal preferences are making under the hood quick formattings and tidying up the code, which to the naked eye seems all good, but it is not. One typical scenario is when indenting code use spaces vs tabs. When it comes to Git source control, a simple change as space is a diff. A change. When two developers have worked on the same file, this formatting becomes a nightmare, resulting in merge conflicts.

If you don't address this, this inconsistent formatting will soon find its way into every pull request; you will see changes that don't matter and fail to concentrate on what changes in the source code.

I am a big fan of clean code. Not only the principals. But also when developers submit clean and tidy pull requests with clear and cohesive changes. When there are too many diffs, our brains quickly get tired, and our frustrations will make room for a critical production bug sooner or later. None of us wants that.

So why not, as the development team, agree — create a contract. Then, perhaps we can enforce this agreement via DevOps if we need a more automated way of governing this.

# The contract - EditorConfig

EditorConfig is a configuration file that contains a collection of rules which the team is agreed to follow. So the IDE or the code editors can adhere to consistent code formatting.

Most of the well-known IDEs like Visual Studio, IntelliJ and  Github come with built-in support to the .editorconfig file, and they honour the configuration out of the box when files are saved or formatted. However, some IDEs like [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig), [Sublime Text](https://github.com/sindresorhus/editorconfig-sublime#readme) and others require a plugin to be enabled.


# The rules - Configuration

Once the .editorconfig file is the present root of the project, then the team must apply the agreed coding styles and rules they would need to follow. The editor config has comprehensive documentation on creating a one from scratch.

In this blog, my intention is not to dictate what that configuration should be. However, I'd strongly encourage making this agreement one of your first tasks to do as you formulate your group; depending on the programming language, you may find that you can extend this configuration to a lot more than just formatting and spacing.

I usually favour starting from the official documentation for each language. Then I work with my development team to establish our contract and check-in the .editor config to the root of the source. 

Since my area of expertise is .NET, my starting point for [.NET coding styles](https://docs.microsoft.com/en-us/dotnet/fundamentals/code-analysis/code-style-rule-options) which we can find under MS documentation.

If you are working with frontend frameworks like Angular, VueJS, and React, in addition to .editorconfig, you will also need to invest time to define your [ESLint](https://eslint.org/) which is more focusing on the rules and styles for the frontend framework you use.

# Enforcing - DevOps

The above may seem reasonable enough if you have a self-disciplined development team to follow the rules. But the truth of the fact is, we will sometimes find one who likes to bend the rules. Intentionally or unintentionally. We don't need to create an exception for this.

The solution would be to make your build pipeline start treating these style violations as build errors instead of a warning. For example, for .NET projects, we could follow the [Code-style analysis](https://docs.microsoft.com/en-us/dotnet/fundamentals/code-analysis/overview) and ensure that these checks are a part of our pull request build validations so that we can ensure that the submitted code is compliant with what the team has agreed.

On the other hand, you should achieve similar frontend frameworks by adding build steps to your frontend projects to enforce the linter rules.

So if a developer is not compliant, their code changes are not accepted, as the build fails due to violating these rules.

# Conclusion

We discussed why having an agreed coding style contract between developers is essential. In this blog, I only initiated the conversation. I will extend this topic further with a guided approach to achieving this with code snippets in my upcoming blogs. I can almost promise that you will have some resistance initially. However, this will be a lifesaver once everyone is on board and starts seeing its benefits. Then, the project developers can be confident that your team will produce auditable quality code.

Also, you will see that you don't need to convince anyone who may join later because it is the constitution that the development team agreed at one point. However, that doesn't mean we don't welcome different views. As the programming languages evolve and release new features, you may find that specific rules also should change. The good thing is if the entire team agrees, it's a matter of updating the config file and accepting to retrofit the existing code as it becomes the new standard and makes the new rule the way forward.

End of the day, it's continuous improvement.