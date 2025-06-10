const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;

const retosController = require("../src/controller/retos.controller");
const retosRepository = require("../src/repository/retos.repository");

describe("Retos Controller", () => {
    let req, res;

    beforeEach(() => {
        sinon.stub(console, "error")
        req = { body: {}, query: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("obtenerRetosDiarios", () => {
        it("debe retornar 400 si falta el ID del usuario", async () => {
            req.query = {};
            await retosController.obtenerRetosDiarios(req, res);
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Falta el ID del usuario.' })).to.be.true;
        });

        it("debe retornar 200 con los retos", async () => {
            req.query = { usuario: "1" };
            sinon.stub(retosRepository, "getRetosDiarios").resolves([{ id_reto: 1 }]);

            await retosController.obtenerRetosDiarios(req, res);
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ retos: [{ id_reto: 1 }] })).to.be.true;
        });
    });

    describe("asignarRetos", () => {
        it("debe retornar 400 si falta el ID del usuario", async () => {
            req.body = {};
            await retosController.asignarRetos(req, res);
            expect(res.status.calledWith(400)).to.be.true;
        });

        it("debe retornar 409 si ya hay retos asignados", async () => {
            req.body = { usuario: "1" };
            sinon.stub(retosRepository, "checkRetosAsignados").resolves(true);

            await retosController.asignarRetos(req, res);
            expect(res.status.calledWith(409)).to.be.true;
        });

        it("debe retornar 201 si se asignan los retos", async () => {
            req.body = { usuario: "1" };
            sinon.stub(retosRepository, "checkRetosAsignados").resolves(false);
            sinon.stub(retosRepository, "asignarRetosAleatorios").resolves([{ id_reto: 2 }]);

            await retosController.asignarRetos(req, res);
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWithMatch({ retos: [{ id_reto: 2 }] })).to.be.true;
        });
    });

    describe("guardarRetos", () => {
        it("debe retornar 200 si se guardan correctamente", async () => {
            req.body = { registros: [{ id_usuario: 1, id_reto: 1, fecha: "2024-06-08", completado: true }] };
            sinon.stub(retosRepository, "guardarRetosCompletados").resolves();

            await retosController.guardarRetos(req, res);
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ message: "Registros guardados correctamente." })).to.be.true;
        });

        it("debe retornar 500 si ocurre un error", async () => {
            req.body = { registros: [] };
            sinon.stub(retosRepository, "guardarRetosCompletados").rejects(new Error("Fallo"));

            await retosController.guardarRetos(req, res);
            expect(res.status.calledWith(500)).to.be.true;
        });
    });

    describe("retosRealizados", () => {
        it("debe retornar 400 si faltan parámetros", async () => {
            req.query = { usuario: "1" }; // falta fecha
            await retosController.retosRealizados(req, res);
            expect(res.status.calledWith(400)).to.be.true;
        });

        it("debe retornar 200 con retos realizados", async () => {
            req.query = { usuario: "1", fecha: "2024-06-08" };
            sinon.stub(retosRepository, "getRetosRealizados").resolves([{ descripcion: "Beber agua", emoji: "💧" }]);

            await retosController.retosRealizados(req, res);
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ retos_realizados: [{ descripcion: "Beber agua", emoji: "💧" }] })).to.be.true;
        });
    });

    describe("crearRetoPersonalizado", () => {
        it("debe retornar 400 si falta la descripción", async () => {
            req.body = { id_usuario: 1 };
            await retosController.crearRetoPersonalizado(req, res);
            expect(res.status.calledWith(400)).to.be.true;
        });

        it("debe retornar 201 si el reto se crea correctamente", async () => {
            req.body = { descripcion: "Leer 10 páginas", id_usuario: 1 };
            sinon.stub(retosRepository, "crearRetoPersonalizadoRepo").resolves({ id_reto: 10 });

            await retosController.crearRetoPersonalizado(req, res);
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWithMatch({ id_reto: 10 })).to.be.true;
        });

        it("debe retornar 500 si falla la creación", async () => {
            req.body = { descripcion: "Leer", id_usuario: 1 };
            sinon.stub(retosRepository, "crearRetoPersonalizadoRepo").rejects(new Error("Error"));

            await retosController.crearRetoPersonalizado(req, res);
            expect(res.status.calledWith(500)).to.be.true;
        });
    });
});
