export default {
  kind: 'collectionType',
  collectionName: 'conceptuals',
  info: {
    singularName: 'conceptual',
    pluralName: 'conceptuals',
    displayName: 'Conceptual',
    description: 'Graph of conceptual nodes and edges for a topic',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    nodes: {
      type: 'json',
    },
    edges: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::edge.edge',
      mappedBy: 'conceptual',
    },
    question_nodes: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::question-node.question-node',
      mappedBy: 'conceptual',
    },
    topic: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::topic.topic',
      mappedBy: 'conceptual',
    },
  },
};