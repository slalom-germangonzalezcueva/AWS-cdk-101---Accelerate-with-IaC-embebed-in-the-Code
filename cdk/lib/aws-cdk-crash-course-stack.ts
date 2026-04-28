import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Tags } from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';


export class AwsCdkCrashCourseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    Tags.of(this).add('Project', 'aws-cdk-101-demo');
    Tags.of(this).add('Environment', 'dev');
    Tags.of(this).add('Owner', 'german.gonzalezcueva@slalom.com');
    Tags.of(this).add('Organization', 'PE Latam');
    Tags.of(this).add('ProvisionedBy', 'CDK');
    Tags.of(this).add('Repository', 'aws-cdk-101-demo');

    const itemsTable = new dynamodb.Table(this, 'CvItemsTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    itemsTable.addGlobalSecondaryIndex({
      indexName: 'byType',
      partitionKey: { name: 'type', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'updatedAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const profileImagesBucket = new s3.Bucket(this, 'ProfileImagesBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      lifecycleRules: [{ abortIncompleteMultipartUploadAfter: cdk.Duration.days(1) }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const frontendBucket = new s3.Bucket(this, 'FrontendWebsiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    const commonEnv = {
      TABLE_NAME: itemsTable.tableName,
      IMAGE_BUCKET_NAME: profileImagesBucket.bucketName,
      CV_PK: 'CV#default',
    };

    const api = new apigateway.RestApi(this, 'CvUpdaterApi', {
      restApiName: 'cv-updater-api',
      description: 'Demo CV updater API managed with AWS CDK.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: 'dev',
        throttlingRateLimit: 50,
        throttlingBurstLimit: 100,
        metricsEnabled: true,
      },
    });

    const repoRoot = path.join(__dirname, '..', '..');
    const createNodeFunction = (name: string, entry: string) =>
      new nodejs.NodejsFunction(this, name, {
        runtime: lambda.Runtime.NODEJS_24_X,
        entry: path.join(repoRoot, 'service', 'src', entry),
        projectRoot: repoRoot,
        handler: 'handler',
        architecture: lambda.Architecture.ARM_64,
        memorySize: 256,
        timeout: cdk.Duration.seconds(10),
        environment: commonEnv,
        bundling: {
          minify: true,
          sourceMap: true,
          target: 'es2022',
          format: nodejs.OutputFormat.CJS,
        },
      });

    const listItemsFn = createNodeFunction('ListItemsFunction', 'items/list.ts');
    const createItemFn = createNodeFunction('CreateItemFunction', 'items/create.ts');
    const updateItemFn = createNodeFunction('UpdateItemFunction', 'items/update.ts');
    const deleteItemFn = createNodeFunction('DeleteItemFunction', 'items/delete.ts');
    const getProfileFn = createNodeFunction('GetProfileFunction', 'profile/get.ts');
    const updateProfileFn = createNodeFunction('UpdateProfileFunction', 'profile/update.ts');
    const profileImageUrlFn = createNodeFunction('CreateProfileImageUploadUrlFunction', 'images/create-upload-url.ts');

    for (const fn of [listItemsFn, createItemFn, updateItemFn, deleteItemFn, getProfileFn, updateProfileFn]) {
      itemsTable.grantReadWriteData(fn);
    }
    profileImagesBucket.grantPut(profileImageUrlFn);
    profileImagesBucket.grantRead(profileImageUrlFn);

    const items = api.root.addResource('items');
    items.addMethod('GET', new apigateway.LambdaIntegration(listItemsFn));
    items.addMethod('POST', new apigateway.LambdaIntegration(createItemFn));
    const itemById = items.addResource('{id}');
    itemById.addMethod('PUT', new apigateway.LambdaIntegration(updateItemFn));
    itemById.addMethod('DELETE', new apigateway.LambdaIntegration(deleteItemFn));

    const profile = api.root.addResource('profile');
    profile.addMethod('GET', new apigateway.LambdaIntegration(getProfileFn));
    profile.addMethod('PUT', new apigateway.LambdaIntegration(updateProfileFn));

    const profileImageUrl = api.root.addResource('profile-image-url');
    profileImageUrl.addMethod('POST', new apigateway.LambdaIntegration(profileImageUrlFn));

    // Optional convenience endpoint for the live exercise. Uncomment and deploy after creating service/src/profile/summary.ts.
    // const summaryFn = createNodeFunction('GetCvSummaryFunction', 'profile/summary.ts');
    // itemsTable.grantReadData(summaryFn);
    // profile.addResource('summary').addMethod('GET', new apigateway.LambdaIntegration(summaryFn));

    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [s3deploy.Source.asset(path.join(repoRoot, 'frontend', 'dist'))],
      destinationBucket: frontendBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'ProfileImagesBucketName', { value: profileImagesBucket.bucketName });
    new cdk.CfnOutput(this, 'DynamoDbTableName', { value: itemsTable.tableName });
    new cdk.CfnOutput(this, 'FrontendUrl', {value: `https://${distribution.distributionDomainName}` });

    /*NagSuppressions.addResourceSuppressions(
      api,
      [
        { id: 'AwsSolutions-APIG2', reason: 'Request validation is deliberately omitted for a one-hour crash-course demo; validation lives in Lambda handlers.' },
        { id: 'AwsSolutions-APIG3', reason: 'AWS WAF is out of scope for the simple crash-course app.' },
        { id: 'AwsSolutions-APIG4', reason: 'Authentication is explicitly out of scope for this demo.' },
        { id: 'AwsSolutions-COG4', reason: 'Cognito/user auth is explicitly out of scope for this demo.' },
      ],
      true,
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      `/${this.stackName}/FrontendWebsiteBucket/Resource`,
      [
        { id: 'AwsSolutions-S1', reason: 'Server access logs omitted to keep the demo focused; add logs for production.' },
        { id: 'AwsSolutions-S2', reason: 'Static demo website intentionally uses S3 website hosting; use CloudFront/OAC for production.' },
        { id: 'AwsSolutions-S10', reason: 'S3 website endpoints do not support HTTPS. Use CloudFront for production.' },
      ],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      `/${this.stackName}/ProfileImagesBucket/Resource`,
      [{ id: 'AwsSolutions-S1', reason: 'Server access logs omitted to keep the demo focused; add logs for production.' }],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      `/${this.stackName}/Custom::S3AutoDeleteObjectsCustomResourceProvider/Handler/ServiceRole/Resource`,
      [{ id: 'AwsSolutions-IAM4', reason: 'CDK generated custom resource role for autoDeleteObjects in ephemeral demo stack.' }],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      `/${this.stackName}/DeployFrontend/CustomResource/Default/Resource`,
      [{ id: 'AwsSolutions-L1', reason: 'CDK bucket deployment custom resource runtime is controlled by CDK.' }],
    );

    NagSuppressions.addResourceSuppressions(
      this,
      [{ id: 'AwsSolutions-IAM5', reason: 'CDK generated asset/deployment policies use scoped wildcards for generated asset objects.' }],
      true,
    );*/
  }
}
