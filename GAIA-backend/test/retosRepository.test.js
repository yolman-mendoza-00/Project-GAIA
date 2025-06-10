const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
chai.use(require("chai-string"));

const retosRepository = require("../src/repository/retos.repository");
const pool = require("../src/utils/db");

describe("RetosRepository", () => {
    let clientMock;

    beforeEach(() => {
        clientMock = {
            query: sinon.stub(),
            release: sinon.stub(),
        };
        sinon.stub(pool, "connect").resolves(clientMock);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should return daily retos for a user and date", async () => {
        const mockRows = [
            {
                id_reto: 1,
                descripcion: "Tomar agua",
                categoria: "Salud",
                emoji: "💧",
                completado: false
            }
        ];
        clientMock.query.resolves({ rows: mockRows });

        const result = await retosRepository.getRetosDiarios(1, "2024-06-07");
        expect(result).to.deep.equal(mockRows);

        sinon.assert.calledWith(clientMock.query, sinon.match.string, [1, "2024-06-07"]);
        sinon.assert.calledOnce(clientMock.release);
    });

    it("should return true if retos are assigned", async () => {
        clientMock.query.resolves({ rowCount: 1 });

        const result = await retosRepository.checkRetosAsignados(1, "2024-06-07");
        expect(result).to.be.true;

        sinon.assert.calledWith(clientMock.query, sinon.match.string, [1, "2024-06-07"]);
        sinon.assert.calledOnce(clientMock.release);
    });

    it("should return false if no retos are assigned", async () => {
        clientMock.query.resolves({ rowCount: 0 });

        const result = await retosRepository.checkRetosAsignados(1, "2024-06-07");
        expect(result).to.be.false;

        sinon.assert.calledOnce(clientMock.release);
    });

    it("should create a reto and assign it", async () => {
        const descripcion = "Meditar";
        const id_usuario = 2;
        const id_reto_fake = 99;

        clientMock.query.onCall(0).resolves({ rows: [{ id_reto: id_reto_fake }] });
        clientMock.query.onCall(1).resolves();

        const result = await retosRepository.crearRetoPersonalizadoRepo(descripcion, id_usuario);
        expect(result).to.deep.equal({ id_reto: id_reto_fake });

        sinon.assert.calledWith(clientMock.query.firstCall, sinon.match.string, [descripcion, 6, id_usuario]);
        sinon.assert.calledWith(
            clientMock.query.secondCall,
            sinon.match.string,
            sinon.match((args) => {
                return args[0] === id_usuario && args[1] === id_reto_fake && typeof args[2] === "string";
            }, "params include id_usuario, id_reto, fecha string")
        );
        sinon.assert.calledOnce(clientMock.release);
    });

    it("should save only retos completados", async () => {
        const registros = [
            { id_usuario: 5, id_reto: 1, fecha: "2024-06-07", completado: true },
            { id_usuario: 5, id_reto: 2, fecha: "2024-06-07", completado: false },
            { id_usuario: 5, id_reto: 3, fecha: "2024-06-07", completado: true }
        ];

        clientMock.query.resolves();

        await retosRepository.guardarRetosCompletados(registros);

        // Esperamos 2 llamadas de INSERT
        sinon.assert.calledWithMatch(clientMock.query, sinon.match.string, [5, 1, "2024-06-07"]);
        sinon.assert.calledWithMatch(clientMock.query, sinon.match.string, [5, 3, "2024-06-07"]);

        // Asegura que nunca se intenta guardar el no-completado
        const secondInsertArgs = [5, 2, "2024-06-07"];
        const neverCalled = clientMock.query.getCalls().some(call => {
            return sinon.match.same(secondInsertArgs).test(call.args[1]);
        });
        expect(neverCalled).to.be.false;

        sinon.assert.calledOnce(clientMock.release);
    });




    it("should assign random retos to a user for a given date", async () => {
        const id_usuario = 10;
        const fecha = "2024-06-07";

        const mockRetos = [
            { id_reto: 1 },
            { id_reto: 2 },
            { id_reto: 3 }
        ];

        // 1. Simula la consulta de retos aleatorios
        clientMock.query.onCall(0).resolves({ rows: mockRetos });

        // 2. Simula las inserciones por cada reto
        clientMock.query.onCall(1).resolves();
        clientMock.query.onCall(2).resolves();
        clientMock.query.onCall(3).resolves();

        // 3. Simula la consulta final de retorno
        clientMock.query.onCall(4).resolves({ rows: [] });

        const result = await retosRepository.asignarRetosAleatorios(id_usuario, fecha);

        expect(result).to.deep.equal([]);

        sinon.assert.calledWith(clientMock.query.firstCall, sinon.match.string); // SELECT RANDOM
        sinon.assert.callCount(clientMock.query, 5); // 1 (select) + 3 (insert) + 1 (select final)
        sinon.assert.calledOnce(clientMock.release);
    });

});
