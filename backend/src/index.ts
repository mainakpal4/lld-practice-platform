import { createServer } from './api/server';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = createServer();

app.listen(PORT, () => {
  console.log(`[LLD Practice Platform Backend] Server running on http://localhost:${PORT}`);
  console.log(`[LLD Practice Platform Backend] API available at http://localhost:${PORT}/api`);
});
