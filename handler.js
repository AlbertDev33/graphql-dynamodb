const { ApolloServer, gql } = require('apollo-server-lambda');
const setupDynamoDBClient = require('./src/core/util/setupDynamoDB');
setupDynamoDBClient();
const crypto = require('crypto');

const SkillFactory = require('./src/core/factories/skillFactory');
const HeroFactory = require('./src/core/factories/heroFactory');
// const AWS = require('aws-sdk');

// function seturpDynamoDb() {
//     if (process.env.IS_LOCAL) {
//         const host = process.env.LOCALSTACK_HOST;
//         const port = process.env.DYNAMODB_PORT;
//         console.log('runningdynamodb locally!', host, port);
//         return new AWS.DynamoDB.DocumentClient({
//             region: 'localhost',
//             credentials: {
//                 accessKeyId: 'DEFAULT_ACCESS_KEY',
//                 secretAccessKey: 'DEFAULT_SECRET_KEY'
//             },
//             endpoint: new AWS.Endpoint(`http://${host}:${port}`)
//         });
//     }
//     return new AWS.DynamoDB.DocumentClient();
// }

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler({
  expressGetMiddlewareOptions: {
    cors: {
      origin: '*',
      credentials: true,
    }
  },
});

async function main() {
  console.log('creating factories...');
  const skillFactory = await SkillFactory.createInstance();
  const heroFactory = await HeroFactory.createInstance();

  console.log('inserting skill item');
  const skillId = String(new Date().getTime());
  await skillFactory.create({
    id: skillId,
    name: 'mage',
    value: 50
  });

  console.log('geetting skill item');
  const skillItem = await skillFactory.findOne(skillId);
  console.log('skillItem', skillItem);;

  const allSkills = await skillFactory.findAll();
  console.log('allSkills', allSkills);

  console.log('\n----------------\n');

  console.log('inserting hero item');
  const heroId = String(new Date().getTime());
  await heroFactory.create({
    id: heroId,
    name: 'Batiman',
    skills: [skillId]
  });

  const hero = await heroFactory.findOne(heroId);
  console.log('hero', hero);

  const allHeroes = await heroFactory.findAll();
  console.log('allHeroes', allHeroes);

  return {
    statusCode: 200,
    body: JSON.stringify({
      hero: {
        hero,
        allHeroes
      },
      skill: {
        skillItem,
        allSkills
      }
    })
  }
}

module.exports.test = main;