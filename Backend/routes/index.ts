import express from 'express';
import PingController from '../controllers/ping';
import Assignments from '../controllers/canvasToNotion';
import path from 'path';

const NAMESPACE: string = "Router";

const router = express.Router();

const pingController = new PingController();

router.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../assets/index.html'));
});

router.get('/ping', async (_req, res) => {
    const response = await pingController.getMessage();
    return res.send(response);
});

router.post('/ping', async (req, res) => {
    const response = { message: req.query.message};
    return res.send(response);
});

router.post('/assignments', async (req, res) => {
    let ass = new Assignments();
    let {domain, canvasToken, notionDb, notionToken} = req.body;
    let errors = await ass.importAssignments(domain, canvasToken, notionDb, notionToken);
    return res.json({ message: 'Import completed', errors });
});

// not currently working
router.patch('/assignments', async (req, res) => {
    let ass = new Assignments();
    let {domain, canvasToken, notionDb, notionToken} = req.body;
    await ass.importAssignments(domain, canvasToken, notionDb, notionToken, true);
    return res.json({ message: 'Successfully imported all assignments' });
});

export default router;
