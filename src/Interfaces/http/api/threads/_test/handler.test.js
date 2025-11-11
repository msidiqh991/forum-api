const Jwt = require('@hapi/jwt')
const pool = require('../../../../../../src/Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('../../../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../../../tests/ThreadTableTestHelper');
const createServer = require('../../../../../Infrastructures/http/createServer');
const container = require('../../../../../Infrastructures/container');
const JwtTokenManager = require('../../../../../Infrastructures/security/JwtTokenManager');


describe('Threads Handler', () => {
    let accessToken;

    beforeAll(async() => {
        await UsersTableTestHelper.addUser({
            id: 'user-123',
            username: 'dicoding',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
        });

        const jwtTokenManager = new JwtTokenManager(Jwt.token);
        accessToken = await jwtTokenManager.createAccessToken({ id: 'user-123' });
    });

    afterEach(async() => {
        await ThreadTableTestHelper.cleanTable();
    });

    afterAll(async() => {
        await UsersTableTestHelper.cleanTable();
        await pool.end();
    });

    it('should respond with 401 and missing authentication', async() => {
        const server = await createServer(container);

        const response = await server.inject({
            method: 'POST',
            url: '/threads',
            payload: {
                title: 'Sample Thread',
                body: 'This is a sample thread body.'
            },
        });

        const responseJson = JSON.parse(response.payload)
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
    })

    it('should respond with 401 when authorization header is invalid', async() => {
        const server = await createServer(container);

        const response = await server.inject({
            method: 'POST',
            url: '/threads',
            headers: {
                Authorization: `Bearer Token`,
                'Content-Type': 'application/json',
            },
            payload: {
                title: 'Sample Thread',
                body: 'This is a sample thread body.'
            },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.error).toEqual('Unauthorized');
        expect(responseJson.message).toBeDefined();
    })

    it('should respond with 400 when payload not contain needed property', async() => {
        const server = await createServer(container);

        const response = await server.inject({
            method: 'POST',
            url: '/threads',
            payload: {
                title: 'Sample Thread',
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
    })

    it('should response 201 when thread is successfully added', async() => {
        const server = await createServer(container);

        const response = await server.inject({
            method: 'POST',
            url: '/threads',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            payload: {
                title: 'Sample Thread',
                body: 'This is a sample thread body.'
            },
        })

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 200 when detail is fetched', async() => {
        await ThreadTableTestHelper.addThread({
            id: 'thread-123',
            owner: 'user-123',
        });

        const server = await createServer(container);
        
        const response = await server.inject({
            method: 'GET',
            url: `/threads/thread-123`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread).toBeDefined();
        expect(responseJson.data.thread.comments).toBeInstanceOf(Array);
    })
})