#!/bin/bash
# =====================================================
# Script: create-all-collections.sh
# Description: Generates Strapi collection types automatically (excluding User)
# Works with Strapi v4+
# =====================================================

API_PATH="src/api"

make_collection () {
  local name=$1
  local attributes=$2

  mkdir -p "$API_PATH/$name/content-types/$name"
  cat > "$API_PATH/$name/content-types/$name/schema.json" <<EOF
{
  "collectionName": "${name}s",
  "info": {
    "singularName": "$name",
    "pluralName": "${name}s",
    "displayName": "${name^}"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    $attributes
  }
}
EOF
  echo "✅ Created: $name"
}

echo "🚀 Generating Strapi collection types (excluding user)..."

# ========== PROFILES ==========
make_collection "profile" '
    "examType": { "type": "string" },
    "examDate": { "type": "datetime" },
    "studyMode": { "type": "string" },
    "isOnBreak": { "type": "boolean" },
    "isInstituteLinked": { "type": "boolean" },
    "college": { "type": "string" },
    "collegeEmail": { "type": "email" },
    "year": { "type": "integer" },
    "rollNo": { "type": "string" },
    "dailyTopicLimit": { "type": "integer" },
    "defaultSessionDuration": { "type": "integer" },
    "user": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "plugin::users-permissions.user",
      "inversedBy": "profile"
    }
'

# ========== USER_TOPICS ==========
make_collection "user-topic" '
    "memoryLocation": { "type": "string" },
    "lastSession": { "type": "datetime" },
    "nextSession": { "type": "datetime" },
    "timeTotal": { "type": "integer" },
    "timeRemaining": { "type": "integer" },
    "profile": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::profile.profile",
      "inversedBy": "user_topics"
    }
'

# ========== SESSIONS ==========
make_collection "session" '
    "isPaused": { "type": "boolean" },
    "scheduledFor": { "type": "datetime" },
    "timeTakenForRevision": { "type": "integer" },
    "timeTakenForActivity": { "type": "integer" },
    "timeAllotted": { "type": "integer" },
    "scoreActivity": { "type": "string" },
    "user_topic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::user-topic.user-topic",
      "inversedBy": "sessions"
    }
'

# ========== TOPICS ==========
make_collection "topic" '
    "conceptual": { "type": "string" },
    "mcq": { "type": "string" }
'

# ========== CONCEPTUAL ==========
make_collection "conceptual" '
    "nodes": { "type": "string" },
    "topic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::topic.topic",
      "inversedBy": "conceptuals"
    }
'

# ========== EDGE ==========
make_collection "edge" '
    "from": { "type": "string" },
    "to": { "type": "string" },
    "conceptual": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::conceptual.conceptual",
      "inversedBy": "edges"
    }
'

# ========== QUESTION_NODE ==========
make_collection "question-node" '
    "node": { "type": "string" },
    "conceptual": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::conceptual.conceptual",
      "inversedBy": "question_nodes"
    }
'

# ========== QUESTION ==========
make_collection "question" '
    "question": { "type": "text" },
    "options": { "type": "json" },
    "correctAnswer": { "type": "integer" },
    "topic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::topic.topic",
      "inversedBy": "questions"
    },
    "question_node": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::question-node.question-node",
      "inversedBy": "questions"
    }
'

# ========== EXAMS ==========
make_collection "exam" '
    "subjects": { "type": "json" },
    "highYieldTopics": { "type": "json" },
    "topics": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::topic.topic",
      "inversedBy": "exam"
    }
'

echo "------------------------------------------------"
echo "🎉 All collections created successfully!"
echo "👉 Run: npm run develop"
