import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import groups from '@functions/getGroups'
import createGroup from '@functions/createGroup';
import createImage from '@functions/createImage';
import getImages from '@functions/getImages';
import connect from '@functions/connect';
import disconnect from '@functions/disconnect';
import sendNotifications from '@functions/sendNotifications';
import resizeImage from '@functions/resizeImage';
import auth from '@functions/auth';
import rsaAuth from  '@functions/rsaAuth';

const serverlessConfiguration: AWS = {
  service: 'serverless-udagram',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild','serverless-reqvalidator-plugin','serverless-aws-documentation'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      GROUPS_TABLE: 'Group-${self:provider.stage}',
      IMAGES_TABLE: 'Image-${self:provider.stage}',
      IMAGE_ID_INDEX: 'ImageIdIndex',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      IMAGES_S3_BUCKET: 'serverless-udagram-images-${self:provider.stage}',
      SIGNED_URL_EXPIRATION: '300',
      THUMBNAILS_S3_BUCKET: 'serverless-udagram-thumbnail-${self:provider.stage}',
      CONNECTIONS_TABLE: 'Connections-${self:provider.stage}',
      AUTH_0_SECRET_ID: 'Auth0Secret-${self:provider.stage}',
      AUTH_0_SECRET_FIELD: 'auth0Secret'
    },
    profile: 'serverless',
    stage: "${opt:stage, 'dev'}",
    region: 'us-east-1',
    "iamRoleStatements": [
      {
        "Effect": "Allow",
        "Action": [
          "codedeploy:*"
        ],
        "Resource": [
          "*"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:Scan",
          "dynamodb:PutItem",
          "dynamodb:GetItem"
        ],
        "Resource": "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}"
      },
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:PutItem",
          "dynamodb:Query"
        ],
        "Resource": "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}"
      },
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:Query"
        ],
        "Resource": "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}/index/${self:provider.environment.IMAGE_ID_INDEX}"
      },
      {
        "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:GetObject"
        ],
        "Resource": "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "s3:PutObject"
        ],
        "Resource": "arn:aws:s3:::${self:provider.environment.THUMBNAILS_S3_BUCKET}/*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:Scan",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ],
        "Resource": "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.CONNECTIONS_TABLE}"
      },
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue"
        ],
        "Resource": "Auth0Secret"
      },
      {
        "Effect": "Allow",
        "Action": [
          "kms:Decrypt"
        ],
        "Resource": "KMSKey.Arn"
      }
    ]
  },
  // import the function via paths
  functions: { hello, auth, rsaAuth, groups ,createGroup, createImage, getImages, connect, disconnect,sendNotifications, resizeImage},
  package: { individually: true },
  custom: {
    topicName: 'imagesTopic-${self:provider.stage}',
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    documentation: {
      "api": {
        "info": {
          "version": "v1.0.0",
          "title": "Udagram API",
          "description": "Serverless application for images sharing"
        }
      },
      "models": [
        {
          "name": "GroupRequest",
          "contentType": "application/json",
          "schema": "${file(models/create-group-request.json)}"
        }
      ]
    }
  },
  "resources": {
    "Resources": {
      "GatewayResponseDefault4XX": {
        "Type": "AWS::ApiGateway::GatewayResponse",
        "Properties": {
          "ResponseParameters": {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "gatewayresponse.header.Access-Control-Allow-Methods": "'GET,OPTIONS,POST'"
          },
          "ResponseType": "DEFAULT_4XX",
          "RestApiId": {
            "Ref": "ApiGatewayRestApi"
          }
        }
      },
      "GroupsDynamoDBTable": {
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
          "AttributeDefinitions": [
            {
              "AttributeName": "id",
              "AttributeType": "S"
            }
          ],
          "KeySchema": [
            {
              "AttributeName": "id",
              "KeyType": "HASH"
            }
          ],
          "BillingMode": "PAY_PER_REQUEST",
          "TableName": "${self:provider.environment.GROUPS_TABLE}"
        }
      },
      "ImagesDynamoDBTable": {
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
          "AttributeDefinitions": [
            {
              "AttributeName": "groupId",
              "AttributeType": "S"
            },
            {
              "AttributeName": "timestamp",
              "AttributeType": "S"
            },
            {
              "AttributeName": "imageId",
              "AttributeType": "S"
            }
          ],
          "KeySchema": [
            {
              "AttributeName": "groupId",
              "KeyType": "HASH"
            },
            {
              "AttributeName": "timestamp",
              "KeyType": "RANGE"
            }
          ],
          "BillingMode": "PAY_PER_REQUEST",
          "StreamSpecification": {
            "StreamViewType": "NEW_IMAGE"
          },
          "TableName": "${self:provider.environment.IMAGES_TABLE}",
          "GlobalSecondaryIndexes": [
            {
              "IndexName": "${self:provider.environment.IMAGE_ID_INDEX}",
              "KeySchema": [
                {
                  "AttributeName": "imageId",
                  "KeyType": "HASH"
                }
              ],
              "Projection": {
                "ProjectionType": "ALL"
              }
            }
          ]
        }
      },
      "WebSocketConnectionsDynamoDBTable": {
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
          "AttributeDefinitions": [
            {
              "AttributeName": "id",
              "AttributeType": "S"
            }
          ],
          "KeySchema": [
            {
              "AttributeName": "id",
              "KeyType": "HASH"
            }
          ],
          "BillingMode": "PAY_PER_REQUEST",
          "TableName": "${self:provider.environment.CONNECTIONS_TABLE}"
        }
      },
      "RequestBodyValidator": {
        "Type": "AWS::ApiGateway::RequestValidator",
        "Properties": {
          "Name": "request-body-validator",
          "RestApiId": {
            "Ref": "ApiGatewayRestApi"
          },
          "ValidateRequestBody": true,
          "ValidateRequestParameters": false
        }
      },
      "AttachmentsBucket": {
        "Type": "AWS::S3::Bucket",
        "DependsOn": ["SNSTopicPolicy"],
        "Properties": {
          "BucketName": "${self:provider.environment.IMAGES_S3_BUCKET}",
          "NotificationConfiguration": {
            "TopicConfigurations": [
              {
                "Event": "s3:ObjectCreated:Put",
                "Topic": "ImagesTopic"
              }
            ]
          },
          "CorsConfiguration": {
            "CorsRules": [
              {
                "AllowedOrigins": [
                  "*"
                ],
                "AllowedHeaders": [
                  "*"
                ],
                "AllowedMethods": [
                  "GET",
                  "PUT",
                  "POST",
                  "DELETE",
                  "HEAD"
                ],
                "MaxAge": 3000
              }
            ]
          }
        }
      },
      "BucketPolicy": {
        "Type": "AWS::S3::BucketPolicy",
        "Properties": {
          "PolicyDocument": {
            "Id": "MyPolicy",
            "Version": "2012-10-17",
            "Statement": [
              {
                "Sid": "PublicReadForGetBucketObjects",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*"
              }
            ]
          },
          "Bucket": "AttachmentsBucket"
        }
      },
      "SNSTopicPolicy": {
        "Type": "AWS::SNS::TopicPolicy",
        "Properties": {
          "PolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "AWS": "*"
                },
                "Action": "sns:Publish",
                "Resource": "ImagesTopic",
                "Condition": {
                  "ArnLike": {
                    "AWS:SourceArn": "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}"
                  }
                }
              }
            ]
          },
          "Topics": [
            "ImagesTopic"
          ]
        }
      },
      "ThumbnailsBucket": {
        "Type": "AWS::S3::Bucket",
        "Properties": {
          "BucketName": "${self:provider.environment.THUMBNAILS_S3_BUCKET}"
        }
      },
      "ImagesTopic": {
        "Type": "AWS::SNS::Topic",
        "Properties": {
          "DisplayName": "Image bucket topic",
          "TopicName": "${self:custom.topicName}"
        }
      },
      // "ImagesSearch": {
      //   "Type": "AWS::Elasticsearch::Domain",
      //   "Properties": {
      //     "ElasticsearchVersion": "6.3",
      //     "DomainName": "images-search-${self:provider.stage}",
      //     "ElasticsearchClusterConfig": {
      //       "DedicatedMasterEnabled": false,
      //       "InstanceCount": "1",
      //       "ZoneAwarenessEnabled": false,
      //       "InstanceType": "t2.small.elasticsearch"
      //     },
      //     "EBSOptions": {
      //       "EBSEnabled": true,
      //       "Iops": 0,
      //       "VolumeSize": 10,
      //       "VolumeType": "gp2"
      //     },
      //     "AccessPolicies": {
      //       "Version": "2012-10-17",
      //       "Statement": [
      //         {
      //           "Effect": "Allow",
      //           "Principal": {
      //             "AWS": "*"
      //           },
      //           "Action": "es:*",
      //           "Resource": "*"
      //         }
      //       ]
      //     }
      //   }
      // },
      "KMSKey": {
        "Type": "AWS::KMS::Key",
        "Properties": {
          "Description": "KMS key to encrypt Auth0 secret",
          "KeyPolicy": {
            "Version": "2012-10-17",
            "Id": "key-default-1",
            "Statement": [
              {
                "Sid": "Allow administration of the key",
                "Effect": "Allow",
                "Principal": {
                  "AWS": {
                    "Fn::Join": [
                      ":",
                      [
                        "arn:aws:iam:",
                        {
                          "Ref": "AWS::AccountId"
                        },
                        "root"
                      ]
                    ]
                  }
                },
                "Action": [
                  "kms:*"
                ],
                "Resource": "*"
              }
            ]
          }
        }
      },
      "KMSKeyAlias": {
        "Type": "AWS::KMS::Alias",
        "Properties": {
          "AliasName": "alias/auth0Key-${self:provider.stage}",
          "TargetKeyId": "KMSKey"
        }
      },
      "Auth0Secret": {
        "Type": "AWS::SecretsManager::Secret",
        "Properties": {
          "Name": "${self:provider.environment.AUTH_0_SECRET_ID}",
          "Description": "Auth0 secret",
          "KmsKeyId": "KMSKey"
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
