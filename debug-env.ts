import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

console.log('Loading .env from:', envPath);
console.log('Dotenv parsed result:', result.error ? 'Error' : 'Success');
if (result.parsed) {
    console.log('Keys found:', Object.keys(result.parsed));
    console.log('DATABASE_URL length:', result.parsed.DATABASE_URL ? result.parsed.DATABASE_URL.length : 'undefined');
} else {
    console.log('No parsed result returned.');
}

console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');
