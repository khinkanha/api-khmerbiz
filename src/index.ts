import { createApp } from './app';
import { config } from './config/index';

const app = createApp();

app.listen(config.port, () => {
  console.log(`API server running on port ${config.port} (${config.nodeEnv})`);
});

export default app;
