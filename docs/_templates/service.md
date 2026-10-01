# service-name

> **Language:** .NET 10 | Node 24 (NestJS) · **Namespace:** `service-name` · **Owns:** the data this service owns

## Purpose

One paragraph: the business capability and the fundamentals it demonstrates.

## APIs (sync)

| RPC / route | Request → response | Notes |
|---|---|---|
| `Name` | `NameRequest` → `NameResponse` | deadline, auth |

## Events

| Direction | Topic | `ce_type` | Notes |
|---|---|---|---|
| out | `orders.v1` | `com.lab.order.placed.v1` | key = orderId |

## Data

Stores, tables or keys, and who may access them.

## Config

| Variable | Default | Meaning |
|---|---|---|
| `EXAMPLE_SETTING` | `value` | what it controls |

## Resilience

Deadlines, retries, circuit breakers, idempotency.

## SLOs

Targets and how they are measured.

## Runbooks

Links to the runbooks for this service.
