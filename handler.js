const AWS = require('aws-sdk');

function seturpDynamoDb() {
    if (process.env.IS_LOCAL) {
        const host = process.env.LOCALSTACK_HOST;
        const port = process.env.DYNAMODB_PORT;
        console.log('runningdynamodb locally!', host, port);
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            credentials: {
                accessKeyId: 'DEFAULT_ACCESS_KEY',
                secretAccessKey: 'DEFAULT_SECRET_KEY'
            },
            endpoint: new AWS.Endpoint(`http://${host}:${port}`)
        });
    }
    return new AWS.DynamoDB.DocumentClient();
}

module.exports.hello = async (event) => {
    const dynamodb = seturpDynamoDb();
    const heroes = await dynamodb.scan({
        TableName: process.env.HEROES_TABLE
    }).promise();

    const skills = await dynamodb.scan({
        TableName: process.env.SKILLS_TABLE
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                skills,
                heroes
            }
        )
    }
}