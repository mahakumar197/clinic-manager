import { Params } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';

function sanitizeBody(body: any) {
  if (!body || typeof body !== 'object') return body;

  const clone = { ...body };

  const sensitiveFields = [
    'password',
    'oldPassword',
    'newPassword',
    'confirmPassword',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'otp',
  ];

  sensitiveFields.forEach((field) => {
    if (clone[field]) {
      clone[field] = '***';
    }
  });

  return clone;
}

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',

    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              singleLine: false,
              messageFormat: '{msg}',
            },
          }
        : undefined,
    customProps: (req: any) => {
      const shouldLogBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

      let requestBody;

      if (shouldLogBody && req.body) {
        const bodyString = JSON.stringify(req.body);

        requestBody =
          bodyString.length < 5000
            ? sanitizeBody(req.body)
            : '[body-too-large]';
      }

      return {
        context: 'HTTP',
        ...(requestBody ? { requestBody } : {}),
      };
    },

    serializers: {
      req(
        req: IncomingMessage & {
          id?: string;
          query?: unknown;
          params?: unknown;
        },
      ) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          query: req.query,
          params: req.params,
          headers: {
            host: req.headers.host,
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
          },
          remoteAddress: req.socket?.remoteAddress,
          remotePort: req.socket?.remotePort,
        };
      },

      res(res: ServerResponse & { statusCode: number }) {
        return {
          statusCode: res.statusCode,
          headers:
            typeof res.getHeader === 'function'
              ? {
                  'content-type': res.getHeader('content-type'),
                  'content-length': res.getHeader('content-length'),
                }
              : {},
        };
      },
    },

    customLogLevel(req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
      if (res.statusCode >= 500 || err) return 'error';
      return 'info';
    },

    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },

    customErrorMessage(req, res, err) {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },

    customAttributeKeys: {
      req: 'request',
      res: 'response',
      err: 'error',
      responseTime: 'duration',
    },

    formatters: {
      level: (label: string) => ({ level: label.toUpperCase() }),

      log: (object: Record<string, unknown>) => {
        const { req, res, ...rest } = object;

        return {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          service: process.env.SERVICE_NAME || 'unknown-service',
          ...rest,
          ...(req ? { request: req } : {}),
          ...(res ? { response: res } : {}),
        };
      },
    },
  },
};
