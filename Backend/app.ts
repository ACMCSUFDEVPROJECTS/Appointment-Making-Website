import logging from './utils/logging';
import express, { Application } from 'express';
import morgan from 'morgan';
import Router from './routes';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

const NAMESPACE = 'App';

const PORT = process.env.PORT || 8000;

const app: Application = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(express.static('assets'));

app.use(cors());

app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        swaggerOptions: {
            url: '/swagger.json',
            version: '1.0'
        }
    })
);

app.use(Router);

app.listen(PORT, () => {
    logging.info(NAMESPACE, `Port is running on ${PORT}`);
});