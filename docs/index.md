---
slug: /
sidebar_position: 1
---

# Microservices Lab — start here

This site documents an educational microservices system, built one milestone at a time. The business logic is deliberately trivial: a toy shop where an order flows through catalog, payment, inventory and notification services. All the attention goes to the architecture around it: how services talk to each other, own their data, fail, recover and scale, and how they are secured, observed and delivered.

## How to use this site

1. **Architecture**: the [overview](architecture/overview.md), [every tool explained in plain words](architecture/tools-explained.md), the [tech stack](architecture/tech-stack.md) (versions and licenses), and [how we work](architecture/dev-workflow.md).
2. **Fundamentals**: the [36 concepts](fundamentals/index.md) the system demonstrates. Each gets a concept page and a hands-on lab when its milestone lands.
3. **Decisions**: the [architecture decision records](adr/index.md) explain why things are the way they are.
4. **Runbooks**: how to set it up and operate it, starting with [toolchain setup](runbooks/toolchain-setup.md).
5. **Design history**: the original design spec and each milestone's plan.

## Where we are

The project is built in milestones M0–M16, tracked in the [roadmap on GitHub](https://github.com/Eyal-Avni/microservices-lab/blob/main/ROADMAP.md). M0 lays the foundation (docs, tooling, CI); the first running services arrive in M1.

## Learning tips

- Follow the milestones in order: each one adds a few fundamentals on top of the last.
- For every fundamental, read the concept page, run the lab, break things on purpose, then answer "Check your understanding".
- If you meet an unfamiliar term, check the [glossary](glossary.md).
