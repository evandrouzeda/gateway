const request = require("supertest");
const app = require("../app")
require("dotenv").config();

describe("Testing the API", () => {
    let token = "";
    it("Login needs to accept valid credentials and return the token", async () => {
        const res = await request(app).post("/login").send({
            username: process.env.TEST_USERNAME,
            password: process.env.TEST_PASSWORD
        })

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });

    it("Login needs to avoid invalid credentials", async () => {
        const res = await request(app).post("/login").send({
            username: 'invalid',
            password: 'invalid'
        })

        expect(res.statusCode).toEqual(300);
    });

    it("Auth middleware needs to check if the token is valid", async () => {
        const res = await request(app)
            .post("/carteira")
            .set('x-access-token', token)
            .send({
                nome: "Teste"
            })

        // Expect to return a 500 because it is not connected to the microservice
        expect(res.statusCode).toEqual(500);
    });

    it("Auth middleware needs to check if the token is invalid", async () => {
        const res = await request(app)
            .post("/carteira")
            .set('x-access-token', "token")
            .send({
                nome: "Teste"
            });

        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual("Erro ao autenticar o token.");
    });

    it("Auth middleware needs to check if the token is misssing ", async () => {
        const res = await request(app).post("/carteira").send({
            nome: "Teste"
        });
        expect(res.statusCode).toEqual(401);
    });
})