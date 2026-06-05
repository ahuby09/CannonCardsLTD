import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const productionClientOrigin = 'https://soft-marzipan-926b7d.netlify.app';
const productionApiBaseUrl = 'https://cannoncardsltd.onrender.com';

function productionUrl(configuredValue, productionFallback, developmentFallback) {
  if (!isProduction) {
    return configuredValue || developmentFallback;
  }

  return !configuredValue || configuredValue.includes('localhost')
    ? productionFallback
    : configuredValue;
}

function clientOrigins() {
  if (!isProduction) {
    return process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  }

  return [...new Set([process.env.CLIENT_ORIGIN, productionClientOrigin].filter(Boolean))].join(',');
}

function getMysqlSslConfig() {
  const sslEnabled = ['1', 'true', 'required'].includes(
    String(process.env.MYSQL_SSL || '').toLowerCase()
  );

  if (!sslEnabled) {
    return undefined;
  }

  const ca = process.env.MYSQL_SSL_CA_BASE64
    ? Buffer.from(process.env.MYSQL_SSL_CA_BASE64, 'base64').toString('utf8')
    : process.env.MYSQL_SSL_CA;

  return {
    rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false',
    ...(ca ? { ca } : {})
  };
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  clientOrigin: clientOrigins(),
  apiBaseUrl: productionUrl(process.env.API_BASE_URL, productionApiBaseUrl, 'http://localhost:4000'),

  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'pokemon_store',
    ssl: getMysqlSslConfig()
  },

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  codeEncryptionKey: process.env.CODE_ENCRYPTION_KEY,

  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  clientSuccessUrl: productionUrl(
    process.env.CLIENT_SUCCESS_URL,
    `${productionClientOrigin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    'http://localhost:5173/order-confirmation?session_id={CHECKOUT_SESSION_ID}'
  ),
  clientCancelUrl: productionUrl(
    process.env.CLIENT_CANCEL_URL,
    `${productionClientOrigin}/checkout`,
    'http://localhost:5173/checkout'
  ),
  storeCurrency: (process.env.STORE_CURRENCY || 'gbp').toLowerCase(),

  shippoApiToken: process.env.SHIPPO_API_TOKEN,
  shipFrom: {
    name: process.env.SHIP_FROM_NAME,
    company: process.env.SHIP_FROM_COMPANY,
    street1: process.env.SHIP_FROM_STREET1,
    city: process.env.SHIP_FROM_CITY,
    state: process.env.SHIP_FROM_STATE,
    zip: process.env.SHIP_FROM_ZIP,
    country: process.env.SHIP_FROM_COUNTRY || 'GB',
    phone: process.env.SHIP_FROM_PHONE,
    email: process.env.SHIP_FROM_EMAIL
  },

  defaults: {
    singleWeightGrams: Number(process.env.DEFAULT_SINGLE_WEIGHT_GRAMS || 30),
    singleLengthCm: Number(process.env.DEFAULT_SINGLE_LENGTH_CM || 20),
    singleWidthCm: Number(process.env.DEFAULT_SINGLE_WIDTH_CM || 15),
    singleHeightCm: Number(process.env.DEFAULT_SINGLE_HEIGHT_CM || 1),
    sealedWeightGrams: Number(process.env.DEFAULT_SEALED_WEIGHT_GRAMS || 500),
    sealedLengthCm: Number(process.env.DEFAULT_SEALED_LENGTH_CM || 25),
    sealedWidthCm: Number(process.env.DEFAULT_SEALED_WIDTH_CM || 18),
    sealedHeightCm: Number(process.env.DEFAULT_SEALED_HEIGHT_CM || 8)
  },

  pokewalletApiKey: process.env.POKEWALLET_API_KEY,
  pokewalletApiBaseUrl: process.env.POKEWALLET_API_BASE_URL || 'https://api.pokewallet.io'
};

export function requireConfig(value, name) {
  if (!value) {
    const error = new Error(`Missing server configuration: ${name}`);
    error.statusCode = 500;
    error.code = 'CONFIG_MISSING';
    throw error;
  }
  return value;
}
