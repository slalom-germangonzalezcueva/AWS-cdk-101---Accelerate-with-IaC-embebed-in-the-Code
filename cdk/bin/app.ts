#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkCrashCourseStack } from '../lib/aws-cdk-crash-course-stack';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Aspects } from 'aws-cdk-lib';

const app = new cdk.App();

new AwsCdkCrashCourseStack(app, 'CdkCvUpdaterDemoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1'
  }
});

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
