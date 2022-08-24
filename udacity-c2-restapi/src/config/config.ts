import * as dotenv from 'dotenv';

// load dotenv variables
dotenv.config();


export const config = {
  "dev": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DATABASE_URL,
    "dialect": "postgres",
    "aws_region": "us-east-1",
    "aws_profile": process.env.AWS_PROFILE,
    "aws_media_bucket": process.env.S3_MEDIA_BUCKET
  },
  "jwt": {
    "secret": process.env.SECRET
  },
  "prod": {
    "username": "",
    "password": "",
    "database": "udagram_prod",
    "host": "",
    "dialect": "postgres"
  }
}
