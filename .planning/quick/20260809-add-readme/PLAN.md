---
task: add-readme
date: 2026-08-09
type: execute
files_modified: [README.md]
autonomous: true
---

<objective>
Add a comprehensive root README file to document the Mockly application, including its tech stack, features, local setup guidelines (with Gemini API variables), seeding instructions, and how to run it.
</objective>

<execution_context>
@~/.gemini/antigravity/get-shit-done/workflows/quick.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>
<task type="auto">
  <name>Create README.md at root</name>
  <files>README.md</files>
  <action>Write the detailed README.md file covering overview, tech stack, key features, local setup, seeding, and run commands.</action>
  <verify>Check that README.md file exists and has correct info.</verify>
  <acceptance_criteria>
    - README.md exists at root.
    - Contains Google Gemini setup instructions and MERN setup steps.
  </acceptance_criteria>
  <done>README.md created successfully.</done>
</task>
</tasks>
