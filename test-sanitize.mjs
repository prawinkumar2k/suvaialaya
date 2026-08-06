import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';

const app = express();
app.use((req, res, next) => {
  ['body', 'params', 'headers'].forEach((k) => {
    if (req[k]) {
      req[k] = mongoSanitize.sanitize(req[k]);
    }
  });
  res.json({ ok: true });
});

app.listen(8081, () => console.log('started'));
