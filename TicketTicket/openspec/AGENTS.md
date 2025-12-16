# OpenSpec Agent Instructions

## Overview
This project uses OpenSpec for spec-driven development. All features must be specified before implementation.

## Directory Structure
- `openspec/specs/` - Current specifications (source of truth)
- `openspec/changes/` - Proposed changes and new features
- `openspec/archive/` - Completed and archived changes

## Workflow

### 1. Proposal Phase
Before implementing any feature:
1. Create a change folder in `openspec/changes/[feature-name]/`
2. Write `proposal.md` describing the change
3. Write `tasks.md` breaking down implementation steps
4. Write `specs/` folder with detailed specifications

### 2. Review Phase
- Review specs with stakeholder
- Iterate until alignment is reached
- Specs should use SHALL/MUST language

### 3. Implementation Phase
- Follow the agreed specs exactly
- Reference task list in `tasks.md`
- Mark tasks as complete

### 4. Archive Phase
- Move completed specs to `openspec/specs/`
- Archive the change folder to `openspec/archive/`

## Specification Format

Each spec file should include:
- **Requirements**: Clear, testable requirements using SHALL/MUST
- **Scenarios**: Example behaviors with Given/When/Then format
- **Constraints**: Limitations and boundaries
- **Data Models**: Relevant data structures

## Commands
- `/openspec:proposal` - Create a new feature proposal
- `/openspec:apply` - Implement approved specs
- `/openspec:archive` - Archive completed changes
