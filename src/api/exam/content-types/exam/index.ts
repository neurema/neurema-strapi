export default {
  kind: 'collectionType',
  collectionName: 'exams',
  info: {
    singularName: 'exam',
    pluralName: 'exams',
    displayName: 'Exam',
    description: 'Exam metadata and grouped topics',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {
    highYieldTopics: {
      type: 'json',
    },
    subjects: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::subject.subject',
      inversedBy: 'exams',
    },
    name: {
      type: 'string',
    },
  },
};