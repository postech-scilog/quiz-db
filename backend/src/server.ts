import express from "express";
import helmet from "helmet";
import pino from "pino";
import { pinoHttp } from "pino-http";
import errorHandler from "./handlers/errorHandler.ts";
import router from "./router.ts";

const PORT = 3000;

const logger = pino();

const app = express();
app.disable("x-powered-by"); // fingerprinting 감소를 위해
app.use(
	helmet({
		contentSecurityPolicy: false,
	}),
);
app.use(pinoHttp({ logger }));
app.use(express.static("public")); // public 디렉토리의 파일 서빙, 404등 오류 발생 시 라우터로 fallthrough
app.use("/", router);
app.use(errorHandler);
app.listen(PORT, () => {
	logger.info(`listening on port ${PORT}`);
});
