import { Global, Module } from '@nestjs/common';
import { createLogger, Logger, transports } from 'winston';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useFactory() {
        return createLogger({
          transports: [new transports.Console()],
        });
      },
    },
  ],
  exports: [Logger],
})
export class LoggerModule {}
