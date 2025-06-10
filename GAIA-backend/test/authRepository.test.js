const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
chai.use(require("chai-string"));

const { findUserByEmail, createUser } = require("../src/repository/auth.repository");
const pool = require("../src/utils/db");

describe("Validate UsuarioRepository", () => {
    let connectStub;
    let clientMock;

    beforeEach(() => {
        clientMock = {
            query: sinon.stub(),
            release: sinon.stub(),
        };
        connectStub = sinon.stub(pool, "connect").resolves(clientMock);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("findUserByEmail", () => {
        it("should return a user when found", async () => {
            const fakeUser = { id: 1, nombre: "Test", correo: "test@test.com", contraseña: "hashed" };
            clientMock.query.resolves({ rows: [fakeUser] });

            const result = await findUserByEmail("test@test.com");

            expect(connectStub.calledOnce).to.be.true;
            expect(clientMock.query.calledOnceWith(
                "SELECT * FROM usuarios WHERE correo = $1",
                ["test@test.com"]
            )).to.be.true;
            expect(clientMock.release.calledOnce).to.be.true;
            expect(result).to.deep.equal(fakeUser);
        });

        it("should return undefined when no user found", async () => {
            clientMock.query.resolves({ rows: [] });

            const result = await findUserByEmail("noexist@test.com");

            expect(result).to.be.undefined;
        });
    });

    describe("createUser", () => {
        it("should insert a new user", async () => {
            clientMock.query.resolves();

            await createUser("username", "user@test.com", "hashedPassword");

            expect(connectStub.calledOnce).to.be.true;
            expect(clientMock.query.calledOnceWith(
                "INSERT INTO usuarios (nombre, correo, contraseña) VALUES ($1, $2, $3)",
                ["username", "user@test.com", "hashedPassword"]
            )).to.be.true;
            expect(clientMock.release.calledOnce).to.be.true;
        });
    });
});
