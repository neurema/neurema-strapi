#!/bin/bash
# setup_strapi_schema.sh
# Create full schema based on your ER diagram

echo "🚀 Setting up Strapi Content Types..."

# === USERS ===
npx strapi generate content-type user email:string password:string

# === PROFILES ===
npx strapi generate content-type profile \
  examType:string \
  examDate:datetime \
  studyMode:string \
  isOnBreak:boolean \
  isInstituteLinked:boolean \
  college:string \
  collegeEmail:string \
  year:integer \
  rollNo:string \
  dailyTopicLimit:integer \
  defaultSessionDuration:integer

# === USER_TOPICS ===
npx strapi generate content-type user-topic \
  memoryLocation:string \
  lastSession:datetime \
  nextSession:datetime \
  timeTotal:integer \
  timeRemaining:integer

# === SESSIONS ===
npx strapi generate content-type session \
  isPaused:boolean \
  scheduledFor:datetime \
  timeTakenForRevision:integer \
  timeTakenForActivity:integer \
  timeAllotted:integer \
  scoreActivity:string

# === TOPICS ===
npx strapi generate content-type topic conceptual:string mcq:string

# === CONCEPTUAL ===
npx strapi generate content-type conceptual nodes:string

# === EDGE ===
npx strapi generate content-type edge from:string to:string

# === QUESTION_NODE ===
npx strapi generate content-type question-node node:string

# === QUESTION ===
npx strapi generate content-type question question:string options:json correctAnswer:integer

# === EXAMS ===
npx strapi generate content-type exam subjects:json highYieldTopics:json

echo "✅ Base Content Types Created."

# === RELATIONS (manual JSON patching) ===
# You’ll need to add relations in each schema.json like:
# Example for user -> profile
# In src/api/user/content-types/user/schema.json:
#   "attributes": {
#     "profiles": {
#       "type": "relation",
#       "relation": "oneToMany",
#       "target": "api::profile.profile"
#     }
#   }

echo "⚙️  Please now define relations manually in schema.json files:"
echo "   user (1:N) → profile"
echo "   profile (1:N) → user-topic"
echo "   user-topic (1:N) → session"
echo "   topic (1:N) → conceptual"
echo "   conceptual (1:N) → edge, question-node"
echo "   question-node (1:N) → question"
echo "   topic (1:N) → question"
echo "   exam (1:N) → topic"
echo ""
echo "💾 After editing, run: npm run build && npm run develop"
echo "Done ✅"
