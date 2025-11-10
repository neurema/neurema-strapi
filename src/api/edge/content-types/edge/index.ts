export default {
  kind: 'collectionType',
  collectionName: 'edges',
  info: {
    singularName: 'edge',
    pluralName: 'edges',
    displayName: 'Edge',
    description: 'Edge linking conceptual nodes',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    from: {
      type: 'string',
    },
    to: {
      type: 'string',
    },
    conceptual: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::conceptual.conceptual',
      inversedBy: 'edges',
    },
  },
};