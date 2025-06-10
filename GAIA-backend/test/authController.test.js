const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
chai.use(require("chai-string"));

const bcrypt = require("bcrypt");
const authController = require("../src/controller/auth.controller");
const authRepository = require("../src/repository/auth.repository");

describe("Auth Controller", () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("registrar", () => {
        it("debe retornar 400 si faltan campos", async () => {
            req.body = { username: "Juan", email: "" }; // falta password
            await authController.registrar(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ error: "Todos los campos son obligatorios." })).to.be.true;
        });

        it("debe retornar 409 si el correo ya está registrado", async () => {
            req.body = { username: "Juan", email: "juan@mail.com", password: "123456" };
            sinon.stub(authRepository, "findUserByEmail").resolves({ id_usuario: 1 });

            await authController.registrar(req, res);

            expect(res.status.calledWith(409)).to.be.true;
            expect(res.json.calledWithMatch({ error: "El correo electrónico ya está registrado." })).to.be.true;
        });

        it("debe registrar usuario exitosamente", async () => {
            req.body = { username: "Juan", email: "juan@mail.com", password: "123456" };
            sinon.stub(authRepository, "findUserByEmail").resolves(null);
            sinon.stub(bcrypt, "hash").resolves("hashedPassword123");
            const createUserStub = sinon.stub(authRepository, "createUser").resolves();

            await authController.registrar(req, res);

            expect(createUserStub.calledWith("Juan", "juan@mail.com", "hashedPassword123")).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWithMatch({ message: "Usuario registrado con éxito." })).to.be.true;
        });
    });

    describe("login", () => {
        it("debe retornar 401 si el correo no está registrado", async () => {
            req.body = { email: "notfound@mail.com", password: "123456" };
            sinon.stub(authRepository, "findUserByEmail").resolves(null);

            await authController.login(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWithMatch({ error: "Correo no registrado." })).to.be.true;
        });

        it("debe retornar 401 si la contraseña no coincide", async () => {
            req.body = { email: "juan@mail.com", password: "wrongpass" };
            sinon.stub(authRepository, "findUserByEmail").resolves({
                contraseña: "hashed123"
            });
            sinon.stub(bcrypt, "compare").resolves(false);

            await authController.login(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWithMatch({ error: "Contraseña incorrecta." })).to.be.true;
        });

        it("debe iniciar sesión exitosamente", async () => {
            req.body = { email: "juan@mail.com", password: "123456" };
            sinon.stub(authRepository, "findUserByEmail").resolves({
                id_usuario: 1,
                nombre: "Juan",
                correo: "juan@mail.com",
                contraseña: "hashed123",
                foto: "data:image/png;base64,AAA..."
            });
            sinon.stub(bcrypt, "compare").resolves(true);

            await authController.login(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({
                message: "Inicio de sesión exitoso.",
                user: {
                    id: 1,
                    nombre: "Juan",
                    correo: "juan@mail.com",
                    foto: sinon.match.any 
                }
            })).to.be.true;
        });
    });
});
