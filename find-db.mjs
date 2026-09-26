import pg from 'pg';

const regions = [
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'eu-central-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'sa-east-1',
  'af-south-1',
  'me-central-1',
];

const password = 'Dl9gnFTEzZoBWyn5';
const projectRef = 'hnlieepsxoqeebkreugt';

async function testConnection() {
  console.log('Checking Supabase pooler connections...');
  for (const region of regions) {
    for (const port of [6543, 5432]) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      const client = new pg.Client({
        host,
        port,
        user: `postgres.${projectRef}`,
        password,
        database: 'postgres',
        connectionTimeoutMillis: 3500,
        ssl: { rejectUnauthorized: false },
      });
      try {
        await client.connect();
        console.log(`\n==============================================`);
        console.log(`CONNECTED! Region: ${region}, Port: ${port}`);
        console.log(`Host: ${host}`);
        console.log(`==============================================\n`);
        const res = await client.query('SELECT current_database(), version();');
        console.log('Result:', res.rows[0]);
        await client.end();
        return { host, port, region };
      } catch {
        // silent fail
      }
    }
  }
  console.log('Finished region scan.');
}

testConnection();
