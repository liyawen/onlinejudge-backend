import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as json from 'koa-json';
import * as session from 'koa-generic-session';
import * as logger from 'koa-logger';
// import * as CSRF from 'koa-csrf';
import * as cors from '@koa/cors';
import * as redisStore from 'koa-redis';
import * as error from 'koa-json-error';
import KoaError from './lib/error';
import router from './routes';
import config from './config';
import passport from './middlewares/passport';
import { StatusCode, ErrorCode } from './common/constants';

export const app = new Koa();

// logger
app.use(logger());

// bodyParser
app.use(bodyParser());

// jsonResponse
app.use(json({ pretty: false, param: 'pretty' }));

// error parser
app.use(error({
  format: (err: any) => ({
    code: err.code,
    status: err.status,
    message: err.message,
    stack: err.stack
  })
}));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    console.log(e);
    if (e instanceof KoaError) {
      ctx.body = { message: e.message, ...e.options };
    } else {
      ctx.body = {
        message: e.message,
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        code: ErrorCode.SERVER_ERROR
      };
    }
    ctx.res.statusCode = ctx.body.statusCode || StatusCode.OK;
  }
});

// session
app.keys = [config.site.secret];
app.use(session({
  store: redisStore(config.redis)
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// cors
app.use(cors());

// csrf
// app.use(new CSRF({
//   invalidSessionSecretMessage: 'Invalid session secret',
//   invalidSessionSecretStatusCode: 403,
//   invalidTokenMessage: 'Invalid CSRF token',
//   invalidTokenStatusCode: 403,
//   excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
//   disableQuery: false
// }));

app.use(router.routes());

console.log(`${config.site.name} is now listening on port ${config.site.port}`);
app.listen(config.site.port);

process.on('SIGINT', () => process.exit());
